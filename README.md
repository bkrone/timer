# First Due Fitness workout timer

A timer and workout-card app for the station. It runs from this repo on GitHub Pages at
**https://bkrone.github.io/timer/** and installs to a phone's home screen. Everything is
automatic: add a card, and the site updates, a push notification goes out, a thumbnail is
made, and the card gets a starter timer.

## Add a new workout card

1. **Name the file.** Use underscores between words, for example `Iron_Sunrise.jpg`.
   - The app turns the name into the label: `Iron_Sunrise.jpg` shows as "Iron Sunrise".
   - `_s_` becomes an apostrophe: `Hell_s_Bells.jpg` shows as "Hell's Bells".
   - Hyphens are kept when the name also has underscores: `Sit-ups_and_Shut-ups.jpg`.
   - JPG, PNG, WebP and GIF all work. Portrait pages around 1,200 to 2,000 pixels tall are plenty.
2. **Upload it.** On GitHub open the `cards` folder, choose **Add file > Upload files**,
   drop the image in, and click **Commit changes** (to `main`).
3. **Wait a minute or two.** This all happens by itself:
   - The site redeploys with the new card.
   - Everyone who enabled alerts gets a notification. Tapping it opens the new card.
   - A follow-up commit appears from "Card housekeeping" with a small thumbnail of the card and a
     starter line for it in `card-timers.json` (for time).
4. **Check the card's timer.** Open `card-timers.json`, find the card's line at the bottom of the file,
   and change it if "for time" isn't right (examples below). Click the pencil icon, edit, then
   **Commit changes**.
5. **Open the app** to check it. The card appears in the picker, and the Start button under the card
   uses its timer. If the app looks out of date, close it completely and reopen it while online.

**To remove a card,** delete the image from the `cards` folder. No notification is sent, and its
thumbnail is removed automatically. Its line in `card-timers.json` can stay or be deleted.

## Timers in `card-timers.json`

Each card has a line like `"murph": { "type": "fortime" }`. The key on the left is the card's file
name in lowercase with dashes (`Hell_s_Bells.jpg` becomes `hell-s-bells`).

JSON doesn't allow comments, so the examples sit at the top of the file under names that start with an
underscore (`_example-amrap` and so on). The app ignores those. Copy one, rename the key to your
card, and change the numbers.

| Workout style | Line to use |
|---|---|
| For time | `{ "type": "fortime" }` |
| For time with a cap | `{ "type": "fortime", "capMin": 20 }` |
| AMRAP (counts down) | `{ "type": "amrap", "minutes": 15 }` |
| EMOM, every minute | `{ "type": "emom", "totalMin": 30, "intervalMin": 1 }` |
| EMOM, every 2 minutes | `{ "type": "emom", "totalMin": 20, "intervalMin": 2 }` |
| Intervals (Tabata style) | `{ "type": "interval", "work": 20, "rest": 10, "rounds": 8 }` |
| Intervals, repeated in several rounds | `{ "type": "interval", "work": 20, "rest": 10, "rounds": 6, "sets": 5, "restBetweenSec": 90 }` |

The last row is for cards like The Smoke Show: 20 seconds on and 10 off through six exercises, done
for 5 rounds with a rest between. The app shows **Round 2 of 5** above the timer.

- **Rest between rounds is automatic.** When a round ends, a rest countdown starts and the next
  round begins by itself, with the usual 10-second get-ready at the end. There is no rest after the
  last round.
- **Pick the rest on the day.** A small selector above the buttons offers **1:00, 1:30, 2:00 or
  Manual**. It starts on the card's own setting, and you can change it mid-rest.
- **During a rest** the big button says **Skip rest** (and **Start now** once the 10-second get-ready
  begins), and the button on the right is **Pause** / **Resume**. **Reset** cancels the rest and
  leaves the next round ready to start.
- **Manual** means no countdown: after each round the big button says **Start round 3**, and you tap
  it when the group is ready.
- **Set a card's usual rest** with `restBetweenSec` (seconds), for example `"restBetweenSec": 90`.
  Use `0` for Manual. Without it, a card defaults to 90 seconds.
- The log counts only the work time and records the whole workout once, when all the rounds are
  done.

**A card with more than one timer.** Some workouts can be run more than one way (Tree Fiddy is a for-time
workout, but the station sometimes does it Tabata style). Give the card a list of options in square
brackets. The app shows one Start button per option on the home screen, and the first option is the
main one (it's the big button, and **Surprise me** uses it):

```json
"tree-fiddy": [
  { "type": "fortime" },
  { "type": "interval", "work": 20, "rest": 10, "rounds": 7, "sets": 5, "restBetweenSec": 90, "label": "Tabata style" }
]
```

Start buttons on the home screen all share the same plain style, whether a card has one timer or several.

The optional `"label"` names an option on its button (the button also shows the numbers underneath).
Without a label, the button just describes the timer. A card can have up to 4 options, and a card with
one timer keeps working exactly as before. New cards still get a single "for time" line automatically,
so turn it into a list when you want a second option.

Keep the commas between lines, and don't put a comma after the last line. If the file has a typo,
the automatic update stops and leaves it alone rather than overwriting it.

## Using the app

- **Pick a card** at the top of the home screen. If it has a timer, a **Start** button appears.
  **Surprise me** in the card picker chooses a random card and uses its own timer.
- **AMRAP, EMOM, Interval and For time** let you set a timer by hand. **Interval** can also repeat as
  several rounds (up to 10) with an automatic rest of 1:00, 1:30, 2:00 or Manual between them, just like
  the Tabata cards. **Plank** needs no setup: it
  goes straight to a ready screen for the 3-minute ladder (60 seconds on hands, 60 on elbows, 30 on
  hands, 30 on elbows) with one soft beep every 15 seconds. **View card** shows just the card, and you can pinch to zoom it, drag it around, and double-tap to zoom in or out.
- **Settings** (top right) opens the settings, with the app version just under them, and then the workout log.
  The log lists the workouts that were run on this device, with **Copy as CSV**. Each device keeps its own log.
- The settings on that screen control the **Enable new-card alerts** button at the bottom of the home
  screen. It is hidden automatically on devices that can't receive alerts (the TV, older iPads, an
  iPhone or iPad that hasn't been added to the Home Screen), and once alerts are on. On a device that
  can take alerts you can also switch the button off or on by hand.
  The same Settings section has a **Color** choice (Orange, Blue, Purple, Gold, Green, Pink or Silver, or **Custom**) that
  changes the accent color used for buttons, highlights and labels. Custom shows a **Hue** slider and a
  **Brightness** slider, and the button text switches between black and white so it stays readable. It is
  saved on that device only, so the TV and each phone can have their own.
- **New cards show up by themselves.** The app checks the `cards` folder when it opens, whenever the
  card picker opens, and when a device wakes up (at most once a minute). A card this device hasn't
  shown you yet gets a red number on the home screen's card bar and a red **NEW** tag in the picker.
  Both clear when you leave the picker. **Refresh** in the picker is still there if you want to check
  right now.
- The screen stays awake while a timer or card is showing.
- The app keeps the cards and itself on the device, so it still works if the Wi-Fi drops.

## What's in this repo

| File | What it does |
|---|---|
| `index.html` | The app itself |
| `card-timers.json` | Which timer each card uses |
| `cards/` | The workout card images (`cards/thumbs/` is made automatically) |
| `OneSignalSDKWorker.js` | Push notifications and the offline copy of the app |
| `manifest.json` and `icons/` | Home-screen app name and icons |
| `.github/workflows/notify-new-card.yml` | Sends the "new card" notification |
| `.github/workflows/make-card-thumbnails.yml` | "Card housekeeping": thumbnails and starter timers |

## If something looks wrong

- **No notification after adding a card.** Open the **Actions** tab, click the latest "Notify new
  workout card" run, and read the "Send OneSignal push notification" step. It shows exactly what
  OneSignal said. Only newly added cards notify (deleting or editing a card doesn't). Also confirm the
  phone appears as Subscribed under Audience > Subscriptions in OneSignal. If someone deleted and
  re-added the app to their home screen, they need to tap the enable-alerts button again.
- **The app seems out of date.** Check the version under the settings, then close the
  app completely and reopen it while online.
- **A new card isn't showing.** Open the card picker and tap **Refresh**. If it still isn't there,
  check that the file is in the `cards` folder (not a subfolder) and ends in .jpg, .png, .webp or .gif.
  GitHub limits how often it answers a shared Wi-Fi network (60 requests an hour), so after a lot of
  checking the app just keeps showing its saved list until the limit resets.
- **A card is slow to appear, or the TV is laggy.** Run the housekeeping chores by hand: **Actions >
  Card housekeeping > Run workflow**. It fills in any missing thumbnails and timers.
- **The TV doesn't fill the screen.** Add `?debug` to the end of the address. It shows the screen size
  the TV reports in a green bar at the bottom.
- **The screen went to sleep mid-workout.** Tell me which device and iOS version. Add `?debug` to see
  whether the keep-awake request was accepted.

## Settings you may need to change

- **GitHub secret `ONESIGNAL_REST_API_KEY`** (Settings > Secrets and variables > Actions): lets the
  workflow send notifications.
- **`SEGMENT: "All Push"`** in `notify-new-card.yml`: the OneSignal segment that receives them.
- **Repository variable `APP_URL`** (optional): only needed if the app moves away from
  `https://bkrone.github.io/timer/`.
