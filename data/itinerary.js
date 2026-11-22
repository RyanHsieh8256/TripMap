/*
 * 奧地利捷克經典10日 — 行程資料
 * 來源：docs/奧捷行程.pdf（2026/12/03 出發團行程手冊：飯店、航班、餐食已確認）
 *      早期版本依 docs/加利利 奧捷經典10日.pdf（產品介紹）
 *
 * 景點 type：
 *   view   = ▲ 外觀／下車參觀
 *   ticket = ★ 入內參觀或專業導覽（團費包含）
 *   free   = 自由活動推薦
 * 景點座標：有 place 時沿用城市座標（不另畫標記）；有 lat/lng 時畫獨立標記；
 * stops 為同一張景點卡內的多個細部地點。
 */
window.TRIP = {
  title: "奧地利捷克經典10日",
  series: "印象系列",
  subtitle: "漫步布拉格・沉醉庫倫洛夫・雙首都五星連泊",
  hero: "assets/img/hero-krumlov.jpg",
  totalKm: 1281,
  dates: "2026/12/03（四）– 12/12（六）",
  meetup: { time: "2026/12/03（四）19:30", where: "桃園機場第二航廈 長榮航空團體櫃檯" },
  source: "加利利旅遊 行程手冊（2026/12/03 出發團）",

  places: {
    tpe:          { name: "台北（桃園機場）", en: "Taipei TPE", lat: 25.0797, lng: 121.2342, kind: "airport" },
    bkk:          { name: "曼谷（中停）", en: "Bangkok BKK", lat: 13.6900, lng: 100.7501, kind: "airport" },
    vie_airport:  { name: "維也納機場", en: "Vienna Airport VIE", lat: 48.1196, lng: 16.5636, kind: "airport" },
    hallstatt:    { name: "哈斯達特", en: "Hallstatt", lat: 47.5624, lng: 13.6490 },
    salzkammergut:{ name: "薩茲卡瑪谷", en: "Salzkammergut (St. Wolfgang)", lat: 47.7387, lng: 13.4400 },
    salzburg:     { name: "薩爾茲堡", en: "Salzburg", lat: 47.8000, lng: 13.0430 },
    krumlov:      { name: "庫倫洛夫", en: "Český Krumlov", lat: 48.8107, lng: 14.3150 },
    marianske:    { name: "瑪麗安斯凱", en: "Mariánské Lázně", lat: 49.9766, lng: 12.7062 },
    karlovy:      { name: "卡洛維瓦利", en: "Karlovy Vary", lat: 50.2253, lng: 12.8818 },
    prague:       { name: "布拉格", en: "Prague", lat: 50.0875, lng: 14.4210, capital: true },
    telc:         { name: "帖契", en: "Telč", lat: 49.1845, lng: 15.4532 },
    vienna:       { name: "維也納", en: "Vienna", lat: 48.2085, lng: 16.3731, capital: true }
  },

  // 地圖上的城市編號順序（PDF 第 9 頁路線圖）
  tourOrder: ["vienna", "hallstatt", "salzkammergut", "salzburg", "krumlov", "marianske", "karlovy", "prague", "telc"],

  flights: {
    airline: "長榮航空",
    outbound: { no: "BR061", date: "12/03（四）", from: "TPE 台北", to: "VIE 維也納", dep: "22:30", arr: "08:10 +1", duration: "16 小時 40 分", via: "中停曼谷" },
    inbound:  { no: "BR062", date: "12/11（五）", from: "VIE 維也納", to: "TPE 台北", dep: "14:55", arr: "13:05 +1", duration: "15 小時 10 分", via: "中停曼谷" },
    note: "時間皆為當地時間。如遇不可抗拒之情況，旅行社保有變更飯店及班機之權利。"
  },

  highlights: [
    { title: "深度雙國・奧捷CP值最高", desc: "捷克和奧地利的旅遊天數相當平均，遊覽世界遺產、湖泊山水、古典城堡、中古世紀建築，加上奧捷物價比歐洲其他地區還低。" },
    { title: "四大城鎮・專業中文導覽", desc: "深度悠遊布拉格、維也納、薩爾茲堡和庫倫洛夫，特別安排專業導遊，探索當地不為人知的故事。" },
    { title: "捷克文化的心臟・波西米亞雙溫泉區", desc: "跟隨卡夫卡、蕭邦、歌德等名流，徜徉皇室渡假勝地瑪麗安斯凱、卡洛維瓦利，漫步華麗的溫泉迴廊。" }
  ],

  foods: [
    { title: "布拉格地標・跳舞的房子景觀餐廳", day: 6, img: "assets/img/food-dancing-house.jpg", desc: "精緻的法式料理，搭配景觀窗台，用布拉格美景佐餐，餐後還可到頂樓眺望一整片的紅瓦城堡！" },
    { title: "豪爽美饌・維也納豬肋排", day: 8, img: "assets/img/food-ribs.jpg", desc: "外層酥脆的巨大豬肋排，鹹甜醬汁淋漓釀味，烤得恰到好處的鮮嫩肉品。" },
    { title: "在地佳餚・波西米亞傳統料理", day: 4, img: "assets/img/food-pork-knuckle.jpg", desc: "安排波西米亞豬腳、炸豬排，豐富的特色佳餚，為旅程增添味蕾風采。" },
    { title: "仙境湖區・鱒魚美饌", day: null, where: "奧地利湖區", img: "assets/img/food-trout.jpg", desc: "奧地利的高山湖區，澄澈的水源培育著豐美鱒魚，鮮甜滋味深深擄獲您的味蕾！" }
  ],

  faq: [
    { q: "有時間購買精品嗎？", a: "維也納、布拉格、薩爾茲堡都有精品街，推薦自由活動時間前往維也納格拉本大街、柯馬克大道，和布拉格巴黎街。" },
    { q: "為什麼庫倫洛夫需要另外帶過夜包？", a: "庫倫洛夫多為石板路，遊覽車無法進出，搬運行李箱非常不方便，因此需要攜帶過夜包，打包那晚的衣物隨身物品。飯店由古建築和修道院改建，房內空間相對受限，但座落市中心。" },
    { q: "為什麼安排波西米亞溫泉鄉？", a: "卡洛維瓦利和瑪麗安斯凱是捷克最知名的兩大溫泉勝地，藏身在繁密茂盛的森林區域，可愜意悠賞森林百景。" }
  ],

  generalNotes: [
    "若因交通、氣候等不可抗因素影響，領隊將視實際狀況做最佳調整。",
    "餐廳若客滿或休息，將安排其他同等級選擇。",
    "團體菜單固定，特殊餐食（如海鮮過敏、不吃牛）需事先向旅遊專員提出，現場無法臨時更換。"
  ],

  days: [
    {
      day: 1,
      date: "12/03（四）",
      title: "台北 ✈ 維也納",
      tagline: "邂逅浪漫國度",
      mode: "flight",
      route: ["tpe", "bkk", "vie_airport"],
      flight: "outbound",
      intro: "美好的旅程即將實現，開啟這一趟期待已久的旅行。童話般的美麗夢境，引領你走向最愜意、最悸動的夢幻國度。",
      img: "assets/img/d1-flight.jpg",
      sights: [],
      info: [
        { title: "國際航空・線上加價選位服務", desc: "華航／長榮／阿聯酋／阿提哈德皆提供加價選位服務，若有座位需求（如與同行者相鄰），請主動洽詢旅遊專員。需等團體機票開票後，提供票號給貴賓自行到航空公司官網進行線上付費選位（航空公司保有座位最終調整權）。" }
      ],
      meals: null,
      stay: "夜宿機上",
      hotels: [],
      included: [],
      notes: ["本公司盡量忠於原行程，若遇交通、氣候、飯店地點等因素影響，仍保有行程順序調整之權利。"]
    },
    {
      day: 2,
      date: "12/04（五）",
      title: "維也納－哈斯達特－薩茲卡瑪谷",
      tagline: "阿爾卑斯湖區的桃花源",
      route: ["vie_airport", "hallstatt", "salzkammergut"],
      km: [286, 20],
      sights: [
        {
          name: "哈斯達特", en: "Hallstatt", type: "view", place: "hallstatt",
          img: "assets/img/d2-hallstatt.jpg",
          desc: "踏入哈斯達特的那一刻，猶如置身於桃花源，踏著石板路而來的，是身著阿爾卑斯山區傳統服飾的居民。道路旁的木屋環繞著玫瑰花，山丘上古樸典雅的教堂，湖畔小鎮等候您的到來。"
        },
        {
          name: "薩茲卡瑪谷", en: "Salzkammergut", type: "view", place: "salzkammergut",
          img: "assets/img/d2-salzkammergut.jpg",
          desc: "語意為鹽湖區的薩茲卡瑪谷高山湖區，由阿爾卑斯山群所環繞，湖區內共有76個大大小小如寶石般的湖泊，包含夢湖、聖沃夫岡湖、巴德伊修等，已於1997年列入世界遺產。"
        }
      ],
      meals: { b: "飛機上", l: "奧地利風味料理", d: "湖區風味餐" },
      stay: "薩茲卡瑪谷（聖沃夫岡）",
      hotelImg: "assets/img/hotel-lake.jpg",
      hotelDesc: "遨遊空靈純淨的高山湖區，入住舒適爾雅的湖區飯店，親近奧地利最美的仙境小鎮。",
      hotels: [
        { name: "Scalaria Event Resort", stars: 4, lat: 47.73932, lng: 13.44566, addr: "See 1, 5360 St. Wolfgang, Austria", tel: "+43-613-880-00" }
      ],
      included: [],
      notes: ["因航班組合眾多，抵達時間和行程順序請依行前說明會為準。"]
    },
    {
      day: 3,
      date: "12/05（六）",
      title: "薩茲卡瑪谷－薩爾茲堡－庫倫洛夫",
      tagline: "真善美之城與童話紅瓦小鎮",
      route: ["salzkammergut", "salzburg", "krumlov"],
      km: [50, 207],
      sights: [
        {
          name: "薩爾茲堡市區觀光", en: "Salzburg", type: "ticket", badge: "含專業中文導遊", place: "salzburg",
          img: "assets/img/d3-salzburg.jpg",
          desc: "跟著專業中文導遊走訪薩爾茲堡，因為奧斯卡電影《真善美》而舉世聞名。舊城區莫札特故居與穀物小巷，懷舊又藝文，店家相當熱鬧，招牌風格林立。",
          stops: [
            { name: "莫札特故居", en: "Mozarts Geburtshaus", type: "view", lat: 47.79994, lng: 13.04355 },
            { name: "穀物小巷", en: "Getreidegasse", type: "view", lat: 47.80004, lng: 13.04255 }
          ]
        },
        {
          name: "米拉貝爾宮花園", en: "Mirabellgarten", type: "view", lat: 47.80466, lng: 13.04164,
          img: "assets/img/d3-mirabell.jpg",
          desc: "因歌舞電影《真善美》而名聞遐邇的米拉貝爾宮花園，建於1606年，是大主教送給情人的婉麗宮殿。整體為巴洛克式，以飛馬噴泉為中心，剪裁精緻的花草園藝，以及雅緻的雕塑藝術。"
        },
        {
          name: "庫倫洛夫", en: "Český Krumlov", type: "view", place: "krumlov",
          img: "assets/img/d3-krumlov.jpg",
          desc: "遊歷過百國各地的旅人，每當聊到世界上最像童話的地方，都不約而同指向庫倫洛夫。紅色的屋瓦、瑰麗的彩繪塔、樸實的民風，一起沉醉這座以城堡、石橋、流水和綠意，書寫的中世紀詩篇。"
        }
      ],
      meals: { b: "飯店內自助式", l: "中式八菜一湯", d: "捷克傳統風味餐" },
      stay: "庫倫洛夫（舊城區）",
      hotels: [
        { name: "Hotel Ruze", stars: 4, lat: 48.81044, lng: 14.31751, addr: "Horní 154, 381 01 Český Krumlov, Czech Republic", tel: "+420-380-772-100" }
      ],
      included: ["薩爾茲堡（含專業中文導遊）"],
      notes: [
        "庫倫洛夫多為石板路，遊覽車無法進出，請另備過夜包。"
      ]
    },
    {
      day: 4,
      date: "12/06（日）",
      title: "庫倫洛夫 市區觀光－瑪麗安斯凱",
      tagline: "古堡俯瞰與森林溫泉鄉",
      route: ["krumlov", "marianske"],
      km: [226],
      sights: [
        {
          name: "庫倫洛夫城堡", en: "Krumlov Castle", type: "view", lat: 48.81231, lng: 14.31249,
          img: "assets/img/d4-krumlov-castle.jpg",
          desc: "世界遺產級的哥德式庫倫洛夫城堡建在山上，伏爾他瓦河蜿蜒而過，悠緩而寧靜，從城堡區俯瞰小鎮，紅瓦白牆的屋子在陽光下展露出迷人的風情，古堡上的斑駁似乎訴說著歷史的興衰起落。"
        },
        {
          name: "瑪麗安斯凱・溫泉迴廊", en: "Mariánské Lázně", type: "view", place: "marianske",
          img: "assets/img/d4-marianske.jpg",
          desc: "靜臥在波西米亞森林中的溫泉鄉，華麗巴洛克建築與精緻的溫泉迴廊，洋溢柔美的氣息，奧匈帝國法蘭茲約瑟夫皇帝曾幸臨，浪漫音樂家華格納也為此著迷，點上薄暮裡的華燈，更添丰采。"
        }
      ],
      meals: { b: "飯店內自助式", l: "波西米亞風味餐", d: "飯店主廚推薦餐" },
      stay: "瑪麗安斯凱",
      hotels: [
        { name: "Hotel Esplanade Spa & Golf Resort", stars: 5, lat: 49.97680, lng: 12.71269, addr: "Karlovarská 438, 353 01 Mariánské Lázně, Czech Republic", tel: "+420-354-676-617" }
      ],
      included: [],
      notes: []
    },
    {
      day: 5,
      date: "12/07（一）",
      title: "瑪麗安斯凱－卡洛維瓦利－布拉格",
      tagline: "溫泉迴廊到百塔之城",
      route: ["marianske", "karlovy", "prague"],
      km: [42, 128],
      sights: [
        {
          name: "卡洛維瓦利・溫泉迴廊", en: "Karlovy Vary", type: "view", place: "karlovy",
          img: "assets/img/d5-karlovy-vary.jpg",
          desc: "依山傍谷的優雅渡假小鎮，曾吸引貝多芬、蕭邦、哥德來訪。流連特有的卡洛維瓦利溫泉迴廊，品嚐具療效的冷熱溫泉，饒富情趣。查理四世國王的故事，更為此地增添許多傳奇色彩。"
        },
        {
          name: "布拉格", en: "Prague", type: "view", place: "prague",
          img: "assets/img/d5-prague.jpg",
          desc: "唯美的房屋與高塔，雲集在布拉格，形成一整片紅瓦白牆之景，成就「百塔之城」的美名，因此世人也常說，布拉格是以城堡撰寫的詩篇，凡是讀過的人們，這一輩子都會忘不了。"
        }
      ],
      meals: { b: "飯店內自助式", l: "溫泉區風味料理", d: "中式八菜一湯" },
      stay: "布拉格（連泊第 1 晚）",
      hotelImg: "assets/img/hotel-prague.jpg",
      hotelDesc: "沉醉布拉格中心精華地段，從大廳出來逛街幾十分鐘，即可抵達布拉格舊城廣場、購物精品大街，以及市區景點。",
      hotels: "prague",
      included: [],
      notes: []
    },
    {
      day: 6,
      date: "12/08（二）",
      title: "布拉格 城堡區・聖維特大教堂・自由活動",
      tagline: "千塔之城一日漫遊",
      route: ["prague"],
      sights: [
        {
          name: "布拉格路面電車", en: "Tramvaje", type: "ticket", lat: 50.09335, lng: 14.39855,
          img: "assets/img/d6-tram.jpg",
          desc: "復古與摩登的美感結合，打造出舒適、雅麗的布拉格路面電車，透過半開放式的空間設計，感受「千塔之城」的豐饒麗景，行經皇宮古堡，敘說一段娓娓動人的榮華歲月。"
        },
        {
          name: "布拉格城堡區", en: "Hradčany", type: "ticket", badge: "含專業導遊", lat: 50.09058, lng: 14.40157,
          img: "assets/img/d6-hradcany.jpg",
          desc: "跟著專業導遊走訪布拉格城堡區，充滿氣魄的古皇宮，展示華麗的皇冠、權杖、宴會廳等，象徵皇室的興盛，已列世界遺產。還有童話般靈巧的黃金小徑，造訪22號藍色小屋，是作家卡夫卡的故居。",
          stops: [
            { name: "古皇宮", en: "Old Royal Palace", type: "ticket", lat: 50.09058, lng: 14.40157 },
            { name: "黃金小徑", en: "Golden Lane", type: "ticket", lat: 50.09206, lng: 14.40427 }
          ]
        },
        {
          name: "聖維特大教堂", en: "St. Vitus Cathedral", type: "ticket", lat: 50.09086, lng: 14.40057,
          img: "assets/img/d6-st-vitus.jpg",
          desc: "陽光透過藝術家慕夏之窗，灑進聖維特大教堂，建築原為羅曼式教堂，後改建為哥德式大教堂，網狀拱頂是最具突破性的創新，整座教堂被譽為「建築之寶」。",
          note: "若遇關閉或彌撒，將改聖喬治教堂。"
        },
        {
          name: "跳舞的房子景觀餐廳", en: "Tančící dům", type: "ticket", badge: "午餐", lat: 50.07543, lng: 14.41417,
          img: "assets/img/d6-dancing-house.jpg",
          desc: "建築大師法蘭克蓋瑞設計的跳舞的房子景觀餐廳，以兩棟造型獨特的建築構成，一棟挺拔的大樓，象徵男舞者，另一棟運用玻璃帷幕勾勒曼妙腰身，象徵女舞者，宛如一對正在共舞的情侶。"
        },
        {
          name: "自由活動・布拉格舊城區", en: "Old Town", type: "free", lat: 50.08745, lng: 14.42097,
          img: "assets/img/d6-old-town.jpg",
          desc: "推薦漫步舊城區，恣意踩著石板路閒逛，或許欣賞街頭藝人表演，或許靜靜聆聽市街上流洩不絕的笑聲與暢談，或許拿出購物清單，在浪漫的布拉格街道上，展開購物尋寶之旅。"
        }
      ],
      meals: { b: "飯店內自助式", l: "跳舞的房子景觀餐廳（若客滿或休息，將改其他景觀餐廳）", d: "自由活動時光，本餐敬請自理" },
      stay: "布拉格（連泊第 2 晚）",
      hotels: "prague",
      included: ["布拉格路面電車", "布拉格城堡區（含專業導遊、古皇宮、黃金小徑、聖維特大教堂）"],
      notes: []
    },
    {
      day: 7,
      date: "12/09（三）",
      title: "布拉格－帖契－維也納",
      tagline: "摩拉維亞古城到音樂之都",
      route: ["prague", "telc", "vienna"],
      km: [169, 153],
      sights: [
        {
          name: "帖契市政廣場", en: "Telč", type: "view", place: "telc",
          img: "assets/img/d7-telc.jpg",
          desc: "摩達維亞古城，吹著十四世紀的風。帖契市政廣場、迴廊街道、護城湖岸、哥德式塔尖，到文藝復興時期輝煌的立面；時間彷彿留在中世紀的向陽午後，歲月一切靜好，景色典雅無暇。"
        },
        {
          name: "維也納", en: "Vienna", type: "view", place: "vienna",
          img: "assets/img/d7-vienna.jpg",
          desc: "始建於羅馬時期的古老城邦維也納，是奧地利的首都以及第一大城，人口數在歐盟排名第六。歡迎走進這座迷人的「音樂之都」，感受音樂家是如何在維也納的懷抱裡，孕育永恆不朽的樂章。"
        }
      ],
      meals: { b: "飯店內自助式", l: "鄉村風味料理", d: "自由活動時光，本餐敬請自理" },
      stay: "維也納（連泊第 1 晚）",
      hotelImg: "assets/img/hotel-vienna.jpg",
      hotelDesc: "名選經典雋存的首都飯店，坐擁維也納精華地段與便捷交通。",
      hotels: "vienna",
      included: [],
      notes: []
    },
    {
      day: 8,
      date: "12/10（四）",
      title: "維也納 市區觀光・熊布朗宮・自由活動",
      tagline: "哈布斯堡的帝國榮光",
      route: ["vienna"],
      sights: [
        {
          name: "維也納市區觀光", en: "Vienna City", type: "view", lat: 48.20849, lng: 16.37313,
          img: "assets/img/d8-vienna.jpg",
          desc: "古老的哈布斯堡家族，帶領維也納走向中歐盛世，走訪聖史蒂芬大教堂、市立公園、霍夫堡皇宮、瑪麗亞特蕾西亞廣場，從歷史從藝術建築到教堂，進入內心最深刻的溫柔眷戀。",
          stops: [
            { name: "聖史蒂芬大教堂", en: "Stephansdom", type: "view", lat: 48.20849, lng: 16.37313 },
            { name: "市立公園", en: "Stadtpark", type: "view", lat: 48.20289, lng: 16.37972 },
            { name: "霍夫堡皇宮", en: "Hofburg", type: "view", lat: 48.20660, lng: 16.36550 },
            { name: "瑪麗亞特蕾西亞廣場", en: "Maria-Theresien-Platz", type: "view", lat: 48.20451, lng: 16.36090 }
          ]
        },
        {
          name: "熊布朗宮（美泉宮）", en: "Schönbrunn Palace", type: "ticket", lat: 48.18499, lng: 16.31157,
          img: "assets/img/d8-schonbrunn.jpg",
          desc: "氣勢磅礡的熊布朗宮，又稱「美泉宮」，建於1696年，直到1750年才完工，是奧匈帝國鼎盛之象徵，原是哈布斯堡家族的避暑別墅，經特蕾莎女王改建，並和法國凡爾賽宮齊名，1996年名列世界遺產。"
        },
        {
          name: "自由活動・維也納市區", en: "Graben / Kohlmarkt", type: "free", lat: 48.20837, lng: 16.37020,
          img: "assets/img/d8-vienna-free.jpg",
          desc: "推薦走訪維也納市區的行人徒步區，把握時光 Shopping，或欣賞商店街窗櫥藝術，或是點杯道地的維也納咖啡，悠閒的享受慢活時光，為旅程寫下美好的回憶。"
        }
      ],
      meals: { b: "飯店內自助式", l: "中式八菜一湯", d: "維也納豬肋排" },
      stay: "維也納（連泊第 2 晚）",
      hotels: "vienna",
      included: ["熊布朗宮"],
      notes: []
    },
    {
      day: 9,
      date: "12/11（五）",
      title: "維也納 ✈ 台北",
      tagline: "美好的旅程・我們下次再見",
      mode: "flight",
      route: ["vie_airport", "bkk", "tpe"],
      flight: "inbound",
      intro: "溫柔包好繽紛的紀念品，以及難忘的旅遊回憶，我們即將踏上歸途，和煦的風，會一直伴隨我們，祝福大家並歡迎下次再來作客！",
      img: "assets/img/d9-airport.jpg",
      sights: [],
      meals: { b: "飯店內自助式", l: "配合航班時間，本餐敬請自理", d: "飛機上" },
      stay: "夜宿機上",
      hotels: [],
      included: [],
      notes: []
    },
    {
      day: 10,
      date: "12/12（六）",
      title: "抵達台北",
      tagline: "分享您的旅行感動",
      mode: "flight",
      route: ["tpe"],
      intro: "快樂的記憶，滿載著異國浪漫情懷。無論是感動時刻、拍照打卡、購物祕笈，都烙印在您最深刻的回憶。",
      img: "assets/img/d10-taipei.jpg",
      sights: [],
      meals: null,
      stay: "溫暖的家",
      hotels: [],
      included: [],
      notes: []
    }
  ],

  // 連泊城市的飯店（Day 5–6 布拉格、Day 7–8 維也納共用）
  hotelSets: {
    prague: [
      { name: "Hilton Prague Old Town", stars: 5, lat: 50.08877, lng: 14.43175, addr: "V Celnici 7, 110 00 Prague 1, Czech Republic", tel: "+420-224-842-300" }
    ],
    vienna: [
      { name: "Eurostars Grand Hotel Wien", stars: 5, lat: 48.20209, lng: 16.37195, addr: "Kärntner Ring 9, 1010 Wien, Austria", tel: "+43-1-515800" }
    ]
  }
};
