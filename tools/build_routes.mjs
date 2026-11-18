// 依 data/itinerary.js 的陸路段，向 OSRM 取得實際道路軌跡，輸出 data/routes.js。
// 用法：node tools/build_routes.mjs
// 只在行程或座標變動時需要重跑；網頁執行時不會呼叫 OSRM。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OSRM = "https://router.project-osrm.org/route/v1/driving";
const TOLERANCE = 0.0006; // 度，約 50–60 m，簡化後仍貼合道路

const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(ROOT, "data/itinerary.js"), "utf8"), ctx);
const trip = ctx.window.TRIP;

// Douglas–Peucker 簡化
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ay, ax] = pts[a], [by, bx] = pts[b];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    let maxD = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [py, px] = pts[i];
      let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const routes = {};

for (const day of trip.days) {
  if (day.mode === "flight" || !day.km) continue;
  for (let i = 0; i < day.route.length - 1; i++) {
    const from = day.route[i], to = day.route[i + 1];
    const a = trip.places[from], b = trip.places[to];
    const url = `${OSRM}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { headers: { "User-Agent": "trip-map-builder/1.0" } });
    const json = await res.json();
    if (json.code !== "Ok") throw new Error(`${from}>${to}: ${json.code}`);
    const r = json.routes[0];
    const pts = r.geometry.coordinates.map(([lng, lat]) => [+lat.toFixed(5), +lng.toFixed(5)]);
    const simple = simplify(pts, TOLERANCE);
    routes[`${from}>${to}`] = simple;
    console.log(
      `Day ${day.day} ${from} > ${to}: OSRM ${(r.distance / 1000).toFixed(0)} km (手冊 ${day.km[i]} km), ` +
      `${pts.length} → ${simple.length} 點`
    );
    await sleep(1100);
  }
}

const body =
  "// 由 tools/build_routes.mjs 產生（OSRM 道路軌跡，© OpenStreetMap contributors），請勿手動編輯\n" +
  "window.ROUTES = {\n" +
  Object.entries(routes).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") +
  "\n};\n";
writeFileSync(join(ROOT, "data/routes.js"), body);
console.log(`\n已寫入 data/routes.js（${(body.length / 1024).toFixed(1)} KB）`);
