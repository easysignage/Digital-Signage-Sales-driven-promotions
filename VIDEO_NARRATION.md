# Narration script: Sales-driven promotions training session

Read the plain text out loud. Lines in **[brackets]** are what you do on screen while you speak; don't read them.
Take a short pause at each `—— pause ——`. Each part can be recorded as its own take.

---

## Part 1: Introduction

**[Title slide]**

Hi, and welcome to this EasySignage training session.

In this video we will show you how to run your digital signage promotions from live sales data. When sales drop, a promotion starts playing on your screens to help bring them back up. When sales pick up again, the promotion comes off every screen automatically. Nobody has to log in to the CMS to switch anything.

We will build this together, step by step, using the EasySignage Open API and our official SDK.

Here is what we will cover. First, we will explain the idea and how it works. Then we will create an API key, download the project and configure it. Next, we will tag our screens, upload the demo content, and run the app against real screens. After that, we will look at the code, so you understand exactly what happens behind each click. Then we will connect it to a real data source. And finally, we will break it on purpose, so you know how to fix the most common problems when a customer calls you.

Everything we use today is in a public GitHub repository. You will find the link in the description below.

Let's get started.

—— pause ——

## Part 2: Why this matters

**[Show the player with the promo playing]**

Think about a typical store. A promotion is scheduled to run all day. But in the morning sales are already strong, and the promotion isn't needed. In the afternoon sales slow down, and that's exactly when the promotion would help, but nobody has time to go into the CMS and change it.

What we want is for the screens to react by themselves. When sales are slow, the promotion goes on. When sales are strong, it goes off, so you're not giving away a discount you don't need. The business data decides, and the screens follow.

Sales is the example in this video, but at the end we will see that the same idea works for weather, stock levels, footfall, queue length, or the time of day.

—— pause ——

## Part 3: How it works

**[Show the "How it works" diagram from the README]**

Let's look at how it works.

EasySignage is the backend. It stores the content and runs the screens. Our own small app only decides what should play, and it tells EasySignage through the Open API.

The whole thing is built on two tags.

**[Point at the media side of the diagram]**

The first tag is called "promo". We put it on the media items that make up the promotion: the images or videos. With one single API call, enable by tag, every media item with the tag "promo" is switched on. And with disable by tag, they are all switched off. It doesn't matter if that's two items or two hundred.

**[Point at the screens side]**

The second tag is called "automation". We put it on the screens that should follow the rule. After we change the media, we call publish by tag, and every screen with the tag "automation" receives the update.

Now, this is the most important thing to remember from this video: enabling or disabling media changes your library, but nothing changes on the screen until you publish. So every change is always two calls. First, switch the media. Second, publish.

**[Show the "What it does" table]**

The rule itself is simple. We have a threshold, which is one hundred by default. If sales drop below one hundred, the promo turns on. If sales go back above one hundred, the promo turns off. If sales are exactly one hundred, or if the promo is already in the right state, the app does nothing and makes no API calls at all.

The regular content in the playlist doesn't have the promo tag, so it keeps playing all the time. Your screen is never empty.

—— pause ——

## Part 4: What you need

**[Show the Requirements section of the README]**

Before we start, you need four things.

One: Node.js version 20.12 or newer installed on your computer.

Two: an EasySignage account on a Premium or Enterprise plan. API keys and publishing by tag are part of those plans.

Three: an API key, which we will create in a moment.

And four: at least one screen registered in your account. A browser player works perfectly for testing, and that's what we are using today.

**[Terminal: type `node -v`]**

Let's check our Node version. We type node, dash v. We are on a supported version, so we're ready.

—— pause ——

## Part 5: Create the API key

**[CMS → Settings → API Keys]**

Now let's create the API key. In the CMS, we go to Settings, then API Keys, and we click to create a new key.

**[Type a name]**

We give it a name we will recognise later, for example "Sales promo demo".

**[Tick media, playlists, displays]**

For permissions, this app needs exactly three. Media, because we enable and disable media. Playlists, because the setup script creates a playlist. And displays, because we publish to the screens. Always give a key only the permissions it really needs.

**[Pause the recording or blur this part]**

The key is shown only once, so we copy it straight away. If you lose it, you will need to create a new one.

One more thing: API keys don't expire. Treat your key like a password. Never put it in code, in screenshots, or in a support ticket.

—— pause ——

## Part 6: Download and configure the project

**[Terminal]**

Now let's get the code. We clone the repository from GitHub…

**[Type: `git clone https://github.com/easysignage/Digital-Signage-Sales-driven-promotions.git`]**

…we go into the folder…

**[Type: `cd Digital-Signage-Sales-driven-promotions`]**

…and we install the dependencies with npm install.

**[Type: `npm install`]**

There are only two: the EasySignage SDK, and Express, which runs the small web page we will use to control the demo.

**[Open the folder in the editor]**

Let's take a quick look at the project. The "src" folder is the app itself. "public" is the web page. "scripts" has two helpers, setup and reset. "samples" has three demo images. And "test" has the unit tests.

**[Terminal: `cp .env.example .env`]**

The settings live in a file called dot env. We copy the example file to create it.

**[Open `.env.example` in the editor]**

Let's go through the settings. The first one is the API key. The second, the base URL, is only for white-label accounts that have their own API address, so most of you will leave it empty. Then the promo tag, which is "promo". The screen tag, which is "automation". The threshold, one hundred. And the port where the web page runs, three thousand.

**[Pause or blur: open `.env`, paste the key, save]**

We paste our API key into the dot env file and save it.

This file is ignored by Git, so it will never be uploaded by mistake. That's on purpose. Your key stays on your machine.

—— pause ——

## Part 7: Tag the screens

**[CMS → Screens]**

Now we tell EasySignage which screens should follow the rule.

**[Open a screen, add the tag `automation`, save. Repeat for the second screen]**

In the CMS, we open the screen and add the tag "automation". We will do this on two screens, so you can see later that one publish updates both of them at the same time.

If you prefer a different tag name, just change the screen tag setting in the dot env file.

—— pause ——

## Part 8: Upload the demo content

**[Terminal: `npm run setup`]**

Next, we upload the demo content. We run npm run setup.

You can run this as many times as you want. It reuses anything that already exists.

**[Point at the output, line by line]**

Let's read what it did.

First, it looked for a playlist called "Sales demo". There wasn't one, so it created it.

Then it uploaded the three images from the samples folder. Look here: the two images that start with "promo" were tagged "promo". The welcome image was not tagged, so it will always stay on screen.

Finally, it assigned the playlist to every screen tagged "automation", and published them.

**[CMS: open the "Sales demo" playlist]**

Let's check the result in the CMS. Here is our new playlist, with three items. Two of them have the promo tag. And our two screens are now playing this playlist.

If your customer already has their own promotion content, you can skip this step. Just add the "promo" tag to their promotional media, and make sure their screens play a playlist that contains it.

**[Terminal: `npm run reset`]**

One last step before we run the app. We run npm run reset. This turns the promo off and publishes, so we always start from the same place.

**[Show the player]**

And if we look at the player, only the welcome image is showing now. Perfect.

—— pause ——

## Part 9: Run the demo

**[Terminal: `npm run dev`, then open http://localhost:3000. Split screen: demo page left, player right]**

Now let's run the app. We type npm run dev, and open localhost, port three thousand, in the browser.

On the left you see the demo page, and on the right, our real screen.

**[Move the cursor over each area]**

Let's walk through the page. At the top is the current sales figure, the threshold, and a small chart of the latest values. Below that are the controls: Sales drop, Sales pick up, a box where we can type an exact number, Auto mode, and Reset.

This badge shows whether the promo is on or off. And on the right is the API log. This is the best part for learning. Every call the app makes to EasySignage appears here: the SDK method, the HTTP request behind it, the response, and how long it took.

—— pause ——

**[Click "Sales drop"]**

Let's say it's a slow afternoon and sales drop. We click here, and sales go down to sixty. That's below our threshold of one hundred.

**[Point at the log]**

Look at the log. It says: sales sixty is below one hundred, turning promo on. And then we see the two calls. First, media enable by tag "promo".

**[Point at the response line under the call]**

Under the call we can see the request that was sent, and the response: how many media items matched the tag, and how many were updated.

Then the second call: displays publish by tag "automation".

**[Wait for the player to change]**

And there it is. The screen is now showing the promotion. The small delay is just the player downloading the update. It usually takes a few seconds.

—— pause ——

**[Click "Sales pick up"]**

Now the promotion works and sales pick up to one hundred and forty. That's above the threshold, so we don't need the promotion anymore. The app calls disable by tag, publishes again…

**[Wait for the player]**

…and the promotion comes off the screen. The welcome image stays.

That's the complete loop.

—— pause ——

**[Type 50, click "Set sales"]**

Now watch this carefully, because it's important. We type fifty. That's below the threshold, so the promo turns on. Two calls.

**[Type 40, click "Set sales"]**

Now forty. Look at the log: "no change, promo is already on". No API calls at all.

**[Type 100, click "Set sales"]**

And exactly one hundred: again, no change.

Why does this matter? Because in real life you might send new sales numbers every few seconds. The app only talks to EasySignage when something actually needs to change. So it will never flood the API.

—— pause ——

**[Turn Auto on, let it cross the threshold at least twice]**

Now let's turn on Auto mode. This simulates a live sales feed. Every four seconds, the sales number moves up or down.

Every time it crosses the threshold, the screens follow. And every time it stays on the same side, nothing is sent.

**[Turn Auto off, click "Reset"]**

We turn Auto off, and click Reset. Reset turns the promo off, publishes, and puts sales back at one hundred. It's useful between demos.

**[Show the terminal]**

And by the way, the same log is printed in the terminal. So if you run this on a server without a browser, you can still see every call.

—— pause ——

## Part 10: The code

**[Editor]**

Now let's look at the code, so you understand what happens behind each click. The whole app is around three hundred lines. We will follow the same path a sales number takes.

**[Open `src/config.ts`]**

We start with config. This reads the dot env file when the app starts. If the API key is missing, or the threshold isn't a number, the app stops straight away with a clear message. That's much better than starting fine and failing later with a confusing error.

**[Open `src/rule.ts`]**

Next, the rule. This is the decision on its own, with no API code in it. We give it the sales, the threshold, and whether the promo is on right now. It answers "enable", "disable", or nothing.

Notice that the promo state can also be unknown, for example when the app has just started. In that case, the rule always acts, so the screens are always put in the right state.

Because the rule is separate, we can test it without an account.

**[Terminal: `npm test`]**

We run npm test. Four tests: above the threshold, below it, already in the right state, and exactly at the threshold. All passing.

**[Open `src/promo.ts`]**

This file is the heart of the app. There are three things we want you to notice.

**[Scroll to `enqueue`]**

First, the queue. Every change goes through this queue, and the jobs run one at a time. So even if someone clicks very fast, an enable and a disable can never get mixed up or arrive in the wrong order.

**[Scroll to `evaluate`]**

Second, evaluate. When a job runs, it reads the latest sales value again, because newer numbers might have arrived while it was waiting.

**[Scroll to `apply`]**

Third, apply. Here are our two calls: enable or disable by tag, then publish by tag. If no media has the promo tag, it warns us. And if anything fails, the promo state goes back to unknown, so the app will try again with the next number.

**[Scroll to `describePublish`]**

When we publish, EasySignage can answer with a few specific codes. "Publish no players" means no screen has the tag. "Some players update error" means some screens could not be updated, usually because they are offline. And "feature not enabled" means the plan doesn't include publishing by tag. The app turns each of these into a clear message in the log.

**[Show the README code snippet]**

Now, the other files add logging and the web page, which help with training. But in your own project, this is really all you need: create the client, enable or disable by tag, then publish by tag. That's the whole integration.

**[Open `src/server.ts`, point at `127.0.0.1`]**

One last detail. The local server only listens on this computer. Nothing on your network can reach it, and the browser never sees your API key.

—— pause ——

## Part 11: Connecting real data

**[Open a second terminal tab]**

So far, the sales numbers came from buttons and from Auto mode. In a real store, they come from your sales system. Let's pretend this second terminal is the store's point-of-sale system.

**[Type: `curl -X POST http://localhost:3000/api/sales -H "Content-Type: application/json" -d '{"value":70}'`]**

We send the number seventy to the app from outside.

**[Show the demo page and player]**

Sales are low, so the promo turns on. We didn't click anything.

**[Send the same command with `{"value":130}`]**

Now we send one hundred and thirty… sales are good again, and the promo turns off.

**[Show the "Connecting real data" section of the README]**

For a real setup, there are two common ways to do this. The first is a webhook: your POS or e-commerce platform sends the sales total to the app whenever it changes. The second is polling: the app checks a reporting system every minute or so. Checking often is fine, because remember, it only calls EasySignage when the promo needs to change.

One important note. This demo only runs on your own computer. If a system on the internet needs to send it data, host it properly, with authentication. Don't just open the port.

And as we said at the beginning, this works for any signal. Show cold drinks when it's hot outside. Hide a promotion when the product is out of stock. Change content based on footfall, queue length, or the time of day. You just need a tag for the content, a tag for the screens, and a rule.

—— pause ——

## Part 12: Troubleshooting

**[Editor with `.env`. Keep the API key line out of frame]**

Now let's break things on purpose, so you recognise the problems when a customer calls.

**[Change `SCREEN_TAG=automation` to `SCREEN_TAG=lobby`. Stop the app with Ctrl+C, run `npm run dev` again. Click "Sales drop"]**

First, we change the screen tag to "lobby", a tag that no screen has. When you change the dot env file, you need to restart the app. Now sales drop.

**[Point at the log]**

The enable worked, but the publish answered "publish no players". The log tells us clearly: no screens are tagged "lobby". The fix is to add the tag to a screen in the CMS, or to correct the setting.

**[Change it back to `automation`, restart]**

We put it back.

**[Change `PROMO_TAG=promo` to `PROMO_TAG=summer`, restart, click "Sales drop"]**

Second, we change the promo tag to "summer". Sales drop, and the enable call matched zero items. The log warns us: no media is tagged "summer". The screens won't change. The fix: add the tag to your promo media, or run setup.

**[Change it back, restart]**

And we put that back too.

**[Show the Troubleshooting table in the README]**

Here are the other problems you might see.

"Feature not enabled" means the account's plan doesn't include publishing by tag. The customer needs a Premium or Enterprise plan.

A 403 error on every call means the key is wrong, deleted, missing a permission, or the plan has no API access. Check the key under Settings, API Keys.

If the promo is enabled but doesn't show on the screen, the screen probably isn't playing a playlist that contains the promo media. Run setup, or add the media to the screen's playlist.

And if the app says the API key is not set, the dot env file is missing or empty.

In almost every case, the API log tells you exactly which call failed and why. Always start there.

—— pause ——

## Part 13: Keeping your key safe

**[Show the "Keeping your API key safe" section]**

Before we finish, a few rules about the API key.

The key gives full access to your account's data, and it doesn't expire. Treat it like a password.

Keep it only in the dot env file. Never in your code, never in screenshots, never in an email or a ticket.

Give it only the permissions it needs.

And if a key ever leaks, delete it straight away under Settings, API Keys, and create a new one.

—— pause ——

## Part 14: Recap and close

**[Recap slide]**

Let's recap what we covered today.

We put a "promo" tag on the promotion content, and an "automation" tag on the screens.

Every change is two calls: enable or disable the media by tag, then publish to the screens by tag.

The app only calls the API when something needs to change, and it runs the calls one at a time.

The API log shows every call, and explains every error.

And to go live, you feed it real numbers, with a webhook or by polling.

**[Exercises slide]**

If you want to practise, here are a few exercises.

One: change the threshold to five hundred, and work out what the Sales drop and Sales pick up buttons will send now.

Two: add your own promotion image in the CMS, tag it "promo", and check that it switches on and off with the others.

Three: tag one more screen with "automation", and confirm all of them update together.

Four: send a value of exactly one hundred with curl, and explain why nothing happens.

And a bonus for developers: change the rule so the promo turns on below eighty, and only turns off above one hundred and twenty. That way it won't keep switching when sales hover around one hundred. Then add a test for it.

**[End slide with links]**

You will find the code, the blog post, and the help article on creating API keys in the description below.

Thank you for watching, and see you in the next training session.
