"""Ticker universe: all semiconductor & semiconductor-related stocks listed
on US exchanges (NYSE / Nasdaq), including ADRs. (ticker, sub-sector)."""

UNIVERSE = [
    # ---- Fabless chip designers ----
    ("NVDA", "Fabless"), ("AMD", "Fabless"), ("AVGO", "Fabless"),
    ("QCOM", "Fabless"), ("MRVL", "Fabless"), ("SWKS", "Fabless"),
    ("QRVO", "Fabless"), ("MPWR", "Fabless"), ("LSCC", "Fabless"),
    ("ALGM", "Fabless"), ("SLAB", "Fabless"), ("CRUS", "Fabless"),
    ("MTSI", "Fabless"), ("MXL", "Fabless"), ("RMBS", "Fabless"),
    ("CRDO", "Fabless"), ("ALAB", "Fabless"), ("SMTC", "Fabless"),
    ("SITM", "Fabless"), ("INDI", "Fabless"), ("HIMX", "Fabless"),
    ("SIMO", "Fabless"), ("GCTS", "Fabless"), ("AMBA", "Fabless"),
    ("POWI", "Fabless"), ("NVTS", "Fabless"), ("SYNA", "Fabless"),
    ("PI", "Fabless"),
    # ---- Integrated Device Manufacturers (own fabs) ----
    ("INTC", "IDM"), ("TXN", "IDM"), ("ADI", "IDM"), ("MCHP", "IDM"),
    ("ON", "IDM"), ("NXPI", "IDM"), ("STM", "IDM"), ("DIOD", "IDM"),
    ("AOSL", "IDM"), ("WOLF", "IDM"), ("VSH", "IDM"), ("MX", "IDM"),
    ("IFNNY", "IDM"),
    # ---- Foundries ----
    ("TSM", "Foundry"), ("UMC", "Foundry"), ("GFS", "Foundry"),
    ("TSEM", "Foundry"),
    # ---- Memory & storage ----
    ("MU", "Memory"), ("SNDK", "Memory"), ("PENG", "Memory"),
    ("WDC", "Memory"), ("STX", "Memory"),
    # ---- OSAT & Packaging (assembly, test, packaging) ----
    ("AMKR", "OSAT & Packaging"), ("ASX", "OSAT & Packaging"),
    ("IMOS", "OSAT & Packaging"),
    # ---- Semiconductor equipment (incl. packaging/test equipment) ----
    ("AMAT", "Equipment"), ("LRCX", "Equipment"), ("KLAC", "Equipment"),
    ("ASML", "Equipment"), ("TER", "Equipment"), ("MKSI", "Equipment"),
    ("FORM", "Equipment"), ("PLAB", "Equipment"), ("ACMR", "Equipment"),
    ("ONTO", "Equipment"), ("COHU", "Equipment"), ("KLIC", "Equipment"),
    ("ICHR", "Equipment"), ("ACLS", "Equipment"), ("VECO", "Equipment"),
    ("UCTT", "Equipment"), ("AEIS", "Equipment"), ("CAMT", "Equipment"),
    ("NVMI", "Equipment"), ("ASMIY", "Equipment"), ("BESIY", "Equipment"),
    ("ATEYY", "Equipment"),
    # ---- EDA, IP & design software ----
    ("SNPS", "EDA & IP"), ("CDNS", "EDA & IP"), ("ARM", "EDA & IP"),
    ("CEVA", "EDA & IP"), ("PDFS", "EDA & IP"), ("ADEA", "EDA & IP"),
    # ---- Materials & wafer substrates ----
    ("ENTG", "Materials"), ("ATOM", "Materials"), ("AXTI", "Materials"),
    ("SHECY", "Materials"), ("SUOPY", "Materials"), ("SLOIF", "Materials"),
    ("SSLLF", "Materials"),
    # ---- Chemicals & gases for semiconductor manufacturing ----
    ("LIN", "Chemicals & Gases"), ("APD", "Chemicals & Gases"),
    ("DD", "Chemicals & Gases"), ("AIQUY", "Chemicals & Gases"),
    # ---- Photonics & optical ----
    ("COHR", "Photonics"), ("LITE", "Photonics"), ("AAOI", "Photonics"),
    ("FN", "Photonics"),
    # ---- Distributors ----
    ("ARW", "Distribution"), ("AVT", "Distribution"),
]

TICKERS = [t for t, _ in UNIVERSE]
SECTOR_OF = dict(UNIVERSE)
