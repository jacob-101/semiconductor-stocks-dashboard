/* Company profile page: ?t=TICKER -> data/companies/<ticker>.json */

function fmtBigMoney(v) {
  if (v == null) return "—";
  const neg = v < 0 ? "-" : "";
  const a = Math.abs(v);
  if (a >= 1e12) return `${neg}${(a / 1e12).toLocaleString("en-US", { maximumFractionDigits: 2 })}T`;
  if (a >= 1e9) return `${neg}${(a / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 })}B`;
  return `${neg}${(a / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function money2(v) {
  if (v == null) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function boot() {
  const ticker = (new URLSearchParams(location.search).get("t") || "").toUpperCase();
  if (!ticker) {
    document.getElementById("coName").textContent = "No company selected";
    return;
  }
  document.title = `${ticker} — Semiconductor Dashboard`;

  let profile = null;
  try {
    const res = await fetch(`data/companies/${ticker.toLowerCase()}.json`);
    if (res.ok) profile = await res.json();
  } catch (e) { /* profile not published yet */ }

  if (!profile) {
    document.getElementById("coName").textContent = ticker;
    document.getElementById("coTagline").textContent =
      "Technology profile coming soon — this pilot covers Micron (MU) for now.";
    document.getElementById("coSector").textContent = "COMPANY PROFILE";
    return;
  }

  const c = profile.company;
  document.getElementById("coName").textContent = c.name;
  document.getElementById("coTagline").textContent = c.tagline || "";
  document.getElementById("coSector").textContent =
    `COMPANY PROFILE${c.sector ? " · " + c.sector.toUpperCase() : ""}`;

  const meta = document.getElementById("coMeta");
  const parts = [c.ticker, c.exchange, c.hq].filter(Boolean);
  if (parts.length) {
    meta.appendChild(el("span", "meta-item", parts.join(" · ")));
  }
  if (c.website) {
    const a = el("a", "meta-link", "Website ↗");
    a.href = c.website;
    a.target = "_blank";
    a.rel = "noopener";
    meta.appendChild(a);
  }

  const facts = [
    ["Founded", c.founded], ["Founders", c.founders], ["Headquarters", c.hq],
    ["CEO", c.ceo], ["Employees", c.employees],
  ];
  const factsWrap = document.getElementById("facts");
  facts.filter(([, v]) => v).forEach(([k, v]) => {
    const d = el("div", "fact");
    d.appendChild(el("div", "k-label", k));
    d.appendChild(el("div", "k-value sm", v));
    factsWrap.appendChild(d);
  });

  // financial snapshot from the dashboard dataset
  try {
    const data = await (await fetch("data/semiconductors.json")).json();
    const row = data.rows.find((r) => r.ticker === ticker);
    if (row) {
      document.getElementById("finstrip").hidden = false;
      document.getElementById("finAsof").textContent =
        `· data as of ${data.as_of}${row.fy ? ` · ${row.fy}` : ""}`;
      const cells = [
        ["Price $", money2(row.price)],
        ["Mar Cap $", fmtBigMoney(row.market_cap)],
        ["P/E", row.pe == null ? "—" : row.pe.toFixed(2)],
        ["Total Revenue $", fmtBigMoney(row.rev)],
        ["Revenue YoY %", row.rev_yoy == null ? "—" : row.rev_yoy.toFixed(1)],
        ["Net Profit $", fmtBigMoney(row.ni)],
        ["Profit YoY %", row.ni_yoy == null ? "—" : row.ni_yoy.toFixed(1)],
        ["Net Margin %", row.net_margin == null ? "—" : row.net_margin.toFixed(1)],
      ];
      const grid = document.getElementById("finGrid");
      cells.forEach(([k, v]) => {
        const d = el("div", "fin");
        d.appendChild(el("div", "k-label", k));
        d.appendChild(el("div", "k-value xs", v));
        grid.appendChild(d);
      });
    }
  } catch (e) { /* snapshot optional */ }

  if (profile.overview && profile.overview.length) {
    document.getElementById("overviewBlock").hidden = false;
    const wrap = document.getElementById("overview");
    profile.overview.forEach((p) => wrap.appendChild(el("p", null, p)));
  }

  if (profile.technologies && profile.technologies.length) {
    document.getElementById("techBlock").hidden = false;
    const grid = document.getElementById("techGrid");
    profile.technologies.forEach((t) => {
      const card = el("div", "tech-card");
      const head = el("div", "tech-head");
      head.appendChild(el("span", "tech-tag", t.tag || "Technology"));
      head.appendChild(el("h3", null, t.name));
      card.appendChild(head);
      card.appendChild(el("p", null, t.desc));
      if (t.specs && t.specs.length) {
        const chips = el("div", "chips");
        t.specs.forEach((s) => chips.appendChild(el("span", "chip", s)));
        card.appendChild(chips);
      }
      grid.appendChild(card);
    });
  }

  if (profile.products && profile.products.length) {
    document.getElementById("productsBlock").hidden = false;
    const wrap = document.getElementById("productSegs");
    profile.products.forEach((seg) => {
      wrap.appendChild(el("h3", "seg-title", seg.segment));
      const grid = el("div", "prod-grid");
      seg.items.forEach((it) => {
        const card = el("div", "prod-card");
        card.appendChild(el("div", "prod-name", it.name));
        card.appendChild(el("p", null, it.desc));
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
    });
  }

  if (profile.fabs && profile.fabs.length) {
    document.getElementById("fabsBlock").hidden = false;
    const ul = document.getElementById("fabList");
    profile.fabs.forEach((f) => {
      const li = el("li");
      li.appendChild(el("div", "fab-name", f.name));
      li.appendChild(el("p", null, f.desc));
      ul.appendChild(li);
    });
  }

  if (profile.milestones && profile.milestones.length) {
    document.getElementById("timeBlock").hidden = false;
    const ol = document.getElementById("timeline");
    profile.milestones.forEach((m) => {
      const li = el("li");
      li.appendChild(el("span", "year", m.year));
      li.appendChild(el("span", null, m.event));
      ol.appendChild(li);
    });
  }

  if (profile.notes && profile.notes.length) {
    document.getElementById("notesBlock").hidden = false;
    const ul = document.getElementById("noteList");
    profile.notes.forEach((n) => ul.appendChild(el("li", null, n)));
  }

  if (profile.sources && profile.sources.length) {
    document.getElementById("srcLine").textContent = "Sources: " + profile.sources.join(" · ");
  }
}

document.addEventListener("DOMContentLoaded", boot);
