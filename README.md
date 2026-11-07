# US Semiconductor Stocks Dashboard

Static dashboard of **98 semiconductor & semiconductor-related stocks listed on
NYSE/Nasdaq** (IDM, fabless, foundry, memory & storage, equipment, OSAT & packaging,
EDA/IP, materials & wafers, chemicals & gases, photonics, distributors) — Screener-style
table with sorting, sub-sector filters, search, column toggles and CSV export. Everything
renders on one page (no pagination).

## View it

`fetch()` needs HTTP, so serve the folder (don't open `index.html` via `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000 -> stock dashboard
```

## Refresh the data

```bash
python3 scripts/fetch_data.py # stocks -> data/semiconductors.json
```

Pulls live prices + quarterly fundamentals from Yahoo Finance (via yfinance)
into `data/semiconductors.json`. No API key needed.

## Layout

- `index.html` / `styles.css` / `app.js` — stock dashboard (no build step, no dependencies)
- `company.html` / `company.css` / `company.js` — company technology profile
- `data/semiconductors.json` — baked dataset + `as_of` timestamp
- `scripts/tickers.py` — ticker universe with sub-sector mapping
- `scripts/fetch_data.py` — data collector (latest fiscal year vs prior year:
  revenue, revenue YoY, net profit, profit YoY, net margin; foreign issuers'
  statements converted to USD)
- `scripts/fetch_sg_careers.py` — MyCareersFuture scraper and role classifier

