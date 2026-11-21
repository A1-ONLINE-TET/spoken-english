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
  function fresh() { return { v: 1, user: null, premium: false, unlocked: 5, done: {}, tests: [], streak: 0, last: '', placed: false, phone: '',
    course: { done: {}, scores: {}, last: '' }, notes: {}, saved: [], review: {}, badges: {}, stats: {}, goal: { mins: 10, day: '', done: 0 }, settings: { rate: .85 }, doubts: [], ui: {}, parent: { phone: '', auto: false, last: '' } }; }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) { var f = fresh(); for (var k in f) if (s[k] === undefined) s[k] = f[k]; return s; } } catch (e) {} return fresh(); }
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
    var p = courseProgress(), nxt = nextUndone(), due = dueCount();
    if (S.goal.day !== today()) { S.goal.day = today(); S.goal.done = 0; save(); }
    var gp = Math.min(100, Math.round((S.goal.done || 0) / (S.goal.mins || 10) * 100));
    checkBadges();
    shell('home', {}, [
      h('h1', { class: 'h1' }, 'வணக்கம், ' + (S.user ? S.user.name : 'நண்பா') + '! 👋'),
      h('p', { class: 'sub' }, 'இன்று கற்போம். ஒவ்வொரு நாளும் ஒரு படி.'),
      h('div', { class: 'row', style: 'margin-bottom:6px' },
        h('span', { class: 'chip' }, '🔥 ' + S.streak + ' நாள்'),
        h('span', { class: 'chip' }, '⭐ ' + totalStars()),
        h('a', { class: 'chip', href: '#/badges', style: 'text-decoration:none' }, '🏆 ' + Object.keys(S.badges).length + ' badges'),
        h('a', { class: 'chip', href: '#/report', style: 'text-decoration:none;background:#E9FBF2;color:#1a7f4b' }, '📲 பெற்றோர் அறிக்கை')),
      h('div', { class: 'card prog', style: 'margin-top:10px' },
        h('div', { class: 'pr-top' }, h('div', null, h('b', null, 'Course முன்னேற்றம்'), h('div', { class: 'muted2' }, p.done + '/' + p.total + ' lessons · ' + COURSE.modules.length + ' modules')), h('div', { class: 'ring', style: '--p:' + p.pct }, h('span', null, p.pct + '%'))),
        h('div', { class: 'pbar' }, h('div', { style: 'width:' + p.pct + '%' })),
        h('div', { class: 'goal' }, h('span', null, '🎯 இன்று: ' + (S.goal.done || 0) + '/' + (S.goal.mins || 10) + ' நிமிடம்'), h('div', { class: 'pbar sm', style: 'flex:1' }, h('div', { style: 'width:' + gp + '%;background:var(--ok)' })))),
      nxt ? h('a', { href: '#/lesson/' + nxt.id, class: 'cont' }, h('div', { class: 'ic' }, typeIcon(nxt.type)),
        h('div', { style: 'flex:1;min-width:0' }, h('small', null, p.done ? 'தொடர்ந்து கற்க' : 'Course-ஐத் தொடங்கு'), h('b', null, nxt.title), h('span', null, 'Module ' + (nxt.mi + 1) + ': ' + nxt.mod.title + ' · ' + nxt.mins + ' நிமிடம்')), h('div', { class: 'go' }, '▶'))
        : h('a', { href: '#/certificate', class: 'cont' }, h('div', { class: 'ic' }, '🎓'), h('div', { style: 'flex:1' }, h('b', null, 'Course முடிந்தது!'), h('span', null, 'சான்றிதழைப் பெறுங்கள்')), h('div', { class: 'go' }, '›')),
      due ? h('a', { href: '#/review', class: 'cont rev' }, h('div', { class: 'ic' }, '🔁'), h('div', { style: 'flex:1' }, h('b', null, due + ' phrases review-க்கு தயார்'), h('span', null, 'Flashcard மீள்பார்வை · 2 நிமிடம்')), h('div', { class: 'go' }, '›')) : null,
      !S.premium ? h('a', { href: '#/plans', style: 'text-decoration:none' }, h('div', { class: 'banner', style: 'margin:14px 0' },
        h('div', { class: 'bubble' }), h('h3', null, '👑 Premium திறக்க'), h('p', null, 'அனைத்து modules · வீடியோ வகுப்புகள் · வார இறுதித் தேர்வு'), h('span', { class: 'pill' }, 'திட்டங்களைப் பார் →'))) : null,
      h('div', { class: 'sec-t' }, 'விரைவு தொடக்கம்'),
      h('div', { class: 'menu' },
        quick('📚', 'Curriculum', COURSE.modules.length + ' modules · ' + p.total + ' lessons', '#/learn', '#EEF0FB', 'var(--brand)'),
        quick('🎤', 'Speaking', 'பேசிப் பயிற்சி', '#/lesson/' + (firstOfType('speaking') || 'm1l1'), '#FFF1E8', 'var(--accent)'),
        quick('🔤', 'எழுத்துகள்', 'A–Z · 325 வார்த்தை', '#/foundation', '#E9FBF2', 'var(--ok)'),
        quick('📝', 'தினசரி தேர்வு', 'இன்றைய பயிற்சி', '#/test/daily', '#F3EEFF', '#7a4bd8')),
      h('div', { class: 'sec-t' }, 'Modules', h('a', { href: '#/learn' }, 'அனைத்தும்')),
      h('div', { class: 'list' }, COURSE.modules.map(function (m, mi) {
        var mp = modProgress(m), locked = !S.premium && mi >= 2;
        return h('a', { class: 'lrow', href: locked ? '#/plans' : '#/learn', style: 'text-decoration:none;color:inherit', onclick: locked ? null : function () { S.ui.openMod = m.id; save(); } },
          h('div', { class: 'th', style: 'font-size:24px' }, m.icon),
          h('div', { class: 't' }, h('b', null, 'Module ' + (mi + 1) + ': ' + m.title), h('span', null, m.tamil + ' · ' + mp.done + '/' + mp.total + ' lessons'), h('div', { class: 'pbar sm', style: 'margin-top:6px' }, h('div', { style: 'width:' + mp.pct + '%' }))),
          h('div', { class: 'go' }, locked ? '👑' : mp.pct === 100 ? '✅' : '›'));
      }))
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

  // ===================== FOUNDATION (letters & word categories) =====================
  function foundation() {
    var g = h('div', { class: 'tiles' });
    LETTERS.forEach(function (l, i) {
      var open = i < S.unlocked, done = S.done[l.upper];
      g.append(h('a', { class: 'tile ' + (done ? 'done' : open ? '' : 'locked'), href: open ? '#/letter/' + l.upper : 'javascript:;', onclick: open ? null : function () { toast('முந்தைய எழுத்தை முடியுங்கள்'); } },
        l.upper + l.lower, h('small', null, done ? stars(done) : open ? '20 சொல்' : '🔒')));
    });
    shell('learn', {}, [
      h('a', { class: 'link', href: '#/learn', style: 'font-size:13px' }, '‹ Course curriculum'),
      h('h1', { class: 'h1' }, 'அடிப்படை — எழுத்துகள் & வார்த்தைகள்'),
      h('p', { class: 'sub' }, 'எழுத்து → ஒலி → வார்த்தை → வாக்கியம். ' + letterDone() + '/26 எழுத்து முடிந்தது.'),
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
      h('div', { class: 'sec-t', style: 'margin-top:4px' }, 'Module quizzes'),
      h('div', { class: 'list' }, LESSONS.filter(function (l) { return l.type === 'quiz'; }).map(function (l) {
        var locked = !S.premium && l.mi >= 2, sc = S.course.scores[l.id];
        return testCard('📝', l.title, l.mod.title + (sc != null ? ' · ' + sc + '%' : '') + (isDone(l.id) ? ' · ✓ Pass' : ''), locked ? '#/plans' : '#/lesson/' + l.id, locked);
      })),
      h('div', { class: 'sec-t' }, 'வார்த்தைத் தேர்வுகள்'),
      h('div', { class: 'list' },
        testCard('📅', 'தினசரி தேர்வு', '10 கேள்வி · ஒரு பாடம் முடிந்தால்', '#/test/daily', false),
        testCard('🏆', 'வார இறுதித் தேர்வு', '20 கேள்வி · 3 பாடம் முடிந்தால்', !S.premium ? '#/plans' : '#/test/weekend', !S.premium),
        testCard('🎯', 'நிலை தேர்வு', 'உங்களுக்கு ஏற்ற எழுத்துகளைத் திற', '#/placement', false)),
      h('div', { class: 'sec-t' }, 'முன்னேற்றம்', h('a', { href: '#/badges' }, '🏆 Badges')),
      h('div', { class: 'card' },
        prow('Course lessons', courseProgress().done + ' / ' + courseProgress().total + ' (' + courseProgress().pct + '%)'),
        prow('எழுத்துகள் முடிந்தது', letterDone() + ' / 26'),
        prow('நட்சத்திரங்கள்', totalStars() + ''),
        prow('தொடர் நாட்கள்', S.streak + ''),
        prow('Badges', Object.keys(S.badges).length + ' / ' + BADGES.length),
        prow('Speaking tasks', (S.stats.spoken || 0) + '')),
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
    var vl = LESSONS.filter(function (l) { return l.type === 'video'; });
    shell('videos', {}, [
      h('h1', { class: 'h1' }, 'வீடியோ வகுப்புகள்'),
      h('p', { class: 'sub' }, 'அனிமேஷன் + British ஒலியுடன் பார்த்துக் கற்க.'),
      !S.premium ? h('div', { class: 'banner', style: 'margin-bottom:14px' }, h('div', { class: 'bubble' }), h('h3', null, '👑 Premium தேவை'), h('p', null, 'அனைத்து வீடியோ வகுப்புகளையும் பார்க்க Premium திட்டத்தில் சேருங்கள்.'), h('a', { class: 'pill', href: '#/plans', style: 'text-decoration:none' }, 'திட்டங்கள் →')) : null,
      vl.length ? h('div', { class: 'sec-t', style: 'margin-top:4px' }, 'Course வீடியோக்கள்') : null,
      vl.length ? h('div', { class: 'list', style: 'margin-bottom:6px' }, vl.map(function (l) {
        var locked = !S.premium && l.mi >= 2;
        return h('a', { class: 'lrow', href: locked ? '#/plans' : '#/lesson/' + l.id, style: 'text-decoration:none;color:inherit' },
          h('div', { class: 'th', style: 'font-size:24px' }, '▶️'),
          h('div', { class: 't' }, h('b', null, l.title), h('span', null, 'Module ' + (l.mi + 1) + ': ' + l.mod.title + ' · ' + l.mins + ' நிமிடம்' + (isDone(l.id) ? ' · ✓' : ''))),
          h('div', { class: 'go' }, locked ? '👑' : '›'));
      })) : null,
      h('div', { class: 'sec-t' }, 'எழுத்து / வார்த்தை வீடியோக்கள்'),
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
      h('div', { class: 'card', style: 'margin-top:12px;display:flex;justify-content:space-around;text-align:center' },
        h('div', null, h('b', { style: 'font-size:20px;color:var(--brand)' }, courseProgress().pct + '%'), h('div', { class: 'muted2' }, 'Course')),
        h('div', null, h('b', { style: 'font-size:20px;color:var(--brand)' }, String(S.streak)), h('div', { class: 'muted2' }, 'நாள் தொடர்')),
        h('div', null, h('b', { style: 'font-size:20px;color:var(--brand)' }, String(Object.keys(S.badges).length)), h('div', { class: 'muted2' }, 'Badges')),
        h('div', null, h('b', { style: 'font-size:20px;color:var(--brand)' }, String(Object.keys(S.review).length)), h('div', { class: 'muted2' }, 'Phrases'))),
      h('div', { class: 'sec-t' }, 'என் கற்றல்'),
      h('div', { class: 'list' },
        srow('🏆', 'Badges & சாதனைகள்', function () { location.hash = '#/badges'; }),
        srow('🎓', 'சான்றிதழ் (Certificate)', function () { location.hash = '#/certificate'; }),
        srow('🔁', 'Flashcard மீள்பார்வை' + (dueCount() ? ' · ' + dueCount() + ' due' : ''), function () { location.hash = '#/review'; }),
        srow('📝', 'என் குறிப்புகள் (Notes)', function () { location.hash = '#/notes'; }),
        srow('📌', 'சேமித்தவை (Bookmarks)', function () { location.hash = '#/saved'; }),
        srow('❓', 'சந்தேகங்கள் (Q&A)', function () { location.hash = '#/doubts'; }),
        srow('📲', 'பெற்றோர் WhatsApp அறிக்கை', function () { location.hash = '#/report'; })),
      h('div', { class: 'sec-t' }, 'அமைப்புகள்'),
      h('div', { class: 'list' },
        srow('⚙️', 'குரல் வேகம் · தினசரி இலக்கு · Backup', function () { location.hash = '#/settings'; }),
        srow('🔔', 'அறிவிப்புகள்', function () { toast('விரைவில்'); }),
        srow('📊', 'என் முன்னேற்றம்', function () { location.hash = '#/tests'; }),
        srow('💬', 'Zoom வகுப்பு நேரம்', function () { toast('ஆசிரியர் விரைவில் தெரிவிப்பார்'); }),
        srow('↩️', 'முன்னேற்றத்தை மீட்டமை', function () { if (confirm('இந்தச் சாதனத்தின் முன்னேற்றம் அழிக்கப்படும்?')) { var u = S.user, p = S.phone, pr = S.premium; S = fresh(); S.user = u; S.phone = p; S.premium = pr; save(); route(); } }),
        srow('🚪', 'வெளியேறு', function () { if (confirm('வெளியேற?')) { S.user = null; save(); route(); } })),
      h('p', { class: 'fine', style: 'margin-top:18px' }, 'தமிழ் நண்பன் அகாடமி · British Spoken English')
    ]);
  }
  function srow(ic, t, fn) { return h('button', { class: 'lrow', style: 'width:100%;text-align:left', onclick: fn }, h('div', { class: 'th', style: 'font-size:20px' }, ic), h('div', { class: 't' }, h('b', null, t)), h('div', { class: 'go' }, '›')); }

  // ===================== COURSE ENGINE (Udemy-style) =====================
  var COURSE = window.COURSE || { title: '', subtitle: '', level: '', learn: [], modules: [] };
  var LESSONS = [];
  COURSE.modules.forEach(function (m, mi) { m.lessons.forEach(function (l, li) { l.mod = m; l.mi = mi; l.li = li; LESSONS.push(l); }); });
  function lessonById(id) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i]; return null; }
  function lessonIndex(id) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return i; return -1; }
  function isDone(id) { return !!S.course.done[id]; }
  function courseProgress() { var d = 0; LESSONS.forEach(function (l) { if (isDone(l.id)) d++; }); return { done: d, total: LESSONS.length, pct: LESSONS.length ? Math.round(d / LESSONS.length * 100) : 0 }; }
  function modProgress(m) { var d = 0; m.lessons.forEach(function (l) { if (isDone(l.id)) d++; }); return { done: d, total: m.lessons.length, pct: m.lessons.length ? Math.round(d / m.lessons.length * 100) : 0 }; }
  function typeIcon(t) { return { phrases: '💬', dialogue: '🗣️', grammar: '📖', video: '▶️', speaking: '🎤', quiz: '📝' }[t] || '📄'; }
  function typeName(t) { return { phrases: 'Phrases', dialogue: 'Dialogue', grammar: 'Grammar', video: 'Video', speaking: 'Speaking', quiz: 'Quiz' }[t] || t; }
  function firstOfType(t) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].type === t) return LESSONS[i].id; return null; }
  function nextUndone() { if (S.course.last) { var i = lessonIndex(S.course.last); for (var k = Math.max(0, i); k < LESSONS.length; k++) if (!isDone(LESSONS[k].id)) return LESSONS[k]; } for (var j = 0; j < LESSONS.length; j++) if (!isDone(LESSONS[j].id)) return LESSONS[j]; return null; }
  function say(text, rate) { speak(text, rate || S.settings.rate || .85); }
  function today() { return dstr(new Date()); }
  function addGoal(mins) { if (S.goal.day !== today()) { S.goal.day = today(); S.goal.done = 0; } S.goal.done = (S.goal.done || 0) + mins; }
  function markDone(l, score) {
    var first = !isDone(l.id);
    S.course.done[l.id] = 1; if (score != null) S.course.scores[l.id] = score; S.course.last = l.id;
    if (first) addGoal(l.mins || 5);
    if (l.type === 'phrases') l.items.forEach(function (it) { var k = l.id + '|' + it.en; if (!S.review[k]) S.review[k] = { due: Date.now() + 864e5, iv: 1, n: 0 }; });
    touchStreak(); checkBadges(); save();
  }
  function playAll(arr) {
    try { speechSynthesis.cancel(); } catch (e) {}
    var i = 0;
    function nx() { if (i >= arr.length) return; var u = new SpeechSynthesisUtterance(arr[i++]); u.lang = 'en-GB'; u.rate = S.settings.rate || .85; var v = speechSynthesis.getVoices().filter(function (x) { return /en[-_]GB/i.test(x.lang); }); if (v[0]) u.voice = v[0]; u.onend = function () { setTimeout(nx, 450); }; speechSynthesis.speak(u); }
    nx();
  }

  // ---- badges ----
  var BADGES = [
    { id: 'first', ic: '🌱', t: 'முதல் பாடம்', d: 'முதல் lesson முடித்தீர்கள்', ok: function () { return courseProgress().done >= 1; } },
    { id: 'five', ic: '🔥', t: '5 பாடங்கள்', d: '5 lessons முடித்தீர்கள்', ok: function () { return courseProgress().done >= 5; } },
    { id: 'module', ic: '🏅', t: 'முதல் Module', d: 'ஒரு module முழுமையாக', ok: function () { return COURSE.modules.some(function (m) { return modProgress(m).pct === 100; }); } },
    { id: 'quiz90', ic: '🎯', t: 'Quiz மாஸ்டர்', d: 'ஒரு quiz-ல் 90%+', ok: function () { for (var k in S.course.scores) { var l = lessonById(k); if (l && l.type === 'quiz' && S.course.scores[k] >= 90) return true; } return false; } },
    { id: 'speak10', ic: '🎤', t: 'பேச்சாளர்', d: '10 முறை மைக்கில் பேசினீர்கள்', ok: function () { return (S.stats.spoken || 0) >= 10; } },
    { id: 'review20', ic: '🔁', t: 'மீள்பார்வை', d: '20 flashcards review', ok: function () { return (S.stats.reviewed || 0) >= 20; } },
    { id: 'streak3', ic: '📅', t: '3 நாள் தொடர்', d: '3 நாள் தொடர்ந்து', ok: function () { return S.streak >= 3; } },
    { id: 'streak7', ic: '🏆', t: '7 நாள் தொடர்', d: 'ஒரு வாரம் தொடர்ந்து', ok: function () { return S.streak >= 7; } },
    { id: 'half', ic: '⭐', t: 'பாதி வழி', d: 'Course 50%', ok: function () { return courseProgress().pct >= 50; } },
    { id: 'grad', ic: '🎓', t: 'பட்டதாரி', d: 'Course 100% — சான்றிதழ்!', ok: function () { return LESSONS.length > 0 && courseProgress().pct === 100; } }
  ];
  function checkBadges() { BADGES.forEach(function (b) { if (!S.badges[b.id] && b.ok()) { S.badges[b.id] = today(); setTimeout(function () { toast(b.ic + ' புதிய Badge: ' + b.t); }, 500); } }); }

  // ---- speaking / pronunciation score ----
  function wordsOf(s) { return norm(s).split(' ').filter(Boolean); }
  function scoreMatch(heard, target) {
    var t = wordsOf(target), hd = wordsOf(heard), used = {}, hit = 0, missed = [];
    t.forEach(function (w) { var i = -1; for (var k = 0; k < hd.length; k++) if (!used[k] && hd[k] === w) { i = k; break; } if (i >= 0) { used[i] = 1; hit++; } else missed.push(w); });
    return { score: t.length ? Math.round(hit / t.length * 100) : 0, missed: missed };
  }
  function listen(target, fb, btn, loose, onDone) {
    if (!SR) { fb.className = 'fb ok'; fb.textContent = 'இந்தச் சாதனத்தில் குரல் சோதனை இல்லை — சத்தமாகச் சொல்லிப் பாருங்கள் 👍'; if (onDone) onDone(null); return; }
    btn.classList.add('on'); fb.className = 'fb'; fb.textContent = '🎙️ கேட்கிறேன்… இப்போது பேசுங்கள்'; var done = false;
    function end(res, err) {
      if (done) return; done = true; btn.classList.remove('on');
      if (res && res.length) {
        var best = null; res.forEach(function (tx) { var r = scoreMatch(tx, target); r.heard = tx; if (!best || r.score > best.score) best = r; });
        if (loose && best.heard) { best.score = Math.max(best.score, 100); best.missed = []; }
        var cls = best.score >= 80 ? 'ok' : best.score >= 50 ? 'mid' : 'bad';
        fb.className = 'fb ' + cls; fb.replaceChildren(
          h('div', { class: 'scorebar' }, h('div', { class: 'sb ' + cls, style: 'width:' + best.score + '%' })),
          h('div', null, h('b', null, best.score + '/100'), ' · கேட்டது: "' + best.heard + '"'),
          best.missed.length ? h('div', { class: 'missed' }, 'மீண்டும் முயற்சி: ' + best.missed.join(', ')) : h('div', null, best.score >= 80 ? '✅ அருமை!' : '👍 நல்ல முயற்சி'));
        S.stats.spoken = (S.stats.spoken || 0) + 1; checkBadges(); save(); if (onDone) onDone(best.score);
      } else if (err === 'not-allowed' || err === 'service-not-allowed') { fb.className = 'fb bad'; fb.textContent = 'மைக் அனுமதி தரவும் (browser address bar-ல்).'; if (onDone) onDone(null); }
      else { fb.className = 'fb bad'; fb.textContent = '❌ கேட்கவில்லை. மீண்டும் முயலுங்கள் (இணையம் + Chrome தேவை).'; if (onDone) onDone(null); }
    }
    try { var r = new SR(); r.lang = 'en-GB'; r.maxAlternatives = 5; r.interimResults = false;
      r.onresult = function (e) { var a = []; for (var k = 0; k < e.results[0].length; k++) a.push(e.results[0][k].transcript); end(a); };
      r.onerror = function (e) { end(null, e.error); }; r.onnomatch = function () { end(null, 'nomatch'); }; r.onend = function () { end(null, 'end'); }; r.start();
    } catch (e) { end(null, 'start'); }
  }

  // ---- bookmarks ----
  function isSaved(type, id) { return S.saved.some(function (s) { return s.type === type && s.id === id; }); }
  function toggleSave(type, id, t, s) { var i = -1; S.saved.forEach(function (x, k) { if (x.type === type && x.id === id) i = k; }); if (i >= 0) { S.saved.splice(i, 1); toast('நீக்கப்பட்டது'); } else { S.saved.unshift({ type: type, id: id, t: t || '', s: s || '' }); toast('🔖 சேமிக்கப்பட்டது'); } save(); }

  // ---- curriculum tab ----
  function courseTab() {
    var p = courseProgress(), nxt = nextUndone();
    shell('learn', {}, [
      h('div', { class: 'course-hero' },
        h('div', { class: 'ch-top' }, h('span', { class: 'chip lv' }, COURSE.level), h('span', { class: 'chip lv' }, COURSE.modules.length + ' modules · ' + LESSONS.length + ' lessons')),
        h('h1', { class: 'h1', style: 'color:#fff' }, COURSE.title), h('p', { class: 'sub', style: 'color:rgba(255,255,255,.85);margin-bottom:4px' }, COURSE.subtitle),
        h('div', { class: 'pbar lt' }, h('div', { style: 'width:' + p.pct + '%' })),
        h('div', { class: 'ch-row' }, h('span', null, p.done + '/' + p.total + ' lessons முடிந்தது'), h('b', null, p.pct + '%'))),
      nxt ? h('a', { href: '#/lesson/' + nxt.id, class: 'cont' }, h('div', { class: 'ic' }, typeIcon(nxt.type)), h('div', { style: 'flex:1;min-width:0' }, h('small', null, p.done ? 'தொடரு' : 'தொடங்கு'), h('b', null, nxt.title), h('span', null, 'Module ' + (nxt.mi + 1) + ' · ' + nxt.mins + ' நிமிடம்')), h('div', { class: 'go' }, '▶'))
        : h('a', { href: '#/certificate', class: 'cont' }, h('div', { class: 'ic' }, '🎓'), h('div', { style: 'flex:1' }, h('b', null, 'Course முடிந்தது!'), h('span', null, 'சான்றிதழைப் பெறுங்கள்')), h('div', { class: 'go' }, '›')),
      h('div', { class: 'row', style: 'margin:12px 0 4px' }, tool('🔁', 'Review', '#/review', dueCount()), tool('🔍', 'தேடு', '#/search'), tool('📌', 'சேமித்தவை', '#/saved'), tool('📝', 'குறிப்புகள்', '#/notes')),
      h('div', { class: 'sec-t' }, 'பாடத்திட்டம் (Curriculum)'),
      h('div', { class: 'curr' }, COURSE.modules.map(function (m, mi) { return moduleBlock(m, mi, !S.premium && mi >= 2); })),
      h('div', { class: 'sec-t' }, 'அடிப்படை (Foundation)'),
      h('a', { class: 'lrow', href: '#/foundation', style: 'text-decoration:none;color:inherit' }, h('div', { class: 'th', style: 'font-size:26px' }, '🔤'), h('div', { class: 't' }, h('b', null, 'எழுத்துகள் A–Z & வார்த்தைப் பிரிவுகள்'), h('span', null, '26 எழுத்து · 325 படங்கள் · 15 பிரிவு · ' + letterDone() + '/26 முடிந்தது')), h('div', { class: 'go' }, '›')),
      h('div', { class: 'sec-t' }, 'இந்த course-ல் கற்பவை'),
      h('div', { class: 'card' }, h('ul', { class: 'learnlist' }, COURSE.learn.map(function (x) { return h('li', null, x); }))),
      h('p', { class: 'fine', style: 'margin-top:14px' }, 'ஆசிரியர்: ' + COURSE.instructor)
    ]);
  }
  function tool(ic, t, href, badge) { return h('a', { class: 'tool', href: href }, h('span', { class: 'ti' }, ic), t, badge ? h('span', { class: 'bdg' }, String(badge)) : null); }
  function moduleBlock(m, mi, locked) {
    var mp = modProgress(m), nx = nextUndone();
    var open = S.ui.openMod ? S.ui.openMod === m.id : (nx ? nx.mod.id === m.id : mi === 0);
    var list = h('div', { class: 'mlist' + (open ? '' : ' hide') }, m.lessons.map(function (l) {
      var d = isDone(l.id);
      return h('a', { class: 'lesson' + (d ? ' done' : ''), href: locked ? '#/plans' : '#/lesson/' + l.id },
        h('span', { class: 'chk' }, d ? '✓' : typeIcon(l.type)),
        h('div', { class: 't' }, h('b', null, l.title), h('span', null, typeName(l.type) + ' · ' + l.mins + ' நிமிடம்' + (S.course.scores[l.id] != null ? ' · ' + S.course.scores[l.id] + '%' : ''))),
        locked ? h('span', { class: 'lk' }, '👑') : null);
    }));
    var car = h('span', { class: 'car' }, open ? '⌃' : '⌄');
    var head = h('button', { class: 'mhead', onclick: function () { var closed = list.classList.toggle('hide'); S.ui.openMod = closed ? '_' : m.id; save(); car.textContent = closed ? '⌄' : '⌃'; } },
      h('span', { class: 'mi' }, m.icon),
      h('div', { class: 't' }, h('b', null, 'Module ' + (mi + 1) + ': ' + m.title), h('span', null, m.tamil + ' · ' + mp.done + '/' + mp.total + (mp.pct === 100 ? ' ✅' : ''))),
      h('div', { class: 'mp' }, h('div', { class: 'pbar sm' }, h('div', { style: 'width:' + mp.pct + '%' }))), car);
    return h('div', { class: 'mod' + (locked ? ' locked' : '') }, head, list, h('a', { class: 'sheetlink', href: '#/sheet/' + m.id }, '📋 Phrase sheet (resources)'));
  }

  // ---- lesson player ----
  function lessonScreen(id) {
    var l = lessonById(id); if (!l) { location.hash = '#/learn'; return; }
    if (!S.premium && l.mi >= 2) { toast('👑 Premium தேவை'); location.hash = '#/plans'; return; }
    var box = h('div'); plain({ back: true, title: 'Module ' + (l.mi + 1) + ' · ' + (l.li + 1) + '/' + l.mod.lessons.length }, box);
    var i = lessonIndex(id), prev = LESSONS[i - 1], next = LESSONS[i + 1];
    S.course.last = id; S.ui.openMod = l.mod.id; save();
    var bm = h('button', { class: 'ibtn', title: 'Bookmark', onclick: function () { toggleSave('lesson', id, l.title, l.mod.title); bm.textContent = isSaved('lesson', id) ? '🔖' : '📑'; } }, isSaved('lesson', id) ? '🔖' : '📑');
    var top = h('div', { class: 'ltop' }, h('span', { class: 'chip' }, typeIcon(l.type) + ' ' + typeName(l.type)), h('span', { class: 'chip' }, '⏱ ' + l.mins + ' நிமிடம்'), isDone(id) ? h('span', { class: 'chip ok' }, '✓ முடிந்தது') : null, h('div', { class: 'sp' }), bm);
    var body = h('div');
    var foot = h('div', { class: 'lfoot' },
      prev ? h('a', { class: 'btn alt sm', href: '#/lesson/' + prev.id }, '‹ முந்தையது') : h('span'),
      l.type !== 'quiz' && l.type !== 'speaking' ? h('button', { class: 'btn sm' + (isDone(id) ? ' alt' : ''), onclick: function () { markDone(l); toast('✅ Lesson முடிந்தது'); lessonScreen(id); } }, isDone(id) ? '✓ முடிந்தது' : 'முடித்தேன் ✓') : null,
      next ? h('a', { class: 'btn sm' + (isDone(id) ? '' : ' alt'), href: '#/lesson/' + next.id }, 'அடுத்தது ›') : h('a', { class: 'btn sm', href: '#/learn' }, 'Curriculum'));
    box.replaceChildren(top, h('h1', { class: 'h1' }, l.title), h('p', { class: 'sub' }, (l.tamil || '') + ' · ' + l.mod.title), body, notesBox(l), foot);
    if (l.type === 'phrases') phrasesView(l, body);
    else if (l.type === 'dialogue') dialogueView(l, body);
    else if (l.type === 'grammar') grammarView(l, body);
    else if (l.type === 'video') videoView(l, body);
    else if (l.type === 'speaking') speakingView(l, body);
    else if (l.type === 'quiz') quizLessonView(l, body);
  }
  function notesBox(l) {
    var ta = h('textarea', { class: 'nta', placeholder: 'இந்த lesson-க்கான உங்கள் குறிப்புகள்… (தானாகச் சேமிக்கப்படும்)' }); ta.value = S.notes[l.id] || '';
    ta.oninput = function () { S.notes[l.id] = ta.value; save(); };
    var wrap = h('div', { class: 'notes' + (S.notes[l.id] ? '' : ' hide') }, ta);
    return h('div', { class: 'nwrap' }, h('button', { class: 'ntog', onclick: function () { wrap.classList.toggle('hide'); if (!wrap.classList.contains('hide')) ta.focus(); } }, '📝 குறிப்புகள் (Notes)' + (S.notes[l.id] ? ' •' : '')), wrap);
  }
  function phrasesView(l, body) {
    var list = h('div', { class: 'words' });
    l.items.forEach(function (it, n) {
      var fb = h('div', { class: 'fb' }), mic = h('button', { class: 'mic' }, '🎤 பேசு');
      mic.onclick = function () { listen(it.en, fb, mic); };
      var k = l.id + '|' + it.en;
      var sv = h('button', { class: 'ibtn', onclick: function () { toggleSave('phrase', k, it.en, it.ta); sv.textContent = isSaved('phrase', k) ? '🔖' : '📑'; } }, isSaved('phrase', k) ? '🔖' : '📑');
      list.append(h('div', { class: 'pcard' }, h('div', { class: 'pn' }, String(n + 1)),
        h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'w' }, it.en), h('div', { class: 'ta' }, it.ta), it.tip ? h('div', { class: 'tip' }, '💡 ' + it.tip) : null,
          h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn alt sm', onclick: function () { say(it.en); } }, '🔊 கேள்'), h('button', { class: 'btn alt sm', onclick: function () { say(it.en, .6); } }, '🐢'), mic, sv), fb)));
    });
    body.replaceChildren(h('div', { class: 'row', style: 'margin-bottom:10px' }, h('button', { class: 'btn sm', onclick: function () { playAll(l.items.map(function (x) { return x.en; })); } }, '▶ அனைத்தையும் கேள்'), h('a', { class: 'btn alt sm', href: '#/flash/' + l.id }, '🃏 Flashcards')), list);
  }
  function dialogueView(l, body) {
    var mode = 'listen', list = h('div', { class: 'dlg' });
    function render() {
      list.replaceChildren();
      l.lines.forEach(function (ln) {
        var mine = (mode === 'B' && ln.w === 'B') || (mode === 'A' && ln.w === 'A');
        var fb = h('div', { class: 'fb' }), mic = h('button', { class: 'mic' }, '🎤 நீங்கள் பேசுங்கள்');
        mic.onclick = function () { listen(ln.en, fb, mic); };
        list.append(h('div', { class: 'bub ' + (ln.w === 'A' ? 'a' : 'b') + (mine ? ' mine' : '') },
          h('div', { class: 'who' }, ln.w === 'A' ? '🧑 A' : '👩 B'), h('div', { class: 'en' }, ln.en), h('div', { class: 'ta' }, ln.ta),
          h('div', { class: 'row', style: 'margin-top:6px' }, h('button', { class: 'btn alt sm', onclick: function () { say(ln.en); } }, '🔊'), mine ? mic : null), fb));
      });
    }
    var tabs = h('div', { class: 'seg' });
    function seg(t, m) { var b = h('button', { class: 'sg' + (mode === m ? ' on' : ''), onclick: function () { mode = m; Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); }); b.classList.add('on'); render(); } }, t); return b; }
    tabs.append(seg('🎧 கேள்', 'listen'), seg('🗣️ நீங்கள் = B', 'B'), seg('🗣️ நீங்கள் = A', 'A'));
    body.replaceChildren(h('div', { class: 'scene' }, '🎬 ' + l.scene), tabs,
      h('div', { class: 'row', style: 'margin:10px 0' }, h('button', { class: 'btn sm', onclick: function () { playAll(l.lines.map(function (x) { return x.en; })); } }, '▶ முழு உரையாடலைக் கேள்')),
      h('p', { class: 'fine', style: 'margin:0 0 8px;text-align:left' }, '"நீங்கள் = B" தேர்ந்தால், B-யின் வரிகளை நீங்கள் மைக்கில் பேசிப் பயிற்சி செய்யலாம்.'), list);
    render();
  }
  function grammarView(l, body) {
    body.replaceChildren(
      h('div', { class: 'gbox' }, h('div', { class: 'gpat' }, l.pattern), h('div', { class: 'gex' }, l.explain.split('\n').map(function (p) { return h('p', null, p || ' '); }))),
      h('div', { class: 'sec-t' }, 'எடுத்துக்காட்டுகள்'),
      h('div', { class: 'words' }, l.examples.map(function (ex) { return h('div', { class: 'pcard', style: 'align-items:center' }, h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'w', style: 'font-size:15px' }, ex.en), h('div', { class: 'ta' }, ex.ta)), h('button', { class: 'btn alt sm', onclick: function () { say(ex.en); } }, '🔊')); })),
      l.mistakes && l.mistakes.length ? h('div', { class: 'sec-t' }, '⚠️ பொதுவான தவறுகள்') : null,
      l.mistakes && l.mistakes.length ? h('div', { class: 'list' }, l.mistakes.map(function (m) { return h('div', { class: 'mis' }, h('div', { class: 'wr' }, '✗ ' + m.wrong), h('div', { class: 'rt' }, '✓ ' + m.right), h('div', { class: 'why' }, m.why)); })) : null);
  }
  function videoView(l, body) {
    // Video sources (any one): src = your uploaded mp4/webm (e.g. 'videos/m1-greetings.mp4' in this repo, or an R2/CDN URL)
    //                          stream = Cloudflare Stream video UID · yt = YouTube video ID
    var frame;
    if (l.src) {
      var v = h('video', { controls: 'true', playsinline: 'true', preload: 'metadata', poster: l.poster || '', style: 'width:100%;height:100%;background:#000' }, h('source', { src: l.src }));
      var speedBtns = h('div', { class: 'row', style: 'margin-top:8px;justify-content:center' }, [0.75, 1, 1.25, 1.5].map(function (r) { return h('button', { class: 'btn alt sm', onclick: function () { v.playbackRate = r; toast('வேகம் ' + r + '×'); } }, r + '×'); }));
      v.onended = function () { if (!isDone(l.id)) { markDone(l); toast('✅ வீடியோ முடிந்தது — lesson complete'); } };
      frame = h('div', null, h('div', { class: 'vid' }, v), speedBtns);
    } else if (l.stream) {
      frame = h('div', { class: 'vid' }, h('iframe', { src: 'https://iframe.videodelivery.net/' + l.stream, allow: 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture', allowfullscreen: 'true', frameborder: '0', title: l.title }));
    } else if (l.yt) {
      frame = h('div', { class: 'vid' }, h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + l.yt + '?rel=0', allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: 'true', frameborder: '0', title: l.title }));
    } else {
      frame = h('div', { class: 'vid ph' }, h('div', { style: 'font-size:46px' }, '🎬'), h('b', null, 'வீடியோ விரைவில்'), h('small', null, 'உங்கள் வீடியோவை videos/ folder-ல் ஏற்றி, js/course.js-ல் இந்த lesson-க்கு src: "videos/பெயர்.mp4" சேர்த்தால் இங்கே play ஆகும். (அல்லது stream: Cloudflare Stream ID / yt: YouTube ID)'));
    }
    body.replaceChildren(frame, l.desc ? h('p', { class: 'sub', style: 'margin-top:12px' }, l.desc) : null,
      l.notes && l.notes.length ? h('div', { class: 'sec-t' }, '📝 முக்கியக் குறிப்புகள்') : null,
      l.notes && l.notes.length ? h('div', { class: 'card' }, h('ul', { class: 'learnlist' }, l.notes.map(function (x) { return h('li', null, x); }))) : null);
  }
  function speakingView(l, body) {
    var scores = [], list = h('div', { class: 'words' });
    var pr = h('div', { class: 'card center', style: 'margin-top:12px;color:var(--muted)' }, 'ஒவ்வொன்றையும் மைக்கில் பேசிப் பாருங்கள்.');
    function prog() {
      var n = scores.filter(function (x) { return x != null; }).length, avg = n ? Math.round(scores.reduce(function (a, b) { return a + (b || 0); }, 0) / n) : 0;
      pr.replaceChildren(h('b', null, n + '/' + l.tasks.length + ' முடிந்தது'), ' · சராசரி ', h('b', { style: 'color:var(--brand)' }, avg + '/100'),
        n === l.tasks.length ? h('div', null, h('button', { class: 'btn', style: 'margin-top:10px', onclick: function () { markDone(l, avg); toast('🎤 Speaking lesson முடிந்தது!'); lessonScreen(l.id); } }, 'முடித்தேன் ✓')) : null);
    }
    l.tasks.forEach(function (t, n) {
      var fb = h('div', { class: 'fb' }), mic = h('button', { class: 'mic' }, '🎤 பேசு'), ans = h('div', { class: 'ta hide', style: 'margin-top:4px' }, '💬 ' + t.en);
      mic.onclick = function () { listen(t.en, fb, mic, t.loose, function (sc) { if (sc != null) { scores[n] = sc; prog(); } }); };
      list.append(h('div', { class: 'pcard' }, h('div', { class: 'pn' }, String(n + 1)),
        h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'w', style: 'font-size:15px' }, t.ta), ans,
          h('div', { class: 'row', style: 'margin-top:8px' }, mic, h('button', { class: 'btn alt sm', onclick: function () { ans.classList.toggle('hide'); } }, '👁 பதில்'), h('button', { class: 'btn alt sm', onclick: function () { say(t.en); } }, '🔊')), fb)));
    });
    body.replaceChildren(h('div', { class: 'note', style: 'margin:0 0 10px' }, '🎤 தமிழ்க் கேள்வியைப் படித்து ஆங்கிலத்தில் பேசுங்கள். Chrome / Android-ல் மைக் அனுமதி தரவும். ' + (isDone(l.id) ? '(ஏற்கனவே முடிந்தது — மீண்டும் பயிற்சி செய்யலாம்)' : '')), list, pr);
  }
  function quizLessonView(l, body) {
    var n = 0, sc = 0, wrongs = [], qs = shuffle(l.qs), box = h('div', { class: 'q' });
    function next() {
      if (n >= qs.length) {
        var pct = Math.round(sc / qs.length * 100), pass = pct >= 70;
        if (pass) markDone(l, pct); else { S.course.scores[l.id] = Math.max(S.course.scores[l.id] || 0, pct); save(); }
        record(l.mod.title + ' quiz', sc, qs.length);
        box.replaceChildren(h('div', { class: 'card result' }, h('div', { class: 'score' }, pct + '%'), h('div', { class: 'stars' }, stars(pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0)),
          h('p', null, pass ? '🎉 Pass! Module quiz முடிந்தது.' : 'Pass ஆக 70% தேவை. விளக்கங்களைப் படித்து மீண்டும் முயலுங்கள்.'),
          wrongs.length ? h('div', { class: 'list', style: 'text-align:left;margin:10px 0' }, wrongs.map(function (w) { return h('div', { class: 'mis' }, h('div', { style: 'font-weight:700' }, w.q), h('div', { class: 'rt' }, '✓ ' + w.opts[w.a]), h('div', { class: 'why' }, w.why)); })) : null,
          h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: function () { quizLessonView(l, body); } }, 'மீண்டும்'), h('a', { class: 'btn', href: '#/learn' }, 'Curriculum')))); return;
      }
      var q = qs[n], bs = [], opts = h('div', { class: 'opts' });
      q.opts.forEach(function (o, oi) { var b = h('button', { class: 'opt' }, o); b.onclick = function () { bs.forEach(function (x, xi) { x.disabled = true; if (xi === q.a) x.classList.add('ok'); }); if (oi === q.a) sc++; else { b.classList.add('bad'); wrongs.push(q); } box.append(h('div', { class: 'why-box' }, (oi === q.a ? '✅ ' : '❌ ') + q.why)); n++; setTimeout(next, 1500); }; bs.push(b); opts.append(b); });
      box.replaceChildren(h('div', { class: 'pbar' }, h('div', { style: 'width:' + Math.round(n / qs.length * 100) + '%' })), h('div', { class: 'center' }, h('span', { class: 'chip' }, (n + 1) + '/' + qs.length)), h('div', { class: 'prompt' }, q.q), opts);
    }
    body.replaceChildren(box); next();
  }

  // ---- flashcards / spaced repetition ----
  function flashView(cards, title, onFinish) {
    var n = 0, box = h('div', { class: 'flash' });
    function render() {
      if (n >= cards.length) { box.replaceChildren(h('div', { class: 'card result' }, h('div', { class: 'score' }, '🎉'), h('p', null, cards.length + ' cards முடிந்தது!'), onFinish ? onFinish() : null)); return; }
      var c = cards[n];
      var card = h('div', { class: 'fcard', onclick: function () { card.classList.toggle('flip'); if (card.classList.contains('flip')) say(c.en); } },
        h('div', { class: 'ff' }, h('div', { class: 'fl' }, 'English'), h('div', { class: 'ft' }, c.en), h('div', { class: 'fh' }, 'தொடவும் → தமிழ் அர்த்தம்')),
        h('div', { class: 'fb2' }, h('div', { class: 'fl' }, 'தமிழ்'), h('div', { class: 'ft' }, c.ta), h('div', { class: 'fh' }, c.en)));
      box.replaceChildren(h('div', { class: 'pbar' }, h('div', { style: 'width:' + Math.round(n / cards.length * 100) + '%' })), h('div', { class: 'center' }, h('span', { class: 'chip' }, title + ' · ' + (n + 1) + '/' + cards.length)), card,
        h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn alt sm', style: 'flex:1', onclick: function () { say(c.en); } }, '🔊'), h('button', { class: 'btn sm badb', style: 'flex:1', onclick: function () { rate(c, false); } }, '😓 கடினம்'), h('button', { class: 'btn sm okb', style: 'flex:1', onclick: function () { rate(c, true); } }, '😊 எளிது')));
    }
    function rate(c, easy) {
      if (c.key) { var r = S.review[c.key] || { iv: 1, n: 0 }; r.n = (r.n || 0) + 1; r.iv = easy ? Math.min(60, Math.round((r.iv || 1) * 2.5)) : 1; r.due = Date.now() + r.iv * 864e5; S.review[c.key] = r; S.stats.reviewed = (S.stats.reviewed || 0) + 1; touchStreak(); checkBadges(); save(); }
      n++; render();
    }
    render(); return box;
  }
  function practiceCards(l) { var box = h('div'); plain({ back: true, title: 'Flashcards' }, box); box.replaceChildren(h('h1', { class: 'h1' }, '🃏 ' + l.title), h('p', { class: 'sub' }, 'Card-ஐத் தொட்டால் திரும்பும். எளிது / கடினம் என்று குறியிடுங்கள்.'), flashView(l.items.map(function (it) { return { en: it.en, ta: it.ta, key: l.id + '|' + it.en }; }), 'Flashcards', function () { return h('a', { class: 'btn', href: '#/lesson/' + l.id }, 'Lesson-க்குத் திரும்பு'); })); }
  function dueCards() { var out = []; for (var k in S.review) { if (S.review[k].due <= Date.now()) { var p = k.split('|'), l = lessonById(p[0]); if (l && l.items) { var it = l.items.filter(function (x) { return x.en === p[1]; })[0]; if (it) out.push({ en: it.en, ta: it.ta, key: k }); } } } return out; }
  function dueCount() { return dueCards().length; }
  function reviewScreen() {
    var box = h('div'); plain({ back: true, title: 'மீள்பார்வை' }, box); var cards = shuffle(dueCards()).slice(0, 20), total = Object.keys(S.review).length;
    if (!cards.length) { box.replaceChildren(h('div', { class: 'card center' }, h('div', { style: 'font-size:48px' }, '🔁'), h('h2', null, 'இன்று review இல்லை'), h('p', { class: 'sub' }, total ? total + ' phrases review-ல் உள்ளன. அடுத்த due நாளுக்குக் காத்திருங்கள் அல்லது புதிய phrases lesson முடியுங்கள்.' : 'Phrases lesson முடித்தால் அவை தானாக இங்கே review-க்கு வரும்.'), h('a', { class: 'btn', href: '#/learn' }, 'Curriculum'))); return; }
    box.replaceChildren(h('h1', { class: 'h1' }, '🔁 Flashcard Review'), h('p', { class: 'sub' }, 'Spaced repetition — எளிது என்றால் பல நாள் கழித்து, கடினம் என்றால் நாளை மீண்டும் வரும்.'), flashView(cards, 'Review', function () { return h('a', { class: 'btn', href: '#/home' }, 'முடி'); }));
  }

  // ---- saved / notes / search ----
  function savedScreen() {
    var box = h('div'); plain({ back: true, title: 'சேமித்தவை' }, box);
    box.replaceChildren(h('h1', { class: 'h1' }, '📌 சேமித்தவை'), h('p', { class: 'sub' }, 'Bookmark செய்த phrases & lessons.'),
      S.saved.length ? h('div', { class: 'list' }, S.saved.map(function (s) { var lid = s.type === 'lesson' ? s.id : s.id.split('|')[0];
        return h('div', { class: 'lrow' }, h('div', { class: 'th', style: 'font-size:22px' }, s.type === 'lesson' ? '📄' : '💬'),
          h('a', { class: 't', href: '#/lesson/' + lid, style: 'text-decoration:none;color:inherit' }, h('b', null, s.t), h('span', null, s.s)),
          s.type === 'phrase' ? h('button', { class: 'btn alt sm', onclick: function () { say(s.t); } }, '🔊') : null,
          h('button', { class: 'ibtn', onclick: function () { toggleSave(s.type, s.id); savedScreen(); } }, '🗑')); }))
      : h('div', { class: 'card center', style: 'color:var(--muted)' }, 'இன்னும் எதுவும் சேமிக்கவில்லை. Lesson-ல் 📑 அழுத்துங்கள்.'));
  }
  function notesScreen() {
    var box = h('div'); plain({ back: true, title: 'குறிப்புகள்' }, box); var ks = Object.keys(S.notes).filter(function (k) { return S.notes[k] && S.notes[k].trim(); });
    box.replaceChildren(h('h1', { class: 'h1' }, '📝 என் குறிப்புகள்'), h('p', { class: 'sub' }, ks.length + ' lessons-ல் குறிப்புகள்'),
      ks.length ? h('div', { class: 'list' }, ks.map(function (k) { var l = lessonById(k); return h('a', { class: 'lrow', href: '#/lesson/' + k, style: 'text-decoration:none;color:inherit;align-items:flex-start' }, h('div', { class: 'th', style: 'font-size:22px' }, '📝'), h('div', { class: 't' }, h('b', null, l ? l.title : k), h('span', { style: 'white-space:pre-wrap' }, S.notes[k].slice(0, 200)))); }))
      : h('div', { class: 'card center', style: 'color:var(--muted)' }, 'Lesson-ல் "📝 குறிப்புகள்" அழுத்தி எழுதுங்கள்.'));
  }
  function searchScreen() {
    var box = h('div'); plain({ back: true, title: 'தேடு' }, box);
    var inp = h('input', { class: 'inp', placeholder: 'phrase, lesson, word… (எ.கா. thank, கடை, apple)' }), res = h('div', { class: 'list', style: 'margin-top:12px' });
    inp.oninput = function () {
      var q = inp.value.trim().toLowerCase(); res.replaceChildren(); if (q.length < 2) return; var out = [];
      LESSONS.forEach(function (l) {
        if ((l.title + ' ' + (l.tamil || '') + ' ' + l.mod.title + ' ' + l.mod.tamil).toLowerCase().indexOf(q) >= 0) out.push({ ic: typeIcon(l.type), t: l.title, s: 'Module ' + (l.mi + 1) + ': ' + l.mod.title, href: '#/lesson/' + l.id });
        (l.items || []).forEach(function (it) { if ((it.en + ' ' + it.ta).toLowerCase().indexOf(q) >= 0) out.push({ ic: '💬', t: it.en, s: it.ta + ' · ' + l.title, href: '#/lesson/' + l.id, say: it.en }); });
        (l.lines || []).forEach(function (it) { if ((it.en + ' ' + it.ta).toLowerCase().indexOf(q) >= 0) out.push({ ic: '🗣️', t: it.en, s: it.ta + ' · ' + l.title, href: '#/lesson/' + l.id, say: it.en }); });
        (l.examples || []).forEach(function (it) { if ((it.en + ' ' + it.ta).toLowerCase().indexOf(q) >= 0) out.push({ ic: '📖', t: it.en, s: it.ta + ' · ' + l.title, href: '#/lesson/' + l.id, say: it.en }); });
      });
      ALLW.forEach(function (w) { if ((w.word + ' ' + w.tamil).toLowerCase().indexOf(q) >= 0) out.push({ ic: '🔤', t: w.word, s: w.tamil + ' · ' + (w.li >= 0 ? 'எழுத்து ' + w.letter : 'வார்த்தைப் பிரிவு'), href: w.li >= 0 ? '#/letter/' + w.letter : '#/foundation', say: w.word }); });
      out.slice(0, 40).forEach(function (r) { res.append(h('div', { class: 'lrow' }, h('div', { class: 'th', style: 'font-size:20px' }, r.ic), h('a', { class: 't', href: r.href, style: 'text-decoration:none;color:inherit' }, h('b', null, r.t), h('span', null, r.s)), r.say ? h('button', { class: 'btn alt sm', onclick: function () { say(r.say); } }, '🔊') : null)); });
      if (!out.length) res.append(h('div', { class: 'card center', style: 'color:var(--muted)' }, 'எதுவும் கிடைக்கவில்லை.'));
      else if (out.length > 40) res.append(h('p', { class: 'fine' }, out.length + ' முடிவுகள் — முதல் 40 காட்டப்படுகிறது'));
    };
    box.replaceChildren(h('h1', { class: 'h1' }, '🔍 தேடு'), h('p', { class: 'sub' }, LESSONS.length + ' lessons · ' + ALLW.length + ' வார்த்தைகளில் தேடுங்கள்'), inp, res); setTimeout(function () { inp.focus(); }, 60);
  }

  // ---- badges / certificate / sheet / Q&A / settings ----
  function badgesScreen() {
    var box = h('div'); plain({ back: true, title: 'Badges' }, box); checkBadges(); var got = Object.keys(S.badges).length;
    box.replaceChildren(h('h1', { class: 'h1' }, '🏆 சாதனைகள்'), h('p', { class: 'sub' }, got + '/' + BADGES.length + ' badges பெற்றீர்கள்'),
      h('div', { class: 'bgrid' }, BADGES.map(function (b) { var ok = !!S.badges[b.id]; return h('div', { class: 'badge' + (ok ? ' on' : '') }, h('div', { class: 'bi' }, b.ic), h('b', null, b.t), h('small', null, ok ? '✓ ' + S.badges[b.id] : '🔒 ' + b.d)); })));
  }
  function certificateScreen() {
    var box = h('div'); plain({ back: true, title: 'சான்றிதழ்' }, box); var p = courseProgress(), name = S.user ? S.user.name : 'மாணவர்';
    if (p.pct < 100) { box.replaceChildren(h('div', { class: 'card center' }, h('div', { style: 'font-size:48px' }, '🎓'), h('h2', null, 'சான்றிதழ் பூட்டப்பட்டுள்ளது'), h('p', { class: 'sub' }, 'Course 100% முடித்தால் உங்கள் பெயரில் சான்றிதழ் கிடைக்கும். இப்போது ' + p.pct + '% (' + p.done + '/' + p.total + ').'), h('div', { class: 'pbar' }, h('div', { style: 'width:' + p.pct + '%' })), h('a', { class: 'btn', style: 'margin-top:12px', href: '#/learn' }, 'தொடர்ந்து கற்க'))); return; }
    var cv = h('canvas', { width: '1200', height: '850', style: 'width:100%;border-radius:14px;box-shadow:var(--shadow)' }); drawCert(cv, name);
    box.replaceChildren(h('h1', { class: 'h1' }, '🎓 வாழ்த்துகள், ' + name + '!'), h('p', { class: 'sub' }, 'Course முழுமையாக முடித்துவிட்டீர்கள்.'), cv,
      h('button', { class: 'btn', style: 'margin-top:12px', onclick: function () { var a = document.createElement('a'); a.download = 'certificate-' + name + '.png'; a.href = cv.toDataURL('image/png'); a.click(); } }, '⬇️ Download (PNG)'),
      navigator.share ? h('button', { class: 'btn alt', style: 'margin-top:8px', onclick: function () { cv.toBlob(function (b) { try { navigator.share({ files: [new File([b], 'certificate.png', { type: 'image/png' })], title: 'My certificate' }).catch(function () {}); } catch (e) { toast('பகிர முடியவில்லை'); } }); } }, '📤 பகிர்') : null);
  }
  function drawCert(cv, name) {
    var c = cv.getContext('2d'), W = cv.width, H = cv.height, g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5B3DF5'); g.addColorStop(1, '#8A6CF6');
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.fillRect(40, 40, W - 80, H - 80); c.strokeStyle = '#F6C343'; c.lineWidth = 6; c.strokeRect(60, 60, W - 120, H - 120);
    c.textAlign = 'center'; c.fillStyle = '#5B3DF5'; c.font = '700 28px "Noto Sans Tamil", sans-serif'; c.fillText('தமிழ் நண்பன் அகாடமி', W / 2, 150);
    c.fillStyle = '#1E2230'; c.font = '800 54px "Baloo 2", sans-serif'; c.fillText('Certificate of Completion', W / 2, 235);
    c.fillStyle = '#6B7280'; c.font = '400 24px "Noto Sans Tamil", sans-serif'; c.fillText('This is to certify that', W / 2, 310);
    c.fillStyle = '#5B3DF5'; c.font = '800 62px "Noto Sans Tamil", "Baloo 2", sans-serif'; c.fillText(name, W / 2, 400);
    c.fillStyle = '#1E2230'; c.font = '400 26px "Noto Sans Tamil", sans-serif'; c.fillText('has successfully completed the course', W / 2, 465);
    c.font = '700 32px "Baloo 2", "Noto Sans Tamil", sans-serif'; c.fillText(COURSE.title, W / 2, 520);
    c.fillStyle = '#6B7280'; c.font = '400 22px sans-serif'; c.fillText(LESSONS.length + ' lessons · ' + COURSE.modules.length + ' modules · ' + COURSE.level, W / 2, 570);
    c.font = '80px sans-serif'; c.fillText('🏅', W / 2, 690);
    c.fillStyle = '#1E2230'; c.font = '400 22px sans-serif'; c.textAlign = 'left'; c.fillText('Date: ' + today(), 120, 740); c.textAlign = 'right'; c.fillText('Tamil Nanban Academy', W - 120, 740);
    c.strokeStyle = '#1E2230'; c.lineWidth = 2; c.beginPath(); c.moveTo(W - 420, 705); c.lineTo(W - 120, 705); c.stroke();
  }
  function sheetScreen(mid) {
    var m = COURSE.modules.filter(function (x) { return x.id === mid; })[0]; if (!m) { location.hash = '#/learn'; return; }
    var box = h('div'), rows = []; plain({ back: true, title: 'Phrase sheet' }, box);
    m.lessons.forEach(function (l) { (l.items || []).forEach(function (it) { rows.push(it); }); (l.lines || []).forEach(function (ln) { rows.push({ en: ln.en, ta: ln.ta }); }); });
    var txt = m.title + ' — ' + m.tamil + '\n\n' + rows.map(function (r) { return r.en + ' — ' + r.ta; }).join('\n');
    box.replaceChildren(h('h1', { class: 'h1' }, '📋 ' + m.title), h('p', { class: 'sub' }, rows.length + ' phrases · download / copy / print செய்து படிக்கலாம்'),
      h('div', { class: 'row', style: 'margin-bottom:12px' },
        h('button', { class: 'btn sm', onclick: function () { var a = document.createElement('a'); a.download = m.id + '-phrases.txt'; a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt); a.click(); } }, '⬇️ .txt'),
        h('button', { class: 'btn alt sm', onclick: function () { try { navigator.clipboard.writeText(txt).then(function () { toast('Copy ஆனது'); }); } catch (e) { toast('Copy முடியவில்லை'); } } }, '📋 Copy'),
        h('button', { class: 'btn alt sm', onclick: function () { window.print(); } }, '🖨 Print'),
        h('button', { class: 'btn alt sm', onclick: function () { playAll(rows.map(function (r) { return r.en; })); } }, '▶ அனைத்தும்')),
      h('div', { class: 'sheet-t' }, rows.map(function (r, i) { return h('div', { class: 'srow' }, h('div', { style: 'flex:1;min-width:0' }, h('b', null, (i + 1) + '. ' + r.en), h('div', { class: 'ta' }, r.ta)), h('button', { class: 'btn alt sm', onclick: function () { say(r.en); } }, '🔊')); })));
  }
  function doubtsScreen() {
    var box = h('div'); plain({ back: true, title: 'Q&A' }, box); var ta = h('textarea', { class: 'nta', placeholder: 'உங்கள் சந்தேகம்… (எ.கா. "Good night" என்று சந்திக்கும்போது சொல்லலாமா?)' });
    function render() {
      box.replaceChildren(h('h1', { class: 'h1' }, '❓ சந்தேகங்கள் (Q&A)'), h('p', { class: 'sub' }, 'Udemy போல — உங்கள் கேள்விகளை எழுதுங்கள், ஆசிரியர் பதில் சொல்வார்.'),
        h('div', { class: 'card' }, ta, h('button', { class: 'btn sm', style: 'margin-top:8px', onclick: function () { var q = ta.value.trim(); if (!q) { toast('கேள்வியை எழுதுங்கள்'); return; } S.doubts.unshift({ q: q, d: today(), a: '' }); save(); ta.value = ''; toast('கேள்வி சேமிக்கப்பட்டது'); render(); } }, 'அனுப்பு')),
        h('div', { class: 'note' }, 'Demo: இப்போது கேள்விகள் இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும். உண்மையில் Firebase-ல் சேமித்து ஆசிரியர் பதில் சொல்லும்படி அமைக்கலாம்.'),
        S.doubts.length ? h('div', { class: 'sec-t' }, 'என் கேள்விகள் (' + S.doubts.length + ')') : null,
        h('div', { class: 'list' }, S.doubts.map(function (d, i) { return h('div', { class: 'card' }, h('b', null, 'Q: ' + d.q), h('div', { class: 'muted2', style: 'margin:4px 0' }, d.d), h('div', { style: 'font-size:13px;color:var(--muted)' }, d.a ? 'A: ' + d.a : '⏳ ஆசிரியர் பதிலுக்குக் காத்திருக்கிறது'), h('button', { class: 'btn ghost sm', style: 'padding-left:0', onclick: function () { S.doubts.splice(i, 1); save(); render(); } }, 'நீக்கு')); })));
    }
    render();
  }
  function settingsScreen() {
    var box = h('div'); plain({ back: true, title: 'அமைப்புகள்' }, box);
    var rate = h('input', { type: 'range', min: '0.5', max: '1.2', step: '0.05', value: String(S.settings.rate || .85), style: 'width:100%' }), rv = h('b', null, (S.settings.rate || .85).toFixed(2) + '×');
    rate.oninput = function () { S.settings.rate = +rate.value; rv.textContent = (+rate.value).toFixed(2) + '×'; save(); };
    var goal = h('input', { type: 'range', min: '5', max: '60', step: '5', value: String(S.goal.mins || 10), style: 'width:100%' }), gv = h('b', null, (S.goal.mins || 10) + ' நிமிடம்');
    goal.oninput = function () { S.goal.mins = +goal.value; gv.textContent = goal.value + ' நிமிடம்'; save(); };
    box.replaceChildren(h('h1', { class: 'h1' }, '⚙️ அமைப்புகள்'),
      h('div', { class: 'card' }, h('div', { class: 'sec-t', style: 'margin:0 0 6px' }, '🔊 குரல் வேகம்', rv), rate, h('button', { class: 'btn alt sm', style: 'margin-top:8px', onclick: function () { say('Good morning! How are you today?'); } }, '▶ சோதனை')),
      h('div', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'sec-t', style: 'margin:0 0 6px' }, '🎯 தினசரி இலக்கு', gv), goal),
      h('div', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'sec-t', style: 'margin:0 0 6px' }, '💾 Backup'), h('p', { class: 'sub' }, 'முன்னேற்றம், குறிப்புகள், bookmarks அனைத்தையும் ஒரு கோப்பாகச் சேமிக்கலாம்.'),
        h('button', { class: 'btn alt sm', onclick: function () { var a = document.createElement('a'); a.download = 'tna-progress-' + today() + '.json'; a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(S)); a.click(); } }, '⬇️ Backup download')));
  }

  // ---- parent report (WhatsApp) ----
  function buildReport() {
    var p = courseProgress(), name = S.user ? S.user.name : 'மாணவர்', quizzes = [], spoken = S.stats.spoken || 0, week = 0, wk = Date.now() - 7 * 864e5;
    LESSONS.forEach(function (l) { if (l.type === 'quiz' && S.course.scores[l.id] != null) quizzes.push(l.mod.title + ': ' + S.course.scores[l.id] + '%'); });
    S.tests.forEach(function (t) { if (new Date(t.d).getTime() >= wk) week++; });
    var mods = COURSE.modules.map(function (m, i) { var mp = modProgress(m); return (mp.pct === 100 ? '✅' : mp.pct > 0 ? '🔄' : '⬜') + ' Module ' + (i + 1) + ' ' + m.title + ' — ' + mp.done + '/' + mp.total; }).join('\n');
    return '📚 *தமிழ் நண்பன் அகாடமி — முன்னேற்ற அறிக்கை*\n' +
      '👤 மாணவர்: ' + name + '\n📅 தேதி: ' + today() + '\n\n' +
      '🎯 Course முன்னேற்றம்: *' + p.pct + '%* (' + p.done + '/' + p.total + ' lessons)\n' +
      '🔥 தொடர் நாட்கள்: ' + S.streak + '\n' +
      '🎤 பேச்சுப் பயிற்சி: ' + spoken + ' முறை\n' +
      '🔤 எழுத்துகள் (A–Z): ' + letterDone() + '/26 · ⭐ ' + totalStars() + '\n' +
      '🏆 Badges: ' + Object.keys(S.badges).length + '/' + BADGES.length + '\n' +
      '📝 இந்த வாரத் தேர்வுகள்: ' + week + '\n\n' +
      '*Modules:*\n' + mods + '\n' +
      (quizzes.length ? '\n*Quiz மதிப்பெண்கள்:*\n' + quizzes.join('\n') + '\n' : '') +
      '\n— தமிழ் நண்பன் அகாடமி 🙏';
  }
  function waLink(phone, text) { var n = (phone || '').replace(/\D/g, ''); if (n.length === 10) n = '91' + n; return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text); }
  function sendParentReportAuto(report) {
    // === AUTOMATIC WHATSAPP INTEGRATION POINT ===
    // Fully automatic sending needs a small backend (Cloudflare Worker) + a WhatsApp Business API provider
    // (MSG91 WhatsApp / Meta Cloud API / Interakt). The worker runs on a cron (e.g. every Sunday 6 pm),
    // reads each student's progress (store it in Firebase/D1), and calls the provider API with an approved template.
    // Client side, you can POST the report to your worker like this:
    //   fetch('https://report.your-worker.workers.dev/send', { method:'POST', headers:{'Content-Type':'application/json'},
    //     body: JSON.stringify({ to: S.parent.phone, student: S.user.name, report: report }) });
    // Until the worker exists, this is a no-op and the app uses the 1-tap WhatsApp share instead.
    return false;
  }
  function reportScreen() {
    var box = h('div'); plain({ back: true, title: 'பெற்றோர் அறிக்கை' }, box);
    var rep = buildReport();
    var ph = h('input', { class: 'inp', type: 'tel', inputmode: 'numeric', placeholder: 'பெற்றோர் WhatsApp எண் (10 இலக்கம்)', value: S.parent.phone || '' });
    ph.oninput = function () { S.parent.phone = ph.value.replace(/\D/g, '').slice(0, 12); save(); };
    var auto = h('input', { type: 'checkbox' }); auto.checked = !!S.parent.auto;
    auto.onchange = function () { S.parent.auto = auto.checked; save(); toast(auto.checked ? 'வாரந்தோறும் auto-report ON (backend இணைத்தபின் செயல்படும்)' : 'Auto-report OFF'); };
    box.replaceChildren(h('h1', { class: 'h1' }, '📲 பெற்றோர் WhatsApp அறிக்கை'), h('p', { class: 'sub' }, 'மாணவரின் முன்னேற்றத்தை பெற்றோருக்கு WhatsApp-ல் அனுப்புங்கள்.'),
      h('div', { class: 'field' }, h('label', null, 'பெற்றோர் WhatsApp எண்'), h('div', { class: 'phone' }, h('input', { class: 'inp cc', value: '+91', readonly: 'true' }), ph)),
      h('div', { class: 'sec-t' }, 'அறிக்கை முன்னோட்டம்'),
      h('div', { class: 'card report' }, rep),
      h('div', { class: 'row', style: 'margin-top:12px' },
        h('button', { class: 'btn', style: 'background:#25D366', onclick: function () { if (!(S.parent.phone || '').length) { toast('பெற்றோர் எண்ணை உள்ளிடுங்கள்'); ph.focus(); return; } S.parent.last = today(); save(); window.open(waLink(S.parent.phone, rep), '_blank'); } }, '📲 WhatsApp-ல் அனுப்பு'),
        h('button', { class: 'btn alt', onclick: function () { try { navigator.clipboard.writeText(rep).then(function () { toast('Copy ஆனது'); }); } catch (e) { toast('Copy முடியவில்லை'); } } }, '📋 Copy'),
        navigator.share ? h('button', { class: 'btn alt', onclick: function () { navigator.share({ text: rep }).catch(function () {}); } }, '📤 பகிர்') : null),
      S.parent.last ? h('p', { class: 'fine' }, 'கடைசியாக அனுப்பியது: ' + S.parent.last) : null,
      h('div', { class: 'sec-t' }, 'Automatic (வாரந்தோறும்)'),
      h('div', { class: 'card' }, h('label', { style: 'display:flex;align-items:center;gap:10px;font-weight:700' }, auto, 'ஒவ்வொரு வாரமும் தானாக அனுப்பு'),
        h('div', { class: 'note' }, 'முழு automatic அனுப்புதலுக்கு WhatsApp Business API (MSG91 WhatsApp / Meta Cloud API) + ஒரு சிறிய Cloudflare Worker (cron) தேவை. app.js-ல் sendParentReportAuto() என்ற இடத்தில் இணைக்கும் குறிப்பு உள்ளது. அது இணைந்ததும் இந்த toggle செயல்படும்; இப்போது மேலே உள்ள 1-tap WhatsApp பட்டன் வேலை செய்யும்.')));
  }

  // ===================== ROUTER =====================
  function route() {
    if (!S.user) { authScreen(); return; }
    var p = (location.hash || '#/home').replace('#/', '').split('/');
    var n = p[0] || 'home';
    if (n === 'home') home();
    else if (n === 'learn') courseTab();
    else if (n === 'foundation') foundation();
    else if (n === 'lesson') lessonScreen(p[1]);
    else if (n === 'flash') { var fl = lessonById(p[1]); if (fl) practiceCards(fl); else courseTab(); }
    else if (n === 'review') reviewScreen();
    else if (n === 'saved') savedScreen();
    else if (n === 'notes') notesScreen();
    else if (n === 'search') searchScreen();
    else if (n === 'badges') badgesScreen();
    else if (n === 'certificate') certificateScreen();
    else if (n === 'sheet') sheetScreen(p[1]);
    else if (n === 'doubts') doubtsScreen();
    else if (n === 'settings') settingsScreen();
    else if (n === 'report') reportScreen();
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
