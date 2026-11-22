# 奧地利捷克經典10日 行程地圖

以 Leaflet 製作的互動行程地圖：每日路線（實際道路軌跡）、景點、餐食、住宿與航班，支援手機與深色模式。

## 使用

- 線上：GitHub Pages 開啟根目錄的 `index.html`
- 本機：直接用瀏覽器開啟 `index.html`（需網路載入底圖）

鍵盤 ← → 切換天數、Esc 回總覽；網址 `#day-3` 可直接開啟某一天。

### 自由行筆記（Day 6–8）

- 在 Day 6（布拉格）、Day 7–8（維也納）頁面的「我的自由行筆記」標記想去的地點：可從推薦清單加入（行程手冊散步地圖、購物介紹與聖誕市集），或按「在地圖上加點」自訂位置；每個地點可寫筆記、勾選去過，地圖上的 ♥ 圖釘可拖曳調整位置。
- 筆記**只存在目前這個瀏覽器**（localStorage），不會上傳。換裝置請到總覽頁「自由行筆記」匯出備份，再到新裝置匯入（匯入會取代現有筆記）。
- iPhone 建議用 Safari「加入主畫面」開啟，避免太久沒開時資料被清除；出發前記得匯出一份備份。
- 推薦地點資料在 `data/suggestions.js`，功能程式在 `assets/js/notes.js`。

## 結構

| 路徑 | 說明 |
|---|---|
| `index.html`、`assets/` | 頁面、樣式、程式與照片 |
| `data/itinerary.js` | 行程資料（修改行程內容改這裡） |
| `data/suggestions.js` | 自由行推薦地點與各天空檔說明 |
| `data/routes.js` | 道路軌跡，由 `tools/build_routes.mjs` 產生 |
| `data/basemap.js` | 內嵌向量底圖（Claude Artifact 版用），由 `tools/build_basemap.py` 產生 |
| `tools/` | 產生資料與 Artifact 版的腳本 |
| `docs/interactive-map-plan.md` | 實作計畫與維護說明 |

## 資料來源

行程內容與照片：加利利旅遊行程手冊（印象系列）；飯店、航班、餐食依 2026/12/03 出發團行程手冊（`docs/奧捷行程.pdf`，未納入版控）更新。地圖：Esri、Natural Earth、© OpenStreetMap contributors；路線：OSRM。
