# 奧地利捷克經典10日 行程地圖

以 Leaflet 製作的互動行程地圖：每日路線（實際道路軌跡）、景點、餐食、住宿與航班，支援手機與深色模式。

## 使用

- 線上：GitHub Pages 開啟根目錄的 `index.html`
- 本機：直接用瀏覽器開啟 `index.html`（需網路載入底圖）

鍵盤 ← → 切換天數、Esc 回總覽；網址 `#day-3` 可直接開啟某一天。

## 結構

| 路徑 | 說明 |
|---|---|
| `index.html`、`assets/` | 頁面、樣式、程式與照片 |
| `data/itinerary.js` | 行程資料（修改行程內容改這裡） |
| `data/routes.js` | 道路軌跡，由 `tools/build_routes.mjs` 產生 |
| `data/basemap.js` | 內嵌向量底圖（Claude Artifact 版用），由 `tools/build_basemap.py` 產生 |
| `tools/` | 產生資料與 Artifact 版的腳本 |
| `docs/interactive-map-plan.md` | 實作計畫與維護說明 |

## 資料來源

行程內容與照片：加利利旅遊行程手冊（印象系列）。地圖：Esri、Natural Earth、© OpenStreetMap contributors；路線：OSRM。
