# SpendXP — Google Play Publishing Guide
*Complete step-by-step walkthrough. Follow in order.*

---

## PART 1 — Create Your Google Play Developer Account

### Step 1.1 — Open Play Console
Go to: **https://play.google.com/console**

Sign in with a **personal Google account** (Gmail). Don't use your school/college account — use a regular gmail.com address that you'll keep long term.

### Step 1.2 — Accept the Developer Agreement
- Click **"Get started"**
- Read and click **"I agree"** on the Developer Distribution Agreement

### Step 1.3 — Pay the $25 Registration Fee
- Click **"Pay registration fee"**
- You'll be taken to a Google Payments page
- Pay with a debit card, credit card, or UPI (₹2,100 approx)
- ⚠️ This is a **one-time fee**. It never expires. You can publish unlimited apps.

### Step 1.4 — Fill in your account details
- **Account name:** SpendXP (or your name — this is what appears on the Play Store as "Developer")
- **Contact email:** Your email address
- **Phone:** Your number (for account recovery only)
- Click **Save**

### Step 1.5 — Wait for activation
- Google usually activates new accounts **within a few minutes to 48 hours**
- You'll get an email saying "Your developer account is now active"
- Once activated, you can create and submit apps

---

## PART 2 — Build the Signed Android App

### Step 2.1 — Generate your signing keystore (ONE TIME ONLY)
Open **Command Prompt** or **Terminal** on your computer and run:

```
keytool -genkey -v -keystore spendxp-release.jks -alias spendxp -keyalg RSA -keysize 2048 -validity 10000
```

It will ask you:
- **Password:** Choose something strong, write it down (e.g. `SpendXP@2024!`)
- **Re-enter password:** Same
- **First and last name:** Your name
- **Organization Unit:** SpendXP
- **Organization:** SpendXP
- **City:** Bangalore (or your city)
- **State:** Karnataka (or your state)
- **Country code:** IN
- **Is this correct?** Type `yes`
- **Key password:** Press Enter to use same as keystore password

⚠️ **CRITICAL:** The file `spendxp-release.jks` is created where you ran the command. **BACK IT UP.** If you lose this file, you can NEVER update the app on Play Store.

Copy it to:
- A USB drive
- Google Drive
- Email it to yourself

### Step 2.2 — Place the keystore in your project
Copy `spendxp-release.jks` to:
```
SpendXP/android/spendxp-release.jks
```

The `build.gradle` in `android/app/` is already updated to look for it there.

### Step 2.3 — Fill in your passwords in build.gradle
Open `android/app/build.gradle` and replace:
- `YOUR_KEYSTORE_PASSWORD` → your actual password
- `YOUR_KEY_PASSWORD` → same password (if you pressed Enter during keytool)

### Step 2.4 — Open Android Studio
1. Open **Android Studio**
2. Click **File → Open** → navigate to `SpendXP/android/`
3. Click **OK** and wait for Gradle sync to complete (may take 2–3 minutes)

### Step 2.5 — Build the signed AAB
1. In Android Studio: click **Build** (top menu) → **Generate Signed Bundle / APK**
2. Choose **Android App Bundle** → click **Next**
3. Click the **Key store path** folder icon → navigate to `spendxp-release.jks`
4. Enter your **Key store password** and **Key password**
5. Key alias: `spendxp`
6. Click **Next**
7. Choose **release** → click **Finish**
8. Wait ~2 minutes. When done, Android Studio shows "Bundle(s) generated successfully"
9. The file is at: `android/app/release/app-release.aab`

---

## PART 3 — Create the App on Play Console

### Step 3.1 — Create new app
1. Go to **https://play.google.com/console**
2. Click **"Create app"** button (top right)
3. Fill in:
   - **App name:** SpendXP
   - **Default language:** English (India) or English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Check both policy agreement boxes
5. Click **Create app**

### Step 3.2 — Upload your AAB (Internal Testing first)
1. In the left sidebar: **Testing → Internal testing**
2. Click **Create new release**
3. Under "App bundles": click **Upload** → select your `app-release.aab`
4. Wait for it to upload and process (~1-2 minutes)
5. In the **Release notes** box, type:
   ```
   Initial release of SpendXP — financial education app for all ages.
   ```
6. Click **Save**, then **Review release**, then **Start rollout to Internal testing**

**Test it on your phone:**
- Go to Internal testing → copy the opt-in link
- Open the link on your Android phone → join the test → install from Play Store
- Make sure the app opens and works correctly!

---

## PART 4 — Complete the Store Listing

### Step 4.1 — Main store listing
In Play Console sidebar: **Grow → Store presence → Main store listing**

**App name:** SpendXP

**Short description (max 80 chars):**
```
Learn money skills through quests, games & real-life scenarios. Ages 8–25.
```

**Full description (copy-paste this):**
```
SpendXP turns financial education into an adventure.

Join the Order of the Golden Ledger — an elite agency where you earn XP, 
climb ranks, and defeat the Gray Fog by mastering real money skills.

🎯 CASE FILES (QUESTS)
Real-life financial scenarios: first salary, birthday money, peer pressure 
spending, EMIs, credit cards, and more. Make choices, see consequences, 
learn without losing real money.

🎮 ARCADE GAMES
• Budget Blitz — allocate your salary before the timer runs out
• FinIQ Quiz — test your financial knowledge
• Money Maze — navigate life decisions through a financial obstacle course

📚 FINANCIAL SCHOOL
Structured lessons from "What is Money?" to investing and tax planning.
Earn the Scholar badge when you complete all lessons.

🏆 RANKS & PROGRESSION
Rise through 8 ranks: Apprentice → Scout → Agent → Inspector → Detective 
→ Chief → Grandmaster → Legend. Each rank unlocks new challenges.

✅ BUILT FOR EVERYONE
• Kids (8–11): Birthday money, pocket money, lemonade stand basics
• Teens (12–17): Side hustles, peer pressure, first credit card
• Young adults (18–25): First salary, apartment, investments, tax

🔒 SAFE & PRIVATE
No real money involved. Parent controls for younger users. 
Email verification required. COPPA compliant.

Start your journey today. Your financial future starts here.
```

### Step 4.2 — Upload screenshots
Go to **Graphics** section on the same page.

**Phone screenshots (required, min 2):**
- Open `play-store-screenshots.html` in Chrome
- Press F12 → click the phone icon (Device Mode) → set to 390 × 844
- Right-click each phone screen → Save image OR use the screenshot tool
- Upload all 6 screenshots

**App icon (512×512 PNG):**
- Open your app on Chrome mobile view
- Screenshot the app icon, or export it from your project's `public/` folder

**Feature graphic (1024×500 PNG):**
- Create a simple banner in Canva: dark background (#1A1F2E), "SpendXP" in large white text, "Financial Education. Gamified." as subtitle, sage green accent
- Free to make in 5 minutes at canva.com

### Step 4.3 — Categorisation
- **App category:** Education
- **Tags:** Finance, Education, Kids, Learning, Money

### Step 4.4 — Contact details
- **Email:** your email address
- **Website:** https://spendxp.vercel.app
- **Privacy policy:** https://spendxp.vercel.app/privacy

---

## PART 5 — Content Rating

1. In sidebar: **Policy → App content → Content rating**
2. Click **Start questionnaire**
3. Select category: **Education**
4. Answer the questions:
   - Violence: No
   - Sexual content: No
   - Profanity: No
   - Controlled substances: No
   - User interaction: No real-time user-to-user interaction
5. Click **Calculate rating**
6. You should get **PEGI 3 / Everyone** — click **Apply rating**

---

## PART 6 — Target Audience & Content

1. In sidebar: **Policy → App content → Target audience and content**
2. Select target age: **13 and over** (avoids the strictest Families Policy rules while still allowing younger users to use the app with parental guidance)
3. **Does your app appeal to children?** → Select "No" (this keeps you out of the restricted Families Program)
4. Save

---

## PART 7 — Submit for Review

1. In sidebar: **Production**
2. Click **Create new release**
3. Upload the same `app-release.aab` again (or promote from Internal Testing)
4. Click **Review release**
5. Check all items in the checklist have green ✓
6. Click **Start rollout to Production**
7. Click **Rollout** to confirm

You'll see: **"Under review"**

---

## PART 8 — Wait & Monitor

- **New apps:** Review usually takes **1–7 days** (often 2–3 days)
- You'll get an email when approved or if there's an issue
- Check Play Console daily for any **policy warnings** or **rejection reasons**

**If rejected:**
- Read the exact reason in Play Console
- Fix the issue (usually a missing policy page, unclear description, or screenshot problem)
- Resubmit — reviewed again in 1–3 days

---

## QUICK REFERENCE — Files You Need

| File | Where it is |
|------|-------------|
| `spendxp-release.jks` | You generate this (keep it safe forever!) |
| `app-release.aab` | `android/app/release/` after Android Studio build |
| Screenshots | Open `play-store-screenshots.html` in Chrome |
| Privacy Policy URL | https://spendxp.vercel.app/privacy |
| Support URL | https://spendxp.vercel.app/support |

---

## COMMON MISTAKES TO AVOID

❌ **Don't** upload a debug APK — you need a signed AAB  
❌ **Don't** lose your keystore file — you cannot update the app without it  
❌ **Don't** set target audience to "under 13" unless you're ready for strict COPPA rules  
❌ **Don't** use screenshots from a browser desktop — must look like a phone screen  
❌ **Don't** skip the content rating — Play Console won't let you submit without it  

✅ Test on a real phone using Internal Testing before submitting to Production  
✅ Keep your keystore password written down somewhere physical  
✅ Use the exact package name `com.spendxp.app` — it can never be changed  
