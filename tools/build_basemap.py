"""產生內嵌底圖 data/basemap.js（給 Claude Artifact 版使用；Artifact 會擋外部圖磚）。

資料來源：
  - Natural Earth（國界、湖泊、河流）：先下載 geojson 到 --cache 目錄
  - OpenStreetMap / Overpass API（城市街道、水域、公園；薩茲卡瑪谷湖泊）

用法：
  pip install shapely
  python tools/build_basemap.py --cache <放 Natural Earth geojson 的資料夾>

需要的 Natural Earth 檔案（https://github.com/nvkelso/natural-earth-vector/tree/master/geojson）：
  ne_10m_admin_0_countries, ne_50m_admin_0_countries, ne_10m_lakes_europe,
  ne_10m_rivers_lake_centerlines, ne_10m_rivers_europe
"""
import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--cache", required=True, help="Natural Earth geojson 所在資料夾")
ap.add_argument("--pylib", help="額外的 Python 套件路徑（shapely 不在預設路徑時）")
args = ap.parse_args()
if args.pylib:
    sys.path.insert(0, args.pylib)

from shapely.geometry import box, shape, mapping, LineString, MultiLineString, Polygon, MultiPolygon  # noqa: E402
from shapely.ops import polygonize, unary_union  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
CACHE = Path(args.cache)
OVERPASS = [  # 主站忙碌時輪流改用鏡像站
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
UA = {"User-Agent": "trip-map-builder/1.0"}

# 區域範圍（lng/lat）
REGION = box(7.0, 44.0, 23.5, 54.5)     # 奧捷與鄰國：10m 細節
WORLD = box(-20.0, -12.0, 145.0, 72.0)  # 航段用：50m 粗略
HIGHLIGHT = {"AUT", "CZE"}

# 城市細節範圍：south, west, north, east
AREAS = {
    "prague":      (50.068, 14.380, 50.100, 14.442),
    "vienna":      (48.172, 16.296, 48.216, 16.394),  # 市中心＋熊布朗宮

    "salzburg":    (47.793, 13.030, 47.810, 13.054),
    "krumlov":     (48.804, 14.305, 48.818, 14.325),
    "hallstatt":   (47.554, 13.638, 47.570, 13.658),
    "stwolfgang":  (47.732, 13.428, 47.746, 13.452),
    "marianske":   (49.966, 12.694, 49.986, 12.722),
    "karlovy":     (50.213, 12.868, 50.233, 12.892),
    "telc":        (49.178, 15.443, 49.191, 15.462),
}
MAJOR = {"motorway", "trunk", "primary", "secondary", "motorway_link", "trunk_link", "primary_link", "secondary_link"}


def load(name):
    return json.loads((CACHE / f"{name}.geojson").read_text(encoding="utf-8"))["features"]


def r5(x):
    return round(x, 5)


def ring(coords):
    return [[r5(y), r5(x)] for x, y in coords]


def polys(geom):
    """shapely (Multi)Polygon -> [[外環, 內環...], ...]，座標為 [lat, lng]"""
    if geom.is_empty:
        return []
    parts = geom.geoms if isinstance(geom, MultiPolygon) else [geom] if isinstance(geom, Polygon) else [
        g for g in getattr(geom, "geoms", []) if isinstance(g, (Polygon, MultiPolygon))]
    out = []
    for p in parts:
        if isinstance(p, MultiPolygon):
            out.extend(polys(p))
            continue
        if p.area < 1e-9:
            continue
        out.append([ring(p.exterior.coords)] + [ring(i.coords) for i in p.interiors])
    return out


def lines(geom):
    if geom.is_empty:
        return []
    if isinstance(geom, LineString):
        return [ring(geom.coords)] if len(geom.coords) > 1 else []
    out = []
    for g in getattr(geom, "geoms", []):
        out.extend(lines(g))
    return out


def size(obj):
    return len(json.dumps(obj, separators=(",", ":"))) / 1024


basemap = {}

# ---------- 陸地／國界 ----------
land_hl, land = [], []
for f in load("ne_10m_admin_0_countries"):
    g = shape(f["geometry"])
    if not g.intersects(REGION):
        continue
    g = g.intersection(REGION).simplify(0.004, preserve_topology=True)
    (land_hl if f["properties"]["ADM0_A3"] in HIGHLIGHT else land).extend(polys(g))
world = []
for f in load("ne_50m_admin_0_countries"):
    g = shape(f["geometry"])
    if g.intersects(WORLD):
        world.extend(polys(g.intersection(WORLD).simplify(0.04, preserve_topology=True)))
basemap["world"] = world
basemap["land"] = land
basemap["landHl"] = land_hl
print(f"world {size(world):.0f} KB, land {size(land):.0f} KB, landHl {size(land_hl):.0f} KB")

# ---------- 湖泊與河流（Natural Earth） ----------
lakes = []
for f in load("ne_10m_lakes_europe"):
    g = shape(f["geometry"])
    if g.intersects(REGION):
        lakes.extend(polys(g.intersection(REGION).simplify(0.002, preserve_topology=True)))
rivers = []
for name in ("ne_10m_rivers_lake_centerlines", "ne_10m_rivers_europe"):
    for f in load(name):
        if not f["geometry"]:
            continue
        g = shape(f["geometry"])
        if g.intersects(REGION):
            rivers.extend(lines(g.intersection(REGION).simplify(0.003)))
print(f"lakes {size(lakes):.0f} KB, rivers {size(rivers):.0f} KB")


# ---------- Overpass ----------
def overpass(query, key):
    cached = CACHE / f"overpass_{key}.json"  # 快取：重跑時不再查詢
    if cached.exists():
        return json.loads(cached.read_text(encoding="utf-8"))
    els = _overpass(query)
    cached.write_text(json.dumps(els), encoding="utf-8")
    return els


def _overpass(query):
    data = urllib.parse.urlencode({"data": query}).encode()
    for attempt in range(6):
        url = OVERPASS[attempt % len(OVERPASS)]
        try:
            req = urllib.request.Request(url, data=data, headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=120))["elements"]
        except Exception as e:  # 公開服務偶爾忙碌，換站／稍等重試
            print(f"  overpass retry ({url.split('/')[2]}):", e)
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("Overpass failed")


def way_line(el):
    return LineString([(p["lon"], p["lat"]) for p in el["geometry"]])


def element_polygons(el):
    """way 或 multipolygon relation -> shapely geometry"""
    if el["type"] == "way":
        pts = [(p["lon"], p["lat"]) for p in el.get("geometry", [])]
        return Polygon(pts) if len(pts) >= 4 and pts[0] == pts[-1] else None
    outers = [way_line(m) for m in el.get("members", []) if m["type"] == "way" and m.get("role") == "outer" and m.get("geometry")]
    inners = [way_line(m) for m in el.get("members", []) if m["type"] == "way" and m.get("role") == "inner" and m.get("geometry")]
    out = unary_union(list(polygonize(outers))) if outers else None
    if out is not None and inners:
        holes = unary_union(list(polygonize(inners)))
        out = out.difference(holes)
    return out


# 薩茲卡瑪谷的湖（Natural Earth 沒有）
q = """[out:json][timeout:90][bbox:47.50,13.20,47.90,13.80];
(relation["natural"="water"]["name"~"^(Wolfgangsee|Hallstätter See|Mondsee|Fuschlsee)$"];
 way["natural"="water"]["name"~"^(Wolfgangsee|Hallstätter See|Mondsee|Fuschlsee)$"];);
out geom;"""
for el in overpass(q, "lakes"):
    g = element_polygons(el)
    if g is not None and not g.is_empty:
        lakes.extend(polys(g.buffer(0).simplify(0.0003, preserve_topology=True)))
    print("  lake:", el.get("tags", {}).get("name"))
basemap["lakes"] = lakes
basemap["rivers"] = rivers
time.sleep(2)

# 城市細節
areas = {}
for key, (s, w, n, e) in AREAS.items():
    bb = f"{s},{w},{n},{e}"
    q = f"""[out:json][timeout:120];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|pedestrian|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"]({bb});
  way["natural"="water"]({bb});
  relation["natural"="water"]({bb});
  way["waterway"~"^(river|canal|stream)$"]({bb});
  way["leisure"~"^(park|garden)$"]({bb});
  relation["leisure"="park"]({bb});
);
out geom;"""
    els = overpass(q, f"area_{key}")
    clip = box(w, s, e, n)
    major, minor, water_lines, water, parks = [], [], [], [], []
    for el in els:
        t = el.get("tags", {})
        try:
            if "highway" in t and el["type"] == "way":
                g = way_line(el).intersection(clip).simplify(0.00002)
                (major if t["highway"] in MAJOR else minor).extend(lines(g))
            elif "waterway" in t and el["type"] == "way":
                water_lines.extend(lines(way_line(el).intersection(clip).simplify(0.00003)))
            elif t.get("natural") == "water" or t.get("leisure") in ("park", "garden"):
                g = element_polygons(el)
                if g is None or g.is_empty:
                    continue
                g = g.buffer(0).intersection(clip).simplify(0.00002, preserve_topology=True)
                (water if t.get("natural") == "water" else parks).extend(polys(g))
        except Exception as ex:  # 個別幾何錯誤就跳過
            print("  skip", el["type"], el.get("id"), ex)
    areas[key] = {"bbox": [s, w, n, e], "major": major, "minor": minor, "waterLines": water_lines, "water": water, "parks": parks}
    print(f"area {key}: {len(els)} elements, {size(areas[key]):.0f} KB")
    time.sleep(2)
basemap["areas"] = areas

# 參考地名（中文）：[名稱, lat, lng, 種類]；種類決定顯示的縮放範圍
basemap["labels"] = [
    ["奧地利", 47.25, 14.9, "country"], ["捷克", 49.95, 16.45, "country"], ["德國", 49.6, 11.0, "country"],
    ["斯洛伐克", 48.75, 19.3, "country"], ["匈牙利", 47.2, 18.6, "country"], ["波蘭", 50.9, 17.9, "country"],
    ["斯洛維尼亞", 46.15, 14.8, "country"], ["義大利", 46.35, 12.0, "country"], ["瑞士", 46.8, 8.4, "country"],
    ["慕尼黑", 48.137, 11.575, "city"], ["林茲", 48.306, 14.286, "city"], ["格拉茲", 47.071, 15.439, "city"],
    ["布爾諾", 49.195, 16.608, "city"], ["布拉提斯拉瓦", 48.148, 17.107, "city"], ["紐倫堡", 49.452, 11.077, "city"],
    ["德勒斯登", 51.050, 13.738, "city"], ["帕紹", 48.574, 13.461, "city"], ["皮爾森", 49.738, 13.373, "city"],
    ["巴德傑維契", 48.975, 14.474, "city"], ["因斯布魯克", 47.269, 11.404, "city"], ["雷根斯堡", 49.013, 12.101, "city"],
    ["布達佩斯", 47.498, 19.040, "city"],
    ["巴德伊修", 47.711, 13.620, "town"], ["夢湖", 47.835, 13.375, "water"], ["聖沃夫岡湖", 47.752, 13.385, "water"],
    ["哈斯達特湖", 47.595, 13.662, "water"], ["伏爾他瓦河", 50.078, 14.412, "river"], ["多瑙河", 48.225, 16.410, "river"],
    ["薩爾斯河", 47.803, 13.048, "river"],
]

out = ROOT / "data" / "basemap.js"
body = (
    "// 由 tools/build_basemap.py 產生，請勿手動編輯。\n"
    "// 地圖資料 © Natural Earth；城市街道 © OpenStreetMap contributors (ODbL)\n"
    "window.BASEMAP = " + json.dumps(basemap, ensure_ascii=False, separators=(",", ":")) + ";\n"
)
out.write_text(body, encoding="utf-8")
print(f"\n已寫入 {out.relative_to(ROOT)}（{len(body.encode()) / 1024:.0f} KB）")
