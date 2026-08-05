# Deploy on Railway

Everything lives in **one Railway project**: the app and its Postgres database
side by side. The database migrations run automatically each time the app starts
(see `railway.json`). About 10 minutes.

You set up **four variables** total: one points the app at the database, three are
your own secrets.

---

## 1 · Create the project and add the app

1. Go to **railway.app** and log in with **GitHub**.
2. Click **New Project → Deploy from GitHub repo**.
3. Pick **`SidelineWaugh/Social-platform`**.
   - Don't see it? Click **Configure GitHub App** and give Railway access to that repo,
     then come back.
4. Railway starts a first build. **It's fine if this first deploy fails** — the database
   isn't connected yet. We fix that next.

## 2 · Add the database

1. In the project canvas, click **Create** (or the **+**) → **Database → Add PostgreSQL**.
2. Wait until the new **Postgres** box shows it's running.

## 3 · Connect the app to the database

1. Click your **app service** (the one named after the repo, not Postgres).
2. Open the **Variables** tab → **New Variable**.
3. Add the database link — the easy way is the **reference picker**:
   - Start a new variable named **`DATABASE_URL`**.
   - For its value, use the **reference** option and pick **Postgres → `DATABASE_URL`**
     from the dropdown. Railway fills in `${{Postgres.DATABASE_URL}}` for you.
   - (If you don't see a picker, just type the value exactly: `${{Postgres.DATABASE_URL}}`)
4. Add three more plain variables (just type the values):
   | Name | Value |
   |------|-------|
   | `ADMIN_PASSWORD` | a password you choose — used to log into `/admin` |
   | `SESSION_SECRET` | any long random text (30+ characters) |
   | `ANTHROPIC_API_KEY` | your `sk-ant-…` key — **optional**, only for "pull colours from logo" |
5. Save. Railway redeploys automatically. On start it runs the database migrations and
   creates all the tables.

## 4 · Open it

1. On the app service, open **Settings → Networking → Generate Domain** to get a public URL
   (if one isn't shown already).
2. Visit the URL — the events page is **empty** on a fresh database (expected).
3. Go to **`/admin`**, log in with your `ADMIN_PASSWORD`, then **New event**: fill in the
   details, upload the host club logo, **🎨 Pull brand colours from this logo** (or set them
   by hand), pick a Brand Kit background, tick **Published**, Save.

---

## If a deploy goes red

- **`Environment variable not found: DATABASE_URL`** → the reference in Step 3 didn't save.
  Re-open the app service → Variables and confirm `DATABASE_URL` shows `${{Postgres.DATABASE_URL}}`.
- **`Can't reach database server`** → the Postgres box isn't running yet, or the app and
  database ended up in different projects. They must be in the **same** project.

Copy the last ~15 lines of the deploy log if you get stuck — that's enough to pinpoint it.
