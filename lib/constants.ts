export const U = {
  bg:          "#0a0a0f",
  bgDeep:      "#050508",
  glass:       "rgba(255,255,255,0.04)",
  glassHi:     "rgba(255,255,255,0.07)",
  glassLo:     "rgba(255,255,255,0.025)",
  border:      "rgba(255,255,255,0.08)",
  borderHi:    "rgba(255,255,255,0.14)",
  text:        "#ffffff",
  textDim:     "rgba(255,255,255,0.62)",
  textMute:    "rgba(255,255,255,0.38)",
  textFaint:   "rgba(255,255,255,0.20)",
  cyan:        "#22d3ee",
  cyanSoft:    "rgba(34,211,238,0.12)",
  violet:      "#a78bfa",
  violetSoft:  "rgba(167,139,250,0.12)",
  emerald:     "#34d399",
  emeraldSoft: "rgba(52,211,153,0.12)",
  amber:       "#fbbf24",
  amberSoft:   "rgba(251,191,36,0.12)",
  rose:        "#fb7185",
  roseSoft:    "rgba(251,113,133,0.12)",
  up:          "#34d399",
  down:        "#fb7185",
};

export const TICKERS = [
  {sym:"AAPL",name:"Apple Inc.",      price:214.72,chg:+1.34,pct:+0.63},
  {sym:"MSFT",name:"Microsoft",       price:428.15,chg:-2.18,pct:-0.51},
  {sym:"NVDA",name:"NVIDIA Corp.",    price:1087.43,chg:+23.61,pct:+2.22},
  {sym:"TSLA",name:"Tesla Inc.",      price:178.29,chg:-5.44,pct:-2.96},
  {sym:"GOOGL",name:"Alphabet Inc.",  price:175.84,chg:+0.92,pct:+0.52},
  {sym:"AMZN",name:"Amazon.com",      price:196.38,chg:+3.11,pct:+1.61},
  {sym:"META",name:"Meta Platforms",  price:523.67,chg:+8.44,pct:+1.64},
  {sym:"NFLX",name:"Netflix Inc.",    price:648.22,chg:-1.78,pct:-0.27},
];

export const SECTORS = [
  {name:"Technology",value:38.2,chg:+1.8},{name:"Healthcare",value:13.1,chg:+0.4},
  {name:"Financials",value:12.8,chg:-0.6},{name:"Consumer Disc.",value:10.4,chg:-1.2},
  {name:"Industrials",value:8.7,chg:+0.2},{name:"Energy",value:4.9,chg:-2.1},
  {name:"Utilities",value:3.8,chg:+0.7},{name:"Materials",value:3.1,chg:+0.1},
  {name:"Real Estate",value:2.9,chg:-0.3},{name:"Comm. Svcs.",value:2.1,chg:+1.1},
];

export const NEWS = [
  { id: 1, headline: "Fed signals two more rate cuts in 2025 as inflation cools to 2.1%", source: "Reuters", time: "2 m ago", fear: 28, sentiment: "Greed", region: "US" },
  { id: 2, headline: "NVIDIA surpasses $3T market cap amid AI chip supercycle demand surge", source: "Bloomberg", time: "14m ago", fear: 12, sentiment: "Extreme Greed", region: "US" },
  { id: 3, headline: "China's Evergrande restructuring fails; contagion risk spreads to Hong Kong banks", source: "FT", time: "31m ago", fear: 82, sentiment: "Fear", region: "CN" },
  { id: 4, headline: "EU antitrust regulators open probe into Apple's App Store dominance", source: "WSJ", time: "52m ago", fear: 61, sentiment: "Fear", region: "EU" },
  { id: 5, headline: "Saudi Aramco announces record $124B annual dividend for 2024", source: "CNBC", time: "1h ago", fear: 22, sentiment: "Greed", region: "SA" },
  { id: 6, headline: "Japan's Nikkei falls 2.3% on BOJ surprise rate hike announcement", source: "Nikkei", time: "1h ago", fear: 74, sentiment: "Fear", region: "JP" },
  { id: 7, headline: "Microsoft Azure cloud revenue grows 35% YoY — analysts raise price targets", source: "Barrons", time: "2h ago", fear: 15, sentiment: "Extreme Greed", region: "US" },
  { id: 8, headline: "Oil slips below $70/barrel on rising US inventory data", source: "Reuters", time: "2h ago", fear: 55, sentiment: "Neutral", region: "Global" },
];

export const SCORECARD = {
  AAPL: {pe:28.4,roe:147.2,cagr:8.3, margin:26.4,de:1.76,score:7.8,verdict:"Wise to Invest",      tag:"Value Quality",  name:"Apple Inc.",      radar:{val:72,prof:88,growth:62,health:70,mom:76,sent:80}},
  MSFT: {pe:34.2,roe:45.1, cagr:14.8,margin:43.1,de:0.52,score:8.4,verdict:"Wise to Invest",      tag:"Stable Growth",  name:"Microsoft Corp.", radar:{val:65,prof:82,growth:78,health:91,mom:69,sent:74}},
  NVDA: {pe:68.1,roe:91.4, cagr:84.2,margin:55.1,de:0.42,score:9.2,verdict:"Strong Buy Signal",   tag:"High Growth",    name:"NVIDIA Corp.",    radar:{val:48,prof:91,growth:98,health:86,mom:95,sent:90}},
  TSLA: {pe:52.7,roe:18.3, cagr:19.1,margin:8.2, de:0.08,score:5.4,verdict:"Proceed with Caution",tag:"Volatile Growth",name:"Tesla Inc.",       radar:{val:55,prof:42,growth:68,health:72,mom:58,sent:62}},
  GOOGL:{pe:22.1,roe:28.6, cagr:11.2,margin:24.0,de:0.09,score:8.1,verdict:"Wise to Invest",      tag:"Value Growth",   name:"Alphabet Inc.",   radar:{val:78,prof:76,growth:70,health:92,mom:72,sent:77}},
  AMZN: {pe:44.3,roe:22.1, cagr:17.4,margin:7.8, de:0.63,score:7.2,verdict:"Wise to Invest",      tag:"Platform Giant", name:"Amazon.com",       radar:{val:58,prof:60,growth:80,health:74,mom:78,sent:71}},
  META: {pe:24.6,roe:34.8, cagr:21.3,margin:35.3,de:0.10,score:8.6,verdict:"Strong Buy Signal",   tag:"Ad Dominance",   name:"Meta Platforms",  radar:{val:74,prof:84,growth:82,health:88,mom:84,sent:80}},
  NFLX: {pe:41.2,roe:29.4, cagr:12.7,margin:16.8,de:1.24,score:6.9,verdict:"Cautious Buy",        tag:"Content Leader", name:"Netflix Inc.",     radar:{val:60,prof:68,growth:58,health:64,mom:66,sent:68}},
};

export const QUICK_PROMPTS = [
  "Is NVDA wise to invest right now?",
  "Compare AAPL vs MSFT",
  "What's the risk on TSLA?",
  "Which stock has the best ROE?",
  "Explain P/E ratio in simple terms",
  "Best growth stock this quarter?",
];

export function genCandles(n = 60) {
  const d = []; let p = 200;
  for (let i = 0; i < n; i++) {
    const o = p + (Math.random() - .5) * 4, c = o + (Math.random() - .48) * 6;
    const dt = new Date(2025, 0, i + 1);
    d.push({
      date: `${dt.getMonth() + 1}/${dt.getDate()}`, open: +o.toFixed(2), close: +c.toFixed(2),
      high: +(Math.max(o, c) + Math.random() * 3).toFixed(2), low: +(Math.min(o, c) - Math.random() * 3).toFixed(2),
      volume: Math.round(Math.abs(45e6 + (Math.random() - .5) * 20e6)), bullish: c >= o
    });
    p = c;
  } return d;
}

export const CANDLE_DATA = genCandles(60);

export const fmt = (n: number | string, d = 2) => Number(n).toFixed(d);
