(function () {
  'use strict';
  var LETTERS = window.LETTERS || [], CATS = window.CATS || [];
  var app = document.getElementById('app');
  var KEY = 'tna_v1';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---- word pools ----
  var WORDS = [];
  LETTERS.forEach(function (l, i) { l.words.forEach(function (w) { WORDS.push({ word: w.word, ipa: w.ipa, tamil: w.tamil, letter: l.upper, li: i }); }); });
  var CHUNKS = {};
  CATS.forEach(function (c) {
    var parts = Math.ceil(c.words.length / 6), size = Math.ceil(c.words.length / parts);
    for (var n = 0; n < parts; n++) { var ws = c.words.slice(n * size, (n + 1) * size); CHUNKS['c:' + c.id + ':' + n] = { key: 'c:' + c.id + ':' + n, cat: c, n: n, parts: parts, words: ws }; ws.forEach(function (w) { WORDS.push({ word: w.word, ipa: w.ipa, tamil: w.tamil, letter: 'c:' + c.id + ':' + n, li: -1 }); }); }
  });
  var ALLW = (function () { var s = {}, o = []; WORDS.forEach(function (w) { if (!s[w.word]) { s[w.word] = 1; o.push(w); } }); return o; })();

  // ---- state ----
  function fresh() { return { v: 1, user: null, premium: false, unlocked: 5, done: {}, tests: [], streak: 0, last: '', placed: false, phone: '' }; }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return s; } catch (e) {} return fresh(); }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  // ---- dom helpers ----
  function h(tag, attrs) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) { if (k === 'class') e.className = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k.indexOf('on') === 0) e[k] = attrs[k]; else e.setAttribute(k, attrs[k]); }
    for (var i = 2; i < arguments.length; i++) ins(e, arguments[i]);
    return e;
  }
  function ins(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { ins(e, x); }); return; } e.append(c.nodeType ? c : document.createTextNode(c)); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a, n) { return shuffle(a).slice(0, n); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
  function img(word, cls) { return h('img', { src: 'images/words/' + word + '.svg', alt: word, class: cls || '', loading: 'lazy' }); }
  function toast(msg) { var t = h('div', { class: 'toast' }, msg); document.body.append(t); setTimeout(function () { t.remove(); }, 1800); }

  // ---- audio ----
  var audio = null;
  function speak(text, rate) { try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = rate || .8; var v = speechSynthesis.getVoices().filter(function (x) { return /en[-_]GB/i.test(x.lang); }); if (v[0]) u.voice = v[0]; speechSynthesis.speak(u); } catch (e) {} }
  function play(file, text, rate) { if (audio) { try { audio.pause(); } catch (e) {} } var used = false; function fb() { if (!used) { used = true; speak(text, rate); } } try { var a = new Audio('audio/' + file + '.mp3'); audio = a; a.onerror = fb; var p = a.play(); if (p && p.catch) p.catch(fb); } catch (e) { fb(); } }
  function sayWord(w) { play(w, w.replace(/-/g, ' '), .75); }
  function norm(s) { return s.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim(); }
  function matches(hd, word) { var t = norm(hd), w = norm(word.replace(/-/g, ' ')); return t === w || t.split(' ').indexOf(w) >= 0 || t.replace(/ /g, '') === w.replace(/ /g, ''); }
  function sayIt(word, fb, btn) {
    if (!SR) { fb.className = 'fb ok'; fb.textContent = 'சாதனத்தில் குரல் சோதனை இல்லை — சத்தமாகச் சொல்லிப் பாருங்கள்! 👍'; return; }
    btn.classList.add('on'); fb.className = 'fb'; fb.textContent = 'கேட்கிறேன்…'; var done = false;
    function end(ok, hd, err) { if (done) return; done = true; btn.classList.remove('on');
      if (ok === true) { fb.className = 'fb ok'; fb.textContent = '✅ அருமை! "' + hd + '" என்று கேட்டேன்.'; }
      else if (ok === false) { fb.className = 'fb bad'; fb.textContent = hd ? '❌ "' + hd + '" என்று கேட்டது. மீண்டும் முயலுங்கள்.' : '❌ கேட்கவில்லை. மீண்டும்.'; }
      else if (err === 'not-allowed' || err === 'service-not-allowed') { fb.className = 'fb bad'; fb.textContent = 'மைக் அனுமதி தரவும்.'; }
      else { fb.className = 'fb bad'; fb.textContent = 'குரல் சோதனை இப்போது இல்லை (இணையம்/Chrome தேவை).'; } }
    try { var r = new SR(); r.lang = 'en-GB'; r.maxAlternatives = 5; r.interimResults = false;
      r.onresult = function (e) { var a = []; for (var k = 0; k < e.results[0].length; k++) a.push(e.results[0][k].transcript); end(a.some(function (t) { return matches(t, word); }), a[0]); };
      r.onerror = function (e) { end(null, '', e.error); }; r.onnomatch = function () { end(false, ''); }; r.onend = function () { end(false, ''); }; r.start();
    } catch (e) { end(null, '', 'start'); }
  }

  // ===================== SHELL =====================
  var TABS = [
    { id: 'home', ic: '🏠', t: 'முகப்பு' }, { id: 'learn', ic: '📚', t: 'கற்க' },
    { id: 'videos', ic: '▶️', t: 'வீடியோ' }, { id: 'tests', ic: '📝', t: 'தேர்வு' }, { id: 'profile', ic: '👤', t: 'சுயவிவரம்' }
  ];
  function header(opts) {
    opts = opts || {};
    return h('div', { class: 'head' },
      opts.back ? h('button', { class: 'hbtn back', onclick: function () { history.length > 1 ? history.back() : (location.hash = '#/home'); } }, '‹') : h('div', { class: 'logo' }, h('div', { class: 'mark' }, 'த'), h('span', null, 'தமிழ் நண்பன்')),
      opts.title ? h('div', { class: 'logo', style: 'font-size:16px' }, opts.title) : null,
      h('div', { class: 'sp' }),
      h('a', { class: 'coins', href: '#/tests', style: 'text-decoration:none;color:inherit' }, '⭐ ', String(totalStars())),
      S.premium ? h('div', { class: 'hbtn', title: 'Premium' }, '👑') : null);
  }
  function nav(active) {
    return h('div', { class: 'nav' }, TABS.map(function (t) {
      return h('a', { class: t.id === active ? 'on' : '', href: '#/' + t.id }, h('span', { class: 'ni' }, t.ic), t.t);
    }));
  }
  function shell(active, opts, body) {
    app.replaceChildren(header(opts), h('div', { class: 'page' }, body), nav(active));
    window.scrollTo(0, 0);
  }
  function plain(opts, body) { app.replaceChildren(header(opts), h('div', { class: 'page' }, body)); window.scrollTo(0, 0); }

  function totalStars() { var t = 0; for (var k in S.done) t += S.done[k]; return t; }
  function letterDone() { var n = 0; LETTERS.forEach(function (l) { if (S.done[l.upper]) n++; }); return n; }
  function learned(word) { return WORDS.some(function (x) { return x.word === word && S.done[x.letter]; }); }
  function idx(up) { for (var i = 0; i < LETTERS.length; i++) if (LETTERS[i].upper === up) return i; return -1; }

  // ===================== AUTH =====================
  function authScreen() {
    var phone = '';
    var box = h('div', { class: 'sheet' });
    app.replaceChildren(h('div', { class: 'auth' },
      h('div', { class: 'brand' }, h('div', { class: 'mark' }, 'த'), h('h1', null, 'தமிழ் நண்பன் அகாடமி'), h('p', null, 'British Spoken English — படிப்படியாக')),
      box));
    step1();
    function step1() {
      var inp = h('input', { class: 'inp', type: 'tel', inputmode: 'numeric', maxlength: '10', placeholder: '10 இலக்க எண்' });
      box.replaceChildren(
        h('h2', null, 'உள்நுழைவு / பதிவு'),
        h('p', { class: 'muted' }, 'உங்கள் மொபைல் எண்ணை உள்ளிடுங்கள். OTP அனுப்பப்படும்.'),
        h('div', { class: 'field' }, h('label', null, 'மொபைல் எண்'),
          h('div', { class: 'phone' }, h('input', { class: 'inp cc', value: '+91', readonly: 'true' }), inp)),
        h('button', { class: 'btn', onclick: function () {
          var v = inp.value.replace(/\D/g, '');
          if (v.length !== 10) { toast('சரியான 10 இலக்க எண் தரவும்'); return; }
          phone = v; sendOtp(v); step2();
        } }, 'OTP அனுப்பு'),
        h('div', { class: 'note' }, 'இது demo. உண்மையான OTP அனுப்ப MSG91 / Firebase Phone Auth இணைக்க வேண்டும் (sendOtp() இல் குறிப்பு உள்ளது).'),
        h('p', { class: 'fine' }, 'தொடர்வதன் மூலம் ', h('a', { href: 'javascript:;', onclick: function () { toast('விதிமுறைகள் — demo'); } }, 'விதிமுறைகளை'), ' ஏற்கிறீர்கள்.'));
      setTimeout(function () { inp.focus(); }, 60);
    }
    function step2() {
      var ins = [];
      var wrap = h('div', { class: 'otp' });
      for (var i = 0; i < 4; i++) (function (i) {
        var el = h('input', { class: '', inputmode: 'numeric', maxlength: '1' });
        el.oninput = function () { if (el.value && i < 3) ins[i + 1].focus(); if (i === 3 && allFilled()) verify(); };
        el.onkeydown = function (e) { if (e.key === 'Backspace' && !el.value && i > 0) ins[i - 1].focus(); };
        ins.push(el); wrap.append(el);
      })(i);
      function allFilled() { return ins.every(function (x) { return x.value; }); }
      box.replaceChildren(
        h('h2', null, 'OTP உள்ளிடுங்கள்'),
        h('p', { class: 'muted' }, '+91 ' + phone + ' க்கு அனுப்பப்பட்டது · ', h('a', { class: 'link', href: 'javascript:;', onclick: step1 }, 'மாற்று')),
        wrap,
        h('button', { class: 'btn', style: 'margin-top:18px', onclick: verify }, 'சரிபார்'),
        h('button', { class: 'btn ghost', onclick: function () { sendOtp(phone); toast('OTP மீண்டும் அனுப்பப்பட்டது'); } }, 'மீண்டும் அனுப்பு'),
        h('div', { class: 'note' }, 'Demo: எந்த 4 இலக்கங்களையும் (எ.கா. 1234) உள்ளிட்டால் உள்நுழையும்.'));
      setTimeout(function () { ins[0].focus(); }, 60);
      function verify() { var code = ins.map(function (x) { return x.value; }).join(''); if (code.length !== 4) { toast('4 இலக்க OTP தரவும'); return; } verifyOtp(phone, code, function (ok) { if (!ok) { toast('தவறான OTP'); return; } step3(); }); }
    }
    function step3() {
      var inp = h('input', { class: 'inp', placeholder: 'உங்கள் பெயர்' });
      box.replaceChildren(
        h('h2', null, 'வரவேற்கிறோம்! 🎉'),
        h('p', { class: 'muted' }, 'தொடங்க உங்கள் பெயரைச் சொல்லுங்கள்.'),
        h('div', { class: 'field' }, h('label', null, 'பெயர்'), inp),
        h('button', { class: 'btn', onclick: function () {
          var nm = inp.value.trim() || 'மாணவர்';
          S.user = { name: nm, phone: phone }; S.phone = phone; save();
          location.hash = '#/home'; route();
        } }, 'தொடங்கு'));
      setTimeout(function () { inp.focus(); }, 60);
    }
  }
  // --- auth integration points (replace demo with real backend) ---
  function sendOtp(phone) {
    // DEMO: no real SMS. Integrate MSG91 or Firebase Phone Auth here, e.g.:
    //   fetch('https://control.msg91.com/api/v5/otp?mobile=91'+phone+'&template_id=...')
    //   or firebase.auth().signInWithPhoneNumber('+91'+phone, recaptcha)
  }
  function verifyOtp(phone, code, cb) {
    // DEMO: accept any 4-digit code. Replace with server/Firebase verify.
    cb(/^\d{4}$/.test(code));
  }

  // ===================== HOME =====================
  function home() {
    var nextI = -1; for (var i = 0; i < LETTERS.length; i++) { if (i < S.unlocked && !S.done[LETTERS[i].upper]) { nextI = i; break; } }
    shell('home', {}, [
      h('h1', { class: 'h1' }, 'வணக்கம், ' + (S.user ? S.user.name : 'நண்பா') + '! 👋'),
      h('p', { class: 'sub' }, 'இன்று கற்போம். ஒவ்வொரு நாளும் ஒரு படி.'),
      h('div', { class: 'row', style: 'margin-bottom:6px' },
        h('span', { class: 'chip' }, '🔥 ' + S.streak + ' நாள்'),
        h('span', { class: 'chip' }, '⭐ ' + totalStars() + ' நட்சத்திரம்'),
        h('span', { class: 'chip' }, '🔤 ' + letterDone() + '/26 எழுத்து')),
      !S.premium ? h('a', { href: '#/plans', style: 'text-decoration:none' }, h('div', { class: 'banner', style: 'margin:14px 0' },
        h('div', { class: 'bubble' }), h('h3', null, '👑 Premium திறக்க'), h('p', null, 'வீடியோ வகுப்புகள், வார இறுதித் தேர்வு, அனைத்து வார்த்தைப் பொதிகள்'), h('span', { class: 'pill' }, 'திட்டங்களைப் பார் →'))) : null,
      nextI >= 0 ? h('a', { href: '#/letter/' + LETTERS[nextI].upper, style: 'text-decoration:none;margin-top:12px;display:block' },
        h('div', { class: 'card', style: 'display:flex;align-items:center;gap:14px' },
          h('div', { style: 'width:54px;height:54px;border-radius:14px;background:#EEF0FB;display:grid;place-items:center;font-size:26px;font-weight:900;color:var(--brand)' }, LETTERS[nextI].upper + LETTERS[nextI].lower),
          h('div', { style: 'flex:1' }, h('b', null, 'தொடரு: ' + LETTERS[nextI].upper + LETTERS[nextI].lower), h('div', { style: 'color:var(--muted);font-size:13px' }, LETTERS[nextI].words.length + ' வார்த்தைகள்')),
          h('div', { style: 'color:var(--brand);font-size:22px' }, '▶'))) : null,
      h('div', { class: 'sec-t' }, 'விரைவு தொடக்கம்'),
      h('div', { class: 'menu' },
        quick('🔤', 'எழுத்துகள்', 'A–Z', '#/learn', '#EEF0FB', 'var(--brand)'),
        quick('🍎', 'வார்த்தைகள்', CATS.length + ' பிரிவு', '#/learn', '#FFF1E8', 'var(--accent)'),
        quick('▶️', 'வீடியோ', 'பார்த்து கற்க', '#/videos', '#E9FBF2', 'var(--ok)', !S.premium),
        quick('📝', 'தினசரி தேர்வு', 'இன்றைய பயிற்சி', '#/test/daily', '#F3EEFF', '#7a4bd8')),
      h('div', { class: 'sec-t' }, 'எழுத்துகள்', h('a', { href: '#/learn' }, 'அனைத்தும்')),
      letterStrip(8)
    ]);
  }
  function quick(ic, t, s, href, bg, col, locked) {
    return h('a', { class: 'mcard', href: href }, locked ? h('span', { class: 'pro' }, '👑 PRO') : null,
      h('div', { class: 'ic', style: 'background:' + bg + ';color:' + col }, ic), h('b', null, t), h('span', null, s));
  }
  function letterStrip(n) {
    var g = h('div', { class: 'tiles' });
    LETTERS.slice(0, n).forEach(function (l, i) {
      var open = i < S.unlocked, done = S.done[l.upper];
      g.append(h('a', { class: 'tile ' + (done ? 'done' : open ? '' : 'locked'), href: open ? '#/letter/' + l.upper : 'javascript:;', onclick: open ? null : function () { toast('முந்தைய எழுத்தை முடியுங்கள்'); } },
        l.upper + l.lower, h('small', null, done ? stars(done) : open ? 'தொடங்கு' : '🔒')));
    });
    return g;
  }

  // ===================== LEARN =====================
  function learn() {
    var g = h('div', { class: 'tiles' });
    LETTERS.forEach(function (l, i) {
      var open = i < S.unlocked, done = S.done[l.upper];
      g.append(h('a', { class: 'tile ' + (done ? 'done' : open ? '' : 'locked'), href: open ? '#/letter/' + l.upper : 'javascript:;', onclick: open ? null : function () { toast('முந்தைய எழுத்தை முடியுங்கள்'); } },
        l.upper + l.lower, h('small', null, done ? stars(done) : open ? '20 சொல்' : '🔒')));
    });
    shell('learn', {}, [
      h('h1', { class: 'h1' }, 'கற்க'),
      h('p', { class: 'sub' }, 'எழுத்து → ஒலி → வார்த்தை → வாக்கியம்.'),
      h('div', { class: 'sec-t' }, 'எழுத்துகள் (A–Z) · 20 வார்த்தை ஒவ்வொன்றுக்கும்'),
      g,
      h('div', { class: 'sec-t' }, 'வார்த்தைப் பிரிவுகள்'),
      h('div', { class: 'list' }, CATS.map(function (c, ci) {
        var locked = !S.premium && ci >= 4;
        return h('a', { class: 'lrow', href: locked ? '#/plans' : '#/cat/' + c.id + '/0', style: 'text-decoration:none;color:inherit' },
          h('div', { class: 'th', style: 'font-size:26px' }, c.icon),
          h('div', { class: 't' }, h('b', null, c.title), h('span', null, c.tamil + ' · ' + c.words.length + ' சொல்')),
          locked ? h('div', { class: 'go' }, '👑') : h('div', { class: 'go' }, '›'));
      })),
      h('div', { class: 'sec-t' }, 'வாக்கியம் அமைத்தல்'),
      h('a', { class: 'lrow', href: '#/sentence', style: 'text-decoration:none;color:inherit' },
        h('div', { class: 'th', style: 'font-size:26px' }, '🧩'),
        h('div', { class: 't' }, h('b', null, 'Sentence making'), h('span', null, 'படம் பார்த்து வார்த்தைகளை அடுக்கு')),
        h('div', { class: 'go' }, '›'))
    ]);
  }

  // ===================== LETTER LESSON =====================
  function letter(up) {
    var i = idx(up); if (i < 0) { location.hash = '#/learn'; return; }
    if (i >= S.unlocked) { toast('இந்த எழுத்து இன்னும் பூட்டப்பட்டுள்ளது'); location.hash = '#/learn'; return; }
    var l = LETTERS[i], box = h('div');
    plain({ back: true, title: l.upper + l.lower }, box);
    meet();
    function meet() {
      box.replaceChildren(
        h('div', { class: 'hero' }, h('div', { class: 'big' }, l.upper + l.lower),
          h('div', { class: 'meta' }, 'பெயர்: ', h('b', null, l.name), ' ', h('span', { class: 'ipa' }, l.name_ipa), h('br'),
            'ஒலி: ', h('b', null, l.sound_ipa), ' — ', h('b', null, l.words[0].word))),
        h('div', { class: 'row', style: 'margin-top:14px' },
          h('button', { class: 'btn alt', onclick: function () { play('letter-' + l.lower, l.upper, .7); } }, '🔊 எழுத்து ஒலி'),
          h('button', { class: 'btn alt', onclick: function () { sayWord(l.words[0].word); } }, '🔊 ' + l.words[0].word)),
        h('button', { class: 'btn', style: 'margin-top:12px', onclick: words }, '20 வார்த்தைகள் →'));
    }
    function words() {
      var list = h('div', { class: 'words' });
      l.words.forEach(function (w) {
        var fb = h('div', { class: 'fb' }), mic = h('button', { class: 'mic' }, '🎤 சொல்');
        mic.onclick = function () { sayIt(w.word, fb, mic); };
        list.append(h('div', { class: 'wcard' },
          h('div', { class: 'pic', onclick: function () { sayWord(w.word); } }, img(w.word)),
          h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'w' }, w.word), h('div', { class: 'ipa' }, w.ipa), h('div', { class: 'ta' }, w.tamil),
            h('div', { class: 'row', style: 'margin-top:6px' }, h('button', { class: 'btn alt sm', onclick: function () { sayWord(w.word); } }, '🔊'), mic), fb)));
      });
      box.replaceChildren(h('h1', { class: 'h1' }, l.upper + l.lower + ' — வார்த்தைகள்'),
        h('p', { class: 'sub' }, 'படத்தைத் தொட்டால் ஒலி. மைக்கில் சொல்லிப் பாருங்கள்.'), list,
        h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn alt', onclick: meet }, '← பின்'), h('button', { class: 'btn', onclick: quiz }, 'வினாடி வினா →')));
    }
    function quiz() {
      var ws = pick(l.words, Math.min(6, l.words.length)).map(function (w) { return ALLW.filter(function (x) { return x.word === w.word; })[0]; });
      var qs = []; ws.forEach(function (w) { qs.push(makeQ('pic2word', w)); qs.push(makeQ('listen2pic', w)); });
      box.replaceChildren(quizView(shuffle(qs), l.upper + l.lower, function (sc, tot) {
        var r = sc / tot, st = r >= 1 ? 3 : r >= .8 ? 2 : r >= .6 ? 1 : 0;
        if (st > 0) { S.done[l.upper] = Math.max(S.done[l.upper] || 0, st); S.unlocked = Math.min(LETTERS.length, Math.max(S.unlocked, i + 2)); touchStreak(); save(); }
        var nx = LETTERS[i + 1];
        return h('div', { class: 'card result' }, h('div', { class: 'score' }, sc + ' / ' + tot), h('div', { class: 'stars' }, stars(st)),
          h('p', null, st > 0 ? 'அருமை! ' + (nx ? nx.upper + nx.lower + ' திறந்தது.' : 'A–Z முடிந்தது!') : 'மீண்டும் முயலுங்கள்.'),
          h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: words }, 'வார்த்தைகள்'), h('button', { class: 'btn alt', onclick: quiz }, 'மீண்டும்'),
            st > 0 && nx && (i + 1) < S.unlocked ? h('a', { class: 'btn', href: '#/letter/' + nx.upper }, 'அடுத்தது →') : h('a', { class: 'btn', href: '#/learn' }, 'கற்க')));
      }));
    }
  }

  // ===================== CATEGORY LESSON =====================
  function catLesson(id, n) {
    var ch = CHUNKS['c:' + id + ':' + n]; if (!ch) { location.hash = '#/learn'; return; }
    var box = h('div'); plain({ back: true, title: ch.cat.title }, box);
    words();
    function words() {
      var list = h('div', { class: 'words' });
      ch.words.forEach(function (w) {
        var fb = h('div', { class: 'fb' }), mic = h('button', { class: 'mic' }, '🎤 சொல்');
        mic.onclick = function () { sayIt(w.word, fb, mic); };
        list.append(h('div', { class: 'wcard' }, h('div', { class: 'pic', onclick: function () { sayWord(w.word); } }, img(w.word)),
          h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'w' }, w.word), h('div', { class: 'ipa' }, w.ipa), h('div', { class: 'ta' }, w.tamil),
            h('div', { class: 'row', style: 'margin-top:6px' }, h('button', { class: 'btn alt sm', onclick: function () { sayWord(w.word); } }, '🔊'), mic), fb)));
      });
      box.replaceChildren(h('h1', { class: 'h1' }, ch.cat.icon + ' ' + ch.cat.title + ' ' + (n + 1) + '/' + ch.parts),
        h('p', { class: 'sub' }, ch.cat.tamil), list, h('button', { class: 'btn', style: 'margin-top:12px', onclick: quiz }, 'வினாடி வினா →'));
    }
    function quiz() {
      var qs = []; ch.words.forEach(function (w) { var x = ALLW.filter(function (a) { return a.word === w.word; })[0]; qs.push(makeQ('pic2word', x)); qs.push(makeQ('listen2pic', x)); });
      box.replaceChildren(quizView(shuffle(qs), ch.cat.title, function (sc, tot) {
        var r = sc / tot, st = r >= 1 ? 3 : r >= .8 ? 2 : r >= .6 ? 1 : 0; if (st > 0) { S.done[ch.key] = Math.max(S.done[ch.key] || 0, st); touchStreak(); save(); }
        var nk = 'c:' + id + ':' + (n + 1);
        return h('div', { class: 'card result' }, h('div', { class: 'score' }, sc + ' / ' + tot), h('div', { class: 'stars' }, stars(st)),
          h('p', null, st > 0 ? 'அருமை!' : 'மீண்டும் முயலுங்கள்.'),
          h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: words }, 'வார்த்தைகள்'), h('button', { class: 'btn alt', onclick: quiz }, 'மீண்டும்'),
            st > 0 && CHUNKS[nk] ? h('a', { class: 'btn', href: '#/cat/' + id + '/' + (n + 1) }, 'அடுத்தது →') : h('a', { class: 'btn', href: '#/learn' }, 'கற்க')));
      }));
    }
  }

  // ===================== QUIZ ENGINE =====================
  function dW(w, n) { return pick(ALLW.filter(function (x) { return x.word !== w.word; }), n).map(function (x) { return x.word; }); }
  function dL(c, n) { return pick(LETTERS.map(function (l) { return l.upper; }).filter(function (u) { return u !== c; }), n); }
  function makeQ(type, w) {
    if (type === 'first') { var c = w.word.charAt(0).toUpperCase(); return { type: type, w: w, prompt: 'இந்த வார்த்தை எந்த எழுத்தில் தொடங்குகிறது?', opts: shuffle([c].concat(dL(c, 2))), answer: c }; }
    var opts = shuffle([w.word].concat(dW(w, 2)));
    if (type === 'listen2pic') return { type: type, w: w, prompt: 'கேளுங்கள். எந்தப் படம்?', opts: opts, answer: w.word };
    return { type: 'pic2word', w: w, prompt: 'இது என்ன?', opts: opts, answer: w.word };
  }
  function buildTest(pool, n) { var types = ['pic2word', 'listen2pic', 'first'], qs = [], o = []; while (qs.length < n) { if (!o.length) o = shuffle(pool); qs.push(makeQ(types[Math.floor(Math.random() * types.length)], o.pop())); } return qs; }
  function quizView(qs, title, finish) {
    var n = 0, sc = 0, box = h('div', { class: 'q' });
    function next() {
      if (n >= qs.length) { box.replaceChildren(finish(sc, qs.length)); return; }
      var q = qs[n], optsEl = h('div', { class: 'opts' + (q.type === 'listen2pic' ? ' pics' : '') }), bs = [];
      q.opts.forEach(function (o) { var b = h('button', { class: 'opt', 'data-v': o }, q.type === 'listen2pic' ? img(o) : o); b.onclick = function () { choose(b, o); }; bs.push(b); optsEl.append(b); });
      function choose(b, o) { bs.forEach(function (x) { x.disabled = true; if (x.getAttribute('data-v') === q.answer) x.classList.add('ok'); }); if (o === q.answer) sc++; else b.classList.add('bad'); n++; setTimeout(next, 950); }
      box.replaceChildren(h('div', { class: 'pbar' }, h('div', { style: 'width:' + Math.round(n / qs.length * 100) + '%' })),
        h('div', { class: 'center' }, h('span', { class: 'chip' }, title + ' · ' + (n + 1) + '/' + qs.length)),
        h('div', { class: 'prompt' }, q.prompt),
        q.type === 'listen2pic' ? h('div', { class: 'center' }, h('button', { class: 'btn alt sm', onclick: function () { sayWord(q.answer); } }, '🔊 மீண்டும் கேள்')) : h('div', { class: 'pimg' }, img(q.w.word)),
        optsEl);
      if (q.type === 'listen2pic') sayWord(q.answer);
    }
    next(); return box;
  }

  // ===================== TESTS =====================
  function touchStreak() { var t = dstr(new Date()); if (S.last === t) return; S.streak = S.last === dstr(new Date(Date.now() - 864e5)) ? S.streak + 1 : 1; S.last = t; }
  function record(kind, sc, tot) { S.tests.unshift({ t: kind, d: dstr(new Date()), s: sc, n: tot }); S.tests = S.tests.slice(0, 40); touchStreak(); save(); }
  function testsTab() {
    shell('tests', {}, [
      h('h1', { class: 'h1' }, 'தேர்வுகள்'),
      h('p', { class: 'sub' }, 'உங்கள் முன்னேற்றத்தைச் சோதியுங்கள்.'),
      h('div', { class: 'list' },
        testCard('📅', 'தினசரி தேர்வு', '10 கேள்வி · ஒரு பாடம் முடிந்தால்', '#/test/daily', false),
        testCard('🏆', 'வார இறுதித் தேர்வு', '20 கேள்வி · 3 பாடம் முடிந்தால்', !S.premium ? '#/plans' : '#/test/weekend', !S.premium),
        testCard('🎯', 'நிலை தேர்வு', 'உங்களுக்கு ஏற்ற எழுத்துகளைத் திற', '#/placement', false)),
      h('div', { class: 'sec-t' }, 'முன்னேற்றம்'),
      h('div', { class: 'card' },
        prow('எழுத்துகள் முடிந்தது', letterDone() + ' / 26'),
        prow('நட்சத்திரங்கள்', totalStars() + ''),
        prow('தொடர் நாட்கள்', S.streak + '')),
      h('div', { class: 'sec-t' }, 'சமீபத்திய தேர்வுகள்'),
      S.tests.length ? h('div', { class: 'list' }, S.tests.slice(0, 8).map(function (t) {
        return h('div', { class: 'lrow' }, h('div', { class: 'th', style: 'font-size:22px' }, '📝'), h('div', { class: 't' }, h('b', null, t.t), h('span', null, t.d)), h('b', { style: 'color:var(--brand)' }, t.s + '/' + t.n));
      })) : h('div', { class: 'card center', style: 'color:var(--muted)' }, 'இன்னும் தேர்வு இல்லை.')
    ]);
  }
  function testCard(ic, t, s, href, locked) {
    return h('a', { class: 'lrow', href: href, style: 'text-decoration:none;color:inherit' },
      h('div', { class: 'th', style: 'font-size:24px' }, ic), h('div', { class: 't' }, h('b', null, t), h('span', null, s)), h('div', { class: 'go' }, locked ? '👑' : '›'));
  }
  function prow(a, b) { return h('div', { style: 'display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line)' }, h('span', { style: 'color:var(--muted)' }, a), h('b', null, b)); }
  function testScreen(kind, count, minL) {
    var pool = ALLW.filter(function (w) { return learned(w.word); }), box = h('div');
    plain({ back: true, title: kind }, box);
    if (Object.keys(S.done).length < minL) { box.replaceChildren(h('div', { class: 'card center' }, h('h1', { class: 'h1' }, kind + ' தேர்வு'), h('p', { class: 'sub' }, 'முதலில் ' + minL + ' பாடம் முடியுங்கள்.'), h('a', { class: 'btn', href: '#/learn' }, 'கற்க செல்'))); return; }
    box.replaceChildren(quizView(buildTest(pool, count), kind, function (sc, tot) {
      record(kind, sc, tot); var pct = Math.round(sc / tot * 100);
      return h('div', { class: 'card result' }, h('div', { class: 'score' }, sc + ' / ' + tot), h('div', { class: 'stars' }, stars(pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0)),
        h('p', null, pct >= 70 ? 'அருமையான வேலை!' : 'நல்ல முயற்சி. மீண்டும் பயிற்சி செய்யுங்கள்.'),
        h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: function () { testScreen(kind, count, minL); } }, 'மீண்டும்'), h('a', { class: 'btn', href: '#/tests' }, 'முடி')));
    }));
  }
  function placement() {
    var qs = [], box = h('div'); plain({ back: true, title: 'நிலை தேர்வு' }, box);
    for (var k = 0; k < 10; k++) { var li = Math.round(k * 25 / 9); var w = pick(ALLW.filter(function (x) { return x.li === li; }), 1)[0] || pick(ALLW, 1)[0]; qs.push(makeQ(k % 2 ? 'pic2word' : 'first', w)); }
    box.replaceChildren(h('p', { class: 'sub' }, '10 கேள்விகள். உங்களுக்கு ஏற்ற எழுத்துகளைத் திறக்கிறோம்.'),
      quizView(qs, 'நிலை', function (sc, tot) { var un = Math.max(5, Math.round(sc / tot * LETTERS.length)); S.unlocked = Math.max(S.unlocked, un); S.placed = true; save();
        return h('div', { class: 'card result' }, h('div', { class: 'score' }, sc + ' / ' + tot), h('p', null, 'A முதல் ' + LETTERS[S.unlocked - 1].upper + ' வரை திறந்தது.'), h('a', { class: 'btn', href: '#/learn' }, 'கற்க தொடங்கு')); }));
  }

  // ===================== VIDEOS =====================
  function videos() {
    var items = LETTERS.slice(0, 6).map(function (l) { return { t: l.upper + l.lower + ' — எழுத்து வீடியோ', s: l.words.slice(0, 3).map(function (w) { return w.word; }).join(', '), w: l.words[0].word }; });
    items = items.concat([{ t: 'வினைச் சொற்கள் வீடியோ', s: 'run, jump, eat, dance…', w: 'run' }, { t: 'விலங்குகள் வீடியோ', s: 'cat, dog, lion…', w: 'lion' }]);
    shell('videos', {}, [
      h('h1', { class: 'h1' }, 'வீடியோ வகுப்புகள்'),
      h('p', { class: 'sub' }, 'அனிமேஷன் + British ஒலியுடன் பார்த்துக் கற்க.'),
      !S.premium ? h('div', { class: 'banner', style: 'margin-bottom:14px' }, h('div', { class: 'bubble' }), h('h3', null, '👑 Premium தேவை'), h('p', null, 'வீடியோ வகுப்புகளைப் பார்க்க Premium திட்டத்தில் சேருங்கள்.'), h('a', { class: 'pill', href: '#/plans', style: 'text-decoration:none' }, 'திட்டங்கள் →')) : null,
      h('div', { class: 'list' }, items.map(function (it) {
        return h('a', { href: 'javascript:;', style: 'text-decoration:none;color:inherit', onclick: function () { if (!S.premium) { location.hash = '#/plans'; return; } playVideo(it); } },
          h('div', { class: 'lrow' }, h('div', { class: 'th' }, img(it.w)),
            h('div', { class: 't' }, h('b', null, it.t), h('span', null, it.s)),
            h('div', { class: 'go' }, S.premium ? '▶' : '👑')));
      })),
      h('div', { class: 'note' }, 'வீடியோக்கள் இங்கே demo. உண்மையில் YouTube/சர்வரில் ஏற்றி stream செய்யலாம் (ஆப் அளவு சிறியதாக இருக்கும்).')
    ]);
  }
  function playVideo(it) {
    var mask = h('div', { class: 'mask', onclick: function (e) { if (e.target === mask) mask.remove(); } },
      h('div', { class: 'modal' }, h('h3', null, it.t),
        h('div', { style: 'background:#000;border-radius:14px;aspect-ratio:16/9;display:grid;place-items:center;color:#fff' }, h('div', { class: 'pic', style: 'background:transparent' }, img(it.w))),
        h('p', { class: 'sub', style: 'margin-top:10px' }, 'வீடியோ இயக்கி (demo). உண்மையான mp4/YouTube இங்கே இணைக்கப்படும்.'),
        h('button', { class: 'btn', onclick: function () { mask.remove(); } }, 'மூடு')));
    document.body.append(mask);
  }

  // ===================== SENTENCE (preview) =====================
  function sentence() {
    var ex = { pic: 'run', words: ['The', 'boy', 'runs'], ans: 'The boy runs' };
    var box = h('div'); plain({ back: true, title: 'Sentence making' }, box);
    var chosen = [];
    function render() {
      var bank = h('div', { class: 'row' }), line = h('div', { class: 'card', style: 'min-height:48px;display:flex;gap:8px;flex-wrap:wrap;align-items:center' });
      chosen.forEach(function (w, i) { line.append(h('button', { class: 'btn alt sm', onclick: function () { chosen.splice(i, 1); render(); } }, w)); });
      if (!chosen.length) line.append(h('span', { style: 'color:var(--muted)' }, 'வார்த்தைகளைத் தொடுங்கள்…'));
      shuffle(ex.words).forEach(function (w) { if (chosen.indexOf(w) < 0) bank.append(h('button', { class: 'btn sm', style: 'background:#EEF0FB;color:var(--brand)', onclick: function () { chosen.push(w); render(); } }, w)); });
      var ok = chosen.join(' ') === ex.ans;
      box.replaceChildren(h('h1', { class: 'h1' }, 'படம் பார்த்து வாக்கியம் அமை'),
        h('div', { class: 'pic', style: 'width:150px;height:150px;margin:0 auto 12px' }, img(ex.pic)),
        line, h('div', { style: 'height:10px' }), bank,
        chosen.length === ex.words.length ? (ok ? h('div', { class: 'fb ok', style: 'text-align:center;font-size:16px;margin-top:12px' }, '✅ சரி! "' + ex.ans + '"') : h('div', { class: 'fb bad', style: 'text-align:center;margin-top:12px' }, '❌ மீண்டும் முயலுங்கள்')) : null,
        ok ? h('button', { class: 'btn', style: 'margin-top:12px', onclick: function () { sayWord(ex.ans); } }, '🔊 வாக்கியத்தைக் கேள்') : null,
        h('div', { class: 'note' }, 'இது ஒரு எடுத்துக்காட்டு. ஒவ்வொரு வினை/படத்துக்கும் இப்படி வாக்கியப் பயிற்சிகள் சேர்க்கப்படும்.'));
    }
    render();
  }

  // ===================== PLANS / PAYMENT =====================
  function plans() {
    var box = h('div'); plain({ back: true, title: 'Premium' }, box);
    box.replaceChildren(h('div', null,
      h('div', { class: 'banner', style: 'margin-bottom:16px' }, h('div', { class: 'bubble' }), h('h3', null, '👑 தமிழ் நண்பன் Premium'), h('p', null, 'வீடியோ வகுப்புகள் · வார இறுதித் தேர்வு · அனைத்து வார்த்தைப் பொதிகள் · விளம்பரம் இல்லை')),
      S.premium ? h('div', { class: 'card center' }, h('h2', null, '✅ நீங்கள் Premium உறுப்பினர்'), h('p', { class: 'sub' }, 'அனைத்தும் திறந்துள்ளது. நன்றி!'), h('button', { class: 'btn alt', onclick: function () { S.premium = false; save(); route(); } }, 'Demo: Premium நீக்கு')) : [
        plan('இலவசம்', '₹0', ['A–E எழுத்துகள்', 'அடிப்படை வார்த்தைகள்', 'தினசரி தேர்வு'], false, null),
        plan('மாதாந்திரம்', '₹99', ['அனைத்து 26 எழுத்துகள்', 'வீடியோ வகுப்புகள்', 'வார இறுதித் தேர்வு', 'அனைத்து வார்த்தைப் பொதிகள்'], false, { id: 'monthly', amt: 99, label: 'மாதம்' }),
        plan('வருடாந்திரம்', '₹699', ['மாதாந்திரம் அனைத்தும்', '2 மாதம் இலவசம்', 'சிறந்த மதிப்பு'], true, { id: 'yearly', amt: 699, label: 'வருடம்' })
      ],
      h('div', { class: 'note' }, 'பணம் Razorpay (UPI/கார்டு) மூலம். இது demo — உண்மையில் வசூலிக்க Razorpay key + சிறிய backend தேவை (openPay() இல் குறிப்பு).')));
  }
  function plan(name, price, feats, best, buy) {
    return h('div', { class: 'plan' + (best ? ' best' : '') }, best ? h('span', { class: 'tag' }, 'சிறந்தது' ) : null,
      h('div', { class: 'pt' }, name), h('div', { class: 'pr' }, price, buy ? h('small', null, ' / ' + buy.label) : null),
      h('ul', null, feats.map(function (f) { return h('li', null, f); })),
      buy ? h('button', { class: 'btn' + (best ? ' accent' : ''), style: 'margin-top:12px', onclick: function () { openPay(buy); } }, 'இப்போது சேர்') : h('button', { class: 'btn alt', disabled: 'true', style: 'margin-top:12px' }, 'தற்போதைய திட்டம்'));
  }
  function openPay(buy) {
    // === REAL PAYMENT INTEGRATION POINT ===
    // 1) Backend creates a Razorpay order: POST /create-order {amount: buy.amt*100}
    // 2) var rzp = new Razorpay({ key:'rzp_live_xxx', order_id:order.id, amount:buy.amt*100,
    //      currency:'INR', name:'தமிழ் நண்பன் அகாடமி', handler:function(res){ verify on server -> activate } });
    //    rzp.open();
    // Below is a DEMO checkout sheet.
    var mask = h('div', { class: 'mask', onclick: function (e) { if (e.target === mask) mask.remove(); } });
    var modal = h('div', { class: 'modal' },
      h('h3', null, '💳 Razorpay (demo)'),
      h('p', { class: 'sub' }, 'தமிழ் நண்பன் அகாடமி · ' + buy.label + ' திட்டம்'),
      h('div', { style: 'display:flex;justify-content:space-between;font-size:20px;font-weight:800;margin:6px 0 14px' }, h('span', null, 'மொத்தம்'), h('span', null, '₹' + buy.amt)),
      h('div', { class: 'row', style: 'margin-bottom:10px' }, h('button', { class: 'btn alt', style: 'flex:1', onclick: pay }, 'UPI'), h('button', { class: 'btn alt', style: 'flex:1', onclick: pay }, 'கார்டு'), h('button', { class: 'btn alt', style: 'flex:1', onclick: pay }, 'NetBanking')),
      h('button', { class: 'btn accent', onclick: pay }, '₹' + buy.amt + ' செலுத்து'),
      h('button', { class: 'btn ghost', onclick: function () { mask.remove(); } }, 'ரத்து'));
    function pay() { mask.remove(); S.premium = true; S.plan = buy.id; save(); successSheet(); }
    mask.append(modal); document.body.append(mask);
  }
  function successSheet() {
    var mask = h('div', { class: 'mask' });
    mask.append(h('div', { class: 'modal center' }, h('div', { style: 'font-size:54px' }, '🎉'), h('h3', null, 'வெற்றி! Premium செயல்படுத்தப்பட்டது'),
      h('p', { class: 'sub' }, 'அனைத்து வீடியோ, தேர்வு, வார்த்தைப் பொதிகளும் திறந்தன.'),
      h('button', { class: 'btn', onclick: function () { mask.remove(); location.hash = '#/home'; route(); } }, 'தொடங்கு')));
    document.body.append(mask);
  }

  // ===================== PROFILE =====================
  function profile() {
    shell('profile', {}, [
      h('div', { class: 'card', style: 'display:flex;align-items:center;gap:14px' },
        h('div', { style: 'width:60px;height:60px;border-radius:50%;background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;display:grid;place-items:center;font-size:26px;font-weight:800' }, (S.user && S.user.name ? S.user.name[0] : 'ம')),
        h('div', { style: 'flex:1' }, h('b', { style: 'font-size:18px' }, S.user ? S.user.name : 'மாணவர்'), h('div', { style: 'color:var(--muted);font-size:13px' }, '+91 ' + (S.phone || '—')),
          h('span', { class: 'chip', style: 'margin-top:6px' }, S.premium ? '👑 Premium' : 'இலவச திட்டம்'))),
      !S.premium ? h('a', { href: '#/plans', style: 'text-decoration:none' }, h('div', { class: 'banner', style: 'margin:14px 0' }, h('div', { class: 'bubble' }), h('h3', null, '👑 Premium ஆகுங்கள்'), h('p', null, 'அனைத்து வகுப்புகளையும் திறக்க'), h('span', { class: 'pill' }, 'திட்டங்கள் →'))) : null,
      h('div', { class: 'sec-t' }, 'அமைப்புகள்'),
      h('div', { class: 'list' },
        srow('🔔', 'அறிவிப்புகள்', function () { toast('விரைவில்'); }),
        srow('🌐', 'மொழி — தமிழ்', function () { toast('தமிழ்'); }),
        srow('📊', 'என் முன்னேற்றம்', function () { location.hash = '#/tests'; }),
        srow('💬', 'Zoom வகுப்பு நேரம்', function () { toast('ஆசிரியர் விரைவில் தெரிவிப்பார்'); }),
        srow('↩️', 'முன்னேற்றத்தை மீட்டமை', function () { if (confirm('இந்தச் சாதனத்தின் முன்னேற்றம் அழிக்கப்படும்?')) { var u = S.user, p = S.phone, pr = S.premium; S = fresh(); S.user = u; S.phone = p; S.premium = pr; save(); route(); } }),
        srow('🚪', 'வெளியேறு', function () { if (confirm('வெளியேற?')) { S.user = null; save(); route(); } })),
      h('p', { class: 'fine', style: 'margin-top:18px' }, 'தமிழ் நண்பன் அகாடமி · British Spoken English')
    ]);
  }
  function srow(ic, t, fn) { return h('button', { class: 'lrow', style: 'width:100%;text-align:left', onclick: fn }, h('div', { class: 'th', style: 'font-size:20px' }, ic), h('div', { class: 't' }, h('b', null, t)), h('div', { class: 'go' }, '›')); }

  // ===================== ROUTER =====================
  function route() {
    if (!S.user) { authScreen(); return; }
    var p = (location.hash || '#/home').replace('#/', '').split('/');
    var n = p[0] || 'home';
    if (n === 'home') home();
    else if (n === 'learn') learn();
    else if (n === 'videos') videos();
    else if (n === 'tests') testsTab();
    else if (n === 'profile') profile();
    else if (n === 'letter') letter(p[1]);
    else if (n === 'cat') catLesson(p[1], +p[2] || 0);
    else if (n === 'sentence') sentence();
    else if (n === 'plans') plans();
    else if (n === 'placement') placement();
    else if (n === 'test') testScreen(p[1] === 'weekend' ? 'வார இறுதி' : 'தினசரி', p[1] === 'weekend' ? 20 : 10, p[1] === 'weekend' ? 3 : 1);
    else home();
  }
  window.addEventListener('hashchange', route);

  // splash then route
  var sp = h('div', { class: 'splash' }, h('div', { class: 'mark' }, 'த'));
  document.body.append(sp);
  setTimeout(function () { sp.remove(); route(); }, 700);
})();
