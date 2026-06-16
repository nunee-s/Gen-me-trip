// tp-itinerary.jsx — generated plan: AI route, links, edit/confirm, regenerate, share/save, real-image slots

const { useState: useStateI, useEffect: useEffectI, useRef: useRefI } = React;

function useToast() {
  const [msg, setMsg] = useStateI(null);
  const show = (m) => { setMsg(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setMsg(null), 2200); };
  const node = msg ? ReactDOM.createPortal(<div className="toast">{msg}</div>, document.body) : null;
  return [node, show];
}

const SHARE_URL = (typeof location !== "undefined" ? location.href : "https://tripgogo.app");

function buildItineraryText(trip) {
  let t = trip.title.toUpperCase() + "\n" + trip.tagline + "\n";
  t += trip.nights + " nights / " + trip.days + " days · " + trip.dates + " · " + trip.pax + " travelers\n";
  t += "Budget: ¥" + trip.budgetLow.toLocaleString() + "–" + trip.budgetHigh.toLocaleString() + " per person\n\n";
  t += "HOW TO GET THERE (from " + trip.origin + ")\n";
  GET_THERE.forEach(g => { t += "  • " + g.mode + " — " + g.from + " (" + g.note + ")" + (g.cost ? " " + g.cost : "") + "\n"; });
  t += "\nWHERE TO STAY\n";
  STAYS.forEach(s => { t += "  • " + s.name + (s.pick ? " (recommended)" : "") + " — " + s.tag + ", " + s.nights + "\n"; });
  DAYS.forEach(d => {
    t += "\nDAY " + d.n + " · " + d.title + "  (" + d.sub + ")\n";
    d.items.forEach(it => { t += "  " + it.time + "  " + it.kind + ": " + it.name + " — " + it.meta + "\n"; });
  });
  t += "\n— made with Trip go go\n";
  return t;
}
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function TLItem({ it, onAskRemove, onSwap, onEdit, onUp, onDown, first, last }) {
  return (
    <div className="tlrow">
      <div className="tltime">{it.time}</div>
      <div className="tlmid">
        <span className={"tldot" + (it.mark ? " " + it.mark : "")}></span>
        <div className="tlcard">
          <UserImg id={"slot-" + it.id} ph={it.cap || it.name || "Add a photo"} src={it.img} variant="sq" radius={12} style={{ width: 80, flex: "0 0 80px" }} />
          <div className="body">
            <div className="kind">{it.kind}</div>
            <div className="nm"><ExtLink href={gmaps(it.name)}>{it.name}</ExtLink></div>
            <div className="meta">{it.meta}</div>
          </div>
          <div className="acts">
            <span className="movegrp">
              <IconBtn sm title="Move up" onClick={onUp} disabled={first}>↑</IconBtn>
              <IconBtn sm title="Move down" onClick={onDown} disabled={last}>↓</IconBtn>
            </span>
            {it.alts && <IconBtn sm title="Swap for an alternative" onClick={onSwap}>⟲</IconBtn>}
            <IconBtn sm title="Edit" onClick={onEdit}>✎</IconBtn>
            <IconBtn sm title="Remove" onClick={onAskRemove}>✕</IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditItemModal({ item, onSave, onClose }) {
  const [d, setD] = useStateI({ ...item });
  const upd = (k, v) => setD(s => ({ ...s, [k]: v }));
  return (
    <Modal title={item._new ? "Add a stop" : "Edit stop"} onClose={onClose}
      footer={<><Btn sm ghost onClick={onClose}>Cancel</Btn><Btn sm pri onClick={() => onSave(d)}>{item._new ? "Add stop" : "Save changes"}</Btn></>}>
      <div className="row g12 wrap">
        <Field label="Time"><div className="input" style={{ maxWidth: 110 }}><input value={d.time} onChange={e => upd("time", e.target.value)} /></div></Field>
        <Field label="Kind"><div className="input"><input value={d.kind} onChange={e => upd("kind", e.target.value)} /></div></Field>
      </div>
      <div className="field mt14"><span className="field-lbl">Name</span><div className="input"><input value={d.name} placeholder="Place or activity" onChange={e => upd("name", e.target.value)} /></div></div>
      <div className="field mt14"><span className="field-lbl">Details</span><textarea className="input" value={d.meta} placeholder="Notes, time, cost…" onChange={e => upd("meta", e.target.value)} /></div>
    </Modal>
  );
}

function DaySection({ day, regenSeed }) {
  const [items, setItems] = useStateI(day.items);
  const [confirmId, setConfirmId] = useStateI(null);
  const [editItem, setEditItem] = useStateI(null);
  const [regen, setRegen] = useStateI(false);
  const [toast, showToast] = useToast();

  const randomize = () => setItems(s => s.map(x => {
    if (!x.alts) return x;
    let i = Math.floor(Math.random() * x.alts.length);
    if (x._ai != null && x.alts.length > 1) { while (i === x._ai) i = Math.floor(Math.random() * x.alts.length); }
    return { ...x, name: x.alts[i], _ai: i };
  }));

  // respond to "Regenerate all"
  useEffectI(() => { if (regenSeed) randomize(); }, [regenSeed]);

  const remove = (id) => { setItems(s => s.filter(x => x.id !== id)); setConfirmId(null); showToast("Stop removed"); };
  const swap = (id) => setItems(s => s.map(x => {
    if (x.id !== id || !x.alts) return x;
    const i = (x._ai == null ? 0 : x._ai + 1) % x.alts.length;
    return { ...x, name: x.alts[i], _ai: i };
  }));
  const saveEdit = (d) => { setItems(s => s.map(x => x.id === d.id ? d : x)); setEditItem(null); showToast("Stop updated"); };
  const move = (id, dir) => setItems(s => {
    const i = s.findIndex(x => x.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= s.length) return s;
    const next = s.slice(); const tmp = next[i]; next[i] = next[j]; next[j] = tmp; return next;
  });
  const regenerate = () => { setRegen(true); setTimeout(() => { randomize(); setRegen(false); showToast("Day " + day.n + " regenerated"); }, 850); };

  const confItem = items.find(x => x.id === confirmId);

  return (
    <section className="mt28">
      <div className="dayband">
        <span className="n">DAY {day.n}</span>
        <div className="grow">
          <div className="ttl">{day.title}</div>
          <div className="sub">{day.sub}</div>
        </div>
        <Btn sm ghost onClick={regenerate} title="Shuffle this day's swappable picks">
          <span style={{ color: "#dfe6d6" }}>{regen ? "⟳ Regenerating…" : "⟲ Regenerate day"}</span>
        </Btn>
      </div>
      <div className="tl mt14" style={regen ? { opacity: .5, transition: "opacity .2s" } : null}>
        {items.map((it, idx) => (
          <TLItem key={it.id} it={it}
            first={idx === 0} last={idx === items.length - 1}
            onUp={() => move(it.id, -1)} onDown={() => move(it.id, 1)}
            onAskRemove={() => setConfirmId(it.id)}
            onSwap={() => swap(it.id)}
            onEdit={() => setEditItem(it)} />
        ))}
      </div>
      <div style={{ paddingLeft: 62 }}>
        <Btn sm ghost onClick={() => setEditItem({ id: "n" + Date.now(), time: "—:—", kind: "Stop", name: "", meta: "", _new: true })}>
          <span className="muted">＋ Add a stop to Day {day.n}</span>
        </Btn>
      </div>

      {confItem && (
        <ConfirmDialog
          message={<>Remove <b>“{confItem.name}”</b> from Day {day.n}? You can add it back or regenerate the day anytime.</>}
          onConfirm={() => remove(confirmId)} onCancel={() => setConfirmId(null)} />
      )}
      {editItem && (
        <EditItemModal item={editItem}
          onSave={(d) => { if (editItem._new) { setItems(s => [...s, d]); setEditItem(null); showToast("Stop added"); } else saveEdit(d); }}
          onClose={() => setEditItem(null)} />
      )}
      {toast}
    </section>
  );
}

function GetThereCard({ trip }) {
  const [route, setRoute] = useStateI(() => routeFor(trip));
  const [loading, setLoading] = useStateI(false);
  const [src, setSrc] = useStateI("preset");
  const [toast, showToast] = useToast();

  const fetchRoute = async () => {
    if (!(window.claude && window.claude.complete)) { showToast("AI fetch runs in the live app"); return; }
    setLoading(true);
    try {
      const prompt = `You are a Japan rail/transit expert. Give the realistic public-transit route from "${trip.origin}" to "${trip.destination}". Reply with ONLY a JSON array of 3-5 steps, each {"mode":"Metro|Transfer|Limited Express|Bus|Arrive","from":"station or leg","note":"line + approx duration","cost":"¥#### or empty string"}. No prose, no markdown.`;
      const res = await window.claude.complete(prompt);
      const arr = JSON.parse(res.match(/\[[\s\S]*\]/)[0]);
      if (Array.isArray(arr) && arr.length) { setRoute(arr); setSrc("ai"); showToast("Route updated by AI"); }
    } catch (e) { showToast("Couldn’t fetch — keeping saved route"); }
    setLoading(false);
  };

  return (
    <div className="card pad">
      <div className="row tw mid">
        <div><Eyebrow>How to get there</Eyebrow><div className="h-card mt6" style={{ whiteSpace: "nowrap" }}>From {trip.origin}</div></div>
        <span className={"tag " + (src === "ai" ? "gold" : "line")}>{src === "ai" ? "AI route" : "saved"}</span>
      </div>
      <div className="col mt14">
        {route.map((g, i) => (
          <div key={i} className="row g12" style={{ alignItems: "flex-start" }}>
            <div className="col mid" style={{ flex: "0 0 22px", alignSelf: "stretch" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", border: "2.5px solid var(--pine)", background: "var(--paper)", marginTop: 4 }}></span>
              {i < route.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--line-2)" }}></span>}
            </div>
            <div className="grow" style={{ paddingBottom: 16 }}>
              <div className="row tw mid">
                <span className="tag line">{g.mode}</span>
                {g.cost && <span className="amt" style={{ fontSize: 13 }}>{g.cost}</span>}
              </div>
              <div style={{ fontWeight: 700, fontFamily: "var(--sans)", fontSize: 15, marginTop: 5 }}>
                <ExtLink href={gsearch(g.from + " station Japan train")}>{g.from}</ExtLink>
              </div>
              <div className="meta" style={{ fontSize: 13, color: "var(--ink-soft)" }}>{g.note}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g8 mid mt6">
        <Btn sm ghost onClick={fetchRoute}>{loading ? "⟳ Fetching…" : "↻ Fetch live route (AI)"}</Btn>
        <ExtLink className="linkit sub2" href={gsearch(trip.origin + " to " + trip.destination + " train route")}>open in search</ExtLink>
      </div>
      {src !== "ai" && <p className="sub2 mt6" style={{ lineHeight: 1.5 }}>Saved route from your plan. Tap “Fetch live route” to refresh it with AI (runs in the live app).</p>}
      {toast}
    </div>
  );
}

function StaysCard({ trip }) {
  const stays = staysFor(trip);
  const dest = (trip.destination || "").split(" + ")[0].split(",")[0].trim();
  return (
    <div className="card pad">
      <div className="row tw mid">
        <div><Eyebrow>Where to stay</Eyebrow><div className="h-card mt6" style={{ whiteSpace: "nowrap" }}>{dest} · {stays.length} options</div></div>
        <span className="tag gold">{trip.style}</span>
      </div>
      <div className="optgrid mt14">
        {stays.map((s, i) => (
          <div key={i} className={"opt" + (s.pick ? " pick" : "")}>
            <UserImg id={"stay-" + trip.id + "-" + i} ph={s.cap} src={s.img} variant="wide" radius={0} />
            <div className="pad-sm">
              <div className="row tw mid">
                <span className="tag">{s.tag}</span>
                <span className="sub2">{s.nights}</span>
              </div>
              <div className="h-card mt6" style={{ fontSize: 16 }}>
                <ExtLink href={gsearch(s.name + " " + dest)}>{s.name}</ExtLink>
                {s.jp && <span className="sub2" style={{ marginLeft: 6 }}>{s.jp}</span>}
              </div>
              <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
                {s.pts.map((p, j) => <li key={j} className="meta" style={{ display: "flex", gap: 7, fontSize: 12.5, padding: "1px 0" }}><span style={{ color: "var(--moss)" }}>—</span>{p}</li>)}
              </ul>
              <div className="row g6 mt10 wrap">
                <a className="btn sm" href={tripcom(s.name + " " + dest)} target="_blank" rel="noopener noreferrer">Trip.com ↗</a>
                <a className="btn sm ghost" href={mapsUrl(s.name + " " + dest)} target="_blank" rel="noopener noreferrer">Map ↗</a>
                {s.pick && <span className="tag" style={{ background: "var(--pine)", color: "#eef0e6" }}>✓ Recommended</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Essentials() {
  return (
    <section className="mt28">
      <Eyebrow>Trip essentials</Eyebrow>
      <div className="row g20 wrap mt14" style={{ alignItems: "flex-start" }}>
        <div className="card pad grow" style={{ minWidth: 240 }}>
          <div className="h-card">Packing list</div>
          <EditableChecklist items={ESSENTIALS.packing} />
        </div>
        <div className="card pad grow" style={{ minWidth: 240 }}>
          <div className="h-card">Photo checklist</div>
          <EditableChecklist items={ESSENTIALS.photos} />
        </div>
        <div className="col g14" style={{ flex: "0 0 260px" }}>
          <div className="card green pad-sm">
            <Eyebrow><span style={{ color: "#cdd8c2" }}>Rainy day backup</span></Eyebrow>
            <div className="col g8 mt10">
              {ESSENTIALS.rainy.map(r => (
                <div key={r.t}><span className="mono" style={{ fontSize: 10, color: "#aebca2", letterSpacing: ".08em", textTransform: "uppercase" }}>{r.t}</span>
                  <div style={{ fontSize: 13, color: "#eef0e6" }}>{r.d}</div></div>
              ))}
            </div>
          </div>
          <div className="card pad-sm">
            <div className="sub2">Tips</div>
            {ESSENTIALS.tips.map(t => <div key={t} className="meta" style={{ fontSize: 12.5, display: "flex", gap: 6 }}><span style={{ color: "var(--gold)" }}>◦</span>{t}</div>)}
          </div>
          <div className="card pad-sm">
            <div className="sub2">Useful apps</div>
            <div className="row wrap g6 mt6">
              {ESSENTIALS.apps.map(a => (
                <a key={a} className="tag line" style={{ textDecoration: "none" }} href={APP_LINKS[a] || gsearch(a)} target="_blank" rel="noopener noreferrer">{a} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ItineraryScreen({ trip, onExpenses, onPlan, isGuest, onSignIn }) {
  const [regenSeed, setRegenSeed] = useStateI(0);
  const [regenAll, setRegenAll] = useStateI(false);
  const [toast, showToast] = useToast();

  const shareText = trip.title + " — " + trip.tagline + " · " + trip.days + " days";
  const fileName = (trip.title || "trip").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "") + "-itinerary.txt";

  const doRegenAll = () => {
    setRegenAll(true);
    setTimeout(() => { setRegenSeed(s => s + 1); setRegenAll(false); showToast("Whole trip regenerated"); }, 1000);
  };
  const copyLink = () => {
    try { navigator.clipboard.writeText(SHARE_URL); showToast("Link copied"); } catch (e) { showToast("Copy not available"); }
  };
  const nativeShare = () => {
    if (navigator.share) navigator.share({ title: trip.title, text: shareText, url: SHARE_URL }).catch(() => {});
    else copyLink();
  };

  const shareItems = [
    ...(navigator.share ? [{ icon: "⤴", label: "Share via device…", onClick: nativeShare }, { sep: true }] : []),
    { icon: "𝕏", label: "Share on X", href: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) + "&url=" + encodeURIComponent(SHARE_URL) },
    { icon: "f", label: "Share on Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(SHARE_URL) },
    { icon: "✆", label: "Share on WhatsApp", href: "https://wa.me/?text=" + encodeURIComponent(shareText + " " + SHARE_URL) },
    { icon: "✉", label: "Email", href: "mailto:?subject=" + encodeURIComponent(trip.title + " itinerary") + "&body=" + encodeURIComponent(shareText + "\n\n" + SHARE_URL) },
    { sep: true },
    { icon: "⧉", label: "Copy link", onClick: copyLink },
  ];
  const saveItems = [
    { icon: "⤓", label: "Download itinerary (.txt)", onClick: () => { downloadText(fileName, buildItineraryText(trip)); showToast("Saved to your device"); } },
    { icon: "⎙", label: "Print / Save as PDF", onClick: () => window.print() },
  ];

  return (
    <div className="page fade-in">
      {/* cover photo (a real photo loads by default; click to upload your own) */}
      <UserImg id={"trip-hero-" + trip.id} ph="Add a cover photo" src={trip.coverSrc} variant="banner" radius={20} />

      {/* trip header */}
      <div className="card green pad-lg mt14" style={{ position: "relative" }}>
        <div className="row tw wrap" style={{ alignItems: "flex-start", gap: 20 }}>
          <div style={{ maxWidth: 560 }}>
            <Eyebrow><span style={{ color: "#e7b9a0" }}>{trip.nights} nights · {trip.days} days · {trip.dates}</span></Eyebrow>
            <h1 className="h-hero mt6" style={{ fontSize: 44, color: "#f7f1e4" }}>{trip.title}</h1>
            <p className="lead mt12" style={{ color: "#d6ddca" }}>{trip.tagline}</p>
            <div className="row wrap g8 mt14">
              {trip.interests.map(i => <span key={i} className="tag" style={{ background: "rgba(255,255,255,.1)", color: "#e7ecdd" }}>{i}</span>)}
            </div>
          </div>
          <div className="col g10" style={{ flex: "0 0 auto" }}>
            {[["Route", (trip.origin.split(",")[0]) + " → " + trip.destination.split(" + ")[0]], ["Weather", trip.weather], ["Pace / style", trip.pace + " · " + trip.style], ["Budget / pp", "¥" + trip.budgetLow.toLocaleString() + "–" + trip.budgetHigh.toLocaleString()]].map(([k, v]) => (
              <div key={k} className="row tw g20" style={{ borderBottom: "1px solid rgba(255,255,255,.12)", paddingBottom: 7, minWidth: 240 }}>
                <span className="mono" style={{ fontSize: 10, color: "#aebca2", letterSpacing: ".08em", textTransform: "uppercase" }}>{k}</span>
                <span style={{ fontWeight: 600, fontSize: 13, textAlign: "right", color: "#eef0e6" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row g8 mt20 wrap mid">
          {isGuest && <Btn pri sm onClick={onSignIn} title="Save this trip to your account">✦ Sign in to save</Btn>}
          <Btn gold sm onClick={onExpenses}>＋ Track expenses</Btn>
          <Btn ghost sm onClick={onPlan} title="Edit this trip's details and regenerate">
            <span style={{ color: "#eef0e6" }}>✎ Edit details</span>
          </Btn>
          <Btn ghost sm onClick={doRegenAll} title="Re-pick every day's swappable spots across the whole trip">
            <span style={{ color: "#eef0e6" }}>{regenAll ? "⟳ Regenerating trip…" : "⟲ Regenerate all"}</span>
          </Btn>
          <DropMenu sm ghost label={<span style={{ color: "#eef0e6" }}>⤴ Share</span>} items={shareItems} right={false} />
          <DropMenu sm ghost label={<span style={{ color: "#eef0e6" }}>⤓ Save</span>} items={saveItems} right={false} />
        </div>
      </div>

      <div className="row g20 wrap mt28" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 300px", minWidth: 280 }}><GetThereCard trip={trip} /></div>
        <div className="grow" style={{ minWidth: 320 }}><StaysCard trip={trip} /></div>
      </div>

      {DAYS.map(d => <DaySection key={d.n} day={d} regenSeed={regenSeed} />)}

      <Essentials />
      {toast}
    </div>
  );
}

Object.assign(window, { ItineraryScreen });
