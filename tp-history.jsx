// tp-history.jsx — saved trip records: reopen, edit, duplicate, delete, rename

const { useState: useStateH } = React;

function ago(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  const d = Math.floor(s / 86400);
  if (d < 30) return d + "d ago";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CoverThumb({ src }) {
  return <div className="histcover" style={src ? { backgroundImage: `url("${src}")` } : null}></div>;
}

function RenameField({ value, onCommit }) {
  const [v, setV] = useStateH(value);
  React.useEffect(() => { setV(value); }, [value]);
  return (
    <input className="renamefield"
      value={v}
      onChange={e => setV(e.target.value)}
      onBlur={() => { const t = v.trim(); onCommit(t || value); if (!t) setV(value); }}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setV(value); e.target.blur(); } }}
      title="Click to rename" />
  );
}

function TripMetric({ label, value }) {
  return (
    <div className="col" style={{ gap: 2 }}>
      <span className="mono" style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{value}</span>
    </div>
  );
}

function HistoryCard({ trip, active, home, isGuest, onOpen, onExpenses, onEdit, onDuplicate, onDelete, onRename }) {
  const spent = (trip.expenses || []).reduce((s, r) => s + toJPY(r.amt, r.ccy), 0);
  const budget = trip.budgetHigh * trip.pax;
  const pct = budget ? Math.min(100, spent / budget * 100) : 0;
  const over = spent > budget;

  return (
    <div className={"card histcard" + (active ? " active" : "")}>
      <div className="histcover-wrap" onClick={() => onOpen(trip.id)}>
        <CoverThumb src={trip.coverSrc} />
        {active && <span className="histactive">● Active</span>}
      </div>
      <div className="pad">
        <div className="row tw mid">
          <span className="tag gold">{trip.style}</span>
          <span className="sub2">{isGuest ? "Not saved" : "Saved " + ago(trip.savedAt)}</span>
        </div>

        <div className="mt10"><RenameField value={trip.title} onCommit={v => onRename(trip.id, v)} /></div>
        <div className="sub2" style={{ marginTop: 2 }}>{trip.origin.split(",")[0]} → {trip.destination.split(" + ")[0]}</div>

        <div className="row g20 mt14 wrap">
          <TripMetric label="Dates" value={trip.dates} />
          <TripMetric label="Length" value={trip.days + "D / " + trip.nights + "N"} />
          <TripMetric label="Travelers" value={trip.pax} />
        </div>

        <div className="row wrap g6 mt12">
          {trip.interests.slice(0, 4).map(i => <span key={i} className="tag line">{i}</span>)}
        </div>

        <div className="mt14">
          <div className="row tw mid">
            <span className="sub2">{over ? "Over budget" : "Spent so far"}</span>
            <span className="amt" style={over ? { color: "var(--rust)" } : null}>{fmtJPY(spent)} <span className="sub2" style={{ fontWeight: 400 }}>/ {fmtJPY(budget)}</span></span>
          </div>
          <div className="meter mt6"><i style={{ width: pct + "%", background: over ? "var(--rust)" : undefined }}></i></div>
          {home !== "JPY" && <div className="sub2 mt6">≈ {fmtHome(spent, home)} {home} spent</div>}
        </div>

        <div className="row tw mid mt20 wrap g8">
          <div className="row g6 mid">
            <Btn pri sm onClick={() => onOpen(trip.id)}>Open</Btn>
            <Btn sm onClick={() => onExpenses(trip.id)}>Expenses</Btn>
            <Btn ghost sm onClick={() => onEdit(trip.id)}>✎ Edit</Btn>
          </div>
          <div className="row g6 mid">
            <IconBtn sm title="Duplicate trip" onClick={() => onDuplicate(trip.id)}>⧉</IconBtn>
            <IconBtn sm title="Delete trip" onClick={() => onDelete(trip.id)}>✕</IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ history, activeId, home, isGuest, onSignIn, onOpen, onExpenses, onEdit, onDuplicate, onDelete, onRename, onNew }) {
  const [confirmId, setConfirmId] = useStateH(null);
  const sorted = [...history].sort((a, b) => b.savedAt - a.savedAt);
  const confTrip = history.find(h => h.id === confirmId);

  const totalTrips = history.length;
  const totalSpent = history.reduce((s, t) => s + (t.expenses || []).reduce((x, r) => x + toJPY(r.amt, r.ccy), 0), 0);

  return (
    <div className="page fade-in">
      <div className="row tw mid wrap g14" style={{ alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <Eyebrow>Trip history</Eyebrow>
          <h1 className="h-hero" style={{ fontSize: 38, marginTop: 8 }}>Your saved trips</h1>
          <p className="lead" style={{ marginTop: 8, maxWidth: 560 }}>
            Every itinerary you generate is kept here. Reopen, rename, duplicate or edit any trip — your expenses travel with it.
          </p>
        </div>
        <Btn pri lg onClick={onNew}>✦ Plan a new trip</Btn>
      </div>

      {isGuest && (
        <div className="guestbanner">
          <div className="col" style={{ gap: 3 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>You're browsing as a guest</div>
            <div className="sub2">Trips you plan now aren't saved — sign in to keep them private to your account and pick up where you left off.</div>
          </div>
          <div className="row g8 mid" style={{ flex: "0 0 auto" }}>
            <Btn pri sm onClick={onSignIn}>Sign in to save</Btn>
          </div>
        </div>
      )}

      {totalTrips > 0 && (
        <div className="row g10 wrap" style={{ marginBottom: 22 }}>
          <span className="tag line">{totalTrips} {totalTrips === 1 ? "trip" : "trips"} saved</span>
          <span className="tag line">{fmtJPY(totalSpent)} tracked total</span>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card pad-lg" style={{ textAlign: "center", padding: "56px 26px" }}>
          <div className="h-card" style={{ color: "var(--muted)" }}>No saved trips yet</div>
          <p className="sub2" style={{ margin: "8px auto 18px", maxWidth: 360, lineHeight: 1.6 }}>Generate an itinerary from the Plan tab and it will show up here as a record you can revisit and modify.</p>
          <div className="row mid" style={{ justifyContent: "center" }}><Btn pri onClick={onNew}>✦ Plan your first trip</Btn></div>
        </div>
      ) : (
        <div className="histgrid">
          {sorted.map(trip => (
            <HistoryCard key={trip.id} trip={trip} active={trip.id === activeId} home={home} isGuest={isGuest}
              onOpen={onOpen} onExpenses={onExpenses} onEdit={onEdit}
              onDuplicate={onDuplicate} onRename={onRename}
              onDelete={(id) => setConfirmId(id)} />
          ))}
        </div>
      )}

      {confTrip && (
        <ConfirmDialog
          title="Delete this trip?"
          message={<>Delete <b>“{confTrip.title}”</b> and its expense record? This can't be undone.</>}
          confirmLabel="Delete trip"
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)} />
      )}
    </div>
  );
}

Object.assign(window, { HistoryScreen });
