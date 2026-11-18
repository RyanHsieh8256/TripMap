"""從行程 PDF 擷取景點照片，輸出到 assets/img/。

用法：
    pip install pymupdf
    python tools/extract_images.py "docs/加利利 奧捷經典10日.pdf"

xref 編號是針對目前這份 PDF 找出來的；換了 PDF 需重新對照。
"""
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img"
MAX_W = 800
QUALITY = 80

# 內嵌圖片 xref -> 輸出檔名
XREFS = {
    81: "d1-flight",
    83: "d2-hallstatt",
    84: "d2-salzkammergut",
    87: "d3-salzburg",
    88: "d3-mirabell",
    89: "d3-krumlov",
    90: "d4-krumlov-castle",
    91: "d4-marianske",
    92: "d5-karlovy-vary",
    93: "d5-prague",
    94: "d6-tram",
    95: "d6-hradcany",
    96: "d6-st-vitus",
    97: "d6-dancing-house",
    98: "d6-old-town",
    99: "d7-telc",
    100: "d7-vienna",
    101: "d8-vienna",
    102: "d8-schonbrunn",
    103: "d8-vienna-free",
    104: "d9-airport",
    105: "d10-taipei",
    74: "hotel-prague",
    75: "hotel-vienna",
    77: "hotel-lake",
}

# 需要從頁面裁切的區塊：(頁碼 0-based, (x0, y0, x1, y1) 單位 pt) -> 輸出檔名
CROPS = {
    "hero-krumlov": (0, (68, 199, 480, 677)),
    "food-dancing-house": (4, (38, 38, 296, 171)),
    "food-ribs": (4, (300, 38, 558, 171)),
    "food-pork-knuckle": (4, (38, 175, 296, 308)),
    "food-trout": (4, (300, 175, 558, 308)),
}


def save(pix: pymupdf.Pixmap, name: str) -> None:
    if pix.n - pix.alpha >= 4:  # CMYK -> RGB
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    if pix.alpha:
        pix = pymupdf.Pixmap(pix, 0)
    if pix.width > MAX_W:
        h = round(pix.height * MAX_W / pix.width)
        pix = pymupdf.Pixmap(pix, MAX_W, h, None)
    path = OUT / f"{name}.jpg"
    path.write_bytes(pix.tobytes("jpeg", jpg_quality=QUALITY))
    print(f"{path.relative_to(ROOT)}  {pix.width}x{pix.height}  {path.stat().st_size // 1024} KB")


def main(pdf_path: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    for xref, name in XREFS.items():
        save(pymupdf.Pixmap(doc, xref), name)
    for name, (pno, rect) in CROPS.items():
        save(doc[pno].get_pixmap(clip=pymupdf.Rect(*rect), dpi=150), name)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "docs" / "加利利 奧捷經典10日.pdf"))
