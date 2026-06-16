// tp-plan.jsx — the generator / input screen (controlled by App's plan state)

const ALL_INTERESTS = ["Cycling", "Onsen", "Nature", "Food", "Photography", "Culture", "History", "Slow travel", "Nightlife", "Shopping"];

function PlanScreen({ plan, updPlan, onGenerate, editingId }) {
  const sym = ccySym(plan.baseCcy);
  const toggle = (i) => updPlan("interests", plan.interests.includes(i) ? plan.interests.filter(x => x !== i) : [...plan.interests, i]);
  const dates = tripDates(plan.start, plan.end);

  return (
    <div className="page fade-in">
      {/* hero */}
      <div className="row tw mid" style={{ alignItems: "flex-end", marginBottom: 26 }}>
        <div>
          <Eyebrow>{editingId ? "Edit trip" : "Plan a new trip"}</Eyebrow>
          <h1 className="h-hero" style={{ fontSize: 40, marginTop: 8 }}>Where to next?</h1>
          <p className="lead" style={{ marginTop: 8, maxWidth: 520 }}>
            Tell us the essentials. We scan stays, sights, routes &amp; eats and draft a day-by-day plan you can fully edit.
          </p>
        </div>
        <div className="hide-sm" style={{ flex: "0 0 260px" }}>
          <UserImg id="plan-hero" ph="Add a destination photo" src={PHOTOS.castle} variant="wide" radius={16} />
        </div>
      </div>

      <div className="row g20" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* main form */}
        <div className="card pad-lg grow" style={{ minWidth: 320 }}>
          <div className="row g14 wrap">
            <Field label="From (origin)">
              <div className="input"><span className="pre">◉</span><input value={plan.origin} onChange={e => updPlan("origin", e.target.value)} /></div>
            </Field>
            <Field label="Destination">
              <div className="input"><span className="pre">⌖</span><input value={plan.dest} onChange={e => updPlan("dest", e.target.value)} /></div>
            </Field>
          </div>

          <div className="row g14 wrap mt14">
            <Field label="Start date">
              <div className="input"><span className="pre">▦</span><input type="date" value={plan.start} onChange={e => updPlan("start", e.target.value)} /></div>
            </Field>
            <Field label="End date">
              <div className="input"><span className="pre">▦</span><input type="date" value={plan.end} min={plan.start} onChange={e => updPlan("end", e.target.value)} /></div>
            </Field>
            <div className="field" style={{ flex: "0 0 auto" }}>
              <span className="field-lbl">Travelers</span>
              <Stepper value={plan.pax} onChange={v => updPlan("pax", v)} />
            </div>
          </div>

          <div className="row g20 wrap mt14">
            <div className="field" style={{ flex: "0 0 auto" }}>
              <span className="field-lbl">Pace</span>
              <Seg options={["Relaxed", "Balanced", "Packed"]} value={plan.pace} onChange={v => updPlan("pace", v)} />
            </div>
            <div className="field" style={{ flex: "0 0 auto" }}>
              <span className="field-lbl">Style</span>
              <Seg options={["Budget", "Mid-range", "Luxury"]} value={plan.style} onChange={v => updPlan("style", v)} />
            </div>
          </div>

          <div className="field mt14">
            <span className="field-lbl">Budget range · per person</span>
            <div className="row g10 mid wrap">
              <div className="input" style={{ maxWidth: 140 }}><span className="pre">{sym}</span><input value={plan.bLow.toLocaleString()} onChange={e => updPlan("bLow", +e.target.value.replace(/\D/g, "") || 0)} /></div>
              <span className="muted">to</span>
              <div className="input" style={{ maxWidth: 140 }}><span className="pre">{sym}</span><input value={plan.bHigh.toLocaleString()} onChange={e => updPlan("bHigh", +e.target.value.replace(/\D/g, "") || 0)} /></div>
              <CurrencyCombo value={plan.baseCcy} onChange={v => updPlan("baseCcy", v)} />
            </div>
          </div>

          <div className="field mt14">
            <span className="field-lbl">Interests</span>
            <div className="row wrap g8">
              {ALL_INTERESTS.map(i => <Chip key={i} sm on={plan.interests.includes(i)} onClick={() => toggle(i)}>{i}</Chip>)}
            </div>
          </div>

          <div className="field mt14">
            <span className="field-lbl">Anything specific? (free text)</span>
            <textarea className="input" value={plan.freeText} onChange={e => updPlan("freeText", e.target.value)} />
          </div>

          <div className="row tw mid mt20">
            <span className="sub2">Picks pulled live · refine anytime after generating</span>
            <Btn pri lg onClick={onGenerate}>✦ {editingId ? "Regenerate itinerary" : "Generate itinerary"}</Btn>
          </div>
        </div>

        {/* side preview */}
        <div className="col g14" style={{ flex: "0 0 270px" }}>
          <div className="card green pad">
            <Eyebrow><span style={{ color: "#cdd8c2" }}>Smart summary</span></Eyebrow>
            <div className="h-card serif mt6" style={{ color: "#f3efe2" }}>What we'll build</div>
            <div className="col g10 mt14">
              {[["Route", (plan.origin.split(",")[0]) + " → " + plan.dest.split(" + ")[0]], ["When", dates.days + " days · " + dates.nights + " nights"], ["Who", plan.pax + " travelers · " + plan.pace.toLowerCase()], ["Style", plan.style], ["Budget", sym + plan.bLow.toLocaleString() + "–" + plan.bHigh.toLocaleString() + " pp"], ["Loves", plan.interests.slice(0, 4).join(" · ")]].map(([k, v]) => (
                <div key={k} className="row tw" style={{ borderBottom: "1px solid rgba(255,255,255,.12)", paddingBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#aebca2" }}>{k}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, textAlign: "right", color: "#eef0e6" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card pad-sm">
            <div className="row g10 mid">
              <Photo cap="" tag="" className="sq" style={{ width: 54 }} />
              <div className="grow">
                <div className="sub2">Sources scanned</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Transit · Stays · Maps · Reviews</div>
              </div>
            </div>
          </div>
          <p className="sub2" style={{ lineHeight: 1.6, padding: "0 4px" }}>
            {editingId
              ? "Editing a saved trip — change anything and regenerate to update its record in History."
              : "Each generated trip is saved to History, where you can reopen, edit or remove it anytime."}
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlanScreen });
