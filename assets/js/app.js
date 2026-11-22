(() => {
  "use strict";

  const T = window.TRIP;
  const ROUTES = window.ROUTES || {};
  const DAYS = T.days;
  const LAST = DAYS.length;

  const DAY_COLORS = {
    1: "#7a8494", 2: "#2b8cb3", 3: "#3e9a5b", 4: "#c2552f", 5: "#8b5cc0",
    6: "#d9921c", 7: "#2f6bc4", 8: "#c9407a", 9: "#7a8494", 10: "#7a8494"
  };
  const TYPE = {
    view:   { glyph: "▲", label: "外觀／下車參觀" },
    ticket: { glyph: "★", label: "入內參觀・團費含" },
    free:   { glyph: "◆", label: "自由活動推薦" }
  };
  const ICON_PLANE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>';
  const ICON_BED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4z"/></svg>';
  const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const place = (id) => T.places[id];
  const ll = (p) => [p.lat, p.lng];
  const dayOf = (n) => DAYS[n - 1];
  const hotelsOf = (d) => (typeof d.hotels === "string" ? T.hotelSets[d.hotels] : d.hotels || []);
  const dayKm = (d) => (d.km || []).reduce((a, b) => a + b, 0);
  const stars = (n) => "★".repeat(n);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* 無痕模式等情況忽略 */ } }
  };

  // ---------- state ----------
  let current = 0; // 0 = 總覽
  let playTimer = null;
  const show = { sights: true, hotels: true };

  // ---------- theme ----------
  const darkMQ = matchMedia("(prefers-color-scheme: dark)");
  const effectiveTheme = () => document.documentElement.dataset.theme || (darkMQ.matches ? "dark" : "light");
  const savedTheme = store.get("trip-theme");
  if (savedTheme === "light" || savedTheme === "dark") document.documentElement.dataset.theme = savedTheme;

  // ---------- map ----------
  // 有 data/basemap.js（Artifact 版）時用內嵌向量底圖，否則用 Esri 圖磚
  const VECTOR = !!window.BASEMAP;
  const map = L.map("map", { zoomControl: false, minZoom: 2, maxZoom: VECTOR ? 17 : 18, worldCopyJump: !VECTOR });
  L.control.zoom({ position: "bottomright" }).addTo(map);
  map.createPane("labels").style.zIndex = 450; // 地名疊在路線上方
  map.getPane("labels").style.pointerEvents = "none";

  // 底圖：Esri 圖磚可在 file:// 直接使用、免 API key（CARTO 需 key，OSM 會擋無 Referer 請求）
  const ESRI = (svc) => `https://server.arcgisonline.com/ArcGIS/rest/services/${svc}/MapServer/tile/{z}/{y}/{x}`;
  const ATTR = 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> ・ 路線 &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> / OSRM';
  const BASES = {
    canvas: (t) => {
      const tone = t === "dark" ? "Dark" : "Light";
      return [[ESRI(`Canvas/World_${tone}_Gray_Base`), 16], [ESRI(`Canvas/World_${tone}_Gray_Reference`), 16]];
    },
    street: () => [[ESRI("World_Street_Map"), 18]],
    sat: () => [[ESRI("World_Imagery"), 18], [ESRI("Reference/World_Boundaries_and_Places"), 18]]
  };
  let baseKey = BASES[store.get("trip-base")] ? store.get("trip-base") : "canvas";
  let baseLayers = [];
  function applyBase() {
    if (VECTOR) return vectorBase.restyle();
    baseLayers.forEach((l) => map.removeLayer(l));
    baseLayers = BASES[baseKey](effectiveTheme()).map(([url, nativeZoom], i) =>
      L.tileLayer(url, {
        maxNativeZoom: nativeZoom,
        maxZoom: 18,
        pane: i === 0 ? "tilePane" : "labels",
        attribution: i === 0 ? ATTR : ""
      }).addTo(map)
    );
  }
  function applyTheme() {
    document.documentElement.classList.toggle("is-dark", effectiveTheme() === "dark");
    applyBase();
  }

  // 內嵌向量底圖：國界（Natural Earth）＋ 城市街道（OpenStreetMap），用單一 canvas 繪製
  const vectorBase = (() => {
    if (!VECTOR) return null;
    const B = window.BASEMAP;
    const renderer = L.canvas({ padding: 0.3 });
    const opt = { renderer, interactive: false };
    const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    map.getContainer().classList.add("vector-base");
    map.attributionControl.addAttribution("地圖資料 &copy; Natural Earth ・ 街道 &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> ・ 路線 OSRM");

    const L_ = {
      world: L.polygon(B.world, opt),
      land: L.polygon(B.land, opt),
      landHl: L.polygon(B.landHl, opt),
      lakes: L.polygon(B.lakes, opt),
      rivers: L.polyline(B.rivers, opt)
    };
    const areas = Object.values(B.areas).map((a) => ({
      parks: L.polygon(a.parks, opt),
      water: L.polygon(a.water, opt),
      waterLines: L.polyline(a.waterLines, opt),
      minorEdge: L.polyline(a.minor, opt),
      majorEdge: L.polyline(a.major, opt),
      minor: L.polyline(a.minor, opt),
      major: L.polyline(a.major, opt)
    }));

    // 依縮放決定要畫的圖層；canvas 依加入順序繪製，所以每次都照固定順序重加
    let shown = "";
    function visibleList(z) {
      const list = [L_.world];
      if (z >= 5) list.push(L_.land, L_.landHl);
      if (z >= 6) list.push(L_.lakes);
      if (z >= 6 && z < 13) list.push(L_.rivers);
      if (z >= 13) {
        areas.forEach((a) => list.push(a.parks, a.water, a.waterLines));
        areas.forEach((a) => list.push(a.minorEdge, a.majorEdge));
        areas.forEach((a) => list.push(a.minor, a.major));
      }
      return list;
    }
    function refresh() {
      const z = map.getZoom();
      const list = visibleList(z);
      const key = String(z);
      if (key === shown) return;
      shown = key;
      Object.values(L_).forEach((l) => map.removeLayer(l));
      areas.forEach((a) => Object.values(a).forEach((l) => map.removeLayer(l)));
      restyle();
      list.forEach((l) => l.addTo(map));
    }
    function restyle() {
      const z = map.getZoom() || 6;
      const c = {
        land: css("--map-land"), hl: css("--map-land-hl"), border: css("--map-border"), water: css("--map-water"),
        road: css("--map-road"), edge: css("--map-road-edge"), major: css("--map-road-major"), park: css("--map-park")
      };
      const minorW = [0.8, 1.6, 2.6, 4][Math.max(0, Math.min(3, z - 13))];
      const majorW = [1.8, 3, 4.5, 6.5][Math.max(0, Math.min(3, z - 13))];
      L_.world.setStyle({ fillColor: c.land, fillOpacity: 1, color: c.border, weight: z < 5 ? 0.6 : 0, stroke: z < 5 });
      L_.land.setStyle({ fillColor: c.land, fillOpacity: 1, color: c.border, weight: 1 });
      L_.landHl.setStyle({ fillColor: c.hl, fillOpacity: 1, color: c.border, weight: 1.2 });
      L_.lakes.setStyle({ fillColor: c.water, fillOpacity: 1, stroke: false });
      L_.rivers.setStyle({ color: c.water, weight: z < 8 ? 1 : 1.6, opacity: 1 });
      areas.forEach((a) => {
        a.parks.setStyle({ fillColor: c.park, fillOpacity: 1, stroke: false });
        a.water.setStyle({ fillColor: c.water, fillOpacity: 1, stroke: false });
        a.waterLines.setStyle({ color: c.water, weight: minorW + 1, opacity: 1 });
        a.minorEdge.setStyle({ color: c.edge, weight: minorW + 1.4, opacity: 1, lineCap: "round", lineJoin: "round" });
        a.majorEdge.setStyle({ color: c.edge, weight: majorW + 1.6, opacity: 1, lineCap: "round", lineJoin: "round" });
        a.minor.setStyle({ color: c.road, weight: minorW, opacity: 1, lineCap: "round", lineJoin: "round" });
        a.major.setStyle({ color: c.major, weight: majorW, opacity: 1, lineCap: "round", lineJoin: "round" });
      });
    }

    // 中文參考地名
    const RANGE = { country: [5, 9], city: [7, 12], town: [9, 14], water: [9, 14], river: [12, 18] };
    const labels = B.labels.map(([text, lat, lng, kind]) => ({
      kind,
      marker: L.marker([lat, lng], {
        pane: "labels", interactive: false, keyboard: false,
        icon: L.divIcon({ className: `map-label k-${kind}`, html: `<span>${esc(text)}</span>`, iconSize: [0, 0] })
      }).addTo(map)
    }));
    function labelZoom() {
      const z = map.getZoom();
      labels.forEach(({ kind, marker }) => {
        const el = marker.getElement();
        if (el) el.style.display = z >= RANGE[kind][0] && z <= RANGE[kind][1] ? "" : "none";
      });
    }

    map.on("zoomend", () => { refresh(); labelZoom(); });
    map.whenReady(() => { refresh(); labelZoom(); });
    return { restyle: () => { shown = ""; if (map._loaded) refresh(); } };
  })();

  if (VECTOR) $("#baseSel").hidden = true;
  applyTheme();
  darkMQ.addEventListener("change", () => { if (!document.documentElement.dataset.theme) applyTheme(); });
  document.querySelectorAll(".theme-btn").forEach((btn) => btn.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("trip-theme", next);
    applyTheme();
  }));
  const baseSel = $("#baseSel");
  baseSel.value = baseKey;
  baseSel.addEventListener("change", () => {
    baseKey = baseSel.value;
    store.set("trip-base", baseKey);
    applyBase();
  });

  // 大圓弧（航段）
  function arc(a, b, n = 64) {
    const rad = Math.PI / 180;
    const [p1, l1, p2, l2] = [a[0] * rad, a[1] * rad, b[0] * rad, b[1] * rad];
    const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
      const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
      const z = A * Math.sin(p1) + B * Math.sin(p2);
      pts.push([Math.atan2(z, Math.hypot(x, y)) / rad, Math.atan2(y, x) / rad]);
    }
    return pts;
  }

  // ---------- routes ----------
  const legLines = {};   // "day-i" -> latlngs
  const routeParts = {}; // day -> { lines: [], casings: [], flows: [] }
  DAYS.forEach((d) => {
    const color = DAY_COLORS[d.day];
    const parts = { lines: [], casings: [], flows: [] };
    for (let i = 0; i < d.route.length - 1; i++) {
      const from = d.route[i], to = d.route[i + 1];
      const flight = d.mode === "flight";
      const pts = flight ? arc(ll(place(from)), ll(place(to))) : ROUTES[`${from}>${to}`] || [ll(place(from)), ll(place(to))];
      legLines[`${d.day}-${i}`] = pts;
      const tip = `Day ${d.day}・${place(from).name} → ${place(to).name}${d.km ? `（${d.km[i]} km）` : ""}`;
      if (flight) {
        const line = L.polyline(pts, { color, weight: 2.5, dashArray: "6 8", opacity: 0.85 }).addTo(map);
        line.bindTooltip(tip, { sticky: true, className: "route-tip" }).on("click", () => selectDay(d.day, { user: true }));
        parts.lines.push(line);
      } else {
        const casing = L.polyline(pts, { weight: 8, opacity: 0.9, className: "route-casing", interactive: false }).addTo(map);
        const line = L.polyline(pts, { color, weight: 4.5, opacity: 0.95 }).addTo(map);
        const flow = L.polyline(pts, { color: "#fff", weight: 2, opacity: 0, className: "route-flow", interactive: false }).addTo(map);
        line.bindTooltip(tip, { sticky: true, className: "route-tip" }).on("click", () => selectDay(d.day, { user: true }));
        parts.casings.push(casing); parts.lines.push(line); parts.flows.push(flow);
      }
    }
    routeParts[d.day] = parts;
  });

  function styleRoutes() {
    DAYS.forEach((d) => {
      const p = routeParts[d.day];
      const active = current === d.day;
      const dim = current !== 0 && !active;
      const flight = d.mode === "flight";
      p.casings.forEach((l) => l.setStyle({ opacity: dim ? 0.25 : 0.9 }));
      p.lines.forEach((l) => l.setStyle({ opacity: dim ? 0.22 : flight ? 0.85 : 0.95, weight: active ? (flight ? 3.5 : 6) : flight ? 2.5 : 4.5 }));
      p.flows.forEach((l) => l.setStyle({ opacity: active ? 0.95 : 0 }));
      if (active) [...p.casings, ...p.lines, ...p.flows].forEach((l) => l.bringToFront());
    });
  }

  // ---------- city markers ----------
  const daysAt = {}; // placeId -> [day numbers]
  DAYS.forEach((d) => d.route.forEach((id) => (daysAt[id] ||= []).includes(d.day) || daysAt[id].push(d.day)));

  const cityMarkers = {};
  Object.entries(T.places).forEach(([id, p]) => {
    const order = T.tourOrder.indexOf(id);
    const html = p.kind === "airport"
      ? `<div class="pin pin-air">${ICON_PLANE}</div><div class="pin-label">${esc(p.name)}</div>`
      : `<div class="pin pin-city${p.capital ? " capital" : ""}">${order + 1}</div><div class="pin-label">${esc(p.name)}</div>`;
    const m = L.marker(ll(p), {
      icon: L.divIcon({ className: `city-icon${p.kind === "airport" ? " is-air" : ""}`, html, iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14] }),
      zIndexOffset: 2500, // 中距離時城市編號蓋在飯店／景點上；街道層級會隱藏（.z-near）
      title: p.name
    }).addTo(map);
    const hasImg = DAYS.some((d) => d.sights.some((s) => s.place === id && s.img));
    m.bindPopup(() => cityPopup(id), { className: hasImg ? "" : "pop-noimg", maxWidth: 260 });
    cityMarkers[id] = m;
  });

  function cityPopup(id) {
    const p = place(id);
    const days = daysAt[id] || [];
    const sights = [];
    DAYS.forEach((d) => d.sights.forEach((s) => s.place === id && sights.push(s)));
    const s = sights[0];
    return `${s?.img ? `<img class="pop-img" src="${esc(s.img)}" alt="">` : ""}
      <div class="pop-body">
        <div class="pop-title">${esc(p.name)}<small>${esc(p.en)}</small></div>
        ${s ? `<p>${esc(trim(s.desc, 64))}</p>` : ""}
        <div class="pop-days">${days.map((n) => `<button class="pop-chip" data-goto-day="${n}">Day ${n}</button>`).join("")}</div>
      </div>`;
  }

  function styleCities() {
    const d = current ? dayOf(current) : null;
    Object.entries(cityMarkers).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      el.classList.toggle("dim", !!d && !d.route.includes(id));
    });
  }

  // ---------- sight & hotel markers (per day) ----------
  const dayLayers = {};  // day -> { sights, hotels }
  const sightRefs = {};  // "day-i" -> { pts, markers, place }
  const hotelRefs = {};  // "day-j" -> marker

  const trim = (s, n) => (s.length > n ? s.slice(0, n) + "…" : s);

  function sightPopupHtml(d, s, pt) {
    const t = TYPE[pt.type] || TYPE.view;
    const isStop = pt !== s;
    return `${!isStop && s.img ? `<img class="pop-img" src="${esc(s.img)}" alt="">` : ""}
      <div class="pop-body">
        <div class="pop-kicker">Day ${d.day}・${t.glyph} ${t.label}</div>
        <div class="pop-title">${esc(pt.name)}<small>${esc(pt.en || "")}</small></div>
        <p>${isStop ? `屬於「${esc(s.name)}」行程` : esc(trim(s.desc, 72))}</p>
      </div>`;
  }

  DAYS.forEach((d) => {
    const color = DAY_COLORS[d.day];
    const sights = L.layerGroup();
    const hotels = L.layerGroup();

    d.sights.forEach((s, i) => {
      const key = `${d.day}-${i}`;
      const ref = { pts: [], markers: [], place: null };
      const pts = s.stops || (s.lat != null ? [s] : []);
      pts.forEach((pt) => {
        const t = TYPE[pt.type] || TYPE.view;
        const m = L.marker([pt.lat, pt.lng], {
          icon: L.divIcon({
            className: "sight-icon",
            html: `<div class="pin pin-sight" style="--c:${color}">${t.glyph}</div>`,
            iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12]
          }),
          zIndexOffset: 2000,
          title: pt.name
        });
        m.bindPopup(sightPopupHtml(d, s, pt), { className: pt === s && s.img ? "" : "pop-noimg", maxWidth: 260 });
        m.on("click", () => highlightCard(key, true));
        m.addTo(sights);
        ref.pts.push([pt.lat, pt.lng]);
        ref.markers.push(m);
      });
      if (!pts.length && s.place) {
        ref.place = s.place;
        ref.pts.push(ll(place(s.place)));
      }
      sightRefs[key] = ref;
    });

    hotelsOf(d).forEach((h, j) => {
      const m = L.marker([h.lat, h.lng], {
        icon: L.divIcon({ className: "hotel-icon", html: `<div class="pin pin-hotel">${ICON_BED}</div>`, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] }),
        zIndexOffset: 1500,
        title: h.name
      });
      m.bindPopup(`<div class="pop-body">
          <div class="pop-kicker">Day ${d.day}${d.date ? ` ${esc(d.date)}` : ""} 住宿</div>
          <div class="pop-title">${esc(h.name)}<small>${stars(h.stars)} ${h.stars} 星${h.approx ? "・位置約略" : ""}</small></div>
          <p>${esc(h.addr || d.stay)}${h.tel ? `<br>Tel ${esc(h.tel)}` : ""}</p>
        </div>`, { className: "pop-noimg", maxWidth: 260 });
      m.addTo(hotels);
      hotelRefs[`${d.day}-${j}`] = m;
    });

    dayLayers[d.day] = { sights, hotels };
  });

  function syncLayers() {
    Object.entries(dayLayers).forEach(([n, g]) => {
      const on = +n === current;
      toggleLayer(g.sights, on && show.sights);
      toggleLayer(g.hotels, on && show.hotels);
    });
  }
  function toggleLayer(layer, on) {
    if (on && !map.hasLayer(layer)) layer.addTo(map);
    if (!on && map.hasLayer(layer)) map.removeLayer(layer);
  }

  // ---------- bounds & camera ----------
  function boundsFor(n) {
    const pts = [];
    if (n === 0) {
      T.tourOrder.forEach((id) => pts.push(ll(place(id))));
      pts.push(ll(place("vie_airport")));
    } else {
      const d = dayOf(n);
      d.route.forEach((id) => pts.push(ll(place(id))));
      for (let i = 0; i < d.route.length - 1; i++) pts.push(...legLines[`${n}-${i}`]);
      d.sights.forEach((_, i) => pts.push(...sightRefs[`${n}-${i}`].pts));
      hotelsOf(d).forEach((h) => pts.push([h.lat, h.lng]));
    }
    return L.latLngBounds(pts);
  }
  // 上方留給標題列與工具列、下方留給收合的圖例
  const PAD = { paddingTopLeft: [50, 90], paddingBottomRight: [50, 50] };
  const camOpts = (extra = {}) => ({ ...PAD, duration: 1.1, animate: !REDUCED_MOTION, ...extra });
  function flyBounds(b, maxZoom = 14) {
    if (b.getNorthEast().equals(b.getSouthWest())) map.flyTo(b.getCenter(), 8, camOpts());
    else map.flyToBounds(b, camOpts({ maxZoom }));
  }
  function flyPoint(latlng, zoom, then) {
    if (then) map.once("moveend", then);
    map.flyTo(latlng, Math.max(zoom, map.getZoom()), camOpts());
  }
  // 市區日（只有一個城市）可以放大多一點
  const maxZoomFor = (n) => (n && dayOf(n).route.length === 1 ? 14 : 12);

  function zoomClasses() {
    const z = map.getZoom(), c = map.getContainer().classList;
    c.toggle("z-far", z < 5);   // 洲際尺度：只留機場
    c.toggle("z-near", z >= 13); // 街道尺度：隱藏城市標記，讓景點露出來
  }
  map.on("zoomend", zoomClasses);

  // ---------- panel rendering ----------
  const panelBody = $("#panelBody");
  const tabs = $("#dayTabs");

  tabs.innerHTML =
    `<button class="tab tab-overview" role="tab" data-goto-day="0"><small>&nbsp;</small><b>總覽</b><span class="dot" style="--c:var(--accent)"></span></button>` +
    DAYS.map((d) => `<button class="tab" role="tab" data-goto-day="${d.day}" title="Day ${d.day}・${esc(d.title)}"><small>DAY</small><b>${d.day}</b><span class="dot" style="--c:${DAY_COLORS[d.day]}"></span></button>`).join("");

  function renderOverview() {
    const legs = [];
    DAYS.forEach((d) => d.km && d.km.forEach((km, i) => legs.push({ d, i, km })));
    const total = legs.reduce((a, l) => a + l.km, 0);
    const cities = T.tourOrder.length;
    const f = T.flights;

    return `
      <div class="hero">
        <img src="${esc(T.hero)}" alt="庫倫洛夫雪景">
        <div class="hero-text">
          <h2 class="hero-title">${esc(T.title)}</h2>
          <p>${esc(T.subtitle)}</p>
          ${T.dates ? `<p class="hero-dates">${esc(T.dates)}</p>` : ""}
        </div>
      </div>
      ${T.meetup ? `<div class="meetup"><b>集合</b><span>${esc(T.meetup.time)}・${esc(T.meetup.where)}</span></div>` : ""}
      <div class="stats">
        <div class="stat"><b>${LAST}</b><span>天</span></div>
        <div class="stat"><b>2</b><span>國家</span></div>
        <div class="stat"><b>${cities}</b><span>城鎮</span></div>
        <div class="stat"><b>${total.toLocaleString()}</b><span>公里</span></div>
      </div>

      <section class="section">
        <h2 class="section-title">每日行程</h2>
        <ul class="day-list">
          ${DAYS.map((d) => `<li><button class="day-item" data-goto-day="${d.day}" style="--c:${DAY_COLORS[d.day]}">
            <span class="num">${d.day}</span>
            <span><span class="t">${esc(d.title)}</span><span class="s">${d.date ? `${esc(d.date)}・` : ""}${esc(d.tagline)}</span></span>
            <span class="km">${dayKm(d) ? `${dayKm(d)} km` : d.mode === "flight" ? "✈" : "市區"}</span>
          </button></li>`).join("")}
        </ul>
      </section>

      <section class="section">
        <h2 class="section-title">設計理念</h2>
        <div class="cards">
          ${T.highlights.map((h) => `<div class="card"><h3>${esc(h.title)}</h3><p>${esc(h.desc)}</p></div>`).join("")}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">特色美饌</h2>
        <div class="food-grid">
          ${T.foods.map((x) => `<button class="food" ${x.day ? `data-goto-day="${x.day}"` : 'tabindex="-1"'} type="button">
            <img src="${esc(x.img)}" alt="" loading="lazy">
            <div><b>${esc(x.title)}</b><span>${x.day ? `Day ${x.day}` : esc(x.where || "")}</span></div>
          </button>`).join("")}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">景點距離</h2>
        <table class="dist">
          ${legs.map(({ d, i, km }) => `<tr data-leg="${d.day}-${i}" data-day="${d.day}">
            <td>Day ${d.day}</td><td>${esc(place(d.route[i]).name)} → ${esc(place(d.route[i + 1]).name)}</td><td>${km} km</td></tr>`).join("")}
          <tr class="total"><td></td><td>行車總公里數</td><td>約 ${total.toLocaleString()} km</td></tr>
        </table>
      </section>

      <section class="section">
        <h2 class="section-title">航班・${esc(f.airline)}</h2>
        <div class="cards">${flightCard(f.outbound, 1)}${flightCard(f.inbound, 9)}</div>
        <p class="flight-note">${esc(f.note)}</p>
      </section>

      <section class="section">
        <h2 class="section-title">旅遊小叮嚀</h2>
        ${T.faq.map((q) => `<details class="faq"><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("")}
        <ul class="ticks notes" style="margin-top:12px">${T.generalNotes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
      </section>

      <p class="source">資料來源：${esc(T.source)}。如遇不可抗拒之情況，旅行社保有變更行程、飯店及班機之權利。</p>`;
  }

  function flightCard(fl, day) {
    return `<div class="flight" style="--c:${DAY_COLORS[day]}">
      <div class="flight-top"><b>${esc(fl.no)}</b><span>Day ${day}${fl.date ? `・${esc(fl.date)}` : ""}</span></div>
      <div class="flight-row">
        <div><b>${esc(fl.dep)}</b><span>${esc(fl.from)}</span></div>
        <div class="flight-mid">${esc(fl.duration)}<br>${esc(fl.via)}</div>
        <div><b>${esc(fl.arr)}</b><span>${esc(fl.to)}</span></div>
      </div>
    </div>`;
  }

  function renderDay(d) {
    const color = DAY_COLORS[d.day];
    const hotels = hotelsOf(d);
    const food = T.foods.find((x) => x.day === d.day);
    let chain = "";
    if (d.mode !== "flight" || d.route.length > 1) {
      chain = d.route.map((id, i) => {
        const stop = `<button class="chain-stop" data-place="${id}">${esc(place(id).name)}</button>`;
        if (i === d.route.length - 1) return stop;
        const leg = d.km ? `${d.km[i]} km` : "✈";
        return `${stop}<button class="chain-leg" data-leg="${d.day}-${i}" title="顯示此路段">${leg}</button>`;
      }).join("");
    }

    return `<div style="--c:${color}">
      <header class="day-head">
        <div class="day-num"><span>DAY</span>${d.day}${d.date ? `<em class="day-date">${esc(d.date)}</em>` : ""}</div>
        <h2>${esc(d.title)}</h2>
        <p class="tagline">${esc(d.tagline)}</p>
        ${d.intro ? `<p class="day-intro">${esc(d.intro)}</p>` : ""}
      </header>
      ${d.img ? `<div class="day-img"><img src="${esc(d.img)}" alt=""></div>` : ""}

      ${chain ? `<section class="section">
        <h2 class="section-title">${d.mode === "flight" ? "航程" : "今日路線"}</h2>
        <div class="chain">${chain}</div>
        ${dayKm(d) ? `<div class="chain-total">當日車程約 <b>${dayKm(d)} km</b></div>` : ""}
      </section>` : ""}

      ${d.flight ? `<section class="section"><h2 class="section-title">航班</h2>${flightCard(T.flights[d.flight], d.day)}<p class="flight-note">${esc(T.flights.note)}</p></section>` : ""}

      ${d.sights.length ? `<section class="section">
        <h2 class="section-title">景點</h2>
        ${d.sights.map((s, i) => sightCard(d, s, i)).join("")}
      </section>` : ""}

      ${(d.info || []).length ? `<section class="section"><h2 class="section-title">貼心服務</h2><div class="cards">
        ${d.info.map((x) => `<div class="card"><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></div>`).join("")}
      </div></section>` : ""}

      ${d.meals ? `<section class="section">
        <h2 class="section-title">餐食</h2>
        <ul class="meals">
          <li><span class="meal-k">早</span><span>${esc(d.meals.b)}</span></li>
          <li><span class="meal-k">午</span><span>${esc(d.meals.l)}</span></li>
          <li><span class="meal-k">晚</span><span>${esc(d.meals.d)}</span></li>
        </ul>
        ${food ? `<div class="meal-feature"><img src="${esc(food.img)}" alt=""><div><b>${esc(food.title)}</b><span>${esc(food.desc)}</span></div></div>` : ""}
      </section>` : ""}

      <section class="section stay">
        <h2 class="section-title">住宿</h2>
        <div class="stay-where">${esc(d.stay)}</div>
        ${d.hotelDesc ? `<p>${esc(d.hotelDesc)}</p>` : ""}
        ${d.hotelImg ? `<div class="stay-img"><img src="${esc(d.hotelImg)}" alt="" loading="lazy"></div>` : ""}
        ${hotels.length ? `<ul class="hotels">
          ${hotels.map((h, j) => `<li><button class="hotel-btn" data-hotel="${d.day}-${j}">
            <span class="stars">${stars(h.stars)}</span><span class="hotel-name">${esc(h.name)}${h.addr ? `<small>${esc(h.addr)}${h.tel ? `・Tel ${esc(h.tel)}` : ""}</small>` : ""}</span>${h.approx ? '<span class="approx">位置約略</span>' : ""}
          </button></li>`).join("")}
        </ul>${hotels.length > 1 ? '<p class="small muted" style="margin-top:6px">以上擇一入住或同等級</p>' : ""}` : ""}
      </section>

      ${d.included.length ? `<section class="section"><h2 class="section-title">團費包含</h2>
        <ul class="ticks">${d.included.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>` : ""}

      ${d.notes.length ? `<section class="section"><h2 class="section-title">貼心提醒</h2>
        <ul class="ticks notes">${d.notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>` : ""}
    </div>`;
  }

  function sightCard(d, s, i) {
    const t = TYPE[s.type] || TYPE.view;
    return `<article class="sight" id="sight-${d.day}-${i}" data-sight="${d.day}-${i}" tabindex="0">
      <div class="sight-media">${s.img ? `<img src="${esc(s.img)}" alt="${esc(s.name)}" loading="lazy">` : ""}</div>
      <div>
        <div class="sight-meta">
          <span class="badge type-${s.type}">${t.glyph} ${t.label}</span>
          ${s.badge ? `<span class="badge">${esc(s.badge)}</span>` : ""}
        </div>
        <h3>${esc(s.name)}<span class="en">${esc(s.en)}</span></h3>
        <p>${esc(s.desc)}</p>
        ${s.stops ? `<div class="stops">${s.stops.map((st, k) => `<button class="stop-btn" data-stop="${d.day}-${i}-${k}">${TYPE[st.type].glyph} ${esc(st.name)}</button>`).join("")}</div>` : ""}
        ${s.note ? `<p class="sight-note">※ ${esc(s.note)}</p>` : ""}
      </div>
    </article>`;
  }

  // ---------- selection ----------
  function selectDay(n, opts = {}) {
    n = Math.max(0, Math.min(LAST, n | 0));
    if (opts.user) stopPlay();
    const changed = n !== current;
    current = n;

    if (changed || !panelBody.innerHTML) {
      panelBody.innerHTML = n ? renderDay(dayOf(n)) : renderOverview();
      panelBody.scrollTop = 0;
    }
    tabs.querySelectorAll(".tab").forEach((b) => {
      const on = +b.dataset.gotoDay === n;
      b.setAttribute("aria-selected", on);
      if (on) b.scrollIntoView({ block: "nearest", inline: "center", behavior: REDUCED_MOTION ? "auto" : "smooth" });
    });

    $("#prevBtn").disabled = n === 0;
    $("#nextBtn").disabled = n === LAST;
    $("#pageInfo").textContent = n ? `${n} / ${LAST}` : "總覽";
    $("#mapCaption").innerHTML = n
      ? `<span class="k">DAY ${n}</span>${esc(dayOf(n).title)}`
      : `<span class="k">總覽</span>${T.tourOrder.length} 城鎮・約 ${T.totalKm.toLocaleString()} km`;

    map.closePopup();
    styleRoutes();
    styleCities();
    syncLayers();
    if (opts.fly !== false) flyBounds(boundsFor(n), maxZoomFor(n));

    const hash = n ? `#day-${n}` : "#overview";
    if (location.hash !== hash) {
      // 用完整路徑避免受 <base> 影響；沙盒 iframe 若不允許就略過（不影響功能）
      try { history.replaceState(null, "", location.pathname + location.search + hash); } catch { /* ignore */ }
    }
  }

  function highlightCard(key, scroll) {
    panelBody.querySelectorAll(".sight.is-active").forEach((el) => el.classList.remove("is-active"));
    const el = document.getElementById(`sight-${key}`);
    if (!el) return;
    el.classList.add("is-active");
    if (scroll) el.scrollIntoView({ block: "nearest", behavior: REDUCED_MOTION ? "auto" : "smooth" });
  }

  function focusSight(key) {
    const [dn, i] = key.split("-").map(Number);
    const d = dayOf(dn);
    const s = d.sights[i];
    const ref = sightRefs[key];
    stopPlay();
    highlightCard(key, false);
    if (ref.markers.length === 1) {
      const m = ref.markers[0];
      flyPoint(m.getLatLng(), 15, () => m.openPopup());
    } else if (ref.markers.length > 1) {
      map.closePopup();
      map.flyToBounds(L.latLngBounds(ref.pts), camOpts({ maxZoom: 16 }));
    } else if (ref.place) {
      const latlng = ll(place(ref.place));
      flyPoint(latlng, 13, () => {
        L.popup({ className: s.img ? "" : "pop-noimg", maxWidth: 260, offset: [0, -10] })
          .setLatLng(latlng).setContent(sightPopupHtml(d, s, s)).openOn(map);
      });
    }
  }

  // ---------- play ----------
  function updatePlayBtn() {
    const btn = $("#playBtn");
    btn.setAttribute("aria-pressed", !!playTimer);
    btn.querySelector("span").textContent = playTimer ? "暫停播放" : "播放行程";
  }
  function stopPlay() {
    if (!playTimer) return;
    clearInterval(playTimer);
    playTimer = null;
    updatePlayBtn();
  }
  function startPlay() {
    selectDay(current >= LAST ? 1 : current + 1);
    playTimer = setInterval(() => {
      if (current >= LAST) return stopPlay();
      selectDay(current + 1);
    }, 4500);
    updatePlayBtn();
  }
  $("#playBtn").addEventListener("click", () => (playTimer ? stopPlay() : startPlay()));

  // ---------- events ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-goto-day],[data-stop],[data-hotel],[data-leg],[data-place],[data-sight]");
    if (!t) return;
    if (t.dataset.gotoDay != null) {
      selectDay(+t.dataset.gotoDay, { user: true });
    } else if (t.dataset.stop) {
      const [dn, i, k] = t.dataset.stop.split("-").map(Number);
      const m = sightRefs[`${dn}-${i}`].markers[k];
      stopPlay();
      highlightCard(`${dn}-${i}`, false);
      flyPoint(m.getLatLng(), 16, () => m.openPopup());
    } else if (t.dataset.hotel) {
      const m = hotelRefs[t.dataset.hotel];
      stopPlay();
      if (!show.hotels) { show.hotels = true; $("#tgHotels").checked = true; syncLayers(); }
      flyPoint(m.getLatLng(), 16, () => m.openPopup());
    } else if (t.dataset.leg) {
      stopPlay();
      if (t.dataset.day && +t.dataset.day !== current) selectDay(+t.dataset.day, { fly: false });
      map.flyToBounds(L.latLngBounds(legLines[t.dataset.leg]), camOpts({ maxZoom: 13 }));
    } else if (t.dataset.place) {
      stopPlay();
      const m = cityMarkers[t.dataset.place];
      flyPoint(m.getLatLng(), 13, () => m.openPopup());
    } else if (t.dataset.sight) {
      focusSight(t.dataset.sight);
    }
  });

  panelBody.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".sight")) {
      e.preventDefault();
      focusSight(e.target.dataset.sight);
    }
  });

  $("#prevBtn").addEventListener("click", () => selectDay(current - 1, { user: true }));
  $("#nextBtn").addEventListener("click", () => selectDay(current + 1, { user: true }));

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") selectDay(current + 1, { user: true });
    else if (e.key === "ArrowLeft") selectDay(current - 1, { user: true });
    else if (e.key === "Escape") selectDay(0, { user: true });
  });

  $("#tgSights").addEventListener("change", (e) => { show.sights = e.target.checked; syncLayers(); });
  $("#tgHotels").addEventListener("change", (e) => { show.hotels = e.target.checked; syncLayers(); });

  if (matchMedia("(max-width: 899px)").matches) $("#legend").open = false;

  const fromHash = () => {
    const m = location.hash.match(/^#day-(\d+)$/);
    return m ? +m[1] : 0;
  };
  window.addEventListener("hashchange", () => selectDay(fromHash(), { user: true }));

  // 初始畫面：先定位再渲染，避免第一次飛行動畫從世界地圖開始
  const start = fromHash();
  map.fitBounds(boundsFor(start), { ...PAD, maxZoom: maxZoomFor(start) });
  zoomClasses();
  current = -1;
  selectDay(start, { fly: false });
})();
