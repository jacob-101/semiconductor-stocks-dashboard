# ◈ Silicon Sheet — US Semiconductor Stocks Dashboard

> A screener-style dashboard of **98 US-listed semiconductor & related stocks**
> — sortable, filterable by sub-sector, searchable, with CSV export.
> Zero build step. Zero dependencies. Deploys anywhere.

![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
[![Data](https://img.shields.io/badge/Data-Yahoo_Finance_·_yfinance-7B61FF?style=flat-square)](https://finance.yahoo.com)
![Stocks](https://img.shields.io/badge/Stocks-98-e8b25c?style=flat-square)
![Static](https://img.shields.io/badge/Static-HTML_CSS_JS-22d3ee?style=flat-square)

📦 **Repo:** https://github.com/jacob-101/semiconductor-stocks-dashboard

Production URL: not published yet. Netlify settings are in `netlify.toml`. After the site is linked and deployed, put the URL Netlify assigns here.

---

## ✨ What you get

| Feature | Details |
|---|---|
| 📊 **98 names, one page** | IDM, fabless, foundry, memory, equipment, OSAT, EDA/IP, materials, chemicals & gases, photonics, distributors — no pagination |
| 🔍 **Search** | Company name or ticker, instant filtering |
| 🏷️ **Sub-sector pills** | One-click filters with live counts per sector |
| ↕️ **Sorting** | Every numeric column + company name, click the header |
| ☑️ **Edit columns** | Show / hide any column, reset in one click |
| 📥 **CSV export** | Downloads exactly what you see (current filter + sort) |
| 📈 **Market snapshot** | Tracked names, combined market cap, median P/E, fastest grower — plus a scrolling revenue-movers tape |
| 📱 **Responsive + dark** | Wafer-room trading-desk theme, works on mobile |

---

## 🚀 View it

`fetch()` needs HTTP, so serve the folder (don't open `index.html` via `file://`):

```bash
# from the project root
python3 -m http.server 8000
# → open http://localhost:8000
```

Or with Node:

```bash
npx serve .
```

### Deploy on Netlify

Plain static site. No framework, no build, no environment variables.

| Setting | Value |
|---|---|
| Framework | None (static HTML / CSS / JS) |
| Build command | `true` (no-op in `netlify.toml`; leave the UI field empty) |
| Publish directory | `.` |
| Environment variables | none |

`netlify.toml` sets `publish = "."`, skips asset post-processing, and turns Pretty URLs off so `/company.html` is not rewritten onto the dashboard fallback.

1. **From Git:** Netlify → *Add new site → Import an existing project* → connect this repo. The toml overrides the build command and publish directory. Deploy.
2. **From CLI** (after `npx netlify login` and `npx netlify init` or `npx netlify link`):
   ```bash
   npx netlify deploy --prod --dir .
   ```

---

## 🔄 Refresh the data

```bash
python3 scripts/fetch_data.py   # stocks → data/semiconductors.json
```

Pulls live prices + annual fundamentals from **Yahoo Finance (via `yfinance`)** into `data/semiconductors.json`. No API key needed.

| Field | Meaning |
|---|---|
| `price` / `pe` / `market_cap` | Latest market values |
| `rev` / `rev_yoy` | Latest fiscal-year revenue + YoY % vs prior FY |
| `ni` / `ni_yoy` | Latest fiscal-year net profit + YoY % |
| `net_margin` | Net profit ÷ revenue × 100 |
| `fy` | Fiscal-year label (`FY2025`, or `TTM` for ADRs without annual statements on Yahoo) |

> Foreign issuers' statements are converted to USD. Data snapshot: **2026-11-07 09:32 UTC · 98 rows**.
> Re-run the script anytime to refresh — then redeploy (or commit the updated JSON).

---

## 🗂️ Project layout

```
.
├── index.html              # dashboard page
├── styles.css              # wafer-room dark theme (no framework)
├── app.js                  # sorting / filtering / search / CSV / stats / tape
├── company.html             # technology profile page (pilot: Micron)
├── company.css / company.js # profile page assets
├── favicon.svg             # vector icon (plus ico / png fallbacks)
├── site.webmanifest        # name, theme color, icon set
├── data/
│   ├── semiconductors.json # baked dataset + as_of timestamp
│   └── companies/mu.json   # Micron profile content
├── scripts/
│   ├── tickers.py          # 98-ticker universe + sub-sector map
│   └── fetch_data.py       # Yahoo Finance collector (FY vs prior FY)
├── netlify.toml            # publish ".", no build, Pretty URLs off
└── README.md
```

---

## 🛠️ Tech

- **Frontend:** hand-written HTML + CSS + vanilla JS — no bundler, no framework, no tracking
- **Fonts:** Fraunces (display) · IBM Plex Sans (body) · IBM Plex Mono (numbers)
- **Data:** `yfinance` → `data/semiconductors.json` (baked at fetch time, served statically)
- **Hosting:** any static host (Netlify, GitHub Pages, Vercel, S3…)

---

## ⚠️ Disclaimer

Price, P/E and market cap are latest values; revenue, profit and margin are the latest fiscal year (FY varies by company; a few foreign ADRs show TTM). For education only — **not investment advice**.

---

<p align="center">Built with vanilla HTML/CSS/JS · Data: Yahoo Finance</p>
