# 奧地利捷克經典 10 日 — 行程互動地圖 實作計畫

> 資料來源：`docs/加利利 奧捷經典10日.pdf`（加利利旅遊「印象系列」行程手冊，共 20 頁）
> 產出：可直接用瀏覽器開啟的 HTML 互動地圖（不需建置工具、不需伺服器）

---

## 1. 目標

把 PDF 裡分散在各頁的行程資訊（每日路線、景點、餐食、飯店、距離、航班、貼心提醒）整合到一張互動地圖上：

- 一眼看到 10 天的完整路線與城市順序
- 點選某一天 → 地圖自動縮放到當天範圍，側欄顯示當天所有細節
- 點選地圖上的景點／飯店 → 跳出說明，並可跳回對應的那一天
- 手機與桌機都能順暢使用

---

## 2. 從 PDF 整理出的行程資料

| Day | 路線 | 住宿地 | 行車距離 | 重點景點（▲外觀/下車　★入內，團費含） |
|---|---|---|---|---|
| 1 | 台北 ✈ 維也納（BR061 22:30 → 08:10+1，中停曼谷） | 機上 | — | — |
| 2 | 維也納 → 哈斯達特 → 薩茲卡瑪谷 | 薩茲卡瑪谷（4★ Scalaria / Margaretha / 白馬飯店） | 286 + 20 = 306 km | ▲哈斯達特、▲薩茲卡瑪谷湖區 |
| 3 | 薩茲卡瑪谷 → 薩爾茲堡 → 庫倫洛夫 | 庫倫洛夫（4★ OLDINN / Grand / Bellevue / Ruze） | 50 + 207 = 257 km | ★薩爾茲堡中文導遊、▲莫札特故居、▲穀物小巷、▲米拉貝爾宮花園、庫倫洛夫 |
| 4 | 庫倫洛夫 → 瑪麗安斯凱 | 瑪麗安斯凱（5★ Esplanade）或卡洛維瓦利（5★ Pupp） | 226 km | ▲庫倫洛夫城堡、▲瑪麗安斯凱溫泉迴廊 |
| 5 | 瑪麗安斯凱 → 卡洛維瓦利 → 布拉格 | 布拉格連泊 1（5★ Hilton Old Town / Art Nouveau Palace / Marriott / Art Deco Imperial） | 42 + 128 = 170 km | ▲卡洛維瓦利溫泉迴廊、▲布拉格 |
| 6 | 布拉格市區 | 布拉格連泊 2 | — | ★路面電車、★城堡區（古皇宮、黃金小徑）、★聖維特大教堂、★跳舞的房子景觀餐廳（午餐）、▲舊城區自由活動 |
| 7 | 布拉格 → 帖契 → 維也納 | 維也納連泊 1（5★ Eurostars Grand / InterContinental / Hilton Park） | 169 + 153 = 322 km | ▲帖契市政廣場、▲維也納 |
| 8 | 維也納市區 | 維也納連泊 2 | — | ▲聖史蒂芬大教堂、▲市立公園、▲霍夫堡皇宮、▲瑪麗亞特蕾西亞廣場、★熊布朗宮、▲自由活動 |
| 9 | 維也納 ✈ 台北（BR062 17:55 → 16:00+1，中停曼谷） | 機上 | — | — |
| 10 | 抵達台北 | — | — | — |

行車總公里數：約 **1,281 km**（PDF 第 9 頁）。

每日另有：早／午／晚餐內容、飯店備選名單、「團費包含」與「貼心提醒」，全部收進資料檔。

PDF 中需要在地圖上註明的彈性說明：
- Day 3 住宿「庫倫洛夫（或巴德傑維契／琥珀卡）」、Day 4 住宿「瑪麗安斯凱（或卡洛維瓦利）」
- 薩爾茲堡與薩茲卡瑪谷順序可能依飯店調整
- 庫倫洛夫遊覽車無法進入，需帶過夜包（FAQ Q5）
- 聖維特大教堂若關閉或彌撒改聖喬治教堂；跳舞的房子客滿改其他景觀餐廳

---

## 3. 功能規格

### 3.1 必要功能（MVP）

1. **地圖底圖**：Leaflet + Esri Light Gray Canvas（淺灰、讓彩色路線突出）；深色模式切換為 Esri Dark Gray Canvas；另可切換「街道」「衛星」底圖。
2. **路線**
   - 陸路：用 OSRM 預先算好的實際道路軌跡（build 時抓一次存成資料檔，執行時不依賴 OSRM）；抓不到時退回直線。
   - 航段：台北–曼谷–維也納用虛線大圓弧表示。
   - 每天一種顏色；選取某天時，其餘天數的路線變淡。
3. **城市標記**：依造訪順序編號的圓形標記；首都（布拉格、維也納）用雙圈樣式（呼應 PDF 第 9 頁地圖）；hover 顯示中英文名。
4. **景點標記**：小型圖示，區分 ▲（外觀/下車參觀）與 ★（入內參觀、團費含）；點擊彈出說明卡（標題、所屬 Day、描述、「查看 Day N」按鈕）。
5. **飯店標記**：床型圖示，標出每晚的所有備選飯店（可開關圖層）。
6. **側欄**
   - 頂部：行程名稱、10 天／1,281 km／2 國摘要、「總覽」按鈕。
   - Day 時間軸清單（Day 1 ~ Day 10），點擊展開當日詳情：
     - 路線串（城市 → 城市）與當日行車公里數
     - 景點卡片（名稱中英、▲/★ 標記、描述）
     - 餐食（早／午／晚）
     - 住宿備選
     - 團費包含／貼心提醒
   - Day 1、9 顯示航班資訊（班號、時間、飛行時數）。
7. **導覽控制**：上一天／下一天按鈕、鍵盤 ← →、網址 hash（`#day-3`）可直接分享某一天。
8. **地圖↔側欄連動**：點側欄景點 → 地圖飛到該點並開啟說明；點地圖標記 → 側欄切到該天並捲到該景點。
9. **響應式**：桌機為左側欄 + 右地圖；手機為上地圖 + 下方可上拉的面板。

### 3.2 加分功能（MVP 完成後）

- **播放行程**：自動依序飛越每一天（每天停留數秒），可暫停。
- **行程照片**：從 PDF 擷取景點照片放進景點卡片（壓縮至寬 ~800px）。
- **圖層切換**：景點／飯店／路線各自開關。
- **距離總表**：PDF 第 9 頁的分段距離表。

### 3.3 不做的事

- 不做即時導航、不串接訂房或天氣 API。
- 不需要後端；不使用 npm／打包工具。

---

## 4. 技術選型

| 項目 | 選擇 | 理由 |
|---|---|---|
| 地圖 | Leaflet 1.9.4（cdnjs） | 輕量、成熟、免 API key |
| 圖磚 | Esri Light/Dark Gray Canvas（另有 Street、Imagery） | 免 key，且可在 `file://` 直接載入（實測 CARTO 已改為需 API key、OSM 會擋無 Referer 的請求） |
| 道路軌跡 | OSRM demo server（只在製作時呼叫一次） | 取得真實道路形狀；結果寫死在資料檔，執行時離線可用 |
| 座標 | Nominatim 查詢後人工校正 | 景點與飯店座標要準 |
| 字型 | Noto Sans TC / Noto Serif TC（Google Fonts） | 繁中顯示一致 |
| 程式 | 原生 HTML / CSS / JavaScript | 雙擊即開，免建置 |

資料用 `<script src="data/itinerary.js">` 載入（而非 fetch JSON），這樣直接以 `file://` 開啟也能運作。

---

## 5. 檔案結構

```
trip/
├─ index.html                 # 主頁面（版面骨架）
├─ assets/
│  ├─ css/style.css           # 樣式（顏色變數、淺/深色、RWD）
│  ├─ js/app.js               # 地圖與互動邏輯
│  └─ img/                    # 從 PDF 擷取的景點照片（加分項）
├─ data/
│  ├─ itinerary.js            # 行程資料（每日、景點、飯店、餐食、提醒）
│  └─ routes.js               # 預先計算的道路軌跡（OSRM 產出）
├─ tools/
│  ├─ build_routes.mjs        # 呼叫 OSRM 產生 routes.js 的腳本（Node）
│  └─ extract_images.py       # 從 PDF 擷取照片（PyMuPDF）
└─ docs/
   ├─ 加利利 奧捷經典10日.pdf
   └─ interactive-map-plan.md # 本文件
```

---

## 6. 資料模型（`data/itinerary.js`）

```js
window.TRIP = {
  title: "奧地利捷克經典10日",
  subtitle: "漫步布拉格・沉醉庫倫洛夫・雙首都五星連泊",
  totalKm: 1281,
  flights: { outbound: {...}, inbound: {...} },
  places: {                       // 城市節點，路線串用 id 引用
    vienna:  { name: "維也納", en: "Vienna", lat: 48.2085, lng: 16.3731, capital: true },
    hallstatt: { ... },
    ...
  },
  days: [
    {
      day: 2,
      title: "維也納－哈斯達特－薩茲卡瑪谷",
      color: "#...",
      route: ["vie_airport", "hallstatt", "salzkammergut"],   // places id
      legs: [{ from: "vie_airport", to: "hallstatt", km: 286 }, ...],
      flight: null,
      sights: [
        { id: "hallstatt", name: "哈斯達特", en: "Hallstatt", type: "view",   // view=▲, ticket=★
          lat: 47.5622, lng: 13.6493, desc: "...", img: "assets/img/d2-hallstatt.jpg" }
      ],
      meals: { b: "飛機上", l: "鄉村風味料理", d: "湖區西式風味餐" },
      hotels: [ { name: "Scalaria Event Resort", stars: 4, lat: ..., lng: ... }, ... ],
      included: [],
      notes: ["因航班組合眾多，抵達時間和行程順序請依行前說明會為準。"]
    },
    ...
  ]
};
```

`data/routes.js`：`window.ROUTES = { "vie_airport>hallstatt": [[lat,lng], ...], ... }`，以「起點>終點」為 key，座標已簡化以控制檔案大小。

---

## 7. 版面與視覺

- **配色**：沿用手冊的磚紅（≈ `#B65A36`）為主色、米白底（≈ `#F7F3EC`）、金棕色（≈ `#B39B6E`）為路線／點綴；每日路線色由主色系延伸出 8 個可區分的色相。
- **桌機（≥ 900px）**：左側欄 400px（可捲動）＋右側全高地圖；地圖右上為圖層開關，右下為圖例。
- **手機（< 900px）**：地圖佔上方約 55vh，下方為行程面板；Day 清單改成可橫向滑動的頁籤。
- **深色模式**：跟隨系統 `prefers-color-scheme`，並提供手動切換。

---

## 8. 實作步驟

- [x] **Step 1 — 整理資料**：把 PDF 每日內容轉成 `data/itinerary.js`（標題、景點描述、餐食、飯店、提醒、團費包含、航班、距離）。
- [x] **Step 2 — 座標**：用 Nominatim 查詢城市、景點、飯店座標，人工檢查明顯錯誤後寫入資料檔（Hotel Margaretha 查無結果，標示「位置約略」）。
- [x] **Step 3 — 道路軌跡**：`tools/build_routes.mjs`（Node，直接讀 itinerary.js）對 9 段陸路呼叫 OSRM，Douglas–Peucker 簡化後輸出 `data/routes.js`（約 30 KB）。
- [x] **Step 4 — 頁面骨架**：`index.html` + `style.css`，完成側欄／地圖版面與 RWD。
- [x] **Step 5 — 地圖邏輯**：`app.js` 畫路線、城市／景點／飯店標記、航段弧線、圖例。
- [x] **Step 6 — 互動**：Day 切換（flyToBounds、路線淡化與流動動畫）、側欄↔地圖連動、上一天／下一天、鍵盤 ← → Esc、hash 路由。
- [x] **Step 7 — 加分功能**：播放行程、圖層開關、底圖切換、PDF 照片擷取（`tools/extract_images.py`）、距離總表。
- [x] **Step 8 — 驗證**：以 headless Chrome 實測 1400px 桌機與 375/390px 手機、`file://` 開啟、深淺色、各互動流程，console 無錯誤、手機無水平捲軸。

### 實作後的調整

- 底圖由 CARTO 改為 Esri（理由見第 4 節）。
- 縮放到洲際尺度（< 5）只顯示機場；街道尺度（≥ 13）隱藏城市標記，避免蓋住景點。
- 鱒魚美饌在手冊中未指明哪一天，因此不掛在特定 Day 上。
- 手機版隱藏側欄標題列（標題移到封面圖上），把空間留給行程內容。

### 使用與維護

- 開啟：直接雙擊 `index.html`（需網路載入底圖與字型）。
- 修改行程內容：編輯 `data/itinerary.js`。
- 修改路線或城市座標後：執行 `node tools/build_routes.mjs` 重新產生 `data/routes.js`。
- 重新擷取照片：`pip install pymupdf` 後執行 `python tools/extract_images.py`。

---

## 11. Claude Artifact 版（手機觀看）

已發布：https://claude.ai/artifact/AdnbbUPC8tEamJV3npGNou（預設私人，需從頁面的 Share 選單分享）

Artifact 的安全政策只允許 cdnjs 的 script 與 Google Fonts，**外部圖磚、外部 CSS 都會被擋**，因此 Artifact 版與本機版的差異如下：

| 項目 | 本機 `index.html` | Artifact 版 |
|---|---|---|
| 底圖 | Esri 圖磚（簡潔／街道／衛星） | 內嵌向量底圖 `data/basemap.js`：Natural Earth 國界、湖泊、河流＋ OSM 城市街道（10 個城鎮範圍，縮放 ≥ 13 顯示） |
| Leaflet CSS | cdnjs 外連 | 內嵌（`vendor/leaflet-1.9.4.min.css`） |
| 程式與資料 | 分檔載入 | 全部內嵌成單一頁面 |
| 照片 | `assets/img/` | 以附加檔案上傳，路徑相同 |

`app.js` 偵測到 `window.BASEMAP` 時自動切換成向量底圖模式，兩版共用同一份程式。

更新 Artifact 的流程：

1. 修改 `data/itinerary.js` 等原始檔。
2. （城鎮範圍或底圖有變時）`python tools/build_basemap.py --cache <Natural Earth 資料夾>`，需要 shapely；Overpass 結果會快取在同一資料夾。
3. `node tools/build_artifact.mjs` → 產生 `dist/artifact/index.html`（約 1.9 MB）與本機預覽 `dist/artifact/preview.html`。
4. 重新發布 `dist/artifact/index.html`（附加 `assets/img/*.jpg`），網址不變。

---

## 9. 驗收標準

1. 雙擊 `index.html` 即可在 Chrome / Edge 開啟，地圖與路線正常顯示（需網路載入圖磚）。
2. 10 天都能點選，地圖縮放範圍正確涵蓋當天所有地點。
3. PDF 中每一天的景點、餐食、飯店、提醒都出現在對應的 Day 詳情中，無遺漏。
4. 分段距離與 PDF 第 9 頁一致，總計 1,281 km。
5. 手機寬度（375px）下無水平捲軸、面板可正常操作。
6. 瀏覽器 console 無錯誤。

---

## 10. 風險與注意事項

- **圖磚需要網路**：離線時地圖底圖不會顯示（路線與標記仍在）。
- **OSRM／Nominatim 為公開服務**：只在製作時呼叫，遵守使用頻率（Nominatim 每秒 1 次），失敗時退回直線／手動座標。
- **行程可能變動**：PDF 註明順序與飯店依行前說明會為準，頁面頁尾會附上此提醒。
- **照片版權**：照片取自旅行社手冊，僅供個人行程參考使用，不對外公開發布。
