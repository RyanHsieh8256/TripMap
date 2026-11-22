/*
 * 自由活動推薦清單（筆記功能的候選地點）
 * 來源：docs/奧捷行程.pdf p.19–22 散步地圖、p.24–27 購物介紹；
 *       src: "season" 為季節活動（非手冊內容，日期以官方公告為準）。
 * 座標：OpenStreetMap（2026/11 查詢）。
 *
 * cat：sight 景點／shop 購物／food 美食／daily 生活機能／season 季節活動
 */
window.TRIP_SUGGEST = {
  // 有自由活動的天數 → 所在城市與空檔說明
  days: {
    6: { city: "prague", time: "跳舞的房子午餐後到晚上（晚餐自理）" },
    7: { city: "vienna", time: "抵達維也納後的晚上（晚餐自理）" },
    8: { city: "vienna", time: "市區觀光與熊布朗宮之後（晚餐為團體豬肋排）" }
  },

  cats: {
    sight:  { label: "景點" },
    shop:   { label: "購物" },
    food:   { label: "美食" },
    daily:  { label: "生活" },
    season: { label: "季節" }
  },

  items: [
    // ---------- 布拉格（手冊 p.21–22 散步地圖、p.26–27 購物介紹） ----------
    { id: "prg-orloj", city: "prague", cat: "sight", name: "天文鐘", en: "Pražský orloj", lat: 50.08698, lng: 14.42071, src: "p.21",
      desc: "舊市政廳牆上的中世紀天文鐘，整點有十二使徒報時。" },
    { id: "prg-tyn", city: "prague", cat: "sight", name: "提恩教堂", en: "Kostel Matky Boží před Týnem", lat: 50.08771, lng: 14.42271, src: "p.21",
      desc: "舊城廣場上的雙塔哥德式教堂，布拉格最經典的天際線之一。" },
    { id: "prg-mikulas", city: "prague", cat: "sight", name: "聖尼古拉教堂（舊城）", en: "Kostel sv. Mikuláše", lat: 50.08788, lng: 14.41950, src: "p.21",
      desc: "舊城廣場西北角的巴洛克教堂，常有音樂會。" },
    { id: "prg-bridge", city: "prague", cat: "sight", name: "查理士橋", en: "Karlův most", lat: 50.08647, lng: 14.41137, src: "p.21",
      desc: "橫跨伏爾他瓦河的石橋，兩側 30 座聖人雕像，傍晚景色最美。" },
    { id: "prg-powder", city: "prague", cat: "sight", name: "火藥塔", en: "Prašná brána", lat: 50.08724, lng: 14.42776, src: "p.22",
      desc: "舊城東側的哥德式城門塔，可登塔眺望。" },
    { id: "prg-obecni", city: "prague", cat: "sight", name: "市民會館", en: "Obecní dům", lat: 50.08770, lng: 14.42772, src: "p.22",
      desc: "新藝術風格建築，一樓咖啡廳華麗典雅，緊鄰火藥塔。" },
    { id: "prg-mucha", city: "prague", cat: "sight", name: "慕夏博物館", en: "Mucha Museum", lat: 50.08418, lng: 14.42772, src: "p.22",
      desc: "新藝術大師慕夏的作品展，聖維特大教堂的慕夏之窗正是他的作品。" },
    { id: "prg-estates", city: "prague", cat: "sight", name: "城邦歌劇院", en: "Stavovské divadlo", lat: 50.08596, lng: 14.42365, src: "p.22",
      desc: "莫札特《唐喬凡尼》首演之地。" },
    { id: "prg-national", city: "prague", cat: "sight", name: "國家戲劇院", en: "Národní divadlo", lat: 50.08084, lng: 14.41354, src: "p.21",
      desc: "河畔的金頂劇院，歌劇與芭蕾演出。" },
    { id: "prg-wenceslas", city: "prague", cat: "sight", name: "瓦次拉夫廣場", en: "Václavské náměstí", lat: 50.08232, lng: 14.42637, src: "p.22",
      desc: "新城區的林蔭大道廣場，兩側商店林立，盡頭是國家博物館。" },
    { id: "prg-museum", city: "prague", cat: "sight", name: "國家博物館", en: "Národní muzeum", lat: 50.07942, lng: 14.43143, src: "p.22",
      desc: "瓦次拉夫廣場盡頭的新文藝復興建築。" },

    { id: "prg-parizska", city: "prague", cat: "shop", name: "巴黎大道（精品街）", en: "Pařížská", lat: 50.08978, lng: 14.41921, src: "p.21",
      desc: "世界精品名店街：LV、Dior、Chanel、Prada、Hermès、Cartier、RIMOWA 等。" },
    { id: "prg-havel", city: "prague", cat: "shop", name: "哈維爾市集", en: "Havelské tržiště", lat: 50.08477, lng: 14.42099, src: "p.21",
      desc: "舊城區的露天市集，水果、手工藝品與紀念品。" },
    { id: "prg-erpet", city: "prague", cat: "shop", name: "ERPET 水晶專賣店", en: "Erpet Bohemia Crystal", lat: 50.08645, lng: 14.42055, src: "p.21",
      desc: "波西米亞水晶、石榴石飾品，也有手冊介紹的水晶搓刀。" },
    { id: "prg-botanicus", city: "prague", cat: "shop", name: "菠丹妮 Botanicus", en: "Botanicus (Týn 3)", lat: 50.08811, lng: 14.42366, src: "p.26",
      desc: "傳統手工天然保養品：死海泥洗顏皂、玫瑰香皂、玫瑰護手霜，當地買比台灣便宜許多。" },
    { id: "prg-kohinoor", city: "prague", cat: "shop", name: "Koh-I-Noor 彩色鉛筆", en: "Koh-i-Noor (Na Příkopě 24)", lat: 50.08676, lng: 14.42793, src: "p.26",
      desc: "刺蝟造型、長頸鹿造型的彩色鉛筆組，最受歡迎的紀念品。" },
    { id: "prg-bata", city: "prague", cat: "shop", name: "Baťa 鞋店旗艦店", en: "Baťa (Václavské nám. 6)", lat: 50.08363, lng: 14.42384, src: "p.27",
      desc: "1929 年創立的捷克鞋履品牌，布拉格全球旗艦店款式最多。" },
    { id: "prg-palladium", city: "prague", cat: "shop", name: "Palladium 購物中心", en: "Palladium Praha", lat: 50.08946, lng: 14.42962, src: "p.22",
      desc: "約 200 家店的大型購物中心，飯店步行可到。" },
    { id: "prg-billa", city: "prague", cat: "daily", name: "Billa 超市（飯店旁）", en: "Billa (V Celnici 4)", lat: 50.08798, lng: 14.43003, src: "p.22",
      desc: "Hilton 飯店斜對面，買水、零食、伴手禮巧克力很方便。" },

    { id: "prg-xmas", city: "prague", cat: "season", name: "舊城廣場聖誕市集", en: "Vánoční trhy, Staroměstské nám.", lat: 50.08752, lng: 14.42135,
      desc: "每年約 11 月底至隔年 1 月初，大聖誕樹、熱紅酒與烤肉腸（日期以官方公告為準）。" },

    // ---------- 維也納（手冊 p.19–20 散步地圖、p.24、p.27 購物介紹） ----------
    { id: "vie-sacher", city: "vienna", cat: "food", name: "薩赫蛋糕 Café Sacher", en: "Café Sacher Wien", lat: 48.20394, lng: 16.36966, src: "p.19, p.24",
      desc: "元祖薩赫蛋糕，搭配鮮濃奶泡，一口接一口細細品嚐奧地利的甜點。" },
    { id: "vie-demel", city: "vienna", cat: "food", name: "Demel 咖啡館", en: "Demel (Kohlmarkt 14)", lat: 48.20861, lng: 16.36721, src: "p.19",
      desc: "前皇室御用甜點店，櫥窗裡的糖藝作品很有看頭。" },
    { id: "vie-meinl", city: "vienna", cat: "food", name: "Julius Meinl 紅帽咖啡", en: "Julius Meinl am Graben", lat: 48.20945, lng: 16.36836, src: "p.19, p.24",
      desc: "1862 年創立的咖啡品牌（小男孩戴高帽的商標），旗艦店有咖啡豆、餅乾和巧克力。" },

    { id: "vie-graben", city: "vienna", cat: "shop", name: "格拉本大街", en: "Graben", lat: 48.20851, lng: 16.37026, src: "p.19",
      desc: "從聖史蒂芬教堂延伸的徒步大街，Longchamp、H&M、Starbucks 等。" },
    { id: "vie-kohlmarkt", city: "vienna", cat: "shop", name: "柯馬克精品大街", en: "Kohlmarkt", lat: 48.20880, lng: 16.36763, src: "p.19",
      desc: "通往霍夫堡皇宮的精品街：Chanel、LV、Dior、Tiffany、Prada、YSL、Hermès。" },
    { id: "vie-kaerntner", city: "vienna", cat: "shop", name: "克恩滕大街", en: "Kärntner Straße", lat: 48.20499, lng: 16.37090, src: "p.19",
      desc: "歌劇院到聖史蒂芬教堂的主要購物街，飯店出門即到。" },
    { id: "vie-steffl", city: "vienna", cat: "shop", name: "Steffl 百貨", en: "Steffl (Kärntner Str. 19)", lat: 48.20640, lng: 16.37214, src: "p.19",
      desc: "克恩滕大街上的百貨公司，頂樓景觀酒吧可眺望聖史蒂芬教堂。" },
    { id: "vie-swarovski", city: "vienna", cat: "shop", name: "施華洛世奇 Swarovski", en: "Swarovski Kärntner Straße", lat: 48.20724, lng: 16.37148, src: "p.19, p.27",
      desc: "奧地利水晶王國旗艦店，項鍊、耳環、擺飾等當季新品與特價商品。" },
    { id: "vie-mall", city: "vienna", cat: "shop", name: "Wien Mitte 購物中心", en: "Wien Mitte The Mall", lat: 48.20687, lng: 16.38523, src: "p.20",
      desc: "市立公園旁的購物中心，連接機場快線車站。" },
    { id: "vie-billa", city: "vienna", cat: "daily", name: "Billa 超市（飯店同棟）", en: "Billa (Kärntner Ring 9–13)", lat: 48.20230, lng: 16.37205, src: "",
      desc: "與 Eurostars Grand Hotel Wien 同一棟 Ring Galerie，買水、莫札特巧克力很方便。" },

    { id: "vie-opera", city: "vienna", cat: "sight", name: "國家歌劇院", en: "Wiener Staatsoper", lat: 48.20327, lng: 16.36921, src: "p.19",
      desc: "世界三大歌劇院之一，可買站票或參加導覽。" },
    { id: "vie-kursalon", city: "vienna", cat: "sight", name: "Kursalon 音樂廳", en: "Kursalon Wien", lat: 48.20338, lng: 16.37800, src: "p.20",
      desc: "市立公園內，史特勞斯曾在此演出，每晚有華爾滋音樂會。" },

    { id: "vie-xmas-rathaus", city: "vienna", cat: "season", name: "市政廳聖誕市集", en: "Wiener Christkindlmarkt", lat: 48.21071, lng: 16.35919,
      desc: "維也納最大的聖誕市集，每年約 11 月中至 12/26（日期以官方公告為準）。" },
    { id: "vie-xmas-schoenbrunn", city: "vienna", cat: "season", name: "熊布朗宮聖誕市集", en: "Weihnachtsmarkt Schloss Schönbrunn", lat: 48.18572, lng: 16.31273,
      desc: "宮殿前庭的聖誕市集，Day 8 參觀熊布朗宮時就在旁邊（日期以官方公告為準）。" }
  ]
};
