// tp-data.jsx — Matsumoto + Azumino trip seed + expenses

const TRIP = {
  title: "Matsumoto + Azumino",
  tagline: "Castle Town, Countryside Cycling & Onsen Retreat",
  origin: "Akasaka, Tokyo",
  destination: "Matsumoto + Azumino, Nagano",
  nights: 2, days: 3, pax: 2,
  dates: "Jun 18 – 20",
  bestTime: "Mid – late June",
  weather: "23–28°C day · 14–18°C morning/eve",
  pace: "Relaxed",
  style: "Mid-range",
  cycling: "Easy · mostly flat, low traffic",
  budgetLow: 40000, budgetHigh: 60000, // per person, JPY
  interests: ["Cycling", "Onsen", "Nature", "Food", "Photography", "Slow travel"],
  freeText: "Castle town + countryside cycling, onsen ryokan, lots of photo stops, easy pace.",
};

// ---- real online photos (Wikimedia Commons, stable Special:FilePath redirect) ----
// A failed load degrades to the drop-a-photo placeholder (see image-slot.js),
// and a user can always drop their own image over any slot.
const W = (file, w) => "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=" + (w || 900);
const PHOTOS = {
  castle:     W("Matsumoto Matsumoto-jo 06.jpg", 1500),
  castleMoat: W("Matsumoto castle.JPG"),
  castleKeep: W("Keep of Matsumoto Castle.JPG"),
  wasabi:     W("2016-07-03 Daio Wasabi Farm \u5927\u738b\u308f\u3055\u3073\u8fb2\u5712 \u84fc\u5ddd\u3068\u6c34\u8eca\u5c0f\u5c4b DSCF0264.jpg"),
  azumino:    W("Azumino Wasabi Field Spring Water flock.jpg"),
  ryokan:     W("Fujiya Ryokan in Ginzan Onsen 20181006.jpg"),
};

// derive a date label + night/day count from two ISO dates
const _MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function tripDates(s, e) {
  const sd = new Date(s + "T00:00"), ed = new Date(e + "T00:00");
  if (isNaN(sd) || isNaN(ed) || ed < sd) return { label: TRIP.dates, nights: TRIP.nights, days: TRIP.days };
  const nights = Math.max(0, Math.round((ed - sd) / 86400000));
  const label = _MON[sd.getMonth()] + " " + sd.getDate() + " \u2013 " +
    (sd.getMonth() === ed.getMonth() ? ed.getDate() : _MON[ed.getMonth()] + " " + ed.getDate());
  return { label, nights, days: nights + 1 };
}
const taglineFor = (plan) => plan.style + " \u00b7 " + (plan.interests.slice(0, 3).join(", ") || "Custom trip");

const GET_THERE = [
  { mode: "Metro", from: "Akasaka", note: "Marunouchi Line · ~15 min", cost: "" },
  { mode: "Transfer", from: "Shinjuku Station", note: "Switch to JR lines", cost: "" },
  { mode: "Limited Express", from: "Azusa → Matsumoto", note: "~2.5 hrs · reserved seat recommended", cost: "¥6,600" },
  { mode: "Arrive", from: "Matsumoto Station", note: "Total ~3 hrs door-to-door", cost: "" },
];

const STAYS = [
  {
    name: "Ryokan Shoho", jp: "松本・浅間温泉", pick: true,
    tag: "Traditional Ryokan", cap: "Asama Onsen ryokan", img: PHOTOS.ryokan,
    pts: ["Traditional rooms + large onsen", "Kaiseki dinner & breakfast", "~15 min by bus from Matsumoto Sta.", "Great balance of comfort & value"],
    nights: "Night 2",
  },
  {
    name: "Onyado Nono Matsumoto", jp: "", pick: false,
    tag: "City Stay", cap: "Near station onsen hotel", img: PHOTOS.castleMoat,
    pts: ["Near the station", "Onsen + comfortable rooms", "Easy access to castle & cafés"],
    nights: "Night 1",
  },
];

// id, time, kind, name, meta, mark(dot color), cap(photo), alts(swap options)
const DAYS = [
  {
    n: "01", title: "Matsumoto City", sub: "Fri · Jun 18 · Overnight Matsumoto",
    items: [
      { id: "d1a", time: "09:00", kind: "Travel", name: "Limited Express Azusa", meta: "Shinjuku → Matsumoto · arrive ~11:40", mark: "" },
      { id: "d1b", time: "12:00", kind: "Lunch", name: "Shinshu Soba", meta: "Try Kobayashi Soba or Nomugi", mark: "rust", cap: "Shinshu soba",
        alts: ["Shinshu Soba — Kobayashi", "Nomugi (queue early)", "Kawakami soba"] },
      { id: "d1c", time: "13:30", kind: "Sight", name: "Matsumoto Castle", meta: "90 min · national treasure · top photo spot", mark: "", cap: "Matsumoto Castle", img: PHOTOS.castleMoat },
      { id: "d1d", time: "15:30", kind: "Stroll", name: "Nakamachi Street", meta: "Traditional merchant district & crafts", mark: "", cap: "Nakamachi Street" },
      { id: "d1e", time: "16:30", kind: "Café", name: "Alps Coffee Lab", meta: "or High-Five Coffee", mark: "gold", cap: "Alps Coffee Lab",
        alts: ["Alps Coffee Lab", "High-Five Coffee", "Café Risut"] },
      { id: "d1f", time: "18:00", kind: "Dinner", name: "Alps Gohan", meta: "or Matsumoto Jujo Dining · local ingredients", mark: "rust", cap: "Alps Gohan dinner",
        alts: ["Alps Gohan", "Matsumoto Jujo Dining", "Menzo (ramen)"] },
      { id: "d1g", time: "20:00", kind: "Evening", name: "Night walk · castle moat", meta: "Illuminated castle reflection", mark: "", cap: "Castle night view", img: PHOTOS.castleKeep },
    ],
  },
  {
    n: "02", title: "Azumino Cycling Day", sub: "Sat · Jun 19 · Overnight Ryokan (onsen + kaiseki)",
    items: [
      { id: "d2a", time: "09:00", kind: "Train", name: "Matsumoto → Hotaka", meta: "Oito Line · ~30 min", mark: "" },
      { id: "d2b", time: "09:45", kind: "Bike", name: "E-bike rental · Hotaka Sta.", meta: "E-bike recommended · ¥2,000–3,500", mark: "gold", cap: "Azumino cycling",
        alts: ["E-bike (recommended)", "City bike (cheaper)", "Tandem"] },
      { id: "d2c", time: "10:15", kind: "Stop 1", name: "Daio Wasabi Farm", meta: "Watermills · wasabi ice cream · wasabi soba", mark: "", cap: "Daio Wasabi Farm", img: PHOTOS.wasabi },
      { id: "d2d", time: "11:30", kind: "Stop 2", name: "Scenic rice fields", meta: "Best photos with the Northern Alps", mark: "", cap: "Rice fields & Alps", img: PHOTOS.azumino },
      { id: "d2e", time: "13:00", kind: "Café", name: "Azumino Terrace", meta: "Timings Bake Shop / Ararat Café · apple desserts", mark: "gold", cap: "Café terrace",
        alts: ["Azumino Terrace", "Timings Bake Shop", "Ararat Café"] },
      { id: "d2f", time: "14:30", kind: "Stop 4", name: "Riverside path", meta: "Most beautiful & relaxing section · flat roads", mark: "", cap: "Riverside path" },
      { id: "d2g", time: "17:00", kind: "Sunset", name: "Mountain view point", meta: "Best light of the day", mark: "rust", cap: "Sunset mountain view", img: PHOTOS.azumino },
      { id: "d2h", time: "19:00", kind: "Dinner", name: "Back in Matsumoto", meta: "The Source Diner or Okina-do", mark: "rust", cap: "Dinner",
        alts: ["The Source Diner", "Okina-do", "Ryokan kaiseki"] },
    ],
  },
  {
    n: "03", title: "Relax & Return", sub: "Sun · Jun 20 · Arrive Akasaka 16:00–17:00",
    items: [
      { id: "d3a", time: "07:30", kind: "Breakfast", name: "Ryokan breakfast", meta: "Enjoy a relaxed morning", mark: "" },
      { id: "d3b", time: "09:30", kind: "Museum", name: "Matsumoto City Museum of Art", meta: "Yayoi Kusama collection · alt: Metoba River ride", mark: "", cap: "Museum of Art",
        alts: ["Museum of Art (Kusama)", "Metoba River bike ride", "Free morning"] },
      { id: "d3c", time: "11:30", kind: "Lunch", name: "Soba · local curry · bakery", meta: "Last bites before the train", mark: "rust", cap: "Lunch" },
      { id: "d3d", time: "13:00", kind: "Train", name: "Matsumoto → Shinjuku", meta: "Limited Express Azusa", mark: "" },
    ],
  },
];

const ESSENTIALS = {
  packing: ["Light jacket", "Compact umbrella", "Sunscreen", "Water bottle", "Comfortable shoes", "Camera / phone", "Portable charger", "Cycling gloves (optional)"],
  photos: ["Matsumoto Castle", "Castle reflection", "Nakamachi Street", "Daio Wasabi Farm", "Watermill", "Rice fields & Alps", "Countryside cycling", "Café terrace", "Sunset mountain view", "Traditional ryokan", "Onsen morning view"],
  tips: ["Book train seats in advance", "E-bike makes the ride easier", "Cash is useful in small shops", "Stay hydrated while cycling", "Start early for the best light"],
  apps: ["Google Maps", "Navitime", "Japan Transit Planner", "Tenki.jp (weather)"],
  rainy: [
    { t: "Morning", d: "Daio Wasabi Farm — indoor museum & shops" },
    { t: "Afternoon", d: "Matsumoto Museum of Art · Nakamachi · café hopping" },
    { t: "Evening", d: "Onsen & local dining" },
  ],
};

const CATEGORIES = [
  { key: "Transport", color: "#2f5638" },
  { key: "Lodging", color: "#b4863a" },
  { key: "Food", color: "#b25a3c" },
  { key: "Activities", color: "#5d7a4f" },
  { key: "Shopping", color: "#7c6f9c" },
  { key: "Other", color: "#8a8676" },
];
const catColor = (k) => (CATEGORIES.find(c => c.key === k) || CATEGORIES[5]).color;

// amounts in JPY. confirmed = from user; est = placeholder to replace
const INITIAL_EXPENSES = [
  { id: "e1", date: "Jun 18", item: "Limited Express Azusa · return ×2", cat: "Transport", day: "Day 1", amt: 26480, ccy: "JPY", who: "Both", note: "¥13,240 × 2 pax", confirmed: true },
  { id: "e2", date: "Jun 18", item: "Onyado Nono Matsumoto · night 1", cat: "Lodging", day: "Day 1", amt: 22340, ccy: "JPY", who: "Both", note: "", confirmed: true },
  { id: "e3", date: "Jun 19", item: "Ryokan Shoho · night 2 (kaiseki)", cat: "Lodging", day: "Day 2", amt: 23440, ccy: "JPY", who: "Both", note: "", confirmed: true },
  { id: "e4", date: "Jun 19", item: "E-bike rental ×2", cat: "Activities", day: "Day 2", amt: 6000, ccy: "JPY", who: "Both", note: "placeholder — edit me", confirmed: false },
  { id: "e5", date: "Jun 18", item: "Shinshu soba lunch", cat: "Food", day: "Day 1", amt: 2800, ccy: "JPY", who: "Both", note: "placeholder — edit me", confirmed: false },
  { id: "e6", date: "Jun 19", item: "Wasabi soba + café", cat: "Food", day: "Day 2", amt: 3600, ccy: "JPY", who: "Both", note: "placeholder — edit me", confirmed: false },
];

// currencies — code, name, symbol, rate = JPY -> code (1 JPY = rate units)
const CURRENCIES = [
  { code: "JPY", name: "Japanese Yen", sym: "¥", rate: 1 },
  { code: "USD", name: "US Dollar", sym: "$", rate: 0.0064 },
  { code: "EUR", name: "Euro", sym: "€", rate: 0.0059 },
  { code: "GBP", name: "British Pound", sym: "£", rate: 0.0050 },
  { code: "THB", name: "Thai Baht", sym: "฿", rate: 0.23 },
  { code: "SGD", name: "Singapore Dollar", sym: "S$", rate: 0.0086 },
  { code: "AUD", name: "Australian Dollar", sym: "A$", rate: 0.0098 },
  { code: "CNY", name: "Chinese Yuan", sym: "¥", rate: 0.046 },
  { code: "KRW", name: "Korean Won", sym: "₩", rate: 8.8 },
  { code: "HKD", name: "Hong Kong Dollar", sym: "HK$", rate: 0.050 },
  { code: "TWD", name: "Taiwan Dollar", sym: "NT$", rate: 0.205 },
  { code: "CAD", name: "Canadian Dollar", sym: "C$", rate: 0.0088 },
  { code: "MYR", name: "Malaysian Ringgit", sym: "RM", rate: 0.030 },
  { code: "PHP", name: "Philippine Peso", sym: "₱", rate: 0.37 },
  { code: "VND", name: "Vietnamese Dong", sym: "₫", rate: 162 },
  { code: "INR", name: "Indian Rupee", sym: "₹", rate: 0.55 },
];
const CCY = Object.fromEntries(CURRENCIES.map(c => [c.code, c]));
const FX = Object.fromEntries(CURRENCIES.map(c => [c.code, c.rate])); // JPY -> code
const ccySym = (code) => (CCY[code] || { sym: code }).sym;
const fmtJPY = (n) => "¥" + Math.round(n).toLocaleString("en-US");
const fmtCcy = (n, code) => ccySym(code) + Math.round(n).toLocaleString("en-US");
const toJPY = (amt, code) => (+amt || 0) / (FX[code] || 1);       // code -> JPY
const fromJPY = (jpy, code) => (+jpy || 0) * (FX[code] || 1);     // JPY -> code
const fmtHome = (jpyAmount, home) => home === "JPY" ? "" : fmtCcy(fromJPY(jpyAmount, home), home);

// outbound links
const enc = (s) => encodeURIComponent(s);
const gmaps = (q) => "https://www.google.com/maps/search/?api=1&query=" + enc(q + " Matsumoto Nagano Japan");
const gsearch = (q) => "https://www.google.com/search?q=" + enc(q);
const tripcom = (q) => "https://www.trip.com/hotels/list?searchType=H&searchWord=" + enc(q);

const APP_LINKS = {
  "Google Maps": "https://maps.google.com",
  "Navitime": "https://www.navitime.co.jp/",
  "Japan Transit Planner": "https://world.jorudan.co.jp/mln/en/",
  "Tenki.jp (weather)": "https://tenki.jp/",
};

const mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + enc(q);

// destination-aware route + stays: keep the curated Matsumoto content when
// that's the destination, otherwise derive generic destination-based drafts
const _short = (s) => (s || "").split(" + ")[0].split(",")[0].trim();
const _isMatsumoto = (trip) => /matsumoto/i.test(trip.destination || "");
function routeFor(trip) {
  if (_isMatsumoto(trip)) return GET_THERE;
  const o = _short(trip.origin), d = _short(trip.destination);
  return [
    { mode: "Depart", from: o, note: "Head to the main rail / transit hub", cost: "" },
    { mode: "Transit", from: "Connection", note: "Fastest train or transfer for this route", cost: "" },
    { mode: "Main leg", from: o + " → " + d, note: "Reserve a seat in advance where possible", cost: "" },
    { mode: "Arrive", from: d, note: "Door-to-door time varies by route", cost: "" },
  ];
}
function staysFor(trip) {
  if (_isMatsumoto(trip)) return STAYS;
  const d = _short(trip.destination);
  const lux = trip.style === "Luxury", bud = trip.style === "Budget";
  return [
    { name: d + (lux ? " Grand Retreat" : " Boutique Stay"), jp: "", pick: true, tag: trip.style + " pick", cap: d + " recommended stay", img: "",
      pts: ["Central, well-rated & walkable", "A strong fit for a " + (trip.style || "mid-range").toLowerCase() + " trip", "Easy access to the main sights", "Book early for the best rate"], nights: "Recommended" },
    { name: d + (bud ? " Hostel & Capsule" : " City Hotel"), jp: "", pick: false, tag: "Alternative", cap: d + " city stay", img: "",
      pts: ["Close to transit & dining", "Comfortable, no-fuss rooms", "Flexible cancellation"], nights: "Alternative" },
  ];
}

Object.assign(window, {
  PHOTOS, tripDates, taglineFor, routeFor, staysFor, mapsUrl,
  TRIP, GET_THERE, STAYS, DAYS, ESSENTIALS, CATEGORIES, catColor, INITIAL_EXPENSES,
  CURRENCIES, CCY, FX, ccySym, fmtJPY, fmtCcy, toJPY, fromJPY, fmtHome,
  gmaps, gsearch, tripcom, APP_LINKS,
});
