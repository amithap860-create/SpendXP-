# SpendXP — Mobile App Setup Guide
## Capacitor 6 · iOS + Android

This guide takes you from the current Next.js web app to a real iOS and Android
app that you can submit to the App Store and Google Play.

---

## Prerequisites

Install these before starting:

| Tool | Download |
|------|----------|
| Node 20+ | Already installed |
| Xcode 15+ | Mac App Store (iOS only) |
| Android Studio | developer.android.com/studio |
| CocoaPods | `sudo gem install cocoapods` |
| JDK 17+ | Comes with Android Studio |

---

## Step 1 — Install Capacitor packages

Open a terminal in `D:\SpendXP Main\SpendXP` and run:

```bash
npm install
```

This installs all Capacitor packages added to package.json.

---

## Step 2 — Update your Vercel URL

Open `capacitor.config.ts` and replace the placeholder URL:

```ts
server: {
  url: 'https://YOUR-ACTUAL-URL.vercel.app',  // ← change this
```

Find your URL in the Vercel dashboard → your SpendXP project → Domains.

---

## Step 3 — Initialise native platforms

```bash
npx cap add ios
npx cap add android
npx cap sync
```

This creates the `ios/` and `android/` folders with your native project files.

---

## Step 4 — Configure iOS (on a Mac)

### 4a — Open in Xcode
```bash
npm run cap:open:ios
```

### 4b — Set up signing
1. In Xcode, click the `App` target → Signing & Capabilities
2. Select your Apple Developer Team
3. Bundle ID: `com.spendxp.app` (or change in capacitor.config.ts)

### 4c — Add Push Notification capability
1. In Xcode → Signing & Capabilities → + Capability
2. Add **Push Notifications**
3. Add **Background Modes** → tick **Remote notifications**

### 4d — Firebase iOS setup
1. Go to Firebase Console → Project settings → iOS app
2. Download `GoogleService-Info.plist`
3. Drag it into Xcode under the `App` folder (make sure "Copy items if needed" is checked)

### 4e — Run on simulator
```bash
npm run cap:run:ios
```

---

## Step 5 — Configure Android

### 5a — Open in Android Studio
```bash
npm run cap:open:android
```

### 5b — Firebase Android setup
1. Go to Firebase Console → Project settings → Android app
2. Package name: `com.spendxp.app`
3. Download `google-services.json`
4. Place it in `android/app/google-services.json`

### 5c — Run on emulator
```bash
npm run cap:run:android
```

---

## Step 6 — Firebase Cloud Messaging (push notifications)

### Enable FCM in Firebase
1. Firebase Console → Project settings → Cloud Messaging
2. Note your **Server key** — add it to your `.env.local`:
   ```
   FCM_SERVER_KEY=your-server-key-here
   ```

### iOS APNs setup (required for iOS push)
1. Apple Developer → Certificates → + → Apple Push Notification service SSL
2. Download the certificate, export as .p12 from Keychain Access
3. Upload in Firebase Console → Project settings → Cloud Messaging → APNs

---

## Step 7 — App icons and splash screen

### Icons
Place your icon files in these locations:

**iOS** (required sizes — use a 1024×1024 source):
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
```
Use Xcode's icon generator or a tool like https://appicon.co

**Android** (place in these folders):
```
android/app/src/main/res/
  mipmap-mdpi/ic_launcher.png      (48×48)
  mipmap-hdpi/ic_launcher.png      (72×72)
  mipmap-xhdpi/ic_launcher.png     (96×96)
  mipmap-xxhdpi/ic_launcher.png    (144×144)
  mipmap-xxxhdpi/ic_launcher.png   (192×192)
```

### Splash screen
Place a `splash.png` (2732×2732, dark background #1A1F2E, SpendXP logo centered)
in:
- iOS: `ios/App/App/Assets.xcassets/Splash.imageset/`
- Android: `android/app/src/main/res/drawable/splash.png`

---

## Step 8 — Sync after code changes

Any time you push new code to Vercel, the app automatically picks it up
(it loads the live URL). But if you change `capacitor.config.ts` or native
plugin configuration, run:

```bash
npm run cap:sync
```

---

## Step 9 — TestFlight (iOS beta)

1. In Xcode → Product → Archive
2. Distribute → App Store Connect → Upload
3. In App Store Connect → TestFlight → add testers
4. Share the TestFlight link

---

## Step 10 — Google Play (Android beta)

1. In Android Studio → Build → Generate Signed Bundle/APK → Android App Bundle
2. Create a keystore (keep it safe — you need it for every future release)
3. Upload the `.aab` to Google Play Console → Internal testing

---

## Ongoing workflow

```bash
# After changes to native config or plugins:
npm run cap:sync

# Open iOS project:
npm run cap:open:ios

# Open Android project:
npm run cap:open:android
```

Web changes (Next.js code) → push to GitHub → Vercel deploys → 
native app picks up automatically on next launch. No rebuild needed.

---

## Troubleshooting

**"Unable to load remote URL"** — Check that `server.url` in capacitor.config.ts
matches your deployed Vercel URL exactly, including https://.

**Push notifications not working on iOS simulator** — Simulators don't support
real push. Use a physical device for push testing.

**Android build fails** — Make sure `google-services.json` is in `android/app/`.

**Splash screen not hiding** — The `hideSplash()` call in `useNativeInit.ts`
fires 400ms after mount. If the app is slow to hydrate, increase this timeout.
