# Turning on push notifications

The code is ready, but it needs one real value from Firebase Console before
it'll actually work — the same kind of one-time step as `ANALYTICS_SETUP.md`.

## 1. Generate a Web Push key

1. Go to the [Firebase Console](https://console.firebase.google.com) → your `game-of-opinions` project.
2. Click the gear icon → **Project settings**.
3. Open the **Cloud Messaging** tab.
4. Scroll to **Web configuration** → **Web Push certificates**.
5. Click **Generate key pair**. You'll get a long string starting with something like `B...` — that's your VAPID key.

## 2. Paste it into the code

Open `index.html`, search for `VAPID_KEY`, and replace:

```js
const VAPID_KEY = "PASTE_YOUR_VAPID_KEY_HERE";
```

with your real key. That's the only file that needs it.

## 3. How people turn notifications on

There's nothing more for you to build — visitors do this themselves:

1. They open the **Install** popup (the icon in the header).
2. Under "Get gameweek reminders," they tap **Enable Notifications**.
3. Their browser asks for permission; once granted, they're registered.

Only people who've done this (and are using a supported browser — iOS Safari
notably doesn't support web push unless the site is installed to the home
screen first) will receive anything. There's no way to notify someone who's
never visited or never granted permission — that's a browser-level rule, not
something this app can work around.

You can see how many managers have opted in via **admin.html → Season Picks
& Notifications → Load Status** — it shows a live count alongside the season
picks summary.

## 4. How to actually send one — no code required

This is the part you asked about specifically: sending a notification is a
Firebase Console action, not something you run from code or admin.html.

1. Go to Firebase Console → your project → **Engage** section in the left
   sidebar → **Messaging** (sometimes labelled **Cloud Messaging**).
2. Click **New campaign** → **Notifications**.
3. Fill in a **Notification title** and **Notification text** — e.g.
   "Gameweek 3 picks lock in 2 hours!"
4. Click **Next**, and under **Target**, choose your web app (it'll be
   listed by name once at least one person has enabled notifications).
5. Leave scheduling as **Now** (or pick a future date/time to schedule it).
6. Click **Review** → **Publish**.

That's it — everyone currently subscribed gets it within seconds. Repeat
this any time you want to send an update (a deadline reminder, results are
in, season kickoff, etc.) — there's no limit on how often you can do this,
and it costs nothing.

**Cadence guideline:** don't over-send. Midday on the day before each
gameweek locks is the planned rhythm — one reminder per gameweek, not one
per fixture or every deadline nudge.

## Notes

- If you ever want notifications sent *automatically* (e.g. "2 hours before
  every kickoff" without you clicking anything) that requires a scheduled
  Cloud Function, which is a bigger step up — it needs the paid Blaze plan
  and a small server-side deploy. Worth doing later if you want automation,
  but not needed for manual "I want to announce something right now" sends.
- The token stored per-user in Firestore (`users/{uid}.fcmToken`) is only
  used for the admin.html subscriber count — Firebase Console's broadcast
  doesn't read it, so it's safe to ignore if it ever looks out of sync.
