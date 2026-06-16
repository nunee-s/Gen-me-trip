// tp-expenses.jsx — expense tracker with add / edit / delete + auto totals

const { useState: useStateE, useMemo, useEffect: useEffectE } = React;

const blankRow = (trip) => ({ id: "e" + Date.now(), date: ((trip && trip.dates) || TRIP.dates).split("\u2013")[0].trim(), item: "", cat: "Food", day: "Day 1", amt: 0, ccy: "JPY", who: "Both", note: "", confirmed: true });

function ExpensesScreen({ trip, home, onChange, onHistory }) {
  const [rows, setRows] = useStateE(() => (trip.expenses && trip.expenses.length ? trip.expenses : INITIAL_EXPENSES).map(r => ({ ...r })));
  const [editing, setEditing] = useStateE(null);   // id being edited
  const [draft, setDraft] = useStateE(null);        // working copy
  const [adding, setAdding] = useStateE(false);
  const [filter, setFilter] = useStateE("All");

  // persist any change back to this trip's record in History
  const firstRun = React.useRef(true);
  useEffectE(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    onChange && onChange(rows);
  }, [rows]);

  const budget = trip.budgetHigh * trip.pax; // total budget
  const total = useMemo(() => rows.reduce((s, r) => s + toJPY(r.amt, r.ccy), 0), [rows]);
  const remaining = budget - total;
  const pct = budget ? (total / budget) * 100 : 0;

  const byCat = useMemo(() => CATEGORIES.map(c => ({
    ...c, sum: rows.filter(r => r.cat === c.key).reduce((s, r) => s + toJPY(r.amt, r.ccy), 0),
  })).filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum), [rows]);

  const visible = filter === "All" ? rows : rows.filter(r => r.cat === filter);

  const startEdit = (r) => { setEditing(r.id); setDraft({ ...r }); setAdding(false); };
  const startAdd = () => { setDraft(blankRow(trip)); setAdding(true); setEditing(null); };
  const cancel = () => { setEditing(null); setAdding(false); setDraft(null); };
  const save = () => {
    const d = { ...draft, amt: +String(draft.amt).replace(/[^0-9.]/g, "") || 0 };
    if (adding) setRows(s => [...s, d]);
    else setRows(s => s.map(r => r.id === d.id ? d : r));
    cancel();
  };
  const del = (id) => setRows(s => s.filter(r => r.id !== id));
  const upd = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const EditCells = () => (
    <>
      <td><input className="cellinput" style={{ width: 74 }} value={draft.date} onChange={e => upd("date", e.target.value)} /></td>
      <td><input className="cellinput" placeholder="What was it?" value={draft.item} onChange={e => upd("item", e.target.value)} autoFocus /></td>
      <td>
        <select className="cellinput" value={draft.cat} onChange={e => upd("cat", e.target.value)}>
          {CATEGORIES.map(c => <option key={c.key}>{c.key}</option>)}
        </select>
      </td>
      <td>
        <select className="cellinput" value={draft.day} onChange={e => upd("day", e.target.value)}>
          {["Day 1", "Day 2", "Day 3", "—"].map(d => <option key={d}>{d}</option>)}
        </select>
      </td>
      <td className="num">
        <div className="row g6" style={{ justifyContent: "flex-end" }}>
          <input className="cellinput" style={{ width: 84, textAlign: "right" }} value={draft.amt} onChange={e => upd("amt", e.target.value)} />
          <select className="cellinput" style={{ width: 70 }} value={draft.ccy} onChange={e => upd("ccy", e.target.value)}>
            {CURRENCIES.map(c => <option key={c.code}>{c.code}</option>)}
          </select>
        </div>
      </td>
      <td>
        <div className="row g6" style={{ justifyContent: "flex-end" }}>
          <IconBtn sm title="Save" onClick={save}>✓</IconBtn>
          <IconBtn sm title="Cancel" onClick={cancel}>✕</IconBtn>
        </div>
      </td>
    </>
  );

  return (
    <div className="page fade-in">
      <div className="row tw mid" style={{ marginBottom: 22 }}>
        <div>
          <Eyebrow gold>Expenses</Eyebrow>
          <h1 className="h-hero" style={{ fontSize: 34, marginTop: 6 }}>{trip.title} · spend</h1>
        </div>
        <div className="row g8 mid">
          <Btn ghost sm onClick={onHistory} title="All saved trips">⤺ History</Btn>
          <Btn gold onClick={startAdd}>＋ Add expense</Btn>
        </div>
      </div>

      {/* summary cards */}
      <div className="row g20 wrap" style={{ alignItems: "stretch" }}>
        <div className="card pad-lg grow" style={{ minWidth: 320 }}>
          <div className="row tw">
            <div>
              <div className="sub2">Total spent</div>
              <div className="statbig green mt6 tnum">{fmtJPY(total)}</div>
              {home !== "JPY" && <div className="sub2 mt6">≈ {fmtHome(total, home)} {home}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="sub2">{remaining >= 0 ? "Remaining" : "Over budget"}</div>
              <div className={"statbig mt6 tnum " + (remaining >= 0 ? "gold" : "")} style={remaining < 0 ? { color: "var(--rust)" } : null}>{fmtJPY(Math.abs(remaining))}</div>
              <div className="sub2 mt6">of {fmtJPY(budget)} budget</div>
            </div>
          </div>
          <div className="mt20"><Meter pct={pct} over /></div>
          <div className="row tw mt6">
            <span className="sub2">{Math.round(pct)}% of budget · {trip.pax} pax</span>
            <span className="sub2">{remaining >= 0 ? "on track ✓" : "review spend"}</span>
          </div>
        </div>

        <div className="card pad" style={{ flex: "0 0 280px" }}>
          <div className="sub2" style={{ textTransform: "uppercase", letterSpacing: ".08em" }}>By category</div>
          <div className="col g12 mt14">
            {byCat.map(c => (
              <div key={c.key} className="col g6">
                <div className="row tw mid">
                  <span className="catpill"><span className="dotk" style={{ background: c.color }}></span>{c.key}</span>
                  <span className="amt" style={{ fontSize: 13 }}>{fmtJPY(c.sum)}</span>
                </div>
                <div className="catbar"><i style={{ width: (total ? c.sum / total * 100 : 0) + "%", background: c.color }}></i></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="row tw mid wrap g10 mt28">
        <div className="row wrap g6">
          {["All", ...CATEGORIES.map(c => c.key)].map(c => (
            <Chip key={c} sm on={filter === c} onClick={() => setFilter(c)}>{c}</Chip>
          ))}
        </div>
        <span className="sub2">{rows.length} entries · mixed currencies auto-converted to JPY</span>
      </div>

      {/* table */}
      <div className="card mt14" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>Item</th><th>Category</th><th>Day</th><th className="num">Amount</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map(r => (
                editing === r.id ? <tr key={r.id} className="editrow"><EditCells /></tr> : (
                  <tr key={r.id}>
                    <td className="sub2">{r.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.item}</div>
                      {(r.note || !r.confirmed) && <div className="sub2" style={!r.confirmed ? { color: "var(--rust)" } : null}>{r.note || (r.confirmed ? "" : "estimate")}</div>}
                    </td>
                    <td><span className="catpill"><span className="dotk" style={{ background: catColor(r.cat) }}></span>{r.cat}</span></td>
                    <td className="sub2">{r.day}</td>
                    <td className="num">
                      <span className="amt">{r.ccy === "JPY" ? fmtJPY(r.amt) : fmtCcy(r.amt, r.ccy)}</span>
                      {r.ccy !== "JPY" && <div className="sub2">≈ {fmtJPY(toJPY(r.amt, r.ccy))}</div>}
                    </td>
                    <td>
                      <div className="row g6" style={{ justifyContent: "flex-end" }}>
                        <IconBtn sm title="Edit" onClick={() => startEdit(r)}>✎</IconBtn>
                        <IconBtn sm title="Delete" onClick={() => del(r.id)}>✕</IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              ))}
              {adding && <tr className="editrow"><EditCells /></tr>}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ borderBottom: 0, paddingTop: 14 }}>
                  {!adding && <Btn sm ghost onClick={startAdd}><span className="muted">＋ Add a row</span></Btn>}
                </td>
                <td className="num" style={{ borderBottom: 0, paddingTop: 14 }}>
                  <div className="sub2">Running total</div>
                  <div className="statbig" style={{ fontSize: 22 }}>{fmtJPY(total)}</div>
                </td>
                <td style={{ borderBottom: 0 }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="sub2 mt14" style={{ lineHeight: 1.6 }}>
        Rows in <span style={{ color: "var(--rust)" }}>rust</span> are placeholder estimates from your example — edit them with real amounts.
        Foreign-currency entries convert to JPY automatically; totals, the budget bar &amp; category breakdown all recompute live.
      </p>
    </div>
  );
}

Object.assign(window, { ExpensesScreen });
