# Doctor Panic

Companion app for **Doctor Panic**, the frantic cooperative board game where the
whole table plays a surgical team trying to save a patient before the clock runs
out. The app is the hospital: it runs the operation timer, flatlines the patient
at the worst moment and rings the phone with ridiculous orders from the outside
world.

> The board game is required to play. Game by Roberto Fraga, illustrations by
> Éric Azagury, © Sombreros Production / Repos Production. See
> [Credits](#credits).

## Play

| | |
|---|---|
| **In the browser** | <https://misostc.github.io/doctorpanic/> (installable as a web app: *Add to Home screen*) |
| **Android app** | [doctorpanic.apk](https://misostc.github.io/doctorpanic/doctorpanic.apk), also linked from the app's main menu |

Languages: Français · English · Čeština · Deutsch

## What happens during an operation

- **Pick a difficulty and a patient.** Discovery is a calm 4-minute warm-up;
  easy, normal and hard run longer and throw in cardiac arrests and calls.
- **The heart monitor beeps** through the operation, its rhythm changing as
  time goes by.
- **Cardiac arrest!** The alarm goes off and the defibrillator shows a charge.
  Someone has to deliver the shock before the team can carry on. On harder
  levels the first shock doesn't always bring the patient back.
- **The phone rings.** Answer it and the caller gives the table a silly challenge
  (*"sponge every player's forehead"*). Do it, then hang up.
- **Save the patient** before the timer hits zero to win. The result screen sums
  up the game: patient, difficulty, time, cardiac arrests and calls handled.

## Android app extras

The Android app wraps the same game in a native shell and adds:

- **Slap to shock 👋:** during a cardiac arrest, slap the table next to the
  phone to deliver the shock. It listens for a sharp, loud sound together with
  the jolt the phone feels on the table. A level meter shows what the mic
  hears. Turn it on or off from the main menu ("Slap to shock").
- **The screen stays on** for the whole operation.
- **Back button** opens the pause menu instead of quitting mid-operation.
- Works offline, with all assets in the APK.

Microphone audio is only analysed on the device, only while the defibrillator
screen is open. Nothing is recorded or sent anywhere.

## Development

The game is a static site (jQuery Mobile, plain JS/CSS). No build step.

```sh
python3 -m http.server 8000
# open http://localhost:8000/pages/homepage.html
```

### Project layout

```
pages/          one HTML page per screen: homepage, patient-*, operation-*, victory/defeat
js/gameplay.js  game loop: timer, cardiac arrests, phone calls, events, result summary
js/index.js     translations and the result screen
js/debug.js     hidden debug panel (see below)
css/            original styles; css/mobile-fixes.css holds the phone layout fixes
i18n/<lang>/    translations (French is the original text, inline in the pages)
images/ sounds/ fonts/
android/        native Android shell (Kotlin)
```

### Debug panel

Tap the **Doctor Panic logo on the main menu 7 times** to enable it, in the
browser or the app. Operation pages then show a 🐞 button that opens any
screen on demand: a real cardiac arrest or phone call, each event card, and the
victory or defeat screen. Tap the logo 7 times again to turn it off. In the
browser you can also add `?debug=1` or `?debug=0` to a URL.

### Translations

Each language lives in `i18n/<lang>/strings_<lang>.json`. Elements marked
`class="languagespecificHTML" data-text="<key>"` get their text from it. The
French originals sit inline in the HTML, so check wording against them.

## Android build

Everything builds in Docker. Nothing needs installing on the host besides
Docker itself.

```sh
android/build.sh            # unit tests + debug APK
android/build.sh assembleRelease
```

The debug APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`.
The first run builds the image, with JDK 21, Gradle and the Android SDK, and
takes a few minutes. Later runs take about a minute.

How it fits together:

- `MainActivity` serves the web game from the APK assets through
  `WebViewAssetLoader`. Gradle copies the repo's web files in on every build, so
  the web version is the single source of the UI.
- The page talks to the app through `window.DPNative`: `gameplay.js` calls
  `startSlap()`/`stopSlap()`, and the app calls back `gameplay.onSlap()` and
  `gameplay.onMicLevel()`.
- `SlapDetector` (sound transient), `JoltDetector` (accelerometer) and
  `SlapFusion` (combining the two) are plain Kotlin with unit tests on synthetic
  audio.
- A crash is saved and shown on the next launch with a *Copy* button. That
  makes bug reports possible without a cable.

### Release signing & deploy

Every push to `main` runs `.github/workflows/static.yml`. It builds the APK,
puts it next to the site as `doctorpanic.apk` and deploys to GitHub Pages.

With these repository secrets set, the APK is a signed release build.
Otherwise it falls back to a debug build:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the keystore file, base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | store and key password (key alias `doctorpanic`) |

Keep the keystore backed up. Android only installs updates signed with the
same key.

## Credits

**Board game:** author Roberto Fraga; illustrations Éric Azagury; a Repos
Production game published by Sombreros Production (2016). The game content,
artwork and sounds belong to their owners and are for private, non-commercial
use only.

**Original app:** GT Holding and GDS M&C; graphics Cédric Chevalier and Éric
Azagury. Sounds from soundbible.com (recorded by Joe Lamb),
sound-fishing.net and universal-soundbank.com.

**Font:** [PT Sans Narrow](https://fonts.google.com/specimen/PT+Sans+Narrow)
by ParaType, [SIL Open Font License](fonts/pt-sans-narrow/OFL.txt).
