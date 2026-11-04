# Training session script: Sales-driven promotions with the EasySignage Open API

**Format:** recorded training session, screen share with voiceover
**Length:** about 40–45 minutes, in 10 modules (record each module as its own take)
**Audience:** EasySignage resellers, integrators, support staff and developers
**Level:** comfortable with a terminal; no TypeScript knowledge needed for modules 1–6

## Learning objectives

By the end of the session, viewers can:

1. Explain how tag-based enable/disable and tag-based publishing let code control what plays.
2. Create an API key with the right permissions and configure the demo.
3. Seed demo content and run the app against a real screen.
4. Read the API log and say which SDK call and HTTP route ran, and why.
5. Walk through the code: config, rule, queue, publish, error handling.
6. Drive the promo from an outside system (webhook or poll) instead of the simulator.
7. Diagnose the common failures: missing tags, plan limits, bad keys.
8. Keep the API key safe.

## Session outline

| # | Module | Time | Hands-on? |
| --- | --- | --- | --- |
| 1 | Welcome and the use case | 3 min | |
| 2 | How it works: tags, enable/disable, publish | 5 min | |
| 3 | Prerequisites and the API key | 5 min | Yes |
| 4 | Install and configure the project | 4 min | Yes |
| 5 | Tag screens and seed content | 5 min | Yes |
| 6 | Run the demo and read the API log | 7 min | Yes |
| 7 | Code walkthrough | 8 min | |
| 8 | Connecting real data | 4 min | Yes |
| 9 | Troubleshooting (break it on purpose) | 5 min | Yes |
| 10 | Security, recap and exercises | 3 min | |

---

## Before you record

### Account and screens

- An EasySignage account on a **Premium or Enterprise** plan, signed in at app.easysignage.com.
- At least one browser player registered. Ideally two, so you can show that publishing by tag updates several screens at once.
- **Do not** tag the screens with `automation` yet. You will do that on camera in Module 5.
- Remove any old "Sales demo" playlist and sample media if you want Module 5 to start from a clean account.

### Machine

- Node.js 20.12 or newer (`node -v`).
- A fresh folder for the clone, so Module 4 starts from nothing. Keep your working copy elsewhere as a backup.
- Terminal font at 16–18 pt, browser and editor zoomed to 125–150%.
- Notifications off, bookmarks bar hidden, no tabs showing customer data.

### Windows to have open

1. Terminal in the empty folder.
2. Browser tab: CMS, signed in.
3. Browser tab or second window: the browser player.
4. Code editor (opened in Module 4).

### The API key on camera

You will create a key in Module 3 and paste it into `.env` in Module 4. Either:

- **pause the recording** while the key is on screen, or
- record it and **blur those frames** in editing, then **delete that key after recording** and use a new one.

Never show the real key unblurred, even briefly.

---

## Module 1: Welcome and the use case (≈3 min)

**On screen:** Title slide, then the blog post page, then the player showing the promo.

**Say:**
> Welcome. In this session we're going to build and run a small app that decides what plays on your screens based on live business data. Our example is sales: when sales fall below a target, a promotion plays to help lift them; when they pick up again, the promotion comes off every screen. Nobody opens the CMS to do it.
>
> Why does this matter? Store teams don't have time to log in and switch content every time something changes. And promotions that run when they shouldn't, or don't run when they should, cost money. Connecting signage to real data fixes both.
>
> By the end you'll be able to set this up for a customer, explain how it works, connect it to a real data source, and fix the usual problems. Everything we use is in a public GitHub repository, and the link is in the description.
>
> Here's the plan: first the idea, then setup step by step, then we run it, look at the code, connect real data, and finally break it on purpose so you know how to fix it.

---

## Module 2: How it works (≈5 min)

**On screen:** The README's "How it works" diagram, then the "What it does" table.

**Say:**
> EasySignage is the backend here. It stores the content and runs the screens. Our own code only decides *what* should play. It talks to EasySignage through the Open API, using the official SDK, `@easysignage/sdk`.
>
> The whole design rests on two tags.
>
> The first tag, `promo`, goes on media items: the images or videos that make up the promotion. With one API call, `media.enableByTag("promo")`, every media item with that tag is switched on. `disableByTag` switches them all off. It doesn't matter whether that's two items or two hundred.
>
> The second tag, `automation`, goes on screens. After we change the media, we call `displays.publishByTag("automation")`, and every screen with that tag gets the update.
>
> **This is the key point:** enabling or disabling media changes the library, but nothing changes on a screen until you publish. So every change is always two calls: switch the media, then publish.

**On screen:** Point at each row of the table.

> The rule itself: there's a threshold, 100 by default. Below 100, turn the promo on. Above 100, turn it off. Exactly 100, or if the promo is already in the right state, do nothing and make no API calls.
>
> The regular content in the playlist isn't tagged, so it keeps playing either way. The screen is never blank.

---

## Module 3: Prerequisites and the API key (≈5 min)

**On screen:** README "Requirements" section, then the CMS.

**Say:**
> Before we start, you need four things. Node.js 20.12 or newer. An EasySignage account on a Premium or Enterprise plan, because API keys and tag-based publishing are part of those plans. An API key. And at least one screen. A browser player is perfectly fine for testing, and that's what I'm using.

**Do:** In the terminal, run:

```bash
node -v
```

> I'm on a supported version, so we're good.

**Do:** In the CMS, go to **Settings → API Keys** and create a key. Give it a clear name, for example "Sales promo demo". Tick **media**, **playlists** and **displays**.

**Say:**
> Now the API key. In the CMS, go to Settings, then API Keys, and create a new key. Give it a name you'll recognise later. For permissions, this app needs exactly three: media, because we enable and disable media; playlists, because the setup script creates one; and displays, because we publish. Give it only what it needs.
>
> *(pause or blur here)*
>
> The key is shown only once. Copy it now. If you lose it, you'll have to create a new one. Also note: keys don't expire. Treat it like a password.

---

## Module 4: Install and configure the project (≈4 min)

**On screen:** Terminal, then the editor.

**Do:**

```bash
git clone https://github.com/easysignage/Digital-Signage-Sales-driven-promotions.git
cd Digital-Signage-Sales-driven-promotions
npm install
```

**Say:**
> Clone the repository, go into the folder and install the dependencies. There are only two runtime dependencies: the EasySignage SDK and Express for the small local web page.

**Do:** Open the folder in the editor and show the folder tree briefly.

> Quick tour: `src` is the app, `public` is the web page, `scripts` holds setup and reset, `samples` holds three demo images, and `test` has unit tests for the rule.

**Do:**

```bash
cp .env.example .env
```

Open `.env.example` in the editor (not `.env` yet) and go through each line.

**Say:**
> Configuration lives in a `.env` file. Copy the example. Let's look at what's in it.
>
> `EASYSIGNAGE_API_KEY` is the key we just created. `EASYSIGNAGE_BASE_URL` is only for white-label accounts that use their own API host; most of you will leave it alone. `PROMO_TAG` is the media tag, `SCREEN_TAG` is the screen tag, `THRESHOLD` is the sales target, and `PORT` is where the local web page runs.

**Do:** *(pause or blur)* Open `.env`, paste the key, save, close the file.

> Paste the key into `.env` and save. This file is in `.gitignore`, so it will never be committed. That's deliberate: the key should never go into source code, screenshots or support tickets.

---

## Module 5: Tag screens and seed content (≈5 min)

**On screen:** CMS → Screens.

**Do:** Add the tag `automation` to one or two screens.

**Say:**
> Next, tell EasySignage which screens follow the rule. In the CMS, open each screen and add the tag `automation`. I'll do two, so you'll see both update together later. If you want a different tag, change `SCREEN_TAG` in `.env`. Tags are stored in lower case, and the app lower-cases them for you.

**Do:**

```bash
npm run setup
```

**Say:**
> Now we seed the demo content with `npm run setup`. It's safe to run more than once; it reuses whatever already exists. Let's read what it did.

**Do:** Point at the output line by line.

> First it looked for a playlist called "Sales demo" and created it because there wasn't one. Then it uploaded the three images from the `samples` folder. Notice the two `promo-` images were tagged `promo`, and the welcome image wasn't. Finally it assigned the playlist to every screen tagged `automation`, with `pushContentByTag`, and published them.

**Do:** Switch to the CMS. Open the "Sales demo" playlist, show the three items and the `promo` tag on two of them. Show the screen now has the playlist.

> Here's the result in the CMS. Three items, two tagged promo. And our screens are now playing this playlist.
>
> If a customer already has their own promotional content, skip this step. Just add the `promo` tag to their promo media and make sure the screens play a playlist that contains it.

**Do:**

```bash
npm run reset
```

> Last step before running: `npm run reset`. It turns the promo off and publishes, so we start from a known state. Look at the player: only the welcome image now.

---

## Module 6: Run the demo and read the API log (≈7 min)

**On screen:** Terminal, then split screen: demo page left, player right.

**Do:**

```bash
npm run dev
```

Open http://localhost:3000.

**Say:**
> Start the app with `npm run dev` and open localhost port 3000. Let me walk you around the page.
>
> At the top, the current sales figure, the threshold, and a small chart of recent values. Below that, the controls: Sales drop, Sales pick up, a box to type an exact value, Auto mode, and Reset. Then the promo badge, which shows on or off, and the tags in use. And on the right, the API log. This is the most useful part for learning: every call the app makes appears here with the SDK method, the HTTP route behind it, the response and how long it took.

### 6a. Turn the promo on

**Do:** Click **▼ Sales drop**. Wait for the player to change.

> Sales drop. That sets sales to 60% of the threshold, so 60. The log says: sales 60 is below 100, turning promo on. Then two calls. First `media.enableByTag("promo")`. Under it you can see the HTTP route and the response, including how many media items matched and how many were updated. Then `displays.publishByTag("automation")`.
>
> *(wait)*
>
> And the screens switch to the promotion. The delay is the player fetching the update; it's usually a few seconds and depends on the player and its connection.

### 6b. Turn the promo off

**Do:** Click **▲ Sales pick up**.

> Sales pick up to 140. Above the threshold, so the promo isn't needed: `disableByTag`, then publish. The promo comes off and the welcome image stays.

### 6c. No change, no calls

**Do:** Type `50`, **Set sales**. Then `40`, **Set sales**. Then `100`, **Set sales**.

> Now watch carefully. 50: promo turns on, two calls. 40: the log says "no change, promo is already on". No API calls. And 100, exactly at the threshold: also no change.
>
> This matters a lot in production. You can feed this app new numbers every few seconds, and it only calls the API when something actually needs to change.

### 6d. Auto mode

**Do:** Turn **Auto** on. Let it cross the threshold at least twice. Turn it off.

> Auto mode simulates a live data feed. Every four seconds sales move up or down in a wave around the threshold. Each time they cross it, the screens follow. Each time they stay on the same side, nothing is sent.

### 6e. Reset

**Do:** Click **Reset**.

> Reset turns the promo off, publishes, and puts sales back at the threshold. Handy between demos.

### 6f. The terminal

**Do:** Switch to the terminal running `npm run dev`.

> The same log is printed in the terminal, so if you run this on a server without a browser, you still see every call.

---

## Module 7: Code walkthrough (≈8 min)

**On screen:** Editor. Open each file as you talk about it.

**Say (intro):**
> Now let's see how it's built. The app is small on purpose: about three hundred lines. I'll go through it in the order a request flows.

### `src/config.ts`

> Settings load from `.env` at startup. If the API key is missing, or the threshold isn't a number, the app stops immediately with a clear message. That's much better than starting fine and failing later with a confusing API error. Tags are lower-cased here because the API stores them that way.

### `src/rule.ts`

> This is the decision on its own, with no API code at all. Given the sales, the threshold and the current promo state, it returns "enable", "disable" or nothing. Notice the state can be `null`, meaning unknown, at startup or after a failure. When it's unknown, the rule always acts, so the screens get corrected.
>
> Keeping the rule separate means we can test it without an account.

**Do:**

```bash
npm test
```

> Four tests, all pass: above, below, already in the right state, and exactly at the threshold.

### `src/promo.ts`

> This is the heart of the app. Three things to notice.
>
> **One: the queue.** Every change goes through `enqueue`, which runs jobs one at a time. If someone clicks drop and pick up quickly, the enable and disable can never run out of order or overlap.
>
> **Two: `evaluate`** re-reads the state inside the queue. By the time a job runs, newer values may have arrived, so it always decides on the latest.
>
> **Three: `apply`** is the two calls we've been talking about. Enable or disable by tag, then publish by tag. If the enable call reports zero matched items, it warns you that nothing carries the promo tag. If anything fails, the state goes back to unknown, so the next value will try again.

**Do:** Scroll to `describePublish`.

> Publishing can come back with specific codes: `publish_no_players` means no screen has the tag, `some_players_update_error` means some screens couldn't be updated, and `feature_not_enabled` means the plan doesn't include tag publishing. Each one becomes a plain-language message in the log.

### `src/easysignage.ts`

> This creates the SDK client. It also wraps every call so the log can show the real HTTP routes. That's a training aid. In your own project, all you need is:

**On screen:** The README snippet:

```ts
import { EasySignage } from "@easysignage/sdk";
const client = new EasySignage(); // reads EASYSIGNAGE_API_KEY
await client.media.enableByTag("promo");
await client.displays.publishByTag("automation");
```

> That's genuinely the whole integration.

### `src/server.ts` and `src/simulator.ts`

> The server is a small Express app that serves the page and a few local endpoints. It listens on `127.0.0.1` only, so nothing on your network can reach it, and the browser never sees the API key. The simulator is just a timer that changes sales every four seconds.

---

## Module 8: Connecting real data (≈4 min)

**On screen:** Terminal (second tab), then the editor, then the demo page.

**Say:**
> The simulator stands in for real data. In a real store you'd replace it with a sales system. The good news is the app already has an endpoint we can call from outside. Let's pretend this terminal is the POS system.

**Do:** With the app running, in a second terminal:

```bash
curl -X POST http://localhost:3000/api/sales -H "Content-Type: application/json" -d '{"value":70}'
```

Then:

```bash
curl -X POST http://localhost:3000/api/sales -H "Content-Type: application/json" -d '{"value":130}'
```

> I sent 70 from outside the app, and the promo turned on. Then 130, and it turned off. No clicking.

**On screen:** README "Connecting real data" snippet.

> For a real integration, you call `setSales()` with the real number. Two common ways. A webhook: your POS or e-commerce platform posts the sales total to an endpoint like this one. Or polling: a timer that reads a reporting API every minute. Polling often is fine, because the rule only calls EasySignage when the state changes.
>
> One note: this demo listens only on localhost. If a POS system on the internet needs to reach it, put it behind proper hosting with authentication. Don't just open the port.
>
> And the same pattern works for any signal. Weather: show cold drinks when it's hot. Stock levels: hide a promo when the product runs out. Footfall, queue length, time of day. A tag for the content, a tag for the screens, and a rule.

---

## Module 9: Troubleshooting, break it on purpose (≈5 min)

**On screen:** Editor with `.env`, terminal, demo page. Keep the API key line out of frame, or scroll so only the lines you change are visible.

**Say:**
> Now let's break things deliberately, so you recognise the errors when a customer hits them.

### 9a. No screens tagged

**Do:** In `.env`, change `SCREEN_TAG=automation` to `SCREEN_TAG=lobby`. Stop the app (Ctrl+C) and run `npm run dev` again. Click **▼ Sales drop**.

> I've changed the screen tag to one that no screen has. Changes to `.env` need a restart. Now sales drop… the enable works, but the publish answers `publish_no_players`, and the log says no screens are tagged "lobby". Fix: add the tag to a screen in the CMS, or correct `SCREEN_TAG`.

**Do:** Change it back to `automation` and restart.

### 9b. No media tagged

**Do:** Change `PROMO_TAG=promo` to `PROMO_TAG=summer`, restart, click **▼ Sales drop**.

> Now the media tag is wrong. The enable call succeeds but matched zero items, and the log warns that no media is tagged "summer". The screens won't change. Fix: tag the promo media in the CMS, or run setup.

**Do:** Change it back and restart.

### 9c. The rest, from the table

**On screen:** README "Troubleshooting" table.

> The other common ones:
>
> - **`feature_not_enabled`:** the plan doesn't include tag publishing. The account needs Premium or Enterprise.
> - **403 on every call:** the key is wrong, revoked, missing a permission, or the plan has no API access. Check the key under Settings, API Keys.
> - **Promo is enabled but doesn't appear:** the screen isn't playing a playlist that contains the promo media. Run setup, or add the media to the screen's playlist.
> - **"EASYSIGNAGE_API_KEY is not set":** `.env` is missing or empty.
>
> In almost every case, the API log tells you exactly which call failed and the code the API returned. Start there.

---

## Module 10: Security, recap and exercises (≈3 min)

**On screen:** README "Keeping your API key safe", then a recap slide.

**Say:**
> A few rules for the API key. It gives full access to the account's data and it doesn't expire, so treat it like a password. Keep it in `.env` only, never in code, screenshots or tickets. Give it only the permissions it needs. And if it ever leaks, delete it under Settings, API Keys, and create a new one.

**Recap slide:**

> Let's recap.
>
> - Tag the promo content, tag the screens.
> - Every change is two calls: enable or disable by tag, then publish by tag.
> - The app only calls the API when the state changes, and calls run one at a time.
> - The API log shows every call and the reason for every error.
> - To go live, feed it real numbers with a webhook or a poll.

**Exercises slide:**

> Some exercises to try on your own:
>
> 1. Change `THRESHOLD` to 500 and work out what Sales pick up and Sales drop now send.
> 2. Add your own promo image in the CMS, tag it `promo`, and check it switches with the others.
> 3. Tag a second screen with `automation` and confirm both update together.
> 4. Use `curl` to send a value exactly at the threshold, and explain why nothing happens.
> 5. Bonus, for developers: change the rule so the promo turns on below 80 and only turns off above 120, so it doesn't flicker when sales hover around 100. Add a test for it.

**Close:**
> All the code, the blog post and the API key help article are linked in the description. Thanks for joining, and see you in the next session.

---

## After recording

- Delete the API key you showed on camera (if any) and create a new one for future use.
- Run `npm run reset` so the promo is off.
- Remove the `automation` tag from the training screens if they're shared.
- Check the final edit frame by frame anywhere `.env` or the API Keys page appears.

## Video description

> Training session: run digital signage promotions from live sales data with the EasySignage Open API. We set up the demo from scratch, run it against real screens, walk through the code, connect real data and troubleshoot the common errors.
>
> 00:00 Welcome and the use case
> 03:00 How it works: tags, enable/disable, publish
> 08:00 Prerequisites and the API key
> 13:00 Install and configure
> 17:00 Tag screens and seed content
> 22:00 Run the demo and read the API log
> 29:00 Code walkthrough
> 37:00 Connecting real data
> 41:00 Troubleshooting
> 46:00 Security, recap and exercises
>
> Code: https://github.com/easysignage/Digital-Signage-Sales-driven-promotions
> Blog post: https://easysignage.com/blog/26/sales-driven-promotions-digital-signage/
> Open API overview: https://easysignage.com/blog/26/digital-signage-api-integration/
> Creating an API key: https://easysignage.com/help/account-settings/digital-signage-api-keys/
>
> *(Update the timestamps to match your final edit.)*
