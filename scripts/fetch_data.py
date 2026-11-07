"""Fetch live semiconductor data via yfinance and bake into data/semiconductors.json.

Annual figures (latest fiscal year vs prior fiscal year):
  total revenue, revenue YoY %, net profit, net profit YoY %, net margin %.
Plus price, P/E, market cap. Foreign issuers converted to USD.
ADRs with no annual statement on Yahoo fall back to TTM info fields
(growth then unavailable).

Usage:  python3 scripts/fetch_data.py
"""
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import yfinance as yf

sys.path.insert(0, str(Path(__file__).parent))
from tickers import UNIVERSE, SECTOR_OF  # noqa: E402

OUT = Path(__file__).parent.parent / "data" / "semiconductors.json"

REV_ROWS = ["Total Revenue"]
NI_ROWS = ["Net Income", "Net Income Common Stockholders",
           "Net Income From Continuing Operation Net Minority Interest",
           "Net Income Including Noncontrolling Interests"]


def pick_row(df, candidates):
    for name in candidates:
        if name in df.index:
            return df.loc[name]
    return None


def first_valid(series, n):
    """First n non-null values as floats (most-recent-first order)."""
    vals = []
    for v in series.tolist():
        try:
            f = float(v)
        except (TypeError, ValueError):
            continue
        if f != f:  # NaN
            continue
        vals.append(f)
        if len(vals) == n:
            break
    return vals


def yoy(cur, ago):
    if cur is None or ago is None or ago == 0:
        return None
    return (cur - ago) / abs(ago) * 100.0


def fx_to_usd():
    """USD-per-unit rates for non-USD reporting currencies (Yahoo FX)."""
    rates = {"USD": 1.0}

    def per_usd(cross):
        """cross = units of currency per USD -> return USD per unit."""
        try:
            return 1.0 / float(yf.Ticker(cross).fast_info.last_price)
        except Exception:
            return None

    rates["TWD"] = per_usd("TWD=X")
    rates["JPY"] = per_usd("JPY=X")
    rates["KRW"] = per_usd("KRW=X")
    rates["CHF"] = per_usd("CHF=X")
    try:
        rates["EUR"] = float(yf.Ticker("EURUSD=X").fast_info.last_price)
    except Exception:
        pass
    rates = {k: v for k, v in rates.items() if v}
    return rates


FX = None


def fetch_one(ticker, attempt=0):
    global FX
    if FX is None:
        FX = fx_to_usd()
    t = yf.Ticker(ticker)
    try:
        fi = t.fast_info
        price = fi.last_price
        mktcap = fi.market_cap
    except Exception:
        price, mktcap = None, None
    try:
        info = t.info or {}
    except Exception:
        info = {}

    if price is None:
        price = info.get("currentPrice", info.get("regularMarketPrice"))
    if mktcap is None:
        mktcap = info.get("marketCap")

    name = info.get("longName") or info.get("shortName") or ticker
    pe = info.get("trailingPE")
    currency = info.get("currency", "USD")
    fin_currency = info.get("financialCurrency", "USD") or "USD"
    fx = FX.get(fin_currency, 1.0)
    exchange = info.get("exchange", "")

    # --- annual income statement: latest FY vs prior FY ---
    rev = rev_prev = ni = ni_prev = None
    fy_label = None
    try:
        fis = t.income_stmt
        if fis is not None and len(fis.columns) >= 1:
            fy_label = f"FY{fis.columns[0].year}"
            rev_row = pick_row(fis, REV_ROWS)
            ni_row = pick_row(fis, NI_ROWS)
            if rev_row is not None:
                r = first_valid(rev_row, 2)
                if len(r) >= 1:
                    rev = r[0]
                if len(r) >= 2:
                    rev_prev = r[1]
            if ni_row is not None:
                n = first_valid(ni_row, 2)
                if len(n) >= 1:
                    ni = n[0]
                if len(n) >= 2:
                    ni_prev = n[1]
    except Exception:
        pass

    # --- TTM fallback for names with no annual statement on Yahoo ---
    if rev is None or ni is None:
        rev_ttm = info.get("totalRevenue")
        ni_ttm = info.get("netIncomeToCommon")
        if rev is None and isinstance(rev_ttm, (int, float)):
            rev = float(rev_ttm)  # in financialCurrency; converted below
        if ni is None and isinstance(ni_ttm, (int, float)):
            ni = float(ni_ttm)
        fy_label = "TTM"

    rev_yoy = yoy(rev, rev_prev)
    ni_yoy = yoy(ni, ni_prev)
    net_margin = (ni / rev * 100.0) if rev else None

    # Convert statement figures to USD (Yahoo reports ADRs in home currency).
    if rev is not None:
        rev *= fx
    if ni is not None:
        ni *= fx

    return {
        "ticker": ticker,
        "company": name,
        "sector": SECTOR_OF[ticker],
        "exchange": exchange,
        "currency": currency,
        "price": price,
        "pe": pe,
        "market_cap": mktcap,
        "rev": rev,
        "rev_yoy": rev_yoy,
        "ni": ni,
        "ni_yoy": ni_yoy,
        "net_margin": net_margin,
        "fy": fy_label,
    }


def fetch_all():
    results, failed = {}, []
    with ThreadPoolExecutor(max_workers=5) as ex:
        futs = {ex.submit(fetch_one, tc): tc for tc, _ in UNIVERSE}
        done = 0
        for fut in futs:
            tc = futs[fut]
            try:
                results[tc] = fut.result()
            except Exception as e:  # retry once after a pause (rate limits)
                time.sleep(5)
                try:
                    results[tc] = fetch_one(tc)
                except Exception:
                    failed.append(tc)
                    print(f"FAILED {tc}: {e}", flush=True)
            done += 1
            if done % 10 == 0:
                print(f"... {done}/{len(UNIVERSE)} done", flush=True)
            time.sleep(0.3)
    return [results[tc] for tc, _ in UNIVERSE if tc in results], failed


def main():
    print(f"Fetching {len(UNIVERSE)} tickers...", flush=True)
    rows, failed = fetch_all()
    payload = {
        "as_of": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Yahoo Finance (via yfinance)",
        "count": len(rows),
        "rows": rows,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1))
    have_price = sum(1 for r in rows if r["price"])
    have_rev = sum(1 for r in rows if r["rev"])
    print(f"Wrote {OUT}: {len(rows)} rows, {have_price} with price, "
          f"{have_rev} with revenue.")
    if failed:
        print("Failed:", failed)


if __name__ == "__main__":
    main()
