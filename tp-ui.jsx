// tp-ui.jsx — shared editorial primitives

const Photo = ({ cap, tag = "IMG", className = "", style }) => (
  <div className={"photo " + className} style={style}>
    <span className="imgtag">{tag}</span>
    {cap && <span className="cap">{cap}</span>}
  </div>
);

const Eyebrow = ({ children, gold }) => <div className={"eyebrow" + (gold ? " gold" : "")}>{children}</div>;

const Tag = ({ children, kind }) => <span className={"tag" + (kind ? " " + kind : "")}>{children}</span>;

const Chip = ({ children, on, sm, onClick }) => (
  <button className={"chip" + (on ? " on" : "") + (sm ? " sm" : "")} onClick={onClick} style={{ font: "inherit" }}>{children}</button>
);

const Btn = ({ children, pri, gold, ghost, sm, lg, block, onClick, title }) => (
  <button className={"btn" + (pri ? " pri" : "") + (gold ? " gold" : "") + (ghost ? " ghost" : "") + (sm ? " sm" : "") + (lg ? " lg" : "") + (block ? " block" : "")}
    onClick={onClick} title={title}>{children}</button>
);

const IconBtn = ({ children, onClick, title, sm, disabled }) => (
  <button className={"iconbtn" + (sm ? " sm" : "")} onClick={onClick} title={title} disabled={disabled}>{children}</button>
);

const Field = ({ label, children }) => (
  <label className="field">
    {label && <span className="field-lbl">{label}</span>}
    {children}
  </label>
);

const Seg = ({ options, value, onChange }) => (
  <span className="seg">
    {options.map(o => <button key={o} className={value === o ? "on" : ""} onClick={() => onChange && onChange(o)}>{o}</button>)}
  </span>
);

const Stepper = ({ value, onChange }) => (
  <span className="stepper">
    <button onClick={() => onChange && onChange(Math.max(1, value - 1))}>–</button>
    <b>{value}</b>
    <button onClick={() => onChange && onChange(value + 1)}>+</button>
  </span>
);

const Meter = ({ pct, over }) => {
  const p = Math.min(100, pct);
  const o = Math.max(0, pct - 100);
  return (
    <div className="meter">
      <i style={{ width: p + "%" }}></i>
      {over && o > 0 && <i className="over" style={{ width: Math.min(100, o) + "%" }}></i>}
    </div>
  );
};

// small inline glyph marks (geometric, not pictorial)
const Mark = ({ type }) => {
  const m = {
    train: "▤", metro: "◉", bike: "⊚", castle: "⌂", food: "◓", cafe: "◑",
    camera: "▣", onsen: "≋", museum: "❖", sun: "☼", walk: "↝",
  };
  return <span style={{ fontFamily: "var(--mono)" }}>{m[type] || "•"}</span>;
};

// ---------- modal ----------
function Modal({ title, onClose, children, footer, narrow }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return ReactDOM.createPortal(
    <div className="modal-ov" onMouseDown={onClose}>
      <div className={"modal" + (narrow ? " narrow" : "")} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="t">{title}</span>
          <IconBtn sm title="Close" onClick={onClose}>✕</IconBtn>
        </div>
        <div className="modal-bd">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

function ConfirmDialog({ title = "Remove this stop?", message, confirmLabel = "Remove", onConfirm, onCancel }) {
  return (
    <Modal title={title} narrow onClose={onCancel}
      footer={<>
        <Btn sm ghost onClick={onCancel}>Cancel</Btn>
        <button className="btn sm" style={{ background: "var(--rust)", borderColor: "var(--rust)", color: "#fff" }} onClick={onConfirm}>{confirmLabel}</button>
      </>}>
      <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.55 }}>{message}</p>
    </Modal>
  );
}

// ---------- searchable currency combo ----------
function CurrencyCombo({ value, onChange, label }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = CCY[value] || CURRENCIES[0];
  const list = CURRENCIES.filter(c => {
    const s = (c.code + " " + c.name).toLowerCase();
    return s.includes(q.toLowerCase());
  });
  return (
    <div className="combo" ref={ref}>
      <button className="combo-btn" onClick={() => { setOpen(o => !o); setQ(""); }}>
        <span className="sym" style={{ fontWeight: 700 }}>{cur.sym}</span>
        <span className="code">{cur.code}</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>▾</span>
      </button>
      {open && (
        <div className="combo-pop">
          <input className="combo-search" placeholder="Search currency…" value={q} autoFocus
            onChange={e => setQ(e.target.value)} />
          <div className="combo-list">
            {list.length === 0 && <div className="combo-empty">No match</div>}
            {list.map(c => (
              <div key={c.code} className={"combo-opt" + (c.code === value ? " on" : "")}
                onClick={() => { onChange(c.code); setOpen(false); }}>
                <span className="sym">{c.sym}</span>
                <span>{c.name}</span>
                <span className="cd">{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- interactive checklist ----------
function Checklist({ items }) {
  const [done, setDone] = React.useState(() => new Set());
  const toggle = (i) => setDone(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <div className="checklist mt10">
      {items.map((p, i) => (
        <div key={p} className={"checkitem" + (done.has(i) ? " on" : "")} onClick={() => toggle(i)}>
          <span className="checkbox">✓</span><span className="lab">{p}</span>
        </div>
      ))}
    </div>
  );
}

// external link with arrow
const ExtLink = ({ href, children, className = "linkit" }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span className="exticon">↗</span></a>
);

// ---------- user-fillable real-image slot ----------
const SLOT_ASPECT = { wide: "16 / 9", sq: "1 / 1", tall: "3 / 4" };
const ImgSlot = ({ id, ph = "Drop a photo", shape = "rounded", radius = 14, variant = "wide", src, style }) => {
  const base = { display: "block", width: "100%", overflow: "hidden", borderRadius: radius + "px" };
  if (variant === "banner") base.height = "220px";
  else base.aspectRatio = SLOT_ASPECT[variant] || "16 / 9";
  const props = { id, placeholder: ph, shape, radius: String(radius), style: { ...base, ...style } };
  if (src) props.src = src;
  return React.createElement("image-slot", props);
};

// ---------- dropdown menu (share / save) ----------
function DropMenu({ label, items, sm, dark, gold, ghost, right = true }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="combo" ref={ref}>
      <Btn sm={sm} dark={dark} gold={gold} ghost={ghost} onClick={() => setOpen(o => !o)}>{label}</Btn>
      {open && (
        <div className={"combo-pop menu" + (right ? " right" : "")}>
          {items.map((it, i) => it.sep ? <div key={i} className="menu-sep"></div> : (
            it.href
              ? <a key={i} className="menu-item" href={it.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}><span className="mi">{it.icon}</span>{it.label}</a>
              : <button key={i} className="menu-item" onClick={() => { it.onClick && it.onClick(); setOpen(false); }}><span className="mi">{it.icon}</span>{it.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- user image upload (works on a plain static deploy; saves to localStorage) ----------
const UIMG_ASPECT = { wide: "16 / 9", sq: "1 / 1", tall: "3 / 4" };
function UserImg({ id, ph = "Add a photo", src, variant = "wide", radius = 14, style }) {
  const key = "gentrip.img." + id;
  const [data, setData] = React.useState(() => { try { return localStorage.getItem(key) || ""; } catch (e) { return ""; } });
  const [err, setErr] = React.useState("");
  const inputRef = React.useRef(null);
  const url = data || src || "";

  const onFile = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr("Pick an image file"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        let out; try { out = c.toDataURL("image/jpeg", 0.82); } catch (e) { out = reader.result; }
        try { localStorage.setItem(key, out); setErr(""); } catch (e) { setErr("Storage full — photo shown for now"); }
        setData(out);
      };
      img.onerror = () => setErr("Couldn't read that image");
      img.src = reader.result;
    };
    reader.onerror = () => setErr("Couldn't read that file");
    reader.readAsDataURL(f);
  };
  const clear = (e) => { e.stopPropagation(); try { localStorage.removeItem(key); } catch (e2) {} setData(""); setErr(""); };

  const sizeStyle = variant === "banner" ? { height: "220px" } : { aspectRatio: UIMG_ASPECT[variant] || "16 / 9" };
  return (
    <div className={"uimg" + (url ? " filled" : "")} style={{ borderRadius: radius + "px", ...sizeStyle, ...style }}
      onClick={() => inputRef.current && inputRef.current.click()} title="Click to upload a photo">
      {url
        ? <img src={url} alt="" style={{ borderRadius: radius + "px" }} />
        : <div className="uimg-empty"><span className="uimg-ico">⤓</span><span className="uimg-cap">{ph}</span><span className="uimg-sub">click to upload</span></div>}
      {url && <button className="uimg-clear" title="Remove / replace" onClick={clear}>✕</button>}
      {err && <div className="uimg-err">{err}</div>}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files && e.target.files[0]; onFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ---------- editable checklist (toggle / rename / add / delete) ----------
function EditableChecklist({ items }) {
  const [list, setList] = React.useState(() => items.map((t, i) => ({ id: "c" + i + "_" + Math.random().toString(36).slice(2, 6), text: t, done: false })));
  const [adding, setAdding] = React.useState("");
  const toggle = (id) => setList(l => l.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const edit = (id, text) => setList(l => l.map(x => x.id === id ? { ...x, text } : x));
  const del = (id) => setList(l => l.filter(x => x.id !== id));
  const add = () => { const t = adding.trim(); if (!t) return; setList(l => [...l, { id: "c" + Date.now(), text: t, done: false }]); setAdding(""); };
  return (
    <div className="checklist editlist mt10">
      {list.map(item => (
        <div key={item.id} className={"checkitem editable" + (item.done ? " on" : "")}>
          <span className="checkbox" onClick={() => toggle(item.id)}>✓</span>
          <input className="lab-input" value={item.text} onChange={e => edit(item.id, e.target.value)} />
          <button className="ci-del" title="Remove" onClick={() => del(item.id)}>✕</button>
        </div>
      ))}
      <div className="checkitem additem">
        <span className="checkbox add">＋</span>
        <input className="lab-input" placeholder="Add an item…" value={adding}
          onChange={e => setAdding(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }} />
        {adding.trim() && <button className="ci-del addbtn" title="Add" onClick={add}>↵</button>}
      </div>
    </div>
  );
}

// ---------- brand mark: a cute dog face inside a map pin (dog + travel) ----------
function BrandMark({ size = 36 }) {
  return (
    <svg className="brandmark" width={size} height={size} viewBox="0 0 48 54" fill="none" aria-hidden="true">
      <path d="M24 2.5C13.8 2.5 5.5 10.5 5.5 20.4c0 9 7.7 17.8 15.2 26 1.7 1.9 4.9 1.9 6.6 0 7.5-8.2 15.2-17 15.2-26C42.5 10.5 34.2 2.5 24 2.5Z" fill="var(--clay)"/>
      <path d="M24 2.5C13.8 2.5 5.5 10.5 5.5 20.4c0 9 7.7 17.8 15.2 26 1.7 1.9 4.9 1.9 6.6 0 7.5-8.2 15.2-17 15.2-26C42.5 10.5 34.2 2.5 24 2.5Z" fill="#000" opacity="0.05"/>
      <ellipse cx="14.6" cy="17.6" rx="3.3" ry="6.2" transform="rotate(-23 14.6 17.6)" fill="var(--pine)"/>
      <ellipse cx="33.4" cy="17.6" rx="3.3" ry="6.2" transform="rotate(23 33.4 17.6)" fill="var(--pine)"/>
      <circle cx="24" cy="20" r="11" fill="var(--paper)"/>
      <circle cx="19.9" cy="18.4" r="1.8" fill="var(--pine)"/>
      <circle cx="28.1" cy="18.4" r="1.8" fill="var(--pine)"/>
      <ellipse cx="24" cy="24.4" rx="5.3" ry="4.3" fill="var(--gold-soft)"/>
      <circle cx="24" cy="22.6" r="1.9" fill="var(--pine)"/>
      <path d="M24 24.5v1.5" stroke="var(--pine)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M24 26c-1 0-1.8.5-2.2 1.1" stroke="var(--pine)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M24 26c1 0 1.8.5 2.2 1.1" stroke="var(--pine)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { Photo, Eyebrow, Tag, Chip, Btn, IconBtn, Field, Seg, Stepper, Meter, Mark, BrandMark, Modal, ConfirmDialog, CurrencyCombo, Checklist, EditableChecklist, ExtLink, ImgSlot, UserImg, DropMenu });
