export const U = {
  bg:          "var(--bg)",
  bgDeep:      "var(--bg-deep)",
  glass:       "var(--glass)",
  glassHi:     "var(--glass-hi)",
  glassLo:     "var(--glass-lo)",
  border:      "var(--border)",
  borderHi:    "var(--border-hi)",
  text:        "var(--text)",
  textDim:     "var(--text-dim)",
  textMute:    "var(--text-mute)",
  textFaint:   "var(--text-faint)",
  cyan:        "var(--cyan)",
  cyanSoft:    "var(--cyan-soft)",
  violet:      "var(--violet)",
  violetSoft:  "var(--violet-soft)",
  emerald:     "var(--emerald)",
  emeraldSoft: "var(--emerald-soft)",
  amber:       "var(--amber)",
  amberSoft:   "var(--amber-soft)",
  rose:        "var(--rose)",
  roseSoft:    "var(--rose-soft)",
  up:          "var(--up)",
  down:        "var(--down)",
  navBg:       "var(--nav-bg)",
  headerBg:    "var(--header-bg)",
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

export const fmt = (n: number | string, d = 2) => Number(n).toFixed(d);
