# Deploy on Vercel + Neon

The app is a Next.js app with a Postgres database. Vercel hosts the app; Neon
hosts the database. This is the smoothest setup for this project — no start
commands, no region matching. About 10 minutes end to end.

You'll set five environment variables. Two come from Neon, three you choose.

---

## 1 · Create the database (Neon)

1. Go to **neon.tech** and sign up (free — you can use your GitHub account).
2. Create a project. Name it `sideline`; pick a region near you. Leave the rest default.
3. On the project dashboard, open **Connect** (or "Connection Details"). You'll copy
   **two** connection strings — they look like `postgresql://user:pass@host/db?sslmode=require`:
   - **Pooled** — turn the **"Connection pooling"** toggle **ON**. The host will contain
     `-pooler`. This is your **`DATABASE_URL`**.
   - **Direct** — turn the **"Connection pooling"** toggle **OFF**. The host will have
     **no** `-pooler`. This is your **`DIRECT_URL`**.

   Paste both into a note for a moment. Getting these two mixed up is the #1 cause of
   trouble, so keep them labelled: **pooled = DATABASE_URL, direct = DIRECT_URL.**

---

## 2 · Deploy the app (Vercel)

1. Go to **vercel.com** and sign up with **GitHub**.
2. **Add New… → Project** → import the repo **`SidelineWaugh/Social-platform`**.
   (If you don't see it, click "Adjust GitHub App Permissions" and grant access to the repo.)
3. Vercel auto-detects Next.js. Leave the build & output settings at their defaults.
4. Expand **Environment Variables** and add these five:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | the Neon **pooled** string (host has `-pooler`) |
   | `DIRECT_URL` | the Neon **direct** string (host has **no** `-pooler`) |
   | `ADMIN_PASSWORD` | a password you choose — used to log into `/admin` |
   | `SESSION_SECRET` | any long random text (30+ characters is fine) |
   | `ANTHROPIC_API_KEY` | your `sk-ant-…` key — **optional**, only for "pull colours from logo" |

5. Click **Deploy**. The first build runs the database migrations and creates all the
   tables automatically. When it finishes, you'll get a live URL.

---

## 3 · Set it up in the app

1. Open your new Vercel URL. The events page will be **empty** — that's expected on a
   fresh database.
2. Go to **`/admin`** and log in with the `ADMIN_PASSWORD` you set.
3. **New event** → fill in the details → Save. New events already include the default
   backgrounds and the Brand Kit styles.
4. In **Event logo**, upload the host club's logo → click **🎨 Pull brand colours from
   this logo** (needs the API key) → or set the two colours by hand.
5. Pick a Brand Kit background (Deep / Spotlight / Palm / Blades) — the whole event now
   renders in the host club's colours.
6. Tick **Published** and Save so the event appears on the public site.

---

## Notes

- **Redeploys are automatic.** Every push to the repo's default branch triggers a new
  Vercel deploy, and migrations run as part of the build.
- **Uploads** are resized in the browser to stay small, so they fit comfortably within
  Vercel's request limits.
- **Switching hosts later** is always possible — `render.yaml` (Render Blueprint) and
  `railway.json` (Railway) are still in the repo. On those hosts, set `DIRECT_URL` to the
  same value as `DATABASE_URL`.
