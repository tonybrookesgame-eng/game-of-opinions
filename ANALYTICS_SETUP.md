# Turning on Analytics

The code is ready, but every page has a placeholder Measurement ID
(`G-XXXXXXXXXX`) until you do one thing in the Firebase Console.

## 1. Enable Google Analytics on the Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and open the `game-of-opinions` project.
2. Click the gear icon next to **Project Overview** → **Project settings**.
3. Open the **Integrations** tab.
4. Find **Google Analytics** and click **Enable** (or **Link**, if it's already partially set up). Follow the prompts — it'll ask you to create or pick a Google Analytics account, which is free.

## 2. Get the Measurement ID

1. Still in **Project settings**, go back to the **General** tab.
2. Scroll to **Your apps** and click on the web app.
3. In the SDK config snippet shown there, you'll now see a line like:
   ```
   measurementId: "G-ABC1234XYZ"
   ```
4. Copy that value (starts with `G-`).

## 3. Paste it into the code

Replace `G-XXXXXXXXXX` with your real ID in these 7 files — search for `measurementId` in each:

- `index.html`
- `signup.html`
- `myxi.html`
- `season.html`
- `league.html`
- `dashboard.html`
- `rules.html`

(In VS Code: Ctrl+Shift+F to search across all files for `G-XXXXXXXXXX`, replace all 7 at once.)

## 4. Where to see the data

Firebase Console → **Analytics** in the left sidebar (or go straight to Google Analytics at analytics.google.com and pick the linked property).

- **Realtime** report: confirms it's working the moment you visit the site yourself.
- **Reports → Engagement → Pages and screens**: page views and average time spent, per page — this answers "how many viewed the homepage and how long did they stay."
- **Reports → Engagement → Events**: shows `sign_up_started` and `sign_up` counts side by side — the gap between them is exactly "how many started signing up but didn't finish."
- **Explore → Funnel exploration**: build a proper funnel — `page_view` (homepage) → `sign_up_started` → `sign_up` — to see the drop-off percentage at each step.

Data usually takes 24–48 hours to show up in the standard reports the first time (Realtime shows up instantly, always).
