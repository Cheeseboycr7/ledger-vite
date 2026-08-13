import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, X, TrendingUp, TrendingDown, Search } from "lucide-react";

const TOKENS = {
  paper: "#F7F3EB",
  paperLine: "#E1D8C2",
  ink: "#1E293B",
  inkSoft: "#6B7280",
  inkFaint: "#9A9488",
  income: "#2F6B4F",
  incomeSoft: "#E4EEE7",
  expense: "#A63D2F",
  expenseSoft: "#F3E5E1",
  gold: "#B8923A",
  card: "#FFFDF8",
  margin: "#C24A3C",
};

const CATEGORIES = [
  "Salary", "Freelance", "Investment", "Gift",
  "Food", "Transport", "Housing", "Utilities",
  "Entertainment", "Health", "Shopping", "Other",
];

const uid = () => Math.random().toString(36).slice(2, 10);

const seedData = [
  { id: uid(), date: "2026-08-11", description: "Monthly salary", category: "Salary", type: "income", amount: 3200 },
  { id: uid(), date: "2026-08-10", description: "Grocery run", category: "Food", type: "expense", amount: 84.32 },
  { id: uid(), date: "2026-08-09", description: "Design contract, phase 2", category: "Freelance", type: "income", amount: 650 },
  { id: uid(), date: "2026-08-08", description: "Electricity bill", category: "Utilities", type: "expense", amount: 61.5 },
  { id: uid(), date: "2026-08-06", description: "Train pass", category: "Transport", type: "expense", amount: 45 },
  { id: uid(), date: "2026-08-03", description: "Dividend payout", category: "Investment", type: "income", amount: 128.4 },
  { id: uid(), date: "2026-08-01", description: "Rent", category: "Housing", type: "expense", amount: 980 },
];

const money = (n) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function App() {
  const [entries, setEntries] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState("");

  // load fonts
  useEffect(() => {
    const l1 = document.createElement("link");
    l1.rel = "stylesheet";
    l1.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,500&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(l1);
    return () => { document.head.removeChild(l1); };
  }, []);

  // load persisted entries from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ledger-entries");
      setEntries(raw ? JSON.parse(raw) : seedData);
    } catch {
      setEntries(seedData);
    } finally {
      setLoaded(true);
    }
  }, []);

  // persist on change
  useEffect(() => {
    if (!loaded || entries === null) return;
    try {
      localStorage.setItem("ledger-entries", JSON.stringify(entries));
    } catch {
      // ignore storage failure, keep working in-memory
    }
  }, [entries, loaded]);

  const totals = useMemo(() => {
    const list = entries || [];
    const income = list.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = list.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    return { income, expense, balance: income - expense };
  }, [entries]);

  const categoryTotals = useMemo(() => {
    const list = entries || [];
    const map = {};
    list.forEach((e) => {
      if (!map[e.category]) map[e.category] = { income: 0, expense: 0 };
      map[e.category][e.type] += e.amount;
    });
    const rows = Object.entries(map).map(([category, v]) => ({
      category,
      total: v.income + v.expense,
      income: v.income,
      expense: v.expense,
    }));
    rows.sort((a, b) => b.total - a.total);
    const max = rows.reduce((m, r) => Math.max(m, r.total), 0) || 1;
    return { rows: rows.slice(0, 6), max };
  }, [entries]);

  const filtered = useMemo(() => {
    const list = entries || [];
    return list
      .filter((e) => (filterType === "all" ? true : e.type === filterType))
      .filter((e) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [entries, filterType, search]);

  const addEntry = useCallback(
    (e) => {
      e.preventDefault();
      const amt = parseFloat(form.amount);
      if (!form.description.trim()) {
        setFormError("Give the entry a description.");
        return;
      }
      if (!form.amount || isNaN(amt) || amt <= 0) {
        setFormError("Enter an amount greater than zero.");
        return;
      }
      const entry = {
        id: uid(),
        date: form.date,
        description: form.description.trim(),
        category: form.category,
        type: form.type,
        amount: Math.round(amt * 100) / 100,
      };
      setEntries((prev) => [...(prev || []), entry]);
      setForm((f) => ({ ...f, description: "", amount: "" }));
      setFormError("");
    },
    [form]
  );

  const removeEntry = useCallback((id) => {
    setEntries((prev) => (prev || []).filter((e) => e.id !== id));
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: TOKENS.paper,
        color: TOKENS.ink,
        minHeight: "100vh",
        padding: "0",
      }}
    >
      <style>{`
        .ledger-input {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid ${TOKENS.paperLine};
          padding: 8px 2px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: ${TOKENS.ink};
          outline: none;
          width: 100%;
          transition: border-color 0.15s ease;
        }
        .ledger-input:focus {
          border-bottom-color: ${TOKENS.gold};
        }
        .ledger-input::placeholder { color: ${TOKENS.inkFaint}; }
        .ledger-select {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid ${TOKENS.paperLine};
          padding: 8px 2px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: ${TOKENS.ink};
          outline: none;
          width: 100%;
          cursor: pointer;
        }
        .row-hover:hover .del-btn { opacity: 1; }
        .del-btn { opacity: 0; transition: opacity 0.15s ease; }
        .type-btn {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-tab {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: `2px solid ${TOKENS.ink}`,
            paddingBottom: 16,
            marginBottom: 4,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: 34,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              The Ledger
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: TOKENS.inkSoft }}>
              A running record of what comes in and what goes out.
            </p>
          </div>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: TOKENS.inkSoft,
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            {today}
          </p>
        </div>

        {/* Balance strip */}
        <div
          style={{
            position: "relative",
            background: TOKENS.card,
            border: `1px solid ${TOKENS.paperLine}`,
            borderLeft: `4px solid ${TOKENS.margin}`,
            padding: "28px 28px 28px 32px",
            margin: "28px 0",
            backgroundImage: `repeating-linear-gradient(${TOKENS.paper} 0 35px, ${TOKENS.paperLine} 35px 36px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: TOKENS.inkSoft,
                  fontWeight: 600,
                }}
              >
                Current balance
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  fontSize: 40,
                  color: totals.balance >= 0 ? TOKENS.ink : TOKENS.expense,
                  lineHeight: 1,
                }}
              >
                ${money(Math.abs(totals.balance))}
                {totals.balance < 0 && <span style={{ fontSize: 20 }}> due</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: TOKENS.income }}>
                  <TrendingUp size={15} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Income
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500, color: TOKENS.income }}>
                  ${money(totals.income)}
                </p>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: TOKENS.expense }}>
                  <TrendingDown size={15} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Expense
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500, color: TOKENS.expense }}>
                  ${money(totals.expense)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add entry form */}
        <form
          onSubmit={addEntry}
          style={{
            background: TOKENS.card,
            border: `1px solid ${TOKENS.paperLine}`,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: TOKENS.inkSoft,
              fontWeight: 600,
            }}
          >
            Post a new entry
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "0 20px",
            }}
            className="entry-grid"
          >
            <input
              className="ledger-input"
              placeholder="What was it for?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <input
              className="ledger-input"
              placeholder="0.00"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {["income", "expense"].map((t) => (
                <button
                  type="button"
                  key={t}
                  className="type-btn"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  style={{
                    border: `1.5px solid ${form.type === t ? (t === "income" ? TOKENS.income : TOKENS.expense) : TOKENS.paperLine}`,
                    background: form.type === t ? (t === "income" ? TOKENS.incomeSoft : TOKENS.expenseSoft) : "transparent",
                    color: form.type === t ? (t === "income" ? TOKENS.income : TOKENS.expense) : TOKENS.inkSoft,
                    borderRadius: 3,
                    padding: "7px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <select
              className="ledger-select"
              style={{ width: 150, flex: "0 0 auto" }}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="date"
              className="ledger-select"
              style={{ width: 150, flex: "0 0 auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />

            <button
              type="submit"
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: TOKENS.ink,
                color: TOKENS.paper,
                border: "none",
                borderRadius: 3,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Plus size={15} /> Post entry
            </button>
          </div>
          {formError && (
            <p style={{ margin: "10px 0 0", fontSize: 12.5, color: TOKENS.expense }}>{formError}</p>
          )}
        </form>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { key: "all", label: "All" },
              { key: "income", label: "Income" },
              { key: "expense", label: "Expense" },
            ].map((f) => (
              <button
                key={f.key}
                className="filter-tab"
                onClick={() => setFilterType(f.key)}
                style={{
                  border: "none",
                  background: filterType === f.key ? TOKENS.ink : "transparent",
                  color: filterType === f.key ? TOKENS.paper : TOKENS.inkSoft,
                  borderRadius: 3,
                  padding: "6px 13px",
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", width: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", color: TOKENS.inkFaint }} />
            <input
              className="ledger-input"
              placeholder="Search entries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 24, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Transaction list */}
        <div style={{ borderTop: `1px solid ${TOKENS.ink}`, marginTop: 8 }}>
          {filtered.length === 0 && (
            <div style={{ padding: "40px 4px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, margin: "0 0 4px", color: TOKENS.inkSoft }}>
                No entries here yet.
              </p>
              <p style={{ fontSize: 13, color: TOKENS.inkFaint, margin: 0 }}>
                Post your first one above and it'll show up in this ledger.
              </p>
            </div>
          )}
          {filtered.map((e) => (
            <div
              key={e.id}
              className="row-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 2px",
                borderBottom: `1px solid ${TOKENS.paperLine}`,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: TOKENS.inkFaint,
                  width: 52,
                  flexShrink: 0,
                }}
              >
                {fmtDate(e.date)}
              </span>
              <span style={{ fontSize: 14, flexShrink: 0, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.description}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: TOKENS.inkSoft,
                  border: `1px solid ${TOKENS.paperLine}`,
                  borderRadius: 3,
                  padding: "2px 8px",
                  flexShrink: 0,
                }}
              >
                {e.category}
              </span>
              <span
                style={{
                  flexGrow: 1,
                  borderBottom: `1px dotted ${TOKENS.paperLine}`,
                  margin: "0 4px",
                  minWidth: 12,
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: e.type === "income" ? TOKENS.income : TOKENS.expense,
                  flexShrink: 0,
                }}
              >
                {e.type === "income" ? "+" : "\u2212"}${money(e.amount)}
              </span>
              <button
                className="del-btn"
                onClick={() => removeEntry(e.id)}
                aria-label={`Delete entry: ${e.description}`}
                style={{
                  border: "none",
                  background: "transparent",
                  color: TOKENS.inkFaint,
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {categoryTotals.rows.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: TOKENS.inkSoft,
                fontWeight: 600,
              }}
            >
              By category
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categoryTotals.rows.map((r) => (
                <div key={r.category} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12.5, width: 110, flexShrink: 0, color: TOKENS.inkSoft }}>
                    {r.category}
                  </span>
                  <div style={{ flexGrow: 1, height: 6, background: TOKENS.paperLine, borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${(r.total / categoryTotals.max) * 100}%`,
                        height: "100%",
                        background: r.expense >= r.income ? TOKENS.expense : TOKENS.income,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12.5,
                      color: TOKENS.inkSoft,
                      width: 70,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    ${money(r.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
