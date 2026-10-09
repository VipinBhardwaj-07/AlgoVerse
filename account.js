/* AlgoVerse — shared helpers for profile.html / settings.html / support.html
   Uses the same localStorage keys as the main site:
     algoVerseUsers            { [email]: { name, password } }
     algoVerseCurrentUser      "email"
     algoVerseProfile_<email>  profile object
     algoVerseSettings_<email> settings object (new)
*/
(function () {
  'use strict';
  const K = { users: 'algoVerseUsers', current: 'algoVerseCurrentUser', profile: 'algoVerseProfile_', settings: 'algoVerseSettings_' };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { toast('Could not save — your browser storage may be full or blocked.', 'err'); return false; }
  }

  const DEFAULT_SETTINGS = {
    privacy: { visibility: 'public', showEmail: false, showLocation: true, showProgress: true, leaderboard: true, analytics: true },
    notifications: { product: true, reminders: true, weekly: true, marketing: false, security: true, frequency: 'daily' },
    preferences: { language: 'en', fontSize: 'medium', reduceMotion: false, theme: 'dark', editorTheme: 'dark' }
  };

  const Account = {
    $, $$, read, write,
    email() { return localStorage.getItem(K.current) || ''; },
    users() { return read(K.users, {}); },
    saveUsers(u) { return write(K.users, u); },
    user() { return Account.users()[Account.email()] || null; },
    profile() { return read(K.profile + Account.email(), {}); },
    saveProfile(p) { return write(K.profile + Account.email(), p); },
    settings() {
      const s = read(K.settings + Account.email(), {});
      return {
        privacy: Object.assign({}, DEFAULT_SETTINGS.privacy, s.privacy),
        notifications: Object.assign({}, DEFAULT_SETTINGS.notifications, s.notifications),
        preferences: Object.assign({}, DEFAULT_SETTINGS.preferences, s.preferences)
      };
    },
    saveSettings(s) { return write(K.settings + Account.email(), s); },
    displayName() {
      const p = Account.profile(), u = Account.user();
      return (p.name || (u && u.name) || Account.email().split('@')[0] || 'User').trim();
    },
    initial() { return (Account.displayName().charAt(0) || 'U').toUpperCase(); },
    logout() { localStorage.removeItem(K.current); location.href = 'index.html'; },
    deleteAccountData() {
      const e = Account.email();
      const users = Account.users(); delete users[e]; Account.saveUsers(users);
      localStorage.removeItem(K.profile + e); localStorage.removeItem(K.settings + e);
      localStorage.removeItem(K.current);
    },
    esc(str) { return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    safeUrl(u) {
      if (!u) return '';
      const t = String(u).trim();
      try { const url = new URL(/^https?:\/\//i.test(t) ? t : 'https://' + t); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch (e) { return ''; }
    }
  };

  /* ---------- toast ---------- */
  function toast(msg, type) {
    let host = $('.toast-host');
    if (!host) { host = document.createElement('div'); host.className = 'toast-host'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    const t = document.createElement('div'); t.className = 'toast ' + (type || 'ok'); t.textContent = msg; host.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 320); }, 3200);
  }
  Account.toast = toast;

  /* ---------- modal ---------- */
  Account.openModal = function (id) { const m = $('#' + id); if (!m) return; m.classList.add('show'); const f = m.querySelector('input,button.primary,button'); if (f) setTimeout(() => f.focus(), 30); };
  Account.closeModal = function (id) { const m = $('#' + id); if (m) m.classList.remove('show'); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.ac-modal.show').forEach(m => m.classList.remove('show')); });
  document.addEventListener('click', e => { if (e.target.classList && e.target.classList.contains('ac-modal')) e.target.classList.remove('show'); });

  /* ---------- top bar user chip ---------- */
  Account.mountTopbar = function () {
    const slot = $('#topbarUser'); if (!slot) return;
    if (!Account.email()) { slot.innerHTML = '<a class="ac-link-btn" href="index.html">Sign in</a>'; return; }
    const p = Account.profile();
    slot.innerHTML = '<a class="ac-link-btn" href="profile.html" aria-label="My profile">' +
      (p.profileImage ? '<img alt="" src="' + Account.esc(p.profileImage) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover">' : '<span style="width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#00e5c0,#7c3aed);color:#071019;font-weight:800;font-size:.8rem">' + Account.esc(Account.initial()) + '</span>') +
      '<span class="lbl">' + Account.esc(Account.displayName().split(/\s+/)[0]) + '</span></a>';
  };

  /* ---------- auth gate: pages needing a login ---------- */
  Account.requireLogin = function (mainSelector) {
    Account.mountTopbar();
    if (Account.email() && Account.user()) return true;
    const main = $(mainSelector); if (main) main.hidden = true;
    const g = document.createElement('div'); g.className = 'ac-gate ac-card';
    g.innerHTML = '<div class="big" aria-hidden="true">🔐</div><h1 class="ac-page-title">Sign in to continue</h1><p class="ac-page-sub" style="margin:0 auto 1.2rem">You need to be signed in to view this page.</p><a class="ac-btn primary" href="index.html">Go to AlgoVerse</a>';
    document.querySelector('.ac-wrap').appendChild(g);
    return false;
  };

  /* ---------- apply saved preferences on every account page ---------- */
  Account.applyPreferences = function () {
    if (!Account.email()) return;
    const pref = Account.settings().preferences;
    const sizes = { small: '15px', medium: '16px', large: '18px' };
    document.body.style.fontSize = sizes[pref.fontSize] || '16px';
    if (pref.reduceMotion) document.documentElement.classList.add('reduce-motion');
  };

  /* ---------- password helpers ---------- */
  Account.passwordScore = function (pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) s++;
    return Math.min(s, 4);
  };
  Account.wirePwToggles = function () {
    $$('.ac-pw button').forEach(b => b.addEventListener('click', () => {
      const i = b.parentElement.querySelector('input'); const show = i.type === 'password'; i.type = show ? 'text' : 'password';
      b.textContent = show ? '🙈' : '👁️'; b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    }));
  };

  /* ---------- image → square data URL (keeps localStorage small) ---------- */
  Account.imageToDataUrl = function (file, size) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) return reject(new Error('Please choose a PNG, JPG, WEBP or GIF image.'));
      if (file.size > 8 * 1024 * 1024) return reject(new Error('Image is too large (max 8 MB).'));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Could not read that file.'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('That file is not a valid image.'));
        img.onload = () => {
          const c = document.createElement('canvas'); c.width = c.height = size || 256;
          const side = Math.min(img.width, img.height), sx = (img.width - side) / 2, sy = (img.height - side) / 2;
          c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.85));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  };

  Account.download = function (filename, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime || 'application/json' }));
    a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  window.Account = Account;
  document.addEventListener('DOMContentLoaded', () => { Account.mountTopbar(); Account.applyPreferences(); });
})();
