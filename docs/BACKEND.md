# Backend setup — Supabase

The site runs with none of this configured. Craft and Writings show their empty
states, Home and Works read the static project list, About keeps its education
cards, `/studio` says it is not set up, and everything else works normally. Do
this when you want to start editing content.

One service does both jobs:

| Supabase part | Holds | Free tier |
|---|---|---|
| **Database** | projects, writings, craft cards, the About desk, site settings, and who is allowed to edit | 500MB |
| **Storage** (`media` bucket) | the images and models those rows point at | 1GB |

The database stores only each file's public URL.

Filebase is still supported by `/api/uploads` as an alternative image host (see
[§6](#6-optional-filebase)), but nothing in the studio depends on it.

---

## 1. Supabase

### Create the project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Pick a region close to you — `Southeast Asia (Singapore)` is the nearest to
   Chennai.
3. Save the database password it gives you somewhere safe. You will not need it
   for this site, but you cannot see it again.

The project takes a couple of minutes to provision.

### Create the tables — a fresh project

1. In the sidebar, open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in.
3. Press **Run**.
4. Then run `supabase/migrations/0007_seed_projects_and_craft.sql` the same way
   if you want the nine projects and the craft descriptions pre-filled.

This creates five tables (`craft_items`, `writings`, `projects`, `interests`,
`site_settings`) and the `media` storage bucket, turns on row-level security
for all of them, and writes the rule that decides who may edit.

### Bring an existing project up to date

The live project already has `craft_items` and `writings` (the
`portfolio_content_schema` migration).

**Quickest:** open **SQL Editor** → **New query**, paste the whole of
`supabase/pending.sql`, and press **Run**. It is the eight files below in one
script. If the dashboard warns about destructive operations, that is the
`drop policy if exists` lines, which only replace a policy of the same name —
confirm. The script ends by printing one row:

| projects | craft_described | media_bucket | media_policies |
|---|---|---|---|
| 10 | 10 | true | 4 |

If `media_bucket` is false or `media_policies` is below 4, the project would
not let the SQL editor manage storage; everything else still applied. Set the
bucket up by hand (see *"Bucket not found"* under Troubleshooting).

**Or** run the numbered files in `supabase/migrations/`, **in order**, each as
its own query:

| File | Adds |
|---|---|
| `0001_projects.sql` | the `projects` table (Home and Works) |
| `0002_interests.sql` | the `interests` table (About) |
| `0003_writings_rich.sql` | covers, list previews, quick-nav settings, reading time and SEO text on `writings` |
| `0004_craft_meta.sql` | description, tags, year, source link, aspect and order on `craft_items` |
| `0005_site_settings.sql` | the `site_settings` table (the studio's Settings tab) |
| `0006_media_bucket.sql` | the public `media` bucket and its owner-only write policies |
| `0007_seed_projects_and_craft.sql` | the nine projects and Konnectify, and the craft descriptions |
| `0008_saga_crafts.sql` | a `slug` on `craft_items`; swaps the original twelve crafts for the ten Saga pieces |

Every file is safe to run twice. Afterwards:

1. **Advisors** → run the security and performance advisors; both should be
   clean.
2. Check RLS from a terminal with the publishable key — reads succeed, writes
   are refused with `42501`:

   ```bash
   curl "$URL/rest/v1/projects?select=slug" -H "apikey: $ANON"
   curl -X POST "$URL/rest/v1/projects" -H "apikey: $ANON" \
     -H "content-type: application/json" -d '{"slug":"x","title":"x"}'
   ```

Until a file has run, the part of the site that needs it keeps using its
fallback, and the studio tab that needs it says which file to run.

> **The owner email is hard-coded.** `public.is_site_owner()` compares the
> signed-in address with `roshanmuhammed50@gmail.com`. If you ever change the
> address you sign in with, change it there too, or you will lock yourself out.

### Turn on email sign-in

The studio signs in with a one-time code emailed to the owner. There is no
password to steal, and unlike a link, a code can't be used up by a mail
scanner, voided by a newer email you didn't open, or opened on the wrong
device.

1. **Authentication** → **Sign In / Providers**: make sure **Email** is enabled
   and **Confirm email** is on.
2. **Authentication** → **Emails** → **Magic link**: put the code in the email.
   Subject `Your studio sign-in code`, and this body:

   ```html
   <h2>Your studio sign-in code</h2>
   <p style="font-size:28px;font-weight:600;letter-spacing:6px">{{ .Token }}</p>
   <p>Type it into the studio. It works once, within an hour, and only the
   newest code counts. If you didn't ask for it, ignore this email.</p>
   ```

3. **Authentication** → **Users** → **Add user** → **Create new user**: your
   email, any long password (nothing ever asks for it), and **Auto Confirm
   User** ticked. The studio never creates accounts, so this is the only way
   in.
4. **Authentication** → **Sign In / Providers**: turn off **Allow new users to
   sign up**.

### Copy the keys

**Project Settings** → **Data API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** (or publishable) key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The anon key is *meant* to be public — it ships in the browser bundle. What
protects your data is the row-level security you just ran, not the secrecy of
this key. Never put the **service_role** key in this project; it bypasses all of
those rules.

`next.config.ts` reads the project URL to allow the storage host for
`next/image`, so uploaded covers and screenshots are optimised with no extra
configuration.

---

## 2. Wire it up locally

Create `.env.local` in the project root (it is gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

OWNER_EMAIL=roshanmuhammed50@gmail.com
```

Then restart the dev server — Next.js reads env files at boot, so a running
server will not pick these up.

```bash
npm run dev
```

---

## 3. Use it

Go to `http://localhost:3000/studio`.

1. Enter your email, press **Email me a code**.
2. Type the code from your inbox and press **Sign in**.

| Tab | What you edit |
|---|---|
| **Projects** | Works on Home and /works: title, subtitle, tags, links, screenshot and its focal point, which Home row shape a work starts, whether it shows on Home and on Works, and the order (↑ ↓). |
| **Writings** | Posts in Markdown, with a **Preview** that uses the published renderer, snippet buttons for callouts, galleries, video, embeds and highlights, an image button that uploads and inserts a figure, the hero cover, the list preview (image or line illustration), the quick-nav list, and the SEO description. **Import .md** / **Export .md** read and write the same frontmatter format. |
| **Craft** | Board tiles: title, caption, description, tags, year, demo and source links, capture (its aspect ratio fills itself in), order, and a miniature of the repeating block. |
| **Interests** | The About desk: each favourite's category, object (card, book, ball, controller, polaroid, or your own `.glb`), what a tap does, texture or model, scale, credit and licence, and optionally where Reset puts it. |
| **Settings** | The values in `content/config.ts` — speeds, tilts, delays, falloffs, click behaviour. **Back to defaults** removes the override. |

Tick **Published** and press **Save**. Saving is always explicit, so a
half-finished edit never reaches the site on its own. Published changes appear
within a minute.

### Rules for the About desk

- Enter only real favourites; nothing ships as a placeholder.
- Club crests and film, anime or game artwork belong to their owners. Prefer a
  generic object (a ball, a controller) with the title as text, or use an image
  source whose terms you have checked, and fill in **Credit** and **Licence**.
  Anything with a credit is listed under the scene.
- If a licence mentions TMDB, the page adds TMDB's required notice.
- Keep textures at 1024px or less (WebP), and compress models first:
  `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt`.

### If someone else tries to sign in

The studio never creates accounts, and with sign-ups off nobody else can make
one, so a stranger's address gets no code at all. A session would not help them
anyway: every read of unpublished content comes back empty and every write, to
the tables or to the bucket, is rejected by the database. The email check lives
in Postgres, not in the page.

---

## 4. Deploying

Add the same variables in your host's dashboard. On Vercel: **Project** →
**Settings** → **Environment Variables**, for Production *and* Preview.

Nothing changes in Supabase: a code works on any address the site runs on.

---

## 5. Troubleshooting

**A studio tab says a table "is not there yet"** — run `supabase/pending.sql`
(everything at once), or the migration it names from `supabase/migrations/`.

**"Bucket not found" when uploading** — run
`supabase/migrations/0006_media_bucket.sql`. If the SQL editor answers
`must be owner of table objects`, do it in the dashboard instead: **Storage** →
**New bucket**, name it `media`, tick **Public bucket**; then under
**Storage** → **Policies**, add the four policies from that file to `media`.

**"new row violates row-level security policy" when uploading** — you are
signed in with an address other than the one in `public.is_site_owner()`.

**Covers or previews do not show on the site** — the post is missing migration
0003, or the image URL is `http://` (only `https://` and site-relative images
are allowed in posts).

**The sign-in email has a link but no code** — the **Magic link** template is
still Supabase's default. See step 2 of *Turn on email sign-in*.

**"Email link is invalid or has expired"** — the link was used already, is over
an hour old, or a newer email replaced it (some mail scanners open links before
you do). Switch the email to a code, as above, and use the newest email.

**"Your account was never confirmed"** when asking for a code — the owner
account exists but never finished signing up, and sign-ups are off. Run this
in the SQL editor, then ask for a new code:

```sql
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'roshanmuhammed50@gmail.com';
```

**"Only the site owner's address can sign in here"** — that address has no
account. Create it (step 3 of *Turn on email sign-in*).

**Changes save but the public page does not change** — the row is not
published, or you are inside the 60-second revalidation window.

**A settings change has no effect** — the value was outside the range
`lib/settings.ts` accepts; the site ignores it and keeps the default.

---

## 6. Optional: Filebase

`/api/uploads` can still presign uploads to a Filebase bucket. It is not used by
the studio, and it answers `501` until all four variables are set:

```bash
FILEBASE_ACCESS_KEY=XXXXXXXXXXXXXXXX
FILEBASE_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FILEBASE_BUCKET=roshan-portfolio
FILEBASE_PUBLIC_URL=https://xxxxxxxx.myfilebase.com
```

These are server-side only — never give them a `NEXT_PUBLIC_` prefix. The bucket
must have public access turned on, and the route only accepts callers whose
Supabase session belongs to `OWNER_EMAIL`.
