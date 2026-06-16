// tp-auth.jsx — local account store + sign-in / register modal
// Prototype only: accounts live in localStorage, namespaced per browser.
// Passwords are lightly encoded (NOT secure) — this is a design prototype.

const AUSERS = "gentrip.users.v1";
const ASESSION = "gentrip.session.v1";

const loadUsers = () => { try { return JSON.parse(localStorage.getItem(AUSERS)) || {}; } catch (e) { return {}; } };
const saveUsers = (u) => { try { localStorage.setItem(AUSERS, JSON.stringify(u)); } catch (e) {} };
const loadSession = () => { try { return localStorage.getItem(ASESSION) || null; } catch (e) { return null; } };
const saveSession = (id) => { try { id ? localStorage.setItem(ASESSION, id) : localStorage.removeItem(ASESSION); } catch (e) {} };

// per-user trip history (private to the account)
const userHistKey = (id) => "gentrip.history.u." + id;
const loadUserHistory = (id) => { try { return JSON.parse(localStorage.getItem(userHistKey(id))) || null; } catch (e) { return null; } };
const saveUserHistory = (id, h) => { try { localStorage.setItem(userHistKey(id), JSON.stringify(h)); } catch (e) {} };

const hash = (s) => { try { return btoa(unescape(encodeURIComponent("tgg:" + s))); } catch (e) { return "tgg:" + s; } };
const newUid = () => "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function AuthModal({ onClose, onLogin, onRegister, onGoogle }) {
  const [mode, setMode] = React.useState("signin");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const isUp = mode === "signup";

  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const swap = (m) => { setMode(m); setErr(""); };
  const submit = (e) => {
    if (e) e.preventDefault();
    setErr("");
    const em = email.trim();
    if (isUp && !name.trim()) return setErr("Tell us your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setErr("Enter a valid email address.");
    if (pass.length < 6) return setErr("Password must be at least 6 characters.");
    const res = isUp ? onRegister({ name, email: em, pass }) : onLogin({ email: em, pass });
    if (res && !res.ok) setErr(res.error);
  };

  return ReactDOM.createPortal(
    <div className="auth-ov" onMouseDown={onClose}>
      <div className="authcard" onMouseDown={e => e.stopPropagation()}>
        <div className="authpanel" style={{ backgroundImage: `linear-gradient(180deg, rgba(42,49,35,.25), rgba(34,40,28,.78)), url("${PHOTOS.castle}")` }}>
          <div className="authpanel-in">
            <div className="logo onphoto">
              <BrandMark />
              <span className="logo-text">
                <span className="logo-name" style={{ color: "#fff" }}>trip go go</span>
                <span className="logo-tag" style={{ color: "#f3d9c9" }}>happy adventures</span>
              </span>
            </div>
            <div>
              <div className="serif authpanel-h">Plan it. Save it. Come back to it.</div>
              <p className="authpanel-p">Your trips stay private to your account — only you can open and edit them.</p>
            </div>
            <div className="authpanel-cap mono">Matsumoto Castle · Nagano</div>
          </div>
        </div>

        <div className="authform">
          <button className="authclose" onClick={onClose} title="Continue as guest">✕</button>
          <h2 className="h-card authtitle" style={{ marginTop: 6 }}>{isUp ? "Create your account" : "Welcome back"}</h2>
          <p className="sub2" style={{ marginTop: 4 }}>{isUp ? "Save trips and keep them private to you." : "Sign in to see your saved trips."}</p>

          <button className="gbtn" onClick={onGoogle}><span className="gmk">G</span>Continue with Google</button>
          <div className="authdiv"><span>or</span></div>

          <form onSubmit={submit} noValidate>
            {isUp && (
              <div className="field"><span className="field-lbl">Name</span>
                <div className="input"><span className="pre">◔</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
              </div>
            )}
            <div className={"field" + (isUp ? " mt12" : "")}><span className="field-lbl">Email</span>
              <div className="input"><span className="pre">@</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></div>
            </div>
            <div className="field mt12"><span className="field-lbl">Password</span>
              <div className="input"><span className="pre">⚿</span><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder={isUp ? "At least 6 characters" : "Your password"} /></div>
            </div>
            {err && <div className="autherr">{err}</div>}
            <button type="submit" className="btn pri authsubmit">{isUp ? "Create account" : "Sign in"}</button>
          </form>

          <div className="authfoot">
            {isUp
              ? <>Already have an account? <button className="linktext" onClick={() => swap("signin")}>Sign in</button></>
              : <>New here? <button className="linktext" onClick={() => swap("signup")}>Create an account</button></>}
          </div>
          <button className="guestlink" onClick={onClose}>Continue as guest →</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

Object.assign(window, {
  AuthModal, loadUsers, saveUsers, loadSession, saveSession,
  loadUserHistory, saveUserHistory, hash, newUid,
});
