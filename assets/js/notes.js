/*
 * 自由行筆記：在有自由活動的天數（data/suggestions.js 的 days）標註想去的地點並寫筆記。
 * 資料只存在這個瀏覽器的 localStorage（trip-notes-v1），可匯出／匯入 JSON 備份。
 * 由 app.js 呼叫 window.TripNotes(ctx) 建立，回傳給 app.js 使用的介面。
 */
window.TripNotes = function createNotes(ctx) {
  "use strict";

  const { map, T, esc, dayColor, flyPoint, getCurrent } = ctx;
  const S = window.TRIP_SUGGEST || { days: {}, cats: {}, items: [] };
  const DAYS = Object.keys(S.days).map(Number);
  const KEY = "trip-notes-v1";
  const CAT_ORDER = ["sight", "food", "shop", "daily", "season"];
  const PLACEHOLDER = {
    prague: "例：先到天文鐘看整點報時，再走查理士橋看夕陽，晚餐在舊城廣場聖誕市集解決",
    vienna: "例：晚餐去 Café Sacher 吃蛋糕，回飯店前到同棟的 Billa 買水和莫札特巧克力"
  };
  const ICON_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

  const candById = Object.fromEntries(S.items.map((c) => [c.id, c]));
  const candidatesFor = (day) => S.items.filter((c) => c.city === S.days[day].city);
  const cityName = (day) => T.places[S.days[day].city]?.name || "";
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---------- storage ----------
  const blank = () => ({ v: 1, items: [], dayNotes: {} });
  const num = (v) => (typeof v === "number" || (typeof v === "string" && v.trim() !== "")) && Number.isFinite(+v);
  function clean(d) {
    if (!d || typeof d !== "object" || !Array.isArray(d.items)) return null;
    const items = d.items
      .filter((x) => x && DAYS.includes(+x.day) && num(x.lat) && num(x.lng) && Math.abs(+x.lat) <= 90 && Math.abs(+x.lng) <= 180)
      .map((x) => ({
        id: String(x.id || uid()),
        day: +x.day,
        name: String(x.name || "未命名地點").slice(0, 80),
        lat: +x.lat,
        lng: +x.lng,
        note: String(x.note || "").slice(0, 4000),
        done: !!x.done,
        sid: x.sid && candById[x.sid] ? String(x.sid) : null,
        at: +x.at || Date.now()
      }));
    const dayNotes = {};
    DAYS.forEach((n) => {
      const t = d.dayNotes && d.dayNotes[n];
      if (t) dayNotes[n] = String(t).slice(0, 8000);
    });
    return { v: 1, items, dayNotes };
  }
  function load() {
    try { return clean(JSON.parse(localStorage.getItem(KEY))) || blank(); } catch { return blank(); }
  }
  function canStore() {
    try { localStorage.setItem("trip-notes-test", "1"); localStorage.removeItem("trip-notes-test"); return true; } catch { return false; }
  }
  let persistent = canStore();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); persistent = true; } catch { persistent = false; }
  }

  let state = load();
  let show = true;       // 圖層開關
  let candOpen = false;  // 推薦清單是否展開（展開時地圖顯示推薦點）
  let picking = 0;       // 正在「在地圖上加點」的天數
  let undo = null;       // 剛刪除的項目 { item, index }
  let importPending = null;
  let importMsg = "";

  const itemsOf = (day) => state.items.filter((x) => x.day === day);
  const isAdded = (day, sid) => state.items.some((x) => x.day === day && x.sid === sid);
  const find = (id) => state.items.find((x) => x.id === id);

  // ---------- map layers ----------
  const layers = {};     // day -> 我的地點
  const candLayers = {}; // day -> 推薦點（未加入的）
  const markers = {};    // item id -> marker
  const candMarkers = {}; // "day:cid" -> marker
  DAYS.forEach((n) => { layers[n] = L.layerGroup(); candLayers[n] = L.layerGroup(); });

  const noteIcon = (it) => L.divIcon({
    className: "note-icon",
    html: `<div class="pin pin-note${it.done ? " done" : ""}">${it.done ? "✓" : "♥"}</div>`,
    iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -13]
  });

  function notePopup(it) {
    return `<div class="pop-body">
        <div class="pop-kicker">Day ${it.day}・我的筆記${it.done ? "・已去過" : ""}</div>
        <div class="pop-title">${esc(it.name)}</div>
        ${it.note ? `<p class="pop-note">${esc(it.note).replace(/\n/g, "<br>")}</p>` : ""}
        <div class="pop-days">
          <button class="pop-chip" type="button" data-n-toggle="${it.id}">${it.done ? "改回想去" : "✓ 標記去過"}</button>
          <button class="pop-chip" type="button" data-n-edit="${it.id}">編輯筆記</button>
        </div>
        <p class="pop-tip">可拖曳圖釘調整位置</p>
      </div>`;
  }

  function candPopup(day, c) {
    const cat = S.cats[c.cat]?.label || "";
    return `<div class="pop-body">
        <div class="pop-kicker">推薦・${esc(cat)}${c.src ? `・手冊 ${esc(c.src)}` : c.cat === "season" ? "・季節活動" : ""}</div>
        <div class="pop-title">${esc(c.name)}<small>${esc(c.en || "")}</small></div>
        <p>${esc(c.desc)}</p>
        <div class="pop-days"><button class="pop-chip" type="button" data-n-add="${c.id}" data-n-day="${day}">＋ 加入 Day ${day} 筆記</button></div>
      </div>`;
  }

  function buildMarkers() {
    DAYS.forEach((n) => { layers[n].clearLayers(); candLayers[n].clearLayers(); });
    Object.keys(markers).forEach((k) => delete markers[k]);
    Object.keys(candMarkers).forEach((k) => delete candMarkers[k]);

    state.items.forEach((it) => {
      const m = L.marker([it.lat, it.lng], { icon: noteIcon(it), draggable: true, zIndexOffset: 2200, title: it.name });
      m.bindPopup(() => notePopup(it), { className: "pop-noimg", maxWidth: 260 });
      m.on("click", () => highlightItem(it.id, true));
      m.on("dragend", () => {
        const p = m.getLatLng();
        it.lat = +p.lat.toFixed(6);
        it.lng = +p.lng.toFixed(6);
        save();
      });
      m.addTo(layers[it.day]);
      markers[it.id] = m;
    });

    DAYS.forEach((n) => candidatesFor(n).forEach((c) => {
      if (isAdded(n, c.id)) return;
      const label = (S.cats[c.cat]?.label || "").slice(0, 1);
      const m = L.marker([c.lat, c.lng], {
        icon: L.divIcon({ className: "cand-icon", html: `<div class="pin pin-cand">${esc(label)}</div>`, iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -11] }),
        zIndexOffset: 1800,
        title: c.name
      });
      m.bindPopup(candPopup(n, c), { className: "pop-noimg", maxWidth: 260 });
      m.addTo(candLayers[n]);
      candMarkers[`${n}:${c.id}`] = m;
    }));
  }

  function toggleLayer(layer, on) {
    if (on && !map.hasLayer(layer)) layer.addTo(map);
    if (!on && map.hasLayer(layer)) map.removeLayer(layer);
  }
  function sync() {
    const cur = getCurrent();
    DAYS.forEach((n) => {
      toggleLayer(layers[n], show && cur === n);
      toggleLayer(candLayers[n], show && cur === n && candOpen);
    });
  }

  // ---------- 在地圖上加點 ----------
  const hint = document.createElement("div");
  hint.className = "pick-hint";
  hint.hidden = true;
  hint.innerHTML = '<span>點地圖選擇位置</span><button type="button" data-n-pickcancel>取消</button>';
  map.getContainer().parentElement.appendChild(hint);

  function setPicking(day) {
    picking = day;
    hint.hidden = !day;
    map.getContainer().classList.toggle("is-picking", !!day);
    render();
  }
  map.on("click", (e) => {
    if (!picking) return;
    const day = picking;
    const n = itemsOf(day).filter((x) => !x.sid).length + 1;
    setPicking(0);
    addItem({ day, name: `自訂地點 ${n}`, lat: e.latlng.lat, lng: e.latlng.lng }, { focusName: true });
  });

  // ---------- 資料操作 ----------
  function refresh() {
    buildMarkers();
    sync();
    render();
  }
  function addItem(x, opts = {}) {
    const it = {
      id: uid(), day: x.day, name: x.name,
      lat: +(+x.lat).toFixed(6), lng: +(+x.lng).toFixed(6),
      note: "", done: false, sid: x.sid || null, at: Date.now()
    };
    state.items.push(it);
    save();
    refresh();
    highlightItem(it.id, true);
    if (opts.focusName) {
      const el = document.querySelector(`[data-n-name="${it.id}"]`);
      if (el) { el.focus(); el.select(); }
    }
    return it;
  }
  function removeItem(id) {
    const index = state.items.findIndex((x) => x.id === id);
    if (index < 0) return;
    undo = { item: state.items[index], index };
    state.items.splice(index, 1);
    save();
    refresh();
  }
  function restore() {
    if (!undo) return;
    state.items.splice(Math.min(undo.index, state.items.length), 0, undo.item);
    const id = undo.item.id;
    undo = null;
    save();
    refresh();
    highlightItem(id, true);
  }
  function setDone(id, done) {
    const it = find(id);
    if (!it) return;
    it.done = done;
    save();
    const m = markers[id];
    if (m) {
      m.setIcon(noteIcon(it));
      if (m.isPopupOpen()) m.getPopup().update();
    }
    render();
  }

  // ---------- 側欄：當天的筆記區 ----------
  function itemHtml(it) {
    const c = it.sid ? candById[it.sid] : null;
    return `<li class="note-item${it.done ? " is-done" : ""}" id="note-${it.id}">
        <div class="note-row">
          <label class="note-check" title="去過"><input type="checkbox" data-n-done="${it.id}"${it.done ? " checked" : ""}><span class="sr">去過</span></label>
          <input class="note-name" data-n-name="${it.id}" value="${esc(it.name)}" maxlength="80" aria-label="地點名稱">
          <button class="n-icon" type="button" data-n-locate="${it.id}" title="在地圖上顯示" aria-label="在地圖上顯示">${ICON_PIN}</button>
          <button class="n-icon" type="button" data-n-del="${it.id}" title="刪除" aria-label="刪除">×</button>
        </div>
        ${c ? `<p class="note-desc">${esc(c.desc)}</p>` : ""}
        <textarea class="note-text" data-n-note="${it.id}" rows="1" placeholder="筆記：營業時間、想買的東西、怎麼去…">${esc(it.note)}</textarea>
      </li>`;
  }

  function candListHtml(day) {
    const list = candidatesFor(day);
    return CAT_ORDER.map((cat) => {
      const group = list.filter((c) => c.cat === cat);
      if (!group.length) return "";
      return `<div class="cand-group">
          <h3>${esc(S.cats[cat]?.label || cat)}</h3>
          <ul class="cand-list">${group.map((c) => {
            const added = isAdded(day, c.id);
            return `<li class="cand-item">
                <button class="cand-name" type="button" data-n-cfocus="${c.id}">${esc(c.name)}<small>${esc(c.en || "")}${c.src ? `・手冊 ${esc(c.src)}` : ""}</small></button>
                <button class="cand-add" type="button" data-n-add="${c.id}" data-n-day="${day}"${added ? " disabled" : ""}>${added ? "已加入" : "＋ 加入"}</button>
              </li>`;
          }).join("")}</ul>
        </div>`;
    }).join("");
  }

  function sectionInner(day) {
    const items = itemsOf(day);
    const done = items.filter((x) => x.done).length;
    return `
      <h2 class="section-title">我的自由行筆記</h2>
      <p class="notes-time"><b>自由活動</b>${esc(S.days[day].time)}</p>
      ${persistent ? "" : '<p class="notes-warn">這個瀏覽器目前無法儲存資料（例如無痕模式），重新整理後筆記會消失，請記得匯出備份。</p>'}
      ${undo && undo.item.day === day ? `<div class="notes-undo"><span>已刪除「${esc(undo.item.name)}」</span><button class="link-btn" type="button" data-n-undo>復原</button></div>` : ""}
      ${items.length
        ? `<p class="notes-count">${items.length} 個地點・去過 ${done} 個</p><ul class="note-list">${items.map(itemHtml).join("")}</ul>`
        : '<p class="notes-empty">還沒有想去的地點。從下方推薦清單加入，或在地圖上點選位置。</p>'}
      <div class="notes-actions">
        <button class="n-btn${picking === day ? " is-on" : ""}" type="button" data-n-pick="${day}" aria-pressed="${picking === day}">${picking === day ? "點地圖選位置…（再按一次取消）" : "＋ 在地圖上加點"}</button>
      </div>
      <details class="cand" data-n-cand${candOpen ? " open" : ""}>
        <summary>推薦清單<small>${esc(cityName(day))}・行程手冊與季節活動</small></summary>
        ${candListHtml(day)}
      </details>
      <label class="daynote">
        <span>Day ${day} 當日筆記</span>
        <textarea data-n-daynote="${day}" rows="2" placeholder="${esc(PLACEHOLDER[S.days[day].city] || "")}">${esc(state.dayNotes[day] || "")}</textarea>
      </label>
      <p class="notes-foot">筆記只存在這個瀏覽器，會自動儲存。<button class="link-btn" type="button" data-goto-day="0" data-n-backup>備份／匯入</button></p>`;
  }

  function sectionHtml(day) {
    if (!S.days[day]) return "";
    return `<section class="section notes-sec" id="notesSec" data-day="${day}">${sectionInner(day)}</section>`;
  }

  function render() {
    const sec = document.getElementById("notesSec");
    if (sec && +sec.dataset.day === getCurrent()) {
      sec.innerHTML = sectionInner(+sec.dataset.day);
      autosizeAll(sec);
    }
    const ov = document.getElementById("notesOverview");
    if (ov && getCurrent() === 0) ov.outerHTML = overviewHtml();
  }

  // ---------- 總覽：筆記摘要與備份 ----------
  function overviewHtml() {
    const total = state.items.length;
    return `<section class="section notes-ov" id="notesOverview">
        <h2 class="section-title">自由行筆記</h2>
        <ul class="day-list">
          ${DAYS.map((n) => {
            const its = itemsOf(n);
            const done = its.filter((x) => x.done).length;
            const d = T.days[n - 1];
            return `<li><button class="day-item" type="button" data-goto-day="${n}" style="--c:${dayColor(n)}">
                <span class="num">${n}</span>
                <span><span class="t">${esc(cityName(n))}${d?.date ? `・${esc(d.date)}` : ""}</span><span class="s">${its.length ? `${its.length} 個地點・去過 ${done} 個` : "尚未標記地點"}${state.dayNotes[n] ? "・有當日筆記" : ""}</span></span>
                <span class="km note-count">♥ ${its.length}</span>
              </button></li>`;
          }).join("")}
        </ul>
        <div class="notes-backup">
          <button class="n-btn" type="button" data-n-export${total || Object.keys(state.dayNotes).length ? "" : " disabled"}>匯出備份</button>
          <label class="n-btn">匯入備份<input type="file" accept=".json,application/json" data-n-import hidden></label>
        </div>
        ${importPending ? `<div class="notes-confirm">
            <p>備份檔有 ${importPending.items.length} 個地點，匯入後會<b>取代</b>目前的 ${total} 個地點與當日筆記。</p>
            <button class="n-btn is-on" type="button" data-n-import-ok>取代</button>
            <button class="n-btn" type="button" data-n-import-cancel>取消</button>
          </div>` : ""}
        ${importMsg ? `<p class="notes-msg">${esc(importMsg)}</p>` : ""}
        <p class="notes-foot">筆記只存在這個瀏覽器${persistent ? "，會自動儲存" : "（目前無法儲存，請匯出備份）"}。換手機或換瀏覽器時，先在舊的裝置匯出，再到新的裝置匯入。iPhone 建議用 Safari「加入主畫面」開啟，避免太久沒開時資料被清除。</p>
      </section>`;
  }

  function exportJson() {
    const data = { app: "TripMap 奧捷自由行筆記", exportedAt: new Date().toISOString(), ...state };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    const a = document.createElement("a");
    a.href = url;
    a.download = `奧捷筆記-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function readImport(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data = null;
      try { data = clean(JSON.parse(reader.result)); } catch { data = null; }
      importPending = data;
      importMsg = data ? "" : "這個檔案不是有效的筆記備份。";
      render();
    };
    reader.onerror = () => { importMsg = "讀取檔案失敗。"; render(); };
    reader.readAsText(file);
  }

  // ---------- helpers ----------
  function autosize(el) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }
  function autosizeAll(root = document) {
    root.querySelectorAll(".note-text, .daynote textarea").forEach(autosize);
  }
  function highlightItem(id, scroll) {
    document.querySelectorAll(".note-item.is-active").forEach((el) => el.classList.remove("is-active"));
    const el = document.getElementById(`note-${id}`);
    if (!el) return;
    el.classList.add("is-active");
    if (scroll) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function openMarker(m, zoom) {
    if (!m) return;
    flyPoint(m.getLatLng(), zoom, () => m.openPopup());
  }

  // ---------- events ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-n-pick],[data-n-pickcancel],[data-n-add],[data-n-cfocus],[data-n-locate],[data-n-del],[data-n-undo],[data-n-toggle],[data-n-edit],[data-n-export],[data-n-import-ok],[data-n-import-cancel],[data-n-backup]");
    if (!t) return;
    const ds = t.dataset;
    if (ds.nPick) {
      setPicking(picking === +ds.nPick ? 0 : +ds.nPick);
    } else if (t.hasAttribute("data-n-pickcancel")) {
      setPicking(0);
    } else if (ds.nAdd) {
      const c = candById[ds.nAdd];
      const day = +ds.nDay || getCurrent();
      if (!c || !S.days[day] || isAdded(day, c.id)) return;
      map.closePopup();
      addItem({ day, name: c.name, lat: c.lat, lng: c.lng, sid: c.id });
    } else if (ds.nCfocus) {
      const m = candMarkers[`${getCurrent()}:${ds.nCfocus}`];
      if (m) openMarker(m, 16);
      else {
        const it = state.items.find((x) => x.day === getCurrent() && x.sid === ds.nCfocus);
        if (it) { highlightItem(it.id, true); openMarker(markers[it.id], 16); }
      }
    } else if (ds.nLocate) {
      highlightItem(ds.nLocate, false);
      openMarker(markers[ds.nLocate], 16);
    } else if (ds.nDel) {
      removeItem(ds.nDel);
    } else if (t.hasAttribute("data-n-undo")) {
      restore();
    } else if (ds.nToggle) {
      const it = find(ds.nToggle);
      if (it) setDone(it.id, !it.done);
    } else if (ds.nEdit) {
      map.closePopup();
      highlightItem(ds.nEdit, true);
      const el = document.querySelector(`[data-n-note="${ds.nEdit}"]`);
      if (el) el.focus({ preventScroll: true });
    } else if (t.hasAttribute("data-n-export")) {
      exportJson();
    } else if (t.hasAttribute("data-n-import-ok")) {
      if (importPending) {
        state = importPending;
        importPending = null;
        importMsg = `已匯入 ${state.items.length} 個地點。`;
        undo = null;
        save();
        refresh();
      }
    } else if (t.hasAttribute("data-n-import-cancel")) {
      importPending = null;
      importMsg = "";
      render();
    } else if (t.hasAttribute("data-n-backup")) {
      // app.js 會先切到總覽，渲染完再捲到筆記區
      requestAnimationFrame(() => document.getElementById("notesOverview")?.scrollIntoView({ block: "start" }));
    }
  });

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.nName) {
      const it = find(t.dataset.nName);
      if (!it) return;
      it.name = t.value.slice(0, 80);
      save();
      const m = markers[it.id];
      if (m && m.isPopupOpen()) m.getPopup().update();
    } else if (t.dataset.nNote) {
      const it = find(t.dataset.nNote);
      if (!it) return;
      it.note = t.value.slice(0, 4000);
      save();
      autosize(t);
    } else if (t.dataset.nDaynote) {
      const day = +t.dataset.nDaynote;
      if (t.value.trim()) state.dayNotes[day] = t.value.slice(0, 8000);
      else delete state.dayNotes[day];
      save();
      autosize(t);
    }
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.nDone) {
      setDone(t.dataset.nDone, t.checked);
      document.querySelector(`[data-n-done="${t.dataset.nDone}"]`)?.focus();
    } else if (t.hasAttribute("data-n-import") && t.files && t.files[0]) {
      readImport(t.files[0]);
      t.value = "";
    } else if (t.dataset.nName) {
      const it = find(t.dataset.nName);
      if (it && !it.name.trim()) { it.name = "未命名地點"; t.value = it.name; save(); }
    }
  });

  // <details> 的 toggle 不會冒泡，用 capture 監聽
  document.addEventListener("toggle", (e) => {
    if (!e.target.matches || !e.target.matches("[data-n-cand]")) return;
    candOpen = e.target.open;
    sync();
  }, true);

  // 其他分頁修改時同步
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = load();
    undo = null;
    refresh();
  });

  buildMarkers();

  // ---------- 給 app.js 的介面 ----------
  return {
    days: DAYS,
    sectionHtml,
    overviewHtml,
    sync,
    pointsFor: (day) => itemsOf(day).map((x) => [x.lat, x.lng]),
    setShow(on) { show = on; sync(); },
    isPicking: () => !!picking,
    cancelPick() {
      if (!picking) return false;
      setPicking(0);
      return true;
    },
    onDay() {
      if (picking && picking !== getCurrent()) setPicking(0);
      autosizeAll();
    }
  };
};
