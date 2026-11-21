# தமிழ் நண்பன் அகாடமி (Tamil Nanban Academy)

British Spoken English learning app for Tamil speakers — a full mobile app (PWA) with
login, subscription/payment, header + bottom navigation, letters (A–Z, 20 words each),
word categories, action words, tests and a sentence-making preview.

## Run locally
    cd tnacademy
    python3 -m http.server 8080
    # open http://localhost:8080  (use Chrome / Android for voice check)

## App structure
- **Header navigation** — logo, stars, premium crown, back button on inner pages.
- **Bottom navigation (5 tabs)** — முகப்பு (Home), கற்க (Learn), வீடியோ (Videos),
  தேர்வு (Tests), சுயவிவரம் (Profile).
- **Login** — phone number + 4-digit OTP (demo: any 4 digits), then name.
- **Payment** — Free / Monthly ₹99 / Yearly ₹699 plans; Razorpay demo checkout; premium gating.
- **Learn** — 26 letters × 20 words, 15 word categories, sentence making.
- **Tests** — Daily, Weekend (premium), Placement; progress + streak.
- **Offline** — service worker precaches all screens and 325 images.

## Course (Udemy-style) — NEW
- `js/course.js` — modules → lessons (types: phrases, dialogue, grammar, video, speaking, quiz). Edit this file to add content; no code change needed.
- **Curriculum** with per-module progress, continue-learning, lesson ✓, prev/next.
- **Lesson player**: 🔊 listen / 🐢 slow / 🎤 pronunciation score (0–100 + missed words), dialogue role-play (you = A/B), grammar with mistakes, video (your mp4 / Cloudflare Stream / YouTube), speaking tasks, module quiz (70% pass, explanations).
- **Flashcard review** (spaced repetition), **notes** per lesson, **bookmarks**, **search**, **badges**, **daily goal + streak**, **certificate** (PNG download), **phrase sheet** (txt/copy/print), **Q&A**, **settings** (voice speed, goal, backup).
- **Parent WhatsApp report** (`#/report`): builds a progress report and opens WhatsApp with it (1 tap). Fully automatic weekly sending needs a Cloudflare Worker cron + WhatsApp Business API (MSG91 WhatsApp / Meta Cloud API) — see `sendParentReportAuto()` in `js/app.js`.
- **Your own videos**: put mp4 in `videos/` (see `videos/README.md`) or use Cloudflare Stream.
- Free plan: Modules 1–2. Premium: all modules.

## Content
- `tools/letters20.json` — 26 letters, 20 words each (word, British IPA, Tamil).
- `tools/words.json` — 15 word categories (animals, fruit, body, actions, …).
- `images/words/*.svg` — 325 animated flat-2D illustrations.
- Regenerate app data after editing JSON/images: `python3 tools/make_data.py`
- Course lessons: edit `js/course.js` directly (modules/lessons arrays).

## What is DEMO vs real (integration points)
Everything in the front-end works. Two things need a small backend + keys for production:

1. **OTP login** — `sendOtp()` / `verifyOtp()` in `js/app.js`.
   Plug in MSG91 or Firebase Phone Auth. Demo accepts any 4-digit code.
2. **Payment** — `openPay()` in `js/app.js`.
   Plug in Razorpay: backend creates an order, `new Razorpay({...}).open()`, verify on server,
   then set premium. Demo marks premium locally.

Audio currently uses the phone's built-in British voice (`speechSynthesis`, en-GB).
For consistent British audio, add `audio/<word>.mp3` files (Azure/Google TTS) — the app
plays them automatically when present.

## Publishing to Play Store
Wrap this PWA as a TWA (Trusted Web Activity) with Bubblewrap, or load it in a WebView.
Needs: a Google Play Developer account, the app hosted on HTTPS, a privacy policy, and
signed Android build (AAB).
