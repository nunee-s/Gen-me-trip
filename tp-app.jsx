// tp-app.jsx — shell: auth, nav, plan state, generate flow, trip history, tweaks

const { useState, useEffect } = React;

const ACCENTS = {
  "Forest": { pine: "#34472f", pine2: "#46593a", moss: "#7c8b66", mossSoft: "#e9ecda" },
  "Pine": { pine: "#283f2b", pine2: "#385338", moss: "#5d7a4f", mossSoft: "#e6ecdb" },
  "Teal": { pine: "#234a47", pine2: "#2f5e5a", moss: "#4f8079", mossSoft: "#dceae7" },
  "Plum": { pine: "#44324a", pine2: "#56415d", moss: "#8a6a90", mossSoft: "#ece1ee" },
};
const POPS = {
  "Clay": { c: "#d16a42", c2: "#bd5a35", soft: "#f7ddce" },
  "Coral": { c: "#e0654f", c2: "#cc5641", soft: "#f8ddd5" },
  "Sky": { c: "#4f93b0", c2: "#3f7e9a", soft: "#deeaef" },
  "Marigold": { c: "#d99a3c", c2: "#c2842b", soft: "#f6e6c5" },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Forest",
  "pop": "Clay",
  "home": "USD",
  "density": "regular"
}/*EDITMODE-END*/;

const GEN_LINES = [
  "Scanning transit & routes…",
  "Finding stays near your destination…",
  "Picking sights, cafés & local eats…",
  "Plotting the day-by-day plan…",
  "Estimating budget vs. your range…",
];

const DEFAULT_PLAN = {
  origin: TRIP.origin,
  dest: "Matsumoto + Azumino",
  pax: TRIP.pax,
  pace: TRIP.pace,
  style: TRIP.style,
  interests: ["Cycling", "Onsen", "Nature", "Food", "Photography"],
  bLow: TRIP.budgetLow,
  bHigh: TRIP.budgetHigh,
  baseCcy: "JPY",
  start: "2026-06-18",
  end: "2026-06-20",
  freeText: TRIP.freeText,
};

// Build a stored trip record (header-level fields) from the plan form.
function makeTrip(plan, base) {
  const d = tripDates(plan.start, plan.end);
  return {
    id: (base && base.id) || ("trip" + Date.now()),
    savedAt: Date.now(),
    title: plan.dest,
    tagline: taglineFor(plan),
    origin: plan.origin,
    destination: plan.dest,
    dates: d.label, nights: d.nights, days: d.days,
    pax: plan.pax, pace: plan.pace, style: plan.style,
    interests: plan.interests.slice(),
    budgetLow: plan.bLow, budgetHigh: plan.bHigh, baseCcy: plan.baseCcy,
    bestTime: TRIP.bestTime, weather: TRIP.weather, cycling: TRIP.cycling,
    coverSrc: (base && base.coverSrc) || PHOTOS.castle,
    plan: { ...plan },
    expenses: (base && base.expenses) ? base.expenses.map(e => ({ ...e })) : INITIAL_EXPENSES.map(e => ({ ...e })),
  };
}
function seedTrip() { const s = makeTrip(DEFAULT_PLAN); s.savedAt = Date.now() - 36 * 3600 * 1000; s.seed = true; return s; }

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("plan");  // plan | itinerary | expenses | history
  const [gen, setGen] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [editingTripId, setEditingTripId] = useState(null);  // non-null while editing a saved trip

  // auth
  const [user, setUser] = useState(() => { const s = loadSession(); const us = loadUsers(); return (s && us[s]) ? us[s] : null; });
  const [authOpen, setAuthOpen] = useState(false);

  // initial history load (per account, or in-memory for guests)
  useEffect(() => {
    let h;
    if (user) { const saved = loadUserHistory(user.id); h = (saved && saved.length) ? saved : [seedTrip()]; }
    else { h = [seedTrip()]; }
    setHistory(h);
    setActiveId(h[0] ? h[0].id : null);
    if (!user) setAuthOpen(true);   // welcome modal over the app on first visit
  }, []);

  // persist only when signed in — guest trips stay in-memory ("sign in to save")
  useEffect(() => { if (user && history.length) saveUserHistory(user.id, history); }, [history, user]);

  const updPlan = (k, v) => setPlan(p => ({ ...p, [k]: v }));
  const activeTrip = history.find(h => h.id === activeId) || history[0] || seedTrip();

  useEffect(() => {
    const a = ACCENTS[t.accent] || ACCENTS["Forest"];
    const p = POPS[t.pop] || POPS["Clay"];
    const r = document.documentElement;
    r.style.setProperty("--pine", a.pine);
    r.style.setProperty("--pine-2", a.pine2);
    r.style.setProperty("--moss", a.moss);
    r.style.setProperty("--moss-soft", a.mossSoft);
    r.style.setProperty("--clay", p.c);
    r.style.setProperty("--clay-2", p.c2);
    r.style.setProperty("--clay-soft", p.soft);
    document.body.classList.toggle("dense", t.density === "compact");
  }, [t.accent, t.pop, t.density]);

  const generate = () => {
    setGen(true); setGenStep(0);
    let i = 0;
    const iv = setInterval(() => { i++; if (i < GEN_LINES.length) setGenStep(i); }, 360);
    setTimeout(() => {
      const base = editingTripId ? history.find(h => h.id === editingTripId) : null;
      const trip = makeTrip(plan, base);
      delete trip.seed;
      setHistory(h => base ? h.map(x => x.id === base.id ? trip : x) : [trip, ...h]);
      setActiveId(trip.id);
      setEditingTripId(null);
      clearInterval(iv); setGen(false); setScreen("itinerary"); window.scrollTo(0, 0);
    }, 1900);
  };

  const go = (s) => { setScreen(s); window.scrollTo(0, 0); };

  // ---- history actions ----
  const openTrip = (id) => { setActiveId(id); go("itinerary"); };
  const openExpenses = (id) => { setActiveId(id); go("expenses"); };
  const editTrip = (id) => {
    const tr = history.find(h => h.id === id);
    if (tr) { setPlan(tr.plan ? { ...DEFAULT_PLAN, ...tr.plan } : DEFAULT_PLAN); setActiveId(id); setEditingTripId(id); go("plan"); }
  };
  const duplicateTrip = (id) => {
    const tr = history.find(h => h.id === id);
    if (!tr) return;
    const copy = { ...tr, id: "trip" + Date.now(), savedAt: Date.now(), seed: false, title: tr.title + " (copy)", expenses: tr.expenses.map(e => ({ ...e })) };
    setHistory(h => [copy, ...h]);
  };
  const deleteTrip = (id) => {
    setHistory(h => {
      const next = h.filter(x => x.id !== id);
      if (id === activeId) setActiveId(next[0] ? next[0].id : null);
      return next;
    });
  };
  const renameTrip = (id, name) => setHistory(h => h.map(x => x.id === id ? { ...x, title: name } : x));
  const updateExpenses = (rows) => setHistory(h => h.map(x => x.id === activeTrip.id ? { ...x, expenses: rows } : x));

  // ---- auth actions ----
  const finishAuth = (u) => {
    const guestTrips = history.filter(tr => !tr.seed);          // carry anything planned as guest
    let h = loadUserHistory(u.id);
    if (!h || !h.length) h = [seedTrip()];
    if (guestTrips.length) {
      const ids = new Set(h.map(x => x.id));
      h = [...guestTrips.filter(x => !ids.has(x.id)), ...h];
    }
    setUser(u); saveSession(u.id);
    setHistory(h); setActiveId(h[0] ? h[0].id : null);
    saveUserHistory(u.id, h);
    setAuthOpen(false);
  };
  const register = ({ name, email, pass }) => {
    const em = email.trim().toLowerCase();
    const us = loadUsers();
    if (Object.values(us).some(x => x.email === em)) return { ok: false, error: "That email is already registered — sign in instead." };
    const u = { id: newUid(), name: name.trim() || em.split("@")[0], email: em, pass: hash(pass), created: Date.now() };
    const next = { ...us, [u.id]: u }; saveUsers(next);
    finishAuth(u);
    return { ok: true };
  };
  const login = ({ email, pass }) => {
    const em = email.trim().toLowerCase();
    const us = loadUsers();
    const u = Object.values(us).find(x => x.email === em);
    if (!u) return { ok: false, error: "No account found for that email." };
    if (u.pass !== hash(pass)) return { ok: false, error: "Incorrect password — try again." };
    finishAuth(u);
    return { ok: true };
  };
  const loginGoogle = () => {
    const em = "you@gmail.com";
    const us = loadUsers();
    let u = Object.values(us).find(x => x.email === em);
    if (!u) { u = { id: newUid(), name: "Google User", email: em, pass: null, google: true, created: Date.now() }; saveUsers({ ...us, [u.id]: u }); }
    finishAuth(u);
  };
  const logout = () => {
    setUser(null); saveSession(null);
    const seed = seedTrip();
    setHistory([seed]); setActiveId(seed.id);
    setEditingTripId(null); setScreen("plan");
  };

  const navMeta = activeTrip;
  const firstName = user ? (user.name || "").split(" ")[0] : "";
  const initials = user ? (user.name || user.email).trim().slice(0, 1).toUpperCase() : "";

  return (
    <>
      <div className="nav">
        <div className="nav-in">
          <div className="logo">
            <BrandMark />
            <span className="logo-text">
              <span className="logo-name">trip go go</span>
              <span className="logo-tag">happy adventures</span>
            </span>
          </div>
          <div className="nav-tabs">
            <button className={"nav-tab" + (screen === "plan" ? " on" : "")} onClick={() => go("plan")}>Plan</button>
            <button className={"nav-tab" + (screen === "itinerary" ? " on" : "")} onClick={() => go("itinerary")}>Itinerary</button>
            <button className={"nav-tab" + (screen === "expenses" ? " on" : "")} onClick={() => go("expenses")}>Expenses</button>
            <button className={"nav-tab" + (screen === "history" ? " on" : "")} onClick={() => go("history")}>
              History{history.length > 0 && <span className="navcount">{history.length}</span>}
            </button>
          </div>
          <div className="nav-sp"></div>
          <div className="nav-meta">
            <span>{(navMeta.destination || "").split(" + ")[0]}</span>
            <span><b>{navMeta.days}D / {navMeta.nights}N</b></span>
          </div>
          {user ? (
            <div className="nav-user">
              <span className="ava" title={user.email}>{initials}</span>
              <span className="who hide-sm">{firstName}</span>
              <button className="navlink" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <button className="navlink primary" onClick={() => setAuthOpen(true)}>Sign in</button>
          )}
        </div>
      </div>

      {screen === "plan" && <PlanScreen plan={plan} updPlan={updPlan} onGenerate={generate} editingId={editingTripId} />}
      {screen === "itinerary" && <ItineraryScreen key={activeTrip.id} trip={activeTrip} isGuest={!user} onSignIn={() => setAuthOpen(true)} onExpenses={() => openExpenses(activeTrip.id)} onPlan={() => editTrip(activeTrip.id)} />}
      {screen === "expenses" && <ExpensesScreen key={activeTrip.id} trip={activeTrip} home={t.home} onChange={updateExpenses} onHistory={() => go("history")} />}
      {screen === "history" && (
        <HistoryScreen
          history={history} activeId={activeTrip.id} isGuest={!user}
          onSignIn={() => setAuthOpen(true)}
          onOpen={openTrip} onExpenses={openExpenses} onEdit={editTrip}
          onDuplicate={duplicateTrip} onDelete={deleteTrip} onRename={renameTrip}
          onNew={() => { setPlan(DEFAULT_PLAN); setEditingTripId(null); go("plan"); }}
          home={t.home} />
      )}

      {gen && (
        <div className="gen">
          <div className="box">
            <div className="spin"></div>
            <div className="serif" style={{ fontSize: 26, color: "var(--pine)" }}>Building your itinerary</div>
            <div className="genline" key={genStep} style={{ marginTop: 10 }}>{GEN_LINES[genStep]}</div>
          </div>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={login} onRegister={register} onGoogle={loginGoogle} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakSelect label="Surface" value={t.accent} options={Object.keys(ACCENTS)} onChange={v => setTweak("accent", v)} />
        <TweakSelect label="Accent pop" value={t.pop} options={Object.keys(POPS)} onChange={v => setTweak("pop", v)} />
        <TweakRadio label="Density" value={t.density} options={["regular", "compact"]} onChange={v => setTweak("density", v)} />
        <TweakSection label="Expenses" />
        <TweakRadio label="Home currency" value={t.home} options={["JPY", "USD", "THB"]} onChange={v => setTweak("home", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
