/* ════════════════════════════════════════
   WORLD TRAVELER  —  Main App Logic
   ════════════════════════════════════════ */

// ── Telegram WebApp init ─────────────────
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#f7f8fc');
  tg.setBackgroundColor('#f7f8fc');
}

// ── State ────────────────────────────────
let selected     = new Set();    // selected country codes+names (key = code)
let activeRegion = 'all';
let searchQuery  = '';
let openedCountry = null;

// ── DOM refs ─────────────────────────────
const grid        = document.getElementById('countryGrid');
const selBar      = document.getElementById('selectionBar');
const selFlags    = document.getElementById('selFlags');
const selCount    = document.getElementById('selCount');
const searchInput = document.getElementById('searchInput');
const regionTabs  = document.getElementById('regionTabs');

// Modals
const countryModal   = document.getElementById('countryModal');
const resultsModal   = document.getElementById('resultsModal');
const confirmModal   = document.getElementById('confirmModal');
const successScreen  = document.getElementById('successScreen');

// ── Helpers ──────────────────────────────
const photoUrl = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&q=75&auto=format&fit=crop`;

const flagUrl = (code) =>
  `https://flagcdn.com/w80/${code}.png`;

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Stable colour from string (for avatars)
const hashColor = (str) => {
  const colours = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444'];
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return colours[h % colours.length];
};

// ── Render grid ──────────────────────────
function renderGrid() {
  const query   = searchQuery.toLowerCase();
  const filtered = COUNTRIES_UNIQUE.filter(c => {
    if (activeRegion !== 'all' && c.region !== activeRegion) return false;
    if (query && !c.name.toLowerCase().includes(query) &&
        !c.nameEn.toLowerCase().includes(query)) return false;
    return true;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>Страны не найдены</p>
      </div>`;
    return;
  }

  filtered.forEach((country, i) => {
    const card = document.createElement('div');
    card.className = 'country-card' + (selected.has(country.code) ? ' selected' : '');
    card.dataset.code = country.code;
    card.style.animationDelay = `${Math.min(i * 18, 300)}ms`;

    card.innerHTML = `
      <div class="card-circle">
        <img
          src="${photoUrl(country.photo)}"
          alt="${country.nameEn}"
          loading="lazy"
          onerror="this.src='${flagUrl(country.code)}'"
        />
        <div class="card-check">✓</div>
      </div>
      <span class="card-name">${country.emoji} ${country.name}</span>
    `;

    card.addEventListener('click', () => onCardClick(country, card));
    grid.appendChild(card);
  });
}

// ── Card click ───────────────────────────
function onCardClick(country, card) {
  // Short tap = toggle; hold would open detail (handled via pointerdown duration)
  toggleCountry(country, card);
}

function toggleCountry(country, card) {
  const wasSelected = selected.has(country.code);

  if (wasSelected) {
    selected.delete(country.code);
    card?.classList.remove('selected');
  } else {
    selected.add(country.code);
    card?.classList.add('selected');

    // Ripple animation
    card?.classList.add('ripple');
    setTimeout(() => card?.classList.remove('ripple'), 600);

    // Haptic
    tg?.HapticFeedback?.impactOccurred('light');
  }

  updateSelectionBar();
}

// ── Selection bar ─────────────────────────
function updateSelectionBar() {
  const count = selected.size;
  const visible = count > 0;

  selBar.classList.toggle('visible', visible);

  const n = count === 1 ? 'страна' : count < 5 ? 'страны' : 'стран';
  selCount.textContent = `${count} ${n}`;

  // Show up to 5 mini flag circles
  selFlags.innerHTML = '';
  const codes = [...selected].slice(0, 5);
  codes.forEach(code => {
    const c = COUNTRIES_UNIQUE.find(x => x.code === code);
    if (!c) return;
    const el = document.createElement('div');
    el.className = 'sel-flag-item';
    el.innerHTML = `<img src="${flagUrl(code)}" alt="${c.name}" />`;
    selFlags.appendChild(el);
  });
  if (count > 5) {
    const more = document.createElement('div');
    more.className = 'sel-flag-item';
    more.style.cssText = 'background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#6b7280';
    more.textContent = `+${count - 5}`;
    selFlags.appendChild(more);
  }
}

// ── Open country detail ──────────────────
function openCountryModal(country) {
  openedCountry = country;

  document.getElementById('modalPhoto').src    = photoUrl(country.photo);
  document.getElementById('modalFlag').textContent     = country.emoji;
  document.getElementById('modalCountryName').textContent = country.name;
  document.getElementById('modalCapital').textContent  = `🏛️ ${country.capital}`;
  document.getElementById('modalFact').textContent     = country.fact;

  refreshToggleBtn();
  countryModal.classList.remove('hidden');
}

function refreshToggleBtn() {
  if (!openedCountry) return;
  const isSelected = selected.has(openedCountry.code);
  const btn  = document.getElementById('btnToggleCountry');
  const icon = document.getElementById('toggleIcon');
  const text = document.getElementById('toggleText');

  btn.className = `btn-toggle-country ${isSelected ? 'remove' : 'add'}`;
  icon.textContent = isSelected ? '❌' : '✅';
  text.textContent = isSelected ? 'Убрать из списка' : 'Добавить в мой список';
}

// ── Results modal ─────────────────────────
async function openResultsModal() {
  resultsModal.classList.remove('hidden');
  const body = document.getElementById('resultsBody');
  body.innerHTML = '<div class="results-loading">Загрузка результатов…</div>';

  try {
    const data = await fetchResults();
    renderResults(data);
  } catch {
    body.innerHTML = '<div class="results-loading">Нет данных — вы будете первым! 🚀</div>';
  }
}

async function fetchResults() {
  const API = getApiBase();
  const res = await fetch(`${API}/results`);
  if (!res.ok) throw new Error('no data');
  return res.json();
}

function renderResults(data) {
  const body = document.getElementById('resultsBody');
  if (!data.length) {
    body.innerHTML = '<div class="results-loading">Пока никто не поделился. Будьте первым! 🌍</div>';
    return;
  }

  body.innerHTML = '';
  data.forEach(entry => {
    const initials = (entry.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-user">
        <div class="result-avatar" style="background:${hashColor(entry.name || '?')}">${initials}</div>
        <div>
          <div class="result-name">${escHtml(entry.name || 'Путешественник')}</div>
          <div class="result-date">${timeAgo(entry.ts)}</div>
        </div>
      </div>
      <div class="result-countries">
        ${entry.countries.map(c =>
          `<span class="result-country-tag">${c.emoji} ${c.name}</span>`
        ).join('')}
      </div>
    `;
    body.appendChild(card);
  });
}

// ── Confirm & publish ─────────────────────
function openConfirmModal() {
  if (selected.size === 0) return;

  const preview = document.getElementById('confirmPreview');
  preview.innerHTML = '';

  [...selected].forEach(code => {
    const c = COUNTRIES_UNIQUE.find(x => x.code === code);
    if (!c) return;
    const tag = document.createElement('span');
    tag.className = 'confirm-tag';
    tag.textContent = `${c.emoji} ${c.name}`;
    preview.appendChild(tag);
  });

  confirmModal.classList.remove('hidden');
}

async function publishResults() {
  confirmModal.classList.add('hidden');

  const countries = [...selected].map(code => {
    return COUNTRIES_UNIQUE.find(c => c.code === code);
  }).filter(Boolean);

  const user = tg?.initDataUnsafe?.user;
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : 'Путешественник';

  const payload = {
    name,
    telegramId: user?.id,
    initData: tg?.initData || '',
    countries: countries.map(c => ({ code: c.code, name: c.name, emoji: c.emoji })),
  };

  try {
    const API = getApiBase();
    await fetch(`${API}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // offline — still show success
  }

  // Show success screen
  showSuccess(countries);

  // Tell Telegram bot to post the result
  if (tg) {
    const text = `🌍 ${name} побывал(а) в ${countries.length} странах:\n` +
      countries.map(c => `${c.emoji} ${c.name}`).join(' · ');
    tg.sendData(JSON.stringify({ action: 'submit', countries: payload.countries }));
  }
}

function showSuccess(countries) {
  const flags = document.getElementById('successFlags');
  flags.innerHTML = '';
  countries.slice(0, 20).forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'success-flag';
    s.textContent = c.emoji;
    s.style.animationDelay = `${i * 60}ms`;
    flags.appendChild(s);
  });

  successScreen.classList.remove('hidden');
  tg?.HapticFeedback?.notificationOccurred('success');
}

// ── Utils ────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'только что';
  if (m < 60) return `${m} мин. назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч. назад`;
  return `${Math.floor(h / 24)} дн. назад`;
}

function getApiBase() {
  return window.TRAVEL_API_BASE || '/api';
}

// ── Long-press to open detail ─────────────
let pressTimer = null;
grid.addEventListener('pointerdown', e => {
  const card = e.target.closest('.country-card');
  if (!card) return;
  pressTimer = setTimeout(() => {
    pressTimer = null;
    const code = card.dataset.code;
    const country = COUNTRIES_UNIQUE.find(c => c.code === code);
    if (country) openCountryModal(country);
  }, 500);
});
grid.addEventListener('pointerup',    () => clearTimeout(pressTimer));
grid.addEventListener('pointerleave', () => clearTimeout(pressTimer));
grid.addEventListener('pointermove',  () => clearTimeout(pressTimer));

// ── Event listeners ──────────────────────
regionTabs.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  activeRegion = tab.dataset.region;
  renderGrid();
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  renderGrid();
});

// Country modal controls
document.getElementById('modalClose').addEventListener('click', () =>
  countryModal.classList.add('hidden'));
document.getElementById('modalBackdrop').addEventListener('click', () =>
  countryModal.classList.add('hidden'));
document.getElementById('btnToggleCountry').addEventListener('click', () => {
  if (!openedCountry) return;
  toggleCountry(openedCountry, grid.querySelector(`[data-code="${openedCountry.code}"]`));
  refreshToggleBtn();
});

// Submit button
document.getElementById('btnSubmit').addEventListener('click', openConfirmModal);

// Confirm modal
document.getElementById('confirmBackdrop').addEventListener('click', () =>
  confirmModal.classList.add('hidden'));
document.getElementById('btnCancel').addEventListener('click', () =>
  confirmModal.classList.add('hidden'));
document.getElementById('btnPublish').addEventListener('click', publishResults);

// Results modal
document.getElementById('btnResults').addEventListener('click', openResultsModal);
document.getElementById('resultsBackdrop').addEventListener('click', () =>
  resultsModal.classList.add('hidden'));
document.getElementById('resultsClose').addEventListener('click', () =>
  resultsModal.classList.add('hidden'));

// Success
document.getElementById('btnCloseSuccess').addEventListener('click', () => {
  successScreen.classList.add('hidden');
  tg?.close();
});

// ── Splash → App ─────────────────────────
setTimeout(() => {
  document.getElementById('splash').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderGrid();
}, 1300);
