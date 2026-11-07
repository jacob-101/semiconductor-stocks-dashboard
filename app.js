/* Semiconductor dashboard: sortable / filterable / searchable table. */
"use strict";

const COLUMNS = [
  { key: "sno",       label: "S.No.",            align: "left",  sortable: false, visible: true,  locked: true },
  { key: "company",   label: "Company",          align: "left",  sortable: true,  visible: true,  locked: true },
  { key: "sector",    label: "Sub-Sector",       align: "left",  sortable: true,  visible: true },
  { key: "market_cap",label: "Mar Cap", unit: "$", align: "right", sortable: true, visible: true, fmt: "bigmoney" },
  { key: "pe",        label: "P/E",              align: "right", sortable: true,  visible: true,  fmt: "num2" },
  { key: "price",     label: "Price", unit: "$", align: "right", sortable: true,  visible: true,  fmt: "money2" },
  { key: "rev",       label: "Total Revenue", unit: "$", align: "right", sortable: true, visible: true, fmt: "bigmoney" },
  { key: "rev_yoy",   label: "Revenue YoY", unit: "%", align: "right", sortable: true, visible: true, fmt: "growth1" },
  { key: "ni",        label: "Net Profit", unit: "$", align: "right", sortable: true, visible: true, fmt: "bigmoney" },
  { key: "ni_yoy",    label: "Profit YoY", unit: "%", align: "right", sortable: true, visible: true, fmt: "growth1" },
  { key: "net_margin",label: "Net Margin", unit: "%", align: "right", sortable: true, visible: true, fmt: "pct1signed" },
];

const state = {
  rows: [],
  asOf: "",
  sortKey: "market_cap",
  sortDir: -1,
  sector: "ALL",
  query: "",
};

const $ = (id) => document.getElementById(id);
const DASH = "—";

/* Tickers with a published technology profile page (pilot: Micron only). */
const PROFILED = new Set(["MU"]);

/* ---------- formatting ---------- */
function fmtMoney2(v) {
  if (v == null) return DASH;
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtBigMoney(v) {
  if (v == null) return DASH;
  const neg = v < 0 ? "-" : "";
  const a = Math.abs(v);
  if (a >= 1e12) return `${neg}${(a / 1e12).toLocaleString("en-US", { maximumFractionDigits: 2 })}T`;
  if (a >= 1e9)  return `${neg}${(a / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 })}B`;
  return `${neg}${(a / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
}
function fmtNum2(v) {
  if (v == null) return DASH;
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(v, digits) {
  if (v == null) return DASH;
  return `${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
function cellText(col, row) {
  const v = row[col.key];
  switch (col.fmt) {
    case "money2":   return v == null ? DASH : fmtMoney2(v);
    case "bigmoney": return v == null ? DASH : fmtBigMoney(v);
    case "num2":     return v == null ? DASH : fmtNum2(v);
    case "pct2":     return v == null ? DASH : fmtPct(v, 2);
    case "pct1signed": return v == null ? DASH : fmtPct(v, 1);
    case "growth1":  return v == null ? DASH : fmtPct(v, 1);
    default: return v == null ? DASH : String(v);
  }
}
function cellClass(col, row) {
  if (col.fmt === "growth1" && row[col.key] != null) {
    return row[col.key] < 0 ? "growth-neg" : "growth-pos";
  }
  return "";
}

/* ---------- data pipeline ---------- */
function filteredRows() {
  const q = state.query.trim().toLowerCase();
  let rows = state.rows;
  if (state.sector !== "ALL") rows = rows.filter((r) => r.sector === state.sector);
  if (q) {
    rows = rows.filter((r) =>
      r.company.toLowerCase().includes(q) || r.ticker.toLowerCase().includes(q));
  }
  const { sortKey, sortDir } = state;
  return [...rows].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (sortKey === "company") return sortDir * a.company.localeCompare(b.company);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return sortDir * (av - bv);
  });
}

/* ---------- rendering ---------- */
function visibleCols() { return COLUMNS.filter((c) => c.visible); }

function renderHead() {
  const tr = $("headRow");
  tr.innerHTML = "";
  for (const col of visibleCols()) {
    const th = document.createElement("th");
    th.className = (col.align === "left" ? "left" : "") +
      (state.sortKey === col.key && col.sortable ? " sort-key" : "");
    const arrow = state.sortKey === col.key ? (state.sortDir === 1 ? " &#8593;" : " &#8595;") : "";
    th.innerHTML = `${col.label}${col.unit ? ` <span class="unit">${col.unit}</span>` : ""}${col.sortable ? arrow : ""}`;
    if (col.sortable) {
      th.title = `Sort by ${col.label}`;
      th.addEventListener("click", () => {
        if (state.sortKey === col.key) state.sortDir *= -1;
        else { state.sortKey = col.key; state.sortDir = col.key === "company" || col.key === "sector" ? 1 : -1; }
        renderAll();
      });
    }
    tr.appendChild(th);
  }
}

function companyCell(row) {
  const td = document.createElement("td");
  td.className = "left company";
  const a = document.createElement("a");
  const meta = `${row.company} (${row.ticker})${row.exchange ? " · " + row.exchange : ""}${row.fy ? " · " + row.fy : ""}`;
  if (PROFILED.has(row.ticker)) {
    a.href = `company.html?t=${row.ticker}`;
    a.title = `${meta} — open technology profile`;
  } else {
    a.href = `https://finance.yahoo.com/quote/${row.ticker}`;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = `${meta} — open on Yahoo Finance`;
  }
  a.textContent = row.company.length > 34 ? row.company.slice(0, 33) + "…" : row.company;
  const tick = document.createElement("span");
  tick.className = "ticker";
  tick.textContent = row.ticker;
  td.appendChild(a);
  td.appendChild(tick);
  return td;
}

function renderBody(pageRows, startNo) {
  const tb = $("bodyRows");
  tb.innerHTML = "";
  pageRows.forEach((row, i) => {
    const tr = document.createElement("tr");
    for (const col of visibleCols()) {
      let td;
      if (col.key === "sno") {
        td = document.createElement("td");
        td.className = "left";
        td.textContent = `${startNo + i}.`;
      } else if (col.key === "company") {
        td = companyCell(row);
      } else if (col.key === "sector") {
        td = document.createElement("td");
        td.className = "left sector-cell";
        td.textContent = row.sector;
      } else {
        td = document.createElement("td");
        td.textContent = cellText(col, row);
        const cls = cellClass(col, row);
        if (cls) td.className = cls;
      }
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  });
}

function renderResultsLine(total) {
  const label = state.sector === "ALL" ? "" : ` in ${state.sector}`;
  $("resultsLine").innerHTML =
    `<strong>${total}</strong> result${total === 1 ? "" : "s"} found${label}`;
}

function renderAll() {
  const rows = filteredRows();
  renderHead();
  renderBody(rows, 1);
  renderResultsLine(rows.length);
}

/* ---------- sector pills ---------- */
function renderSectors() {
  const wrap = $("sectorFilter");
  wrap.querySelectorAll(".pill[data-sector]").forEach((el) => {
    if (el.dataset.sector !== "ALL") el.remove();
  });
  const counts = {};
  for (const r of state.rows) counts[r.sector] = (counts[r.sector] || 0) + 1;
  Object.keys(counts).sort().forEach((sector) => {
    const b = document.createElement("button");
    b.className = "pill" + (state.sector === sector ? " active" : "");
    b.dataset.sector = sector;
    b.textContent = `${sector} (${counts[sector]})`;
    wrap.appendChild(b);
  });
  if (!wrap.dataset.bound) {
    wrap.dataset.bound = "1";
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".pill");
      if (!btn) return;
      state.sector = btn.dataset.sector;
      wrap.querySelectorAll(".pill").forEach((el) =>
        el.classList.toggle("active", el === btn));
      renderAll();
    });
  }
}

/* ---------- export ---------- */
function toCSV(rows) {
  const cols = visibleCols().filter((c) => c.key !== "sno");
  const head = ["S.No.", ...cols.map((c) => (c.label + (c.unit ? ` (${c.unit})` : "")))];
  const esc = (v) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [head.map(esc).join(",")];
  rows.forEach((r, i) => {
    const vals = [`${i + 1}`];
    for (const c of cols) {
      if (c.key === "company") vals.push(`${r.company} (${r.ticker})`);
      else if (c.key === "sector") vals.push(r.sector);
      else vals.push(r[c.key] == null ? "" : r[c.key]);
    }
    lines.push(vals.map(esc).join(","));
  });
  return lines.join("\n");
}

function exportCSV() {
  const blob = new Blob([toCSV(filteredRows())], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "semiconductor-stocks.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- edit columns modal ---------- */
function renderColList() {
  const wrap = $("colList");
  wrap.innerHTML = "";
  for (const col of COLUMNS) {
    if (col.locked) continue;
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = col.visible;
    cb.addEventListener("change", () => { col.visible = cb.checked; renderAll(); });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(col.label + (col.unit ? ` (${col.unit})` : "")));
    wrap.appendChild(label);
  }
}

/* ---------- boot ---------- */
async function boot() {
  $("exportBtn").addEventListener("click", exportCSV);
  $("colsBtn").addEventListener("click", () => { renderColList(); $("colsModal").hidden = false; });
  $("colsDone").addEventListener("click", () => { $("colsModal").hidden = true; });
  $("colsReset").addEventListener("click", () => {
    COLUMNS.forEach((c) => { if (!c.locked) c.visible = true; });
    renderColList();
    renderAll();
  });
  $("colsModal").addEventListener("click", (e) => {
    if (e.target === $("colsModal")) $("colsModal").hidden = true;
  });
  $("searchBox").addEventListener("input", (e) => {
    state.query = e.target.value;
    renderAll();
  });

  const res = await fetch("data/semiconductors.json");
  const data = await res.json();
  state.rows = data.rows;
  state.asOf = data.as_of;
  $("metaLine").textContent =
    `Data as of ${data.as_of} · Source: ${data.source} · ${data.count} US-listed semiconductor & related stocks.`;
  renderSectors();
  renderAll();
}

document.addEventListener("DOMContentLoaded", boot);
