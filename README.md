# Trip go go ✈️

A travel-planning web app prototype — plan a trip, generate a day-by-day
itinerary, track expenses across currencies, and keep a private history of
your trips behind a sign-in.

**Live demo:** `https://<your-username>.github.io/<repo-name>/`

---

## Deploy on GitHub Pages

1. Create a repo and push all the files in this folder (keep the structure flat — every file sits in the repo root).
2. On GitHub: **Settings ▸ Pages**.
3. **Source:** *Deploy from a branch* → **Branch:** `main` → **Folder:** `/ (root)` → **Save**.
4. Wait ~1 minute, then open the URL Pages shows you. `index.html` loads automatically.

No build step is required — it runs entirely in the browser.

---

## ✅ What works (on the deployed site)

- **Plan** a trip: origin, destination, dates, travelers, pace, style, budget (16 currencies), interests.
- **Generate** an itinerary; *How to get there* and *Where to stay* adapt to the destination.
- **Edit** the plan: add / remove / swap / edit stops, regenerate a day or the whole trip.
- **Expenses**: add/edit/delete, multi-currency auto-converted to JPY, live budget meter + category breakdown.
- **History**: every trip is saved — open, edit, duplicate, rename, delete (with its expenses).
- **Accounts**: create account / sign in; trips are **private per account**; guest browsing with *sign in to save*.
- **Photos**: real photos for the Matsumoto example; drag-drop your own onto any slot (preview only).

## ⚠️ Current limitations (it's a front-end prototype)

- **Not real authentication** — accounts & passwords live in the browser's `localStorage`, lightly encoded (not secure). No password reset or email verification.
- **No backend / database** — data does **not** sync across devices/browsers and is lost if browser data is cleared.
- **"Continue with Google"** is a demo button, not real OAuth.
- **Dropped photos don't persist** on the static site; the built-in default photos still show.
- The **Tweaks** theme panel and **AI "Fetch live route"** only run inside the design editor.
- Day-by-day stops use a **Matsumoto template**; only the header, route and stays change for other destinations.
- Requires an internet connection (React/Babel via CDN, photos via Wikimedia).

## ➡️ Making it production-ready

To turn the prototype into a real product:

| Need | Suggested approach |
|------|--------------------|
| Real login | A managed auth provider — Firebase Auth, Supabase, Auth0, or Clerk (no server to run) |
| Saved trips that sync | That provider's database / storage, or Supabase/Firebase Firestore |
| Real "Sign in with Google" | Google OAuth client ID registered to your deployed domain |
| Live routes / AI suggestions | A small API proxy to a maps / LLM service |

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entry point (loads everything) |
| `tp-styles.css` | All styling + design tokens |
| `tp-data.jsx` | Trip seed data, photos, currencies, helpers |
| `tp-ui.jsx` | Shared UI primitives (buttons, modals, fields, image slot) |
| `tp-plan.jsx` | Plan / generate screen |
| `tp-itinerary.jsx` | Generated itinerary (route, stays, days, essentials) |
| `tp-expenses.jsx` | Expense tracker |
| `tp-history.jsx` | Saved-trips history |
| `tp-auth.jsx` | Local accounts + sign-in / register modal |
| `tp-app.jsx` | App shell: nav, auth state, routing between screens |
| `image-slot.js` | Drag-drop image placeholder component |
| `tweaks-panel.jsx` | Theme tweak panel (editor only) |

*This is a design prototype — see the limitations above before relying on it for real accounts or data.*
