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

## Content
- `tools/letters20.json` — 26 letters, 20 words each (word, British IPA, Tamil).
- `tools/words.json` — 15 word categories (animals, fruit, body, actions, …).
- `images/words/*.svg` — 325 animated flat-2D illustrations.
- Regenerate app data after editing JSON/images: `python3 tools/make_data.py`

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
