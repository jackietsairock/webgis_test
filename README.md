# TERRA — 台灣災害情境監測平台

以 Three.js + MapLibre GL JS 製作的 WebGIS 災害展示網站，使用 Vite 建置。

## 啟動

```sh
npm install
npm run dev
```

開啟終端機顯示的網址（預設 http://localhost:5173）。

```sh
npm run build
npm run preview
```

正式檔案輸出至 `dist/`，可部署至靜態網站主機。

## 功能

- 台灣 WebGIS 地圖，可縮放、平移、旋轉、回到全景。
- Three.js 與 MapLibre 共用 WebGL context，繪製立體示意地形及災害風險柱體。
- 地震、淹水、土石流事件篩選、地點搜尋、地圖定位及詳情。
- GeoJSON 災害示意影響範圍、圖層開關、2D / 3D 視角。
- 逐小時情境回放，事件清單、統計及地圖同步更新。
- 桌面與手機響應式排版，鍵盤操作與減少動畫偏好支援。

## 資料與限制

災害資料位於 `src/data.js`，全部為 2026/09/27 的**合成情境資料，非即時或官方災情**。時間軸顯示截至所選整點已發生的事件（例如 14:32 事件於 15:00 刻度出現）。

台灣輪廓為簡化示意；山脈為程序化、高度誇飾模型，**不是 DEM 實測地形**。影響範圍為依半徑計算的概念圓形，不可作為防災或避難決策依據。

街道底圖使用 OpenStreetMap 標準圖磚（不需 API Key），資料 © OpenStreetMap contributors；需網路連線。請遵守 [圖磚使用政策](https://operations.osmfoundation.org/policies/tiles/)，保留來源標示，不提供預先下載或離線快取功能。斷線時仍可呈現本機輪廓、示意地形及災害。Google Fonts 為可選線上字型，載入失敗時使用系統字型。瀏覽器須支援 WebGL2。

## 程式結構

- `src/main.js`：儀表板、查詢、選取、時間軸。
- `src/map.js`：地理資訊圖層、Three.js 場景與座標轉換。
- `src/data.js`：模擬事件、台灣輪廓及 GeoJSON 生成。
- `src/style.css`：響應式介面。

Three.js custom layer 的整合方式參考 [MapLibre 官方範例](https://maplibre.org/maplibre-gl-js/docs/examples/add-a-3d-model-using-threejs/)。

## MapLibre 6 與 Vite

`src/map.js` 使用 `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url` 匯入背景處理程式，並在建立地圖前呼叫 `setWorkerUrl()`。這會把 Worker 及其相依程式一併打包，避免 GeoJSON 圖層因找不到 Worker 而無法顯示。Three.js 圖層在 `style.load` 初始化，不等待外部底圖完成載入。
