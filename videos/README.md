# videos/ — உங்கள் சொந்த வீடியோக்கள்

இங்கே mp4 (H.264) கோப்புகளை ஏற்றுங்கள். பிறகு `js/course.js`-ல் அந்த lesson-க்கு:

    { id: 'm1l5', type: 'video', title: '...', mins: 10, src: 'videos/m1-greetings.mp4', poster: 'videos/m1-greetings.jpg' }

- **சிறிய வீடியோ (≤ 25 MB)** → இந்த folder-லேயே வைக்கலாம் (Cloudflare Pages கோப்பு வரம்பு 25 MB).
- **பெரிய வீடியோ** → Cloudflare Stream-ல் upload செய்து UID-ஐ `stream: 'UID'` என்று கொடுங்கள்,
  அல்லது Cloudflare R2 / ஏதேனும் CDN-ல் வைத்து முழு URL-ஐ `src:` ஆகக் கொடுங்கள்.
- **YouTube** → `yt: 'VIDEO_ID'`.

ஒரு lesson-ல் src / stream / yt — ஏதேனும் ஒன்று போதும். வீடியோ முடிந்தால் lesson தானாக ✓ ஆகும்.
