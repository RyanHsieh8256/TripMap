// 產生 Claude Artifact 版頁面：dist/artifact/index.html（CSS／JS／資料全部內嵌，含向量底圖）
// 另產生 dist/artifact/preview.html 供本機預覽（模擬 Artifact 外框，照片路徑指回專案根目錄）。
// 用法：node tools/build_artifact.mjs
// 照片（assets/img/*.jpg）在發布時以附加檔案上傳，路徑不變。
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const safe = (s) => s.replace(/<\/(script|style)/gi, "<\\/$1"); // 避免內嵌內容提早關閉標籤

const html = read("index.html");
const title = html.match(/<title>[\s\S]*?<\/title>/)[0];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const body = html
  .match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/\s*<script[\s\S]*?<\/script>/g, "") // 移除原本的 script，下面重新內嵌
  .trim();

const inlineScripts = ["data/itinerary.js", "data/routes.js", "data/basemap.js", "assets/js/app.js"]
  .map((p) => `<script>/* ${p} */\n${safe(read(p))}</script>`)
  .join("\n");

const page = `${title}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>/* Leaflet 1.9.4 */\n${safe(read("vendor/leaflet-1.9.4.min.css"))}</style>
<style>\n${safe(read("assets/css/style.css"))}</style>
${body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
${inlineScripts}
`;

const outDir = join(ROOT, "dist", "artifact");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), page);

// 本機預覽：補上 Artifact 發布時會加的外框
const preview = `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<base href="../../">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
${page}
</body></html>`;
writeFileSync(join(outDir, "preview.html"), preview);

const imgs = readdirSync(join(ROOT, "assets", "img")).filter((f) => f.endsWith(".jpg"));
console.log(`dist/artifact/index.html  ${(Buffer.byteLength(page) / 1024).toFixed(0)} KB`);
console.log(`附加照片 ${imgs.length} 張（assets/img/）`);
