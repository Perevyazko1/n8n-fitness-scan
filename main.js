// === Конфиг ===
// Новый Django-API (переезд с n8n-вебхуков). Пути те же, префикс /webhook → /api.
const API_BASE = 'https://n8n-fitness.ru/api';
const WEBHOOK_URL = `${API_BASE}/scan-barcode`;
// Диплинк в чат Telegram-бота Рыжа (PRO-ассистент живёт там, а не в Mini App).
// TODO: вписать настоящий username бота вместо плейсхолдера.
const RYZH_BOT_URL = 'https://t.me/'; // TODO: 'https://t.me/<bot_username>'

// === Telegram WebApp ===
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // disableVerticalSwipes — защита от случайного свайпа-вниз (закрытия) при скролле.
  // Всё под optional-chaining — на старых клиентах просто игнор.
  try { tg.disableVerticalSwipes?.(); } catch {}
}
const INIT_DATA = tg?.initData || '';

// === Тема (light/dark) ===
// Источник истины — сервер (Profile.theme), но мгновенно применяем из localStorage,
// чтобы не было вспышки светлой темы до загрузки дашборда.
const THEME_BG = { light: '#FBF4EA', dark: '#15161B' };
function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('ryzh-theme', t); } catch {}
  // Бренд фиксирует свой цвет шапки/фона под тему (тему Telegram игнорируем).
  try { tg?.setHeaderColor?.(THEME_BG[t]); } catch {}
  try { tg?.setBackgroundColor?.(THEME_BG[t]); } catch {}
}
try { applyTheme(localStorage.getItem('ryzh-theme') || 'light'); } catch { applyTheme('light'); }

// Крутим иконку обновления во время загрузки.
function setRefreshing(btnId, on) { const b = $(btnId); if (b) b.classList.toggle('spinning', on); }

// === Состояние ===
let codeReader = null;
let scanning = false;
let currentProduct = null;   // { name, brand, kcal100, p100, f100, c100, default_serving_g }
let currentBarcode = null;
let currentTab = null;       // dashboard | foodlog | ryzhai | workout | scanner
let lastKcalTarget = null;   // дневная норма ккал из дашборда — для бюджета на экране «Еда»

// === UI helpers ===
const $ = id => document.getElementById(id);
const screens = {
  dashboard: $('dashboard'), foodlog: $('foodlog'), workout: $('workout'),
  scanner: $('scanner'), card: $('card'), notfound: $('notfound'), manual: $('manual'),
  addproduct: $('addproduct'), pickproduct: $('pickproduct'), logfood: $('logfood'), editfood: $('editfood'), exform: $('exform'),
  prodform: $('prodform'), manualfood: $('manualfood'),
  blockform: $('blockform'),
  settings: $('settings'), reggate: $('reggate'), ryzhai: $('ryzhai'), docview: $('docview'),
  progress: $('progress'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// === Линейные иконки (бренд Cream, без эмодзи) ===
// Общий набор — из ryzh-icons.js (подключён в index.html). Локальный iconSvg —
// тонкая обёртка над ryzhIcon(), чтобы все вызовы получили полный набор иконок
// (meal/home/scan/lock/trophy/settings/chevron*/sparkles/crown/mic/send + базовые).
function iconSvg(name, size = 22, fill = false) {
  return ryzhIcon(name, { size, fill });
}
function pluralDays(n) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return 'дней';
  if (b > 1 && b < 5) return 'дня';
  if (b === 1) return 'день';
  return 'дней';
}

function showStatus(text, isError = false, timeout = 2500) {
  const el = $('status');
  el.innerHTML = text; // допускаем простой HTML (для спиннера)
  el.classList.remove('hidden', 'error');
  if (isError) el.classList.add('error');
  if (timeout) setTimeout(() => el.classList.add('hidden'), timeout);
}

// === Общий клиент к n8n (GET-семантика поверх POST) ===
// text/plain намеренно — чтобы не было CORS preflight (OPTIONS).
// initData шлём всегда — на стороне n8n по нему валидируется и достаётся chat_id.
async function api(path, payload = {}) {
  const r = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ initData: INIT_DATA, ...payload }),
  });
  let data = null;
  try { data = await r.json(); } catch {}
  // доступ к приложению закрыт владельцем → экран-блок
  if (r.status === 403 && data && data.error === 'not_registered') {
    showRegGate();
    throw new Error('not_registered');
  }
  if (!r.ok) throw new Error((data && data.error) || ('HTTP ' + r.status));
  return data;
}

function showRegGate() {
  const tb = document.getElementById('tabbar');
  if (tb) tb.style.display = 'none';
  const idEl = document.getElementById('reg-id');
  if (idEl) idEl.textContent = tg?.initDataUnsafe?.user?.id || '—';
  showScreen('reggate');
}

// === Онбординг: пока профиль не заполнен — держим на Настройках ===
let onboarding = false;

async function boot() {
  try {
    const d = await api('profile');
    if (d && d.complete === false) { startOnboarding(); return; }
  } catch (e) {
    if (e.message === 'not_registered') return;   // забанен → reggate уже показан
    // прочие ошибки сети не блокируют — пустим на главную
  }
  goTab('dashboard');
}

function startOnboarding() {
  onboarding = true;
  const tb = document.getElementById('tabbar');
  if (tb) tb.style.display = 'none';
  openSettings();
}

function endOnboarding() {
  onboarding = false;
  const tb = document.getElementById('tabbar');
  if (tb) tb.style.display = '';
  goTab('dashboard');
}

// === Навигация по вкладкам ===
function goTab(name) {
  if (onboarding) return;   // во время онбординга навигация заблокирована
  if (name !== currentTab) tg?.HapticFeedback?.selectionChanged?.();
  currentTab = name;
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === name));

  if (name === 'scanner') {
    startScanner();           // сам вызовет showScreen('scanner')
    return;
  }
  stopScanner();              // уходим с камеры — гасим её
  showScreen(name);
  if (name === 'dashboard') loadDashboard();
  if (name === 'ryzhai') renderRyzhAi();
  if (name === 'workout') { wktEdit = false; setWktMode('train'); }
  if (name === 'foodlog') setFoodMode('diary');
}

// === Дашборд (Фаза 1) ===
async function loadDashboard() {
  $('dash-loading').classList.remove('hidden');
  $('dash-error').classList.add('hidden');
  $('dash-content').classList.add('hidden');
  setRefreshing('dash-refresh', true);
  try {
    const d = await api('dashboard');
    if (d.ok === false) {
      const msg = d.error === 'no_profile'
        ? 'Профиль не заполнен. Заполни его через бота — и здесь появятся цели и расход.'
        : ('Не удалось загрузить: ' + (d.error || 'unknown'));
      throw new Error(msg);
    }
    renderDashboard(d);
    $('dash-loading').classList.add('hidden');
    $('dash-content').classList.remove('hidden');
  } catch (e) {
    $('dash-loading').classList.add('hidden');
    const box = $('dash-error');
    box.textContent = e.message || 'Ошибка загрузки';
    box.classList.remove('hidden');
  } finally {
    setRefreshing('dash-refresh', false);
  }
}

function pct(part, whole) {
  if (!whole || whole <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(part / whole * 100)));
}

function setStreak(id, s) {
  const el = $(id);
  if (!el) return;
  const cur = (s && s.current) || 0;
  const frozen = s && s.status === 'frozen';
  const cold = cur === 0 && !frozen;
  el.querySelector('.streak-num').textContent = cur;
  el.querySelector('.streak-days').textContent = pluralDays(cur);
  el.querySelector('.streak-flame').innerHTML = frozen ? iconSvg('snowflake', 15) : iconSvg('flame', 15, !cold);
  const cap = el.querySelector('.streak-cap');
  if (cap) {
    const label = el.dataset.label || '';
    cap.textContent = frozen ? 'серия под угрозой' : cold ? 'серия прервана' : `серия · ${label}`;
  }
  el.classList.toggle('cold', cold);       // нет серии — приглушённо
  el.classList.toggle('frozen', !!frozen); // заморожена — под угрозой
}

// Кольцо калорий: дуга = доля съеденного, перебор красит в danger.
function setCalRing(eaten, target) {
  const arc = $('cal-arc');
  if (!arc) return;
  const c = 2 * Math.PI * 59.5;            // r=59.5 в SVG
  const over = (eaten || 0) > (target || 0);
  const p = target > 0 ? Math.max(0, Math.min(1, eaten / target)) : 0;
  arc.style.strokeDasharray = `${(c * p).toFixed(1)} ${c.toFixed(1)}`;
  arc.style.stroke = over ? 'var(--danger)' : 'var(--accent)';
}

// Эмоция лиса на СЕГОДНЯ (поверх тира тела). Пока один сет: 'hungry' | 'normal'.
// Ничего не залогировано за день → голодный/усталый; поел → обычный (довольный) вид.
function foxMood(d) {
  const k = d.kcal || {};
  if ((k.eaten || 0) <= 0) return 'hungry';
  return 'normal';
}

// Голос Рыжа — одна живая строка по состоянию дня. На каждый слот — пара фраз,
// одна из которых подставляется случайно (чтобы Рыж не повторялся).
const pickPhrase = (a, b) => (Math.random() < 0.5 ? a : b);
function ryzhVoice(d) {
  const st = d.streaks || {}, k = d.kcal || {}, w = d.workout_today || {};
  const n = st.nutrition || {}, ws = st.workout || {}, av = d.avatar || {};
  const mTier = av.muscle_tier ?? 0, bTier = av.belly_tier ?? 0;
  const left = Math.round(k.left ?? 0);
  const frozen = n.status === 'frozen' || ws.status === 'frozen';
  if ((k.eaten || 0) <= 0) return pickPhrase(
    'Урчит в животе! Закинь, что съел сегодня — и я приободрюсь.',
    'Я голодный как волк… ну, как лис. Запиши первый приём — оживу.');
  if (frozen) return pickPhrase(
    'Серия висит на волоске — отметься, пока я не покрылся инеем.',
    'Ещё чуть-чуть и серия замёрзнет. Залогируй — спасём её.');
  if ((ws.current || 0) >= 14) return `Тренируемся ${ws.current} дней подряд — мышцы прут, я в топ-форме!`;
  if (bTier >= 2) return 'Последние дни перебор — я нагулял бочок. Давай аккуратнее, и он сдуется.';
  if (mTier >= 3) return 'Мышцы в тонусе — держим режим, красавчик!';
  if ((n.current || 0) >= 7) return `Питание под контролем уже ${n.current} дней — так и держим!`;
  if (left < 0) return pickPhrase(
    `Перебрали на ${-left} ккал — бывает. Завтра подровняем, я рядом.`,
    `На ${-left} ккал больше плана. Не страшно — держим курс дальше.`);
  if (w.is_workout && w.done) return pickPhrase(
    'Тренировка в кармане, питание в норме — ты сегодня машина!',
    'Зал закрыт, еда под контролем. Горжусь, честно.');
  if (left > 0) return pickPhrase(
    `В запасе ещё ${left} ккал — идём ровно, не сбавляй.`,
    `Осталось ${left} ккал на день. Темп отличный, продолжаем.`);
  return pickPhrase(
    'Всё идёт как надо — так и держим, командир.',
    'Двигаемся по плану. Ты молодец, я доволен.');
}

// Статус лиса на сегодня → кольцо/бейдж медальона (см. .hero-fox.s-*):
// risk — стрик под угрозой (заморожен); lost — перебор по ккал; win — трен закрыта + поел; иначе норма.
function foxStatus(d) {
  const st = d.streaks || {}, k = d.kcal || {}, w = d.workout_today || {};
  const left = Math.round(k.left ?? 0);
  const frozen = (st.nutrition && st.nutrition.status === 'frozen')
              || (st.workout && st.workout.status === 'frozen');
  if (frozen) return 'risk';
  if (left < 0) return 'lost';
  if (w.is_workout && w.done && (k.eaten || 0) > 0) return 'win';
  return 'normal';
}

// Реплика Рыжа в комикс-облаке (без префикса «Рыж:» — облако и так «от лиса»).
function setHeroBubble(text) {
  const el = $('hero-bubble-text');
  if (el) el.textContent = text || '';
  $('hero-bubble')?.classList.remove('open');
}

function renderDashboard(d) {
  $('dash-date').textContent = d.date || '';

  // Тема: сервер — источник истины; синхронизируем, если разошлось с локальным кэшем.
  if (d.prefs && d.prefs.theme) {
    const srv = d.prefs.theme === 'dark' ? 'dark' : 'light';
    if (document.documentElement.dataset.theme !== srv) applyTheme(srv);
  }

  // --- Маскот-лис: тир тела (мышцы×живот) + эмоция + статус дня ---
  // Тело: fox_m{мышцы}_b{живот}.png; голодный сет (_hungry) — когда за день не ел.
  // Статус (кольцо/бейдж медальона): норма / стрик под угрозой / цель закрыта / срыв.
  const av = d.avatar || {};
  const m = av.muscle_tier ?? 2, b = av.belly_tier ?? 1;  // дефолт — середина
  const mood = foxMood(d);          // 'hungry' | 'normal' — арт тела
  const status = foxStatus(d);      // 'normal' | 'risk' | 'win' | 'lost' — кольцо/бейдж
  const fox = $('fox-avatar');
  if (fox) {
    fox.onerror = null;          // не прячем и не откатываем — пусть будет битая, если арта нет
    fox.style.display = '';
    fox.src = mood === 'hungry'
      ? `img/fox_m${m}_b${b}_hungry.png`
      : `img/fox_m${m}_b${b}.png`;
  }
  // статус → класс на .hero-fox (цвет кольца + тинт арта)
  const heroFox = $('hero-fox');
  if (heroFox) {
    heroFox.classList.remove('s-risk', 's-win', 's-lost');
    if (status !== 'normal') heroFox.classList.add('s-' + status);
  }
  // бейдж на медальоне: риск — снежинка (синяя), цель закрыта — кубок (зелёный)
  const badge = $('fox-badge');
  if (badge) {
    badge.classList.remove('risk', 'win');
    if (status === 'risk') { badge.classList.add('risk'); badge.innerHTML = iconSvg('snowflake', 19); badge.classList.remove('hidden'); }
    else if (status === 'win') { badge.classList.add('win'); badge.innerHTML = iconSvg('trophy', 19); badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); badge.innerHTML = ''; }
  }

  // --- Голос Рыжа в комикс-облаке --- (приоритет — фраза с бэка; ryzhVoice — фолбэк)
  setHeroBubble(d.ryzh_says || ryzhVoice(d));

  // --- Серии ---
  const st = d.streaks || {};
  setStreak('streak-nutrition', st.nutrition);
  setStreak('streak-workout', st.workout);

  // --- Тренировка (карточка-ссылка на вкладку «Трен») ---
  const w = d.workout_today || {};
  if (w.is_workout) {
    $('wk-ico').innerHTML = iconSvg(w.done ? 'check' : 'dumbbell', 24);
    $('wk-title').textContent = w.done ? 'Тренировка выполнена' : 'Сегодня тренировка';
    $('wk-sub').textContent = w.label || '';
  } else {
    $('wk-ico').innerHTML = iconSvg('leaf', 24);
    $('wk-title').textContent = 'Сегодня отдых';
    $('wk-sub').textContent = (w.days_until_next != null)
      ? `Следующая тренировка через ${w.days_until_next} дн` : '';
  }

  // --- Калории (кольцо + легенда) ---
  const k = d.kcal || {};
  lastKcalTarget = Math.round(k.target || 0) || null;   // кэш для бюджета на «Еде»
  const left = Math.round(k.left ?? 0);
  const over = left < 0;
  $('kcal-left').textContent = over ? -left : left;
  $('kcal-left').classList.toggle('over', over);
  $('kcal-cap').textContent = over ? 'перебор, ккал' : 'осталось, ккал';
  setCalRing(k.eaten || 0, k.target || 0);
  $('kcal-eaten').textContent = `${Math.round(k.eaten || 0)} ккал`;
  $('kcal-target').textContent = `${Math.round(k.target || 0)} ккал`;

  // --- Макросы ---
  setMacro('protein', d.protein, 'г');
  setMacro('fat', d.fat, 'г');
  setMacro('carbs', d.carbs, 'г');

  // --- Карточка недельного дефицита ---
  renderWeeklyCard(d.weekly);

  // --- Счётчик воды ---
  renderWaterCard(d.water);
}

function renderWaterCard(w) {
  if (!w) return;
  const ml = w.ml || 0, target = w.target_ml || 2000;
  $('water-val').textContent = `${(ml / 1000).toFixed(1)} / ${(target / 1000).toFixed(1)} л`;
  $('water-bar').style.width = Math.min(100, target ? ml / target * 100 : 0) + '%';
}

async function logWater(delta) {
  try {
    const res = await api('log-water', { delta });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.impactOccurred?.('light');
    renderWaterCard(res);   // ответ содержит {ml, target_ml}
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 2500);
  }
}

// Goal-aware подпись недельного баланса. lose: «+» = дефицит (хорошо); gain: «−» = профицит
// (хорошо); maintain: ближе к нулю — лучше. total = Σ(цель−съедено) по залогированным дням.
function weeklyWord(goal) {
  if (goal === 'gain') return 'профицит';
  if (goal === 'maintain') return 'баланс';
  return 'дефицит';
}

function renderWeeklyCard(wk) {
  if (!wk) return;
  const total = Math.round(wk.total || 0);
  const word = weeklyWord(wk.goal);
  $('weekly-title').textContent = `За неделю · ${word}`;
  if (!wk.logged_days) {
    $('weekly-sub').textContent = 'Нет залогированных дней за неделю';
    return;
  }
  const sign = total > 0 ? '+' : '';
  $('weekly-sub').textContent =
    `${sign}${total} ккал за ${wk.logged_days} ${pluralDays(wk.logged_days)} · ~${wk.avg > 0 ? '+' : ''}${wk.avg}/день`;
}

function setMacro(key, m, unit) {
  m = m || {};
  const eaten = round(m.eaten || 0), target = Math.round(m.target || 0);
  $('bar-' + key).style.width = pct(eaten, target) + '%';
  $('val-' + key).textContent = target ? `${eaten} / ${target}${unit}` : `${eaten}${unit}`;
}

// === Рыж AI (подписка PRO) ===
// Чата в Mini App НЕТ — ассистент живёт в чате Telegram-бота. Здесь только пейволл
// + переход в чат. Цены/триал — плейсхолдеры (TODO заменить на реальные).
let aiPlan = 'year';

function renderRyzhAi() {
  // TODO: когда бэк начнёт отдавать статус подписки (напр. d.prefs.pro) — читать его тут.
  const pro = false;
  $('ai-paywall').classList.toggle('hidden', pro);
  $('ai-subscribed').classList.toggle('hidden', !pro);
}

function setAiPlan(plan) {
  aiPlan = plan;
  document.querySelectorAll('#ai-plans .plan-row').forEach(r =>
    r.classList.toggle('active', r.dataset.plan === plan));
  tg?.HapticFeedback?.selectionChanged?.();
}

function aiSubscribe() {
  // TODO: здесь подключить реальную оплату по плану `aiPlan`. Пока — показываем
  // экран «PRO активен» с переходом в чат бота (где и живёт ассистент).
  $('ai-paywall').classList.add('hidden');
  $('ai-subscribed').classList.remove('hidden');
  tg?.HapticFeedback?.notificationOccurred?.('success');
}

function openRyzhBot() {
  try {
    if (tg?.openTelegramLink) tg.openTelegramLink(RYZH_BOT_URL);
    else window.open(RYZH_BOT_URL, '_blank');
  } catch { window.open(RYZH_BOT_URL, '_blank'); }
}

// Инфо-страницы (политика/оферта/тарифы/поддержка) открываем ВНУТРИ аппа: тянем
// контент тех же .html (единый источник, они же — публичные ссылки для банка) и
// показываем как обычный экран. Без внешнего браузера.
const DOC_TITLES = {
  'pricing.html': 'Тарифы',
  'terms.html': 'Пользовательское соглашение',
  'privacy.html': 'Политика конфиденциальности',
  'support.html': 'Поддержка',
};
let docReturn = 'settings';   // куда вернуться по «назад» из docview

async function openDoc(page) {
  if (!page) return;
  page = page.split(/[?#]/)[0];
  // запоминаем экран, с которого открыли (профиль / пейволл), — для «назад»
  const cur = document.querySelector('.screen.active');
  if (cur && cur.id !== 'docview') docReturn = cur.id;
  $('docview-title').textContent = DOC_TITLES[page] || 'Документ';
  const body = $('docview-body');
  body.innerHTML = '<div class="loading">Загрузка…</div>';
  showScreen('docview');
  try {
    const r = await fetch(page, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const html = await r.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const card = doc.querySelector('.doc-card');
    const upd = doc.querySelector('.doc-upd');
    body.innerHTML =
      (upd ? `<div class="docview-upd">${upd.innerHTML}</div>` : '') +
      (card ? `<div class="doc-card">${card.innerHTML}</div>` : html);
    // ссылки внутри документа: на другие .html — открываем тоже в аппе;
    // t.me/tg/mailto/внешние — через нативные методы Telegram.
    body.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (/\.html(\?|#|$)/.test(href)) { openDoc(href); return; }
        try {
          if (/^(https:\/\/t\.me|tg:)/.test(href) && tg?.openTelegramLink) tg.openTelegramLink(href);
          else if (tg?.openLink) tg.openLink(href);
          else window.open(href, '_blank');
        } catch { window.open(href, '_blank'); }
      });
    });
  } catch (e) {
    body.innerHTML = '<div class="error-box">Не удалось загрузить документ. Попробуй позже.</div>';
  }
}

// Преимущества PRO и подсказки «после оформления» — рисуются один раз.
const AI_BENEFITS = [
  { icon: 'check',    title: 'План на каждое утро',     sub: 'Рыж присылает, что съесть и как потренироваться сегодня' },
  { icon: 'mic',      title: 'Надиктуй, что съел',      sub: 'Голосом или текстом — посчитаю калории и КБЖУ сам' },
  { icon: 'leaf',     title: 'Что полезно, что вредно', sub: 'Разберу любой продукт и состав за секунды' },
  { icon: 'repeat',   title: 'Подскажу альтернативы',   sub: 'Заменю вредное на вкусное и полезное' },
  { icon: 'dumbbell', title: 'План тренировок',         sub: 'Составлю под цель и скорректирую на ходу' },
  { icon: 'sparkles', title: 'Любой вопрос 24/7',       sub: 'Питание, тренировки, восстановление — спроси что угодно' },
];
const AI_HINTS = [
  { icon: 'check',    text: 'Утренний план придёт в чат сам' },
  { icon: 'mic',      text: 'Надиктуй голосом, что съел' },
  { icon: 'sparkles', text: 'Спроси что угодно про еду и тренировки' },
];

// Заполнить статичные иконки/списки бренд-набором (один раз при загрузке).
function initStaticUi() {
  if (typeof ryzhIcon !== 'function') return;   // на всякий случай (icons-скрипт не загрузился)
  const pro = () => ryzhIcon('crown', { size: 12 }) + ' PRO';
  // дашборд — карточка «Рыж-тренер»
  $('ai-promo-ico').innerHTML  = ryzhIcon('sparkles', { size: 24, fill: true });
  $('ai-promo-pro').innerHTML  = pro();
  $('ai-promo-chev').innerHTML = ryzhIcon('chevronRight', { size: 20 });
  // еда — кнопки + диктовка
  $('aa-from-ico').innerHTML   = ryzhIcon('meal', { size: 19 });
  $('aa-manual-ico').innerHTML = ryzhIcon('edit', { size: 19 });
  $('dictate-ico').innerHTML   = ryzhIcon('mic', { size: 20 });
  $('dictate-pro').innerHTML   = pro();
  // трен — план с Рыжем
  $('wkt-aiplan-ico').innerHTML = ryzhIcon('sparkles', { size: 20, fill: true });
  $('wkt-aiplan-pro').innerHTML = pro();
  // экран Рыж AI
  $('ai-hero-pro').innerHTML   = pro();
  $('ai-sub-pro').innerHTML    = pro();
  $('ai-subscribe').innerHTML  = ryzhIcon('sparkles', { size: 20, fill: true }) + ' Попробовать Рыж PRO';
  $('ai-openchat').innerHTML   = ryzhIcon('send', { size: 20, fill: true }) + ' Открыть чат с Рыжем';
  $('ai-benefits').innerHTML = AI_BENEFITS.map(bn =>
    `<div class="ai-benefit"><span class="ai-benefit-ico">${ryzhIcon(bn.icon, { size: 21, fill: bn.icon === 'sparkles' })}</span>` +
    `<div><div class="ai-benefit-title">${bn.title}</div><div class="ai-benefit-sub">${bn.sub}</div></div></div>`).join('');
  $('ai-sub-hints').innerHTML = AI_HINTS.map(h =>
    `<div class="ai-sub-hint"><span class="ai-sub-hint-ico">${ryzhIcon(h.icon, { size: 20, fill: h.icon === 'sparkles' })}</span><span>${h.text}</span></div>`).join('');
  // иконки строк «Документы и поддержка»
  document.querySelectorAll('.doc-row [data-ico]').forEach(el =>
    el.innerHTML = ryzhIcon(el.dataset.ico, { size: el.classList.contains('doc-row-ico') ? 19 : 18 }));
  // метка «Скоро» у всех платных мест (оплата пока не подключена)
  const makeSoon = () => { const s = document.createElement('span'); s.className = 'soon-badge'; s.textContent = 'Скоро'; return s; };
  document.querySelectorAll('.pro-badge').forEach(b => {
    if (b.closest('#ai-subscribed')) return;                          // «PRO активен» — не «скоро»
    if (b.nextElementSibling?.classList?.contains('soon-badge')) return;
    b.after(makeSoon());
  });
  document.querySelectorAll('#ai-plans .plan-titlerow').forEach(t => {
    if (!t.querySelector('.soon-badge')) t.appendChild(makeSoon());   // тарифы Год/Месяц
  });
}

// === Настройки (профиль + КБЖУ) ===
// Сегмент-контролы (Пол / Цель)
function segValue(id) { return document.querySelector(`#${id} .seg-btn.active`)?.dataset.val; }
function segSet(id, val) {
  document.querySelectorAll(`#${id} .seg-btn`).forEach(b => b.classList.toggle('active', b.dataset.val === val));
}

// Зеркало backend recalc_targets — чтобы авто-показ нормы совпадал с сервером.
const SET_ACT_BASELINE = { sedentary: 150, light: 250, moderate: 350, active: 500, very: 650 };
const SET_GOAL_MULT = { lose: 0.8, maintain: 1.0, gain: 1.15 };

async function openSettings() {
  showScreen('settings');
  // в онбординге: прячем «назад», показываем подсказку, меняем текст кнопки
  $('set-close').style.display = onboarding ? 'none' : '';
  $('set-onboard-hint').classList.toggle('hidden', !onboarding);
  $('set-save').textContent = onboarding ? 'Сохранить и начать' : 'Сохранить';
  const u = tg?.initDataUnsafe?.user;
  if (u) {
    $('set-name').textContent = u.first_name || 'Профиль';
    const namePart = u.username ? `@${u.username}` : 'Telegram';
    const idPart = u.id ? `ID ${u.id}` : '';
    $('set-username').textContent = [namePart, idPart].filter(Boolean).join(' · ');
  }
  $('set-loading').classList.remove('hidden');
  $('set-content').classList.add('hidden');
  try {
    const d = await api('profile');
    if (d.ok === false) throw new Error(d.error || 'Не удалось загрузить');
    fillSettings(d);
    $('set-loading').classList.add('hidden');
    $('set-content').classList.remove('hidden');
  } catch (e) {
    showStatus('Ошибка: ' + e.message, true, 3000);
    if (onboarding) { $('set-loading').classList.add('hidden'); $('set-content').classList.remove('hidden'); }
    else goTab('dashboard');
  }
}

function fillSettings(d) {
  $('set-height').value = d.height_cm ?? '';
  $('set-weight').value = d.weight_kg ?? '';
  $('set-age').value = d.age ?? '';
  segSet('set-sex-seg', d.sex || 'm');
  $('set-activity').value = d.activity_level || 'moderate';
  segSet('set-goal-seg', d.goal || 'maintain');
  $('set-interval').value = d.training_days_interval ?? 3;   // новым — каждые 3 дня
  $('set-bodyfat').value = d.body_fat_pct ?? '';
  renderTargets(d);
  $('set-auto').checked = true;   // по умолчанию — автоподсчёт
  applyAutoState();
  // преференсы (тема + уведомления) — сервер источник истины, синхронизируем UI
  $('set-notif').checked = d.notifications_enabled !== false;
  const theme = d.theme === 'dark' ? 'dark' : 'light';
  $('set-theme').checked = theme === 'dark';
  applyTheme(theme);
}

function renderTargets(d) {
  $('set-kcal').value = d.target_kcal ?? '';
  $('set-protein').value = d.target_protein_g ?? '';
  $('set-fat').value = d.target_fat_g ?? '';
  $('set-carbs').value = d.target_carbs_g ?? '';
}

function calcNormsLocal() {
  const sex = segValue('set-sex-seg') || 'm';
  const h = Number($('set-height').value) || 0, w = Number($('set-weight').value) || 0, a = Number($('set-age').value) || 0;
  const baseline = SET_ACT_BASELINE[$('set-activity').value] ?? 350;
  const gmult = SET_GOAL_MULT[segValue('set-goal-seg')] ?? 1.0;
  const bmr = Math.round(10 * w + 6.25 * h - 5 * a + (sex === 'm' ? 5 : -161));
  const ref = Math.max(Math.round(bmr * 1.1), Math.round((bmr + baseline) * gmult));
  const tp = Math.round(w * 1.8), tf = Math.round(w * 1.0);
  const tc = Math.max(0, Math.round((ref - tp * 4 - tf * 9) / 4));
  return { kcal: ref, protein: tp, fat: tf, carbs: tc };
}

function refreshNorms() {
  if (!$('set-auto').checked) return;
  const n = calcNormsLocal();
  $('set-kcal').value = n.kcal; $('set-protein').value = n.protein;
  $('set-fat').value = n.fat; $('set-carbs').value = n.carbs;
}

function applyAutoState() {
  const auto = $('set-auto').checked;
  ['set-kcal', 'set-protein', 'set-fat', 'set-carbs'].forEach(id => $(id).disabled = auto);
  $('set-norm-hint').textContent = auto
    ? 'Формула Миффлина — Сан-Жеора по твоим данным. Меняй параметры выше — пересчёт мгновенный.'
    : 'Ручной режим — задай значения сам.';
  if (auto) refreshNorms();
}

function settingsPayload() {
  return {
    height_cm: $('set-height').value, weight_kg: $('set-weight').value, age: $('set-age').value,
    sex: segValue('set-sex-seg') || 'm',
    activity_level: $('set-activity').value,
    goal: segValue('set-goal-seg') || 'maintain',
    training_days_interval: $('set-interval').value,
    body_fat_pct: $('set-bodyfat').value,
  };
}

async function saveSettings() {
  if (onboarding) return onboardingSave();
  const auto = $('set-auto').checked;
  try {
    const payload = settingsPayload();
    if (!auto) Object.assign(payload, {
      target_kcal: Number($('set-kcal').value) || 0,
      target_protein_g: Number($('set-protein').value) || 0,
      target_fat_g: Number($('set-fat').value) || 0,
      target_carbs_g: Number($('set-carbs').value) || 0,
    });
    const res = await api('profile-save', payload);
    if (res.ok === false) throw new Error(res.error || 'fail');
    if (auto) await api('profile-recalc');
    fillSettings(await api('profile'));
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Сохранено ✓', false, 1500);
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// Онбординг: сохранить параметры + посчитать КБЖУ → разблокировать приложение.
async function onboardingSave() {
  const p = settingsPayload();
  if (!p.height_cm || !p.weight_kg || !p.age) { showStatus('Заполни рост, вес и возраст', true); return; }
  try {
    await api('profile-save', p);
    const r = await api('profile-recalc');
    if (r.ok === false) throw new Error(r.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Профиль готов ✓', false, 1200);
    endOnboarding();
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// === Тренировка (Фаза 3) ===
let currentWorkout = null;     // { date, block_num }
let currentExercises = [];     // упражнения текущего блока (для редактирования)
let wktEdit = false;           // режим «изменить план»
let exEditing = null;          // упражнение в форме (null = новое)
let wktViewDate = null;        // YYYY-MM-DD — открытый день
let wktServerToday = null;     // серверное «сегодня»
let currentEstKcal = 0;        // расчётный расход по отмеченным упражнениям

async function loadWorkout(forcedBlock) {
  $('wkt-loading').classList.remove('hidden');
  $('wkt-error').classList.add('hidden');
  $('wkt-blocks').classList.add('hidden');
  $('wkt-progress').classList.add('hidden');
  $('wkt-aiplan').classList.add('hidden');
  $('wkt-rest').classList.add('hidden');
  $('wkt-list').classList.add('hidden');
  $('wkt-complete').classList.add('hidden');
  $('wkt-uncomplete').classList.add('hidden');
  $('wkt-addex').classList.add('hidden');
  $('wkt-editblock').classList.add('hidden');
  $('wkt-newblock').classList.add('hidden');
  $('wkt-edit').classList.add('hidden');
  try {
    const payload = {};
    if (wktViewDate) payload.date = wktViewDate;
    if (forcedBlock) payload.block = forcedBlock;
    const d = await api('workout-today', payload);
    if (d.ok === false) throw new Error(d.error || 'Не удалось загрузить');
    if (!wktServerToday) wktServerToday = d.date;
    if (!wktViewDate) wktViewDate = d.date;
    renderWorkout(d);
    updateWktDayNav();
    $('wkt-loading').classList.add('hidden');
  } catch (e) {
    $('wkt-loading').classList.add('hidden');
    const box = $('wkt-error');
    box.textContent = e.message || 'Ошибка загрузки';
    box.classList.remove('hidden');
  }
}

// Чипы выбора блока (№1–№4). Тап → перезагрузка с этим блоком.
function renderWktBlocks(d) {
  const box = $('wkt-blocks');
  box.innerHTML = '';
  for (const b of (d.blocks || [])) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (b.block_num === d.selected_block ? ' active' : '');
    chip.textContent = b.label;
    chip.addEventListener('click', () => loadWorkout(b.block_num));
    box.appendChild(chip);
  }
  box.classList.toggle('hidden', !(d.blocks && d.blocks.length));
}

function updateWktDayNav() {
  $('wkt-day').textContent = dayLabel(wktViewDate, wktServerToday);
  $('wkt-next').disabled = !!wktServerToday && wktViewDate >= wktServerToday;
}

function stepWktDay(delta) {
  if (!wktViewDate) return;
  const next = addDaysStr(wktViewDate, delta);
  if (delta > 0 && wktServerToday && next > wktServerToday) return;
  wktViewDate = next;
  if (wktMode === 'walk') loadWalking();
  else if (wktMode === 'sport') loadSport();
  else loadWorkout();
}

function renderWorkout(d) {
  currentWorkout = { date: d.date, block_num: d.selected_block, label: d.label };
  currentExercises = d.exercises || [];
  renderWktBlocks(d);
  renderBurnNote($('wkt-burn-note'), d.budget);   // «сожёг X → в лимит +Y» (если есть расход)

  // У нового юзера плана нет вообще — предлагаем создать первый блок.
  if (!d.blocks || !d.blocks.length) {
    $('wkt-sub').textContent = '';
    $('wkt-list').classList.add('hidden');
    $('wkt-edit').classList.add('hidden');
    const hint = $('wkt-rest');
    hint.textContent = 'У тебя ещё нет плана тренировок. Создай первый блок — например «№1 — Грудь + Бицепс» — и добавь в него упражнения.';
    hint.classList.remove('hidden');
    $('wkt-newblock').classList.remove('hidden');
    return;
  }

  if (!d.selected_block) {
    // блок не выбран — просим выбрать (работает для любого дня, в т.ч. задним числом)
    $('wkt-sub').textContent = '';
    $('wkt-list').classList.add('hidden');
    $('wkt-complete').classList.add('hidden');
    $('wkt-uncomplete').classList.add('hidden');
    $('wkt-addex').classList.add('hidden');
    $('wkt-edit').classList.add('hidden');
    const hint = $('wkt-rest');
    hint.textContent = (d.is_today && d.rest_hint_days != null)
      ? 'Сегодня отдых. Если всё же потренировался — выбери блок выше, чтобы отметить.'
      : 'Выбери блок выше, чтобы отметить тренировку за этот день.';
    hint.classList.remove('hidden');
    $('wkt-newblock').classList.remove('hidden');
    return;
  }

  $('wkt-rest').classList.add('hidden');
  currentEstKcal = Math.round(d.est_kcal || 0);
  const exs = currentExercises;
  $('wkt-sub').textContent = wktEdit ? 'редактирование плана' : '';
  // карточка прогресса блока (метка · N/M · бар · осталось) — только в режиме просмотра
  if (wktEdit) $('wkt-progress').classList.add('hidden');
  else renderWktProgress(d.label, exs);
  // PRO-вход «Составить план с Рыжем» — только в режиме просмотра
  $('wkt-aiplan').classList.toggle('hidden', wktEdit);

  const list = $('wkt-list');
  list.innerHTML = '';
  let lastGroup = null;
  for (const ex of exs) {
    const g = ex.group || '';
    if (g && g !== lastGroup) {
      const h = document.createElement('div');
      h.className = 'sec-head';
      h.textContent = g;
      list.appendChild(h);
      lastGroup = g;
    }
    list.appendChild(wktEdit ? buildExerciseEditRow(ex) : buildExerciseRow(ex));
  }
  list.classList.remove('hidden');

  $('wkt-edit').textContent = wktEdit ? 'Готово' : 'Изменить план';
  $('wkt-edit').classList.remove('hidden');
  $('wkt-addex').classList.toggle('hidden', !wktEdit);
  $('wkt-editblock').classList.toggle('hidden', !wktEdit);   // переименовать/удалить текущий блок
  $('wkt-newblock').classList.toggle('hidden', !wktEdit);    // создать новый блок

  // Кнопки завершения. В режиме редактирования прячем.
  const complete = $('wkt-complete');
  const uncomplete = $('wkt-uncomplete');
  if (wktEdit) {
    complete.classList.add('hidden');
    uncomplete.classList.add('hidden');
  } else if (d.logged) {
    // тренировка уже подтверждена → кнопку деактивируем, показываем «отменить»
    complete.textContent = 'Тренировка завершена ✓';
    complete.disabled = true;
    complete.classList.remove('hidden');
    uncomplete.classList.remove('hidden');
  } else {
    complete.textContent = currentEstKcal > 0
      ? `Завершить · ~${currentEstKcal} ккал` : 'Завершить тренировку';
    complete.disabled = false;
    complete.classList.remove('hidden');
    uncomplete.classList.add('hidden');
  }
}

// Строка упражнения в режиме редактирования (карандаш + удалить вместо свитчера).
function buildExerciseEditRow(ex) {
  const row = document.createElement('div');
  row.className = 'ex';
  const main = document.createElement('div');
  main.className = 'ex-main';
  const name = document.createElement('div');
  name.className = 'ex-name';
  name.textContent = ex.exercise;
  const sub = document.createElement('div');
  sub.className = 'muted small';
  sub.textContent = exerciseSub(ex);
  main.appendChild(name);
  main.appendChild(sub);

  const edit = document.createElement('button');
  edit.className = 'food-rep';
  edit.setAttribute('aria-label', 'Изменить');
  edit.innerHTML = iconSvg('edit', 18);
  edit.addEventListener('click', () => openExForm(ex));

  const del = document.createElement('button');
  del.className = 'food-del';
  del.setAttribute('aria-label', 'Удалить');
  del.innerHTML = iconSvg('close', 18);
  del.addEventListener('click', () => exDelete(ex));

  row.appendChild(main);
  row.appendChild(edit);
  row.appendChild(del);
  return row;
}

function toggleWktEdit() {
  wktEdit = !wktEdit;
  loadWorkout(currentWorkout.block_num);   // перерисуем тот же блок в новом режиме
}

const EX_SECTIONS = ['Разминка', 'Силовая', 'Кор', 'Кардио', 'Заминка'];

// Выставить секцию в селект. Нестандартное (старое свободнотекстовое) значение —
// например «Грудь» — сохраняем как временную опцию, чтобы при правке не подменить его.
function setSectionSelect(val) {
  const sel = $('exf-group');
  const old = sel.querySelector('option[data-fallback]');
  if (old) old.remove();
  if (val && !EX_SECTIONS.includes(val)) {
    const o = document.createElement('option');
    o.value = val; o.textContent = val; o.dataset.fallback = '1';
    sel.insertBefore(o, sel.firstChild);
  }
  sel.value = val || 'Силовая';
}

function openExForm(ex) {
  exEditing = ex || null;
  $('exf-title').textContent = ex ? 'Изменить упражнение' : 'Новое упражнение';
  setSectionSelect(ex?.group || 'Силовая');
  $('exf-name').value = ex?.exercise || '';
  $('exf-sets').value = ex?.sets || '';
  $('exf-reps').value = ex?.reps || '';
  $('exf-weight').value = ex?.weight || '';
  // расход за упражнение: значение = ручной override (если задан), плейсхолдер = авто-оценка
  $('exf-kcal').value = ex?.kcal_override ?? '';
  $('exf-kcal').placeholder = (ex?.kcal_auto != null && ex.kcal_auto > 0) ? `авто ≈ ${ex.kcal_auto}` : 'авто';
  $('exf-note').value = ex?.note || '';
  showScreen('exform');
}

async function exfSave() {
  const name = $('exf-name').value.trim();
  if (!name) { showStatus('Впиши название упражнения', true); return; }
  const kcalRaw = $('exf-kcal').value.trim();
  try {
    // MET и длительность не спрашиваем — бэк сам оценивает расход по категории/названию.
    // kcal: пусто → null (авто), число → ручной расход за упражнение.
    const res = await api('exercise-save', {
      id: exEditing?.db_id,
      block_num: currentWorkout.block_num,
      group: $('exf-group').value.trim(),
      exercise: name,
      sets: $('exf-sets').value.trim(),
      reps: $('exf-reps').value.trim(),
      weight: $('exf-weight').value.trim(),
      note: $('exf-note').value.trim(),
      kcal: kcalRaw === '' ? null : Number(kcalRaw),
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showScreen('workout');
    loadWorkout(currentWorkout.block_num);
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// --- Блоки плана (создать/переименовать/удалить) ---
let bfBlock = null;

function openBlockForm(blockNum, label) {
  bfBlock = blockNum || null;
  $('bf-title').textContent = bfBlock ? 'Переименовать блок' : 'Новый блок';
  $('bf-label').value = label || '';
  $('bf-delete').classList.toggle('hidden', !bfBlock);
  showScreen('blockform');
}

async function blockSave() {
  const label = $('bf-label').value.trim();
  if (!label) { showStatus('Впиши название блока', true); return; }
  const wasNew = !bfBlock;
  try {
    const res = await api('block-save', { ...(bfBlock ? { block_num: bfBlock } : {}), label });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    if (wasNew) wktEdit = true;   // новый блок → сразу режим правки, чтоб добавить упражнения
    showScreen('workout');
    loadWorkout(res.block_num || bfBlock || (currentWorkout && currentWorkout.block_num));
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

async function blockDelete() {
  if (!bfBlock) return;
  const okc = await confirmDialog('Удалить блок и все его упражнения?');
  if (!okc) return;
  try {
    const res = await api('block-delete', { block_num: bfBlock });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showScreen('workout');
    loadWorkout();   // без forced — выбор блока заново
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

async function exDelete(ex) {
  const okc = await confirmDialog(`Удалить «${ex.exercise}» из плана?`);
  if (!okc) return;
  try {
    const res = await api('exercise-delete', { id: ex.db_id });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    loadWorkout(currentWorkout.block_num);
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

async function completeWorkout() {
  // Без единой галочки «выполнено» расход насчитался бы 0 ккал — не фиксируем молча,
  // а подсказываем отметить упражнения (или задать ккал в самом упражнении).
  if (!currentExercises.some(e => e.done)) {
    showStatus('Отметь выполненные упражнения галочкой', true, 3500);
    return;
  }
  const btn = $('wkt-complete');
  btn.disabled = true;
  try {
    const payload = { date: currentWorkout.date, block: currentWorkout.block_num };
    const res = await api('complete-workout', payload);
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Тренировка зафиксирована ✓', false, 2000);
    loadWorkout(currentWorkout.block_num);   // обновит статус кнопок + строку «сожёг X → +Y»
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
    btn.disabled = false;
  }
}

async function uncompleteWorkout() {
  const go = await new Promise(res => {
    if (tg?.showConfirm) tg.showConfirm('Отменить завершение тренировки? Лимит по калориям уменьшится.', res);
    else res(confirm('Отменить завершение тренировки?'));
  });
  if (!go) return;
  try {
    const res = await api('uncomplete-workout', { date: currentWorkout.date });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('warning');
    showStatus('Завершение отменено', false, 1500);
    loadWorkout(currentWorkout.block_num);
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

function exerciseSub(ex) {
  const parts = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
  else if (ex.reps) parts.push(ex.reps);
  if (ex.weight) parts.push(ex.weight);
  // расход: «N ккал» — ручной без тильды, авто-оценка с «~» (без эмодзи)
  if (ex.kcal > 0) parts.push(`${ex.kcal_override != null ? '' : '~'}${ex.kcal} ккал`);
  if (ex.note) parts.push(ex.note);
  return parts.join(' · ');
}

// Склонение «упражнение / упражнения / упражнений».
function pluralEx(n) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return 'упражнений';
  if (b > 1 && b < 5) return 'упражнения';
  if (b === 1) return 'упражнение';
  return 'упражнений';
}

// Карточка прогресса блока: метка · N/M · бар · «осталось N упражнений».
function renderWktProgress(label, exs) {
  const done = exs.filter(e => e.done).length;
  const total = exs.length;
  const left = total - done;
  $('wkt-prog-label').textContent = label || '';
  $('wkt-prog-count').textContent = `${done}/${total}`;
  $('wkt-prog-bar').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  const parts = [];
  if (currentEstKcal > 0) parts.push(`~${currentEstKcal} ккал`);
  parts.push(left > 0 ? `осталось ${left} ${pluralEx(left)}` : 'всё выполнено');
  $('wkt-prog-sub').textContent = parts.join(' · ');
  $('wkt-progress').classList.remove('hidden');
}

function buildExerciseRow(ex) {
  const row = document.createElement('div');
  row.className = 'ex' + (ex.done ? ' is-done' : '');

  const check = document.createElement('button');
  check.type = 'button';
  check.className = 'ex-check';
  check.setAttribute('role', 'checkbox');
  check.setAttribute('aria-checked', String(!!ex.done));
  check.setAttribute('aria-label', ex.exercise);
  check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 l4.2 4.2 L19 6.8"/></svg>';

  const main = document.createElement('div');
  main.className = 'ex-main';
  const name = document.createElement('div');
  name.className = 'ex-name';
  name.textContent = ex.exercise;
  const sub = document.createElement('div');
  sub.className = 'muted small';
  sub.textContent = exerciseSub(ex);
  main.appendChild(name);
  main.appendChild(sub);

  row.appendChild(check);
  row.appendChild(main);
  // тап по всей строке (или по кружку) переключает галочку
  row.addEventListener('click', () => toggleExercise(ex, check, row));
  return row;
}

async function toggleExercise(ex, check, row) {
  const newDone = !ex.done;
  // оптимистично: красим сразу, откат при ошибке
  row.classList.toggle('is-done', newDone);
  check.setAttribute('aria-checked', String(newDone));
  check.disabled = true;
  try {
    const res = await api('toggle-exercise', {
      date: currentWorkout.date,
      block_num: currentWorkout.block_num,
      exercise: ex.exercise,
      done: newDone,
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    ex.done = newDone;
    tg?.HapticFeedback?.impactOccurred?.('light');
    recalcEstKcal();          // расход считается по ВЫПОЛНЕННЫМ — пересчитываем сразу
    updateCompleteBtnLabel();
    bumpWorkoutCount();
  } catch (e) {
    row.classList.toggle('is-done', !newDone);   // откат
    check.setAttribute('aria-checked', String(!newDone));
    showStatus('Не сохранилось: ' + e.message, true, 3000);
  } finally {
    check.disabled = false;
  }
}

// Расход тренировки = сумма ккал только по ВЫПОЛНЕННЫМ упражнениям.
// 1:1 с серверным done_workout_stats (ex.kcal = kcal_override ?? kcal_auto, оба целые).
function recalcEstKcal() {
  currentEstKcal = currentExercises.reduce(
    (s, e) => s + (e.done && e.kcal > 0 ? e.kcal : 0), 0);
}

// Обновить подпись на кнопке «Завершить» после тоггла (если она активна и видима).
function updateCompleteBtnLabel() {
  const complete = $('wkt-complete');
  if (complete.disabled || complete.classList.contains('hidden')) return;
  complete.textContent = currentEstKcal > 0
    ? `Завершить · ~${currentEstKcal} ккал` : 'Завершить тренировку';
}

// Пересчитать N/M и бар в карточке прогресса без перезапроса.
function bumpWorkoutCount() {
  const total = document.querySelectorAll('#wkt-list .ex').length;
  const done = document.querySelectorAll('#wkt-list .ex.is-done').length;
  const left = total - done;
  $('wkt-prog-count').textContent = `${done}/${total}`;
  $('wkt-prog-bar').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  const parts = [];
  if (currentEstKcal > 0) parts.push(`~${currentEstKcal} ккал`);
  parts.push(left > 0 ? `осталось ${left} ${pluralEx(left)}` : 'всё выполнено');
  $('wkt-prog-sub').textContent = parts.join(' · ');
}

// === Пояснение «сожёг X → в лимит +Y» (тренировка/ходьба) ===
// budget приходит с бэка (calc.budget_breakdown): burned — сколько сожжено активностью
// всего за день, returned — сколько из этого реально вернулось в дневной лимит.
function renderBurnNote(el, budget) {
  if (!el) return;
  const b = budget || {};
  if (!b.burned || b.burned <= 0) { el.classList.add('hidden'); el.innerHTML = ''; return; }
  el.innerHTML = '';
  const txt = document.createElement('span');
  txt.innerHTML = `🔥 Сожжено сегодня ~${b.burned} ккал · в дневной лимит <b>+${b.returned}</b> `;
  const why = document.createElement('button');
  why.type = 'button';
  why.className = 'why-link';
  why.textContent = 'почему?';
  why.addEventListener('click', () => showBurnWhy(b));
  el.appendChild(txt);
  el.appendChild(why);
  el.classList.remove('hidden');
}

// Единый текст «как считается дневной лимит» — для инфо-секции в настройках,
// «?» у карточки калорий и (по смыслу) для бота. Объясняет, почему нет двойного
// счёта активности: «бытовая активность» в плане ≠ залогированные тренировки/спорт.
const LIMIT_INFO_HTML = `
  <p><b>Дневной лимит калорий складывается так:</b></p>
  <p>1. <b>Обмен веществ</b> — сколько тело тратит в покое.</p>
  <p>2. <b>+ бытовая активность</b> — повседневное движение <b>без зала</b> (поле «Активность · без тренировок»).</p>
  <p>3. <b>× твоя цель</b> — для похудения лимит ниже, для набора выше.</p>
  <p>Это база на день <b>без спорта</b>.</p>
  <p><b>Тренировки, ходьбу и спорт мы не закладываем заранее</b> — они добавляются к лимиту <b>сверху и по факту</b>, когда ты их залогируешь. Поэтому одна и та же активность не считается дважды: «бытовая» и «спорт» — это разное.</p>
  <p>Чтобы лимит не раздувался, у добавки есть <b>потолок</b>, а при похудении в лимит возвращается лишь <b>часть</b> сожжённого.</p>
`;

function fillLimitInfo() {
  const el = $('limit-info-body');
  if (el && !el.dataset.filled) { el.innerHTML = LIMIT_INFO_HTML; el.dataset.filled = '1'; }
}

function openInfoModal(title, html) {
  $('info-modal-title').textContent = title;
  $('info-modal-body').innerHTML = html;
  $('info-modal').classList.remove('hidden');
}
function closeInfoModal() { $('info-modal').classList.add('hidden'); }
function openLimitInfo() { openInfoModal('Как считается дневной лимит', LIMIT_INFO_HTML); }

function showBurnWhy(b) {
  // Рыж-тон, коротко (лимит showPopup ~256 символов).
  const msg = `Сжёг много — красава! Но весь расход в тарелку не вернётся: из ~${b.burned} ккал в лимит ушло +${b.returned}. Часть уже в твоей норме, а сверху есть потолок — иначе будешь есть «под расход» и сольёшь дефицит. Держим курс, командир 🦊`;
  if (tg?.showPopup) { try { tg.showPopup({ title: 'Почему не весь расход?', message: msg, buttons: [{ type: 'ok' }] }); return; } catch (e) {} }
  if (tg?.showAlert) { try { tg.showAlert(msg); return; } catch (e) {} }
  alert(msg);
}

// === Экран «Прогресс» (динамика: дефицит за неделю, вес, % жира) ===
function openProgress() {
  showScreen('progress');
  loadProgress();
}

async function loadProgress() {
  $('prog-loading').classList.remove('hidden');
  $('prog-content').classList.add('hidden');
  try {
    const d = await api('progress');
    // показываем контент ДО отрисовки графиков — иначе clientWidth=0 (display:none) и SVG не масштабируется
    $('prog-loading').classList.add('hidden');
    $('prog-content').classList.remove('hidden');
    renderWeeklyDetail(d.weekly);
    renderLineChart($('prog-weight-chart'), d.weight, $('prog-weight-empty'), { unit: 'кг', dp: 1 });
    renderLineChart($('prog-fat-chart'), d.body_fat, $('prog-fat-empty'), { unit: '%', dp: 1 });
    renderMeasures(d.measurements);
    if (d.current_weight != null && !$('prog-weight').value) $('prog-weight').value = round(d.current_weight, 1);
  } catch (e) {
    $('prog-loading').textContent = 'Не удалось загрузить. ' + e.message;
  }
}

// Обхваты тела: ключ ↔ подпись (порядок отображения). Совпадает с BODY_MEASURES на бэке.
const PROG_MEASURES = [
  ['waist', 'Талия'], ['chest', 'Грудь'], ['hips', 'Бёдра'], ['biceps', 'Бицепс'], ['thigh', 'Бедро'],
];

// Графики обхватов рисуем только для тех, где ≥2 точек (чтобы не плодить пустые секции).
function renderMeasures(meas) {
  const box = $('prog-measures');
  box.innerHTML = '';
  if (!meas) return;
  for (const [key, label] of PROG_MEASURES) {
    const pts = meas[key] || [];
    if (pts.length < 2) continue;
    const head = document.createElement('div');
    head.className = 'sec-head'; head.textContent = `${label}, см`;
    const card = document.createElement('div'); card.className = 'card stat';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('chart');
    card.appendChild(svg);
    box.appendChild(head); box.appendChild(card);
    renderLineChart(svg, pts, null, { unit: '', dp: 1 });
  }
}

function renderWeeklyDetail(wk) {
  if (!wk) return;
  const total = Math.round(wk.total || 0);
  const word = weeklyWord(wk.goal);
  $('prog-wk-label').textContent = `За 7 дней · ${word}`;
  $('prog-wk-total').textContent = `${total > 0 ? '+' : ''}${total} ккал`;
  $('prog-wk-sub').textContent = wk.logged_days
    ? `Учтено ${wk.logged_days} ${pluralDays(wk.logged_days)} (с логом еды) · ~${wk.avg > 0 ? '+' : ''}${wk.avg}/день. Серым — дни без записей.`
    : 'За неделю нет дней с логом еды.';
  renderWeekBars($('prog-wk-bars'), wk.per_day || [], wk.goal);
}

// Столбики дефицита по дням. Хорошее направление (по цели) — акцентный цвет, плохое — приглушённый,
// незалогированные дни — серые. Высота ∝ |дефицит| относительно максимума за неделю.
function renderWeekBars(box, days, goal) {
  box.innerHTML = '';
  const maxAbs = Math.max(1, ...days.filter(x => x.logged).map(x => Math.abs(x.deficit)));
  const goodSign = goal === 'gain' ? -1 : 1;   // gain: профицит (deficit<0) хорошо; иначе дефицит>0 хорошо
  for (const x of days) {
    const col = document.createElement('div');
    col.className = 'wk-bar-col';
    const bar = document.createElement('div');
    bar.className = 'wk-bar' + (!x.logged ? ' empty' : (Math.sign(x.deficit) === goodSign ? ' good' : ' bad'));
    bar.style.height = x.logged ? Math.max(4, Math.round(Math.abs(x.deficit) / maxAbs * 56)) + 'px' : '4px';
    bar.title = x.logged ? `${x.date}: ${x.deficit > 0 ? '+' : ''}${x.deficit} ккал` : `${x.date}: нет лога`;
    const lab = document.createElement('div');
    lab.className = 'wk-bar-lab';
    lab.textContent = (x.date || '').slice(8, 10);   // день месяца
    col.appendChild(bar); col.appendChild(lab);
    box.appendChild(col);
  }
}

// Лёгкий линейный график без библиотек. Считаем в реальных px (экран уже видим → clientWidth валиден),
// чтобы линия/текст были чёткими. points: [{date, value}]. emptyEl — что показать при <2 точках.
function renderLineChart(svg, points, emptyEl, opts = {}) {
  points = (points || []).filter(p => p.value != null);
  const ok = points.length >= 2;
  if (emptyEl) emptyEl.classList.toggle('hidden', ok);
  svg.classList.toggle('hidden', !ok);
  if (!ok) { svg.innerHTML = ''; return; }
  const w = svg.clientWidth || 320, h = 120, padX = 10, padTop = 16, padBot = 22;
  const xs = points.map((_, i) => padX + i * (w - 2 * padX) / (points.length - 1));
  const vals = points.map(p => p.value);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const y = v => padTop + (max - v) / (max - min) * (h - padTop - padBot);
  const dp = opts.dp ?? 1, unit = opts.unit || '';
  const poly = points.map((p, i) => `${xs[i].toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  const dotX = xs[xs.length - 1], dotY = y(last.value);
  const fmtDate = s => (s || '').slice(5).replace('-', '.');   // MM.DD
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = `
    <polyline points="${poly}" fill="none" stroke="var(--accent)" stroke-width="2"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="3.5" fill="var(--accent)"/>
    <text x="${dotX.toFixed(1)}" y="${Math.max(11, dotY - 8).toFixed(1)}" text-anchor="end"
      class="chart-val">${round(last.value, dp)}${unit}</text>
    <text x="${padX}" y="${h - 6}" class="chart-ax">${fmtDate(points[0].date)}</text>
    <text x="${w - padX}" y="${h - 6}" text-anchor="end" class="chart-ax">${fmtDate(last.date)}</text>`;
}

async function bodyLogSave() {
  const weight = Number($('prog-weight').value) || 0;
  const bf = Number($('prog-fat').value) || 0;
  const meas = {};
  for (const [key] of PROG_MEASURES) {
    const v = Number($('prog-' + key).value) || 0;
    if (v) meas[key] = v;
  }
  if (!weight && !bf && !Object.keys(meas).length) {
    showStatus('Впиши вес, % жира или обхват', true); return;
  }
  try {
    const res = await api('log-body', {
      ...(weight ? { weight } : {}),
      ...(bf ? { body_fat_pct: bf } : {}),
      ...meas,
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Записано ✓', false, 1500);
    $('prog-fat').value = '';
    for (const [key] of PROG_MEASURES) $('prog-' + key).value = '';
    loadProgress();
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// === Ходьба / Спорт (разделы в трен-вкладке) ===
let wktMode = 'train';   // train | walk | sport
let walkPace = 'brisk';

function setWktMode(mode) {
  wktMode = mode;
  document.querySelectorAll('[data-wmode]').forEach(b => b.classList.toggle('active', b.dataset.wmode === mode));
  $('wkt-train').classList.toggle('hidden', mode !== 'train');
  $('wkt-walk').classList.toggle('hidden', mode !== 'walk');
  $('wkt-sport').classList.toggle('hidden', mode !== 'sport');
  if (mode === 'walk') { $('wkt-sub').textContent = ''; loadWalking(); }
  else if (mode === 'sport') { $('wkt-sub').textContent = ''; loadSport(); }
  else loadWorkout();
}

async function loadWalking() {
  try {
    const d = await api('walking', wktViewDate ? { date: wktViewDate } : {});
    if (!wktServerToday) wktServerToday = d.date;
    if (!wktViewDate) wktViewDate = d.date;
    walkPace = d.pace || 'brisk';
    $('walk-km').value = d.km || '';
    $('walk-kcal').textContent = `+${d.kcal_burned || 0} ккал`;
    $('walk-sub').textContent = `Всего ходьбы за день: ${d.day_total_kcal || 0} ккал`;
    renderBurnNote($('walk-burn-note'), d.budget);   // «сожёг X → в лимит +Y»
    renderPacePills();
    updateWktDayNav();
  } catch (e) {
    showStatus('Ошибка: ' + e.message, true, 3000);
  }
}

const WALK_PACES = [['stroll', 'Прогулочный'], ['brisk', 'Бодрый'], ['fast', 'Быстрый'], ['jog', 'Бег']];
function renderPacePills() {
  const box = $('walk-pace');
  box.innerHTML = '';
  for (const [val, label] of WALK_PACES) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (val === walkPace ? ' active' : '');
    chip.textContent = label;
    chip.addEventListener('click', () => { walkPace = val; renderPacePills(); });
    box.appendChild(chip);
  }
}

async function walkSave() {
  const km = Number($('walk-km').value) || 0;
  try {
    const res = await api('log-walking', { date: wktViewDate || wktServerToday, km, pace: walkPace });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus(km > 0 ? `Записано · +${res.kcal_burned} ккал ✓` : 'Ходьба убрана', false, 1800);
    loadWalking();
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// === Спорт (активность вне зала: вид + минуты → нет-MET расход) ===
let sportWeight = 76;        // вес из профиля — для живого превью ккал
let sportActsLoaded = false; // справочник видов грузим один раз

async function loadSport() {
  try {
    const d = await api('sport', wktViewDate ? { date: wktViewDate } : {});
    if (!wktServerToday) wktServerToday = d.date;
    if (!wktViewDate) wktViewDate = d.date;
    sportWeight = d.weight_kg || 76;
    if (!sportActsLoaded) { renderSportOptions(d.activities || []); sportActsLoaded = true; }
    $('sport-total').textContent = `+${d.sum_kcal || 0} ккал`;
    $('sport-sub').textContent = (d.items && d.items.length)
      ? `Записей за день: ${d.items.length}` : 'За день пока пусто';
    renderSportList(d.items || []);
    renderBurnNote($('sport-burn-note'), d.budget);   // «сожёг X → в лимит +Y»
    sportUpdatePreview();
    updateWktDayNav();
  } catch (e) {
    showStatus('Ошибка: ' + e.message, true, 3000);
  }
}

function renderSportOptions(acts) {
  const sel = $('sport-activity');
  sel.innerHTML = '';
  for (const a of acts) {
    const o = document.createElement('option');
    o.value = a.key; o.textContent = a.label;
    if (a.met != null) o.dataset.met = a.met;   // нет met → «Другое» (ручные ккал)
    sel.appendChild(o);
  }
}

function sportUpdatePreview() {
  const sel = $('sport-activity');
  const opt = sel.options[sel.selectedIndex];
  const met = opt && opt.dataset.met ? Number(opt.dataset.met) : null;
  const min = Number($('sport-min').value) || 0;
  const manual = Number($('sport-kcal').value) || 0;
  if (manual > 0) { $('sport-preview').textContent = `Расход: ${manual} ккал (вручную)`; return; }
  if (met == null) { $('sport-preview').textContent = 'Для «Другое» впиши калории вручную.'; return; }
  if (!min) { $('sport-preview').textContent = 'Впиши минуты — посчитаю расход.'; return; }
  const kcal = Math.round(Math.max(met - 1, 0) * sportWeight * min / 60);
  $('sport-preview').textContent = `Расход: ~${kcal} ккал за ${min} мин`;
}

function renderSportList(items) {
  const box = $('sport-list');
  box.innerHTML = '';
  for (const it of items) {
    const row = document.createElement('div');
    row.className = 'food';
    const main = document.createElement('div'); main.className = 'food-main';
    const nm = document.createElement('div'); nm.className = 'food-desc'; nm.textContent = it.activity;
    const sub = document.createElement('div'); sub.className = 'muted small';
    sub.textContent = it.minutes ? `${it.minutes} мин` : '';
    main.appendChild(nm); main.appendChild(sub);
    const kcal = document.createElement('div'); kcal.className = 'food-kcal'; kcal.textContent = `+${it.kcal}`;
    const del = document.createElement('button');
    del.className = 'icon-btn'; del.setAttribute('aria-label', 'Удалить');
    del.innerHTML = iconSvg('close', 18);
    del.addEventListener('click', () => sportDelete(it));
    row.appendChild(main); row.appendChild(kcal); row.appendChild(del);
    box.appendChild(row);
  }
}

async function sportSave() {
  const activity = $('sport-activity').value;
  const minutes = Number($('sport-min').value) || 0;
  const kcalRaw = $('sport-kcal').value.trim();
  const kcal = kcalRaw === '' ? null : Number(kcalRaw);
  if (kcal == null && !minutes) { showStatus('Впиши минуты', true); return; }
  try {
    const res = await api('log-sport', {
      date: wktViewDate || wktServerToday,
      activity, minutes,
      ...(kcal != null ? { kcal } : {}),
    });
    if (res.ok === false) {
      showStatus(res.error === 'no_kcal' ? 'Для «Другое» впиши калории' : 'Не вышло', true, 2500);
      return;
    }
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus(`Записано · +${res.kcal_burned} ккал ✓`, false, 1800);
    $('sport-min').value = ''; $('sport-kcal').value = '';
    loadSport();
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

async function sportDelete(it) {
  const ok = await confirmDialog(`Удалить «${it.activity}»?`);
  if (!ok) return;
  try {
    const res = await api('sport-delete', { id: it.id, date: wktViewDate || wktServerToday });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    loadSport();
  } catch (e) {
    showStatus('Не удалилось: ' + e.message, true, 3000);
  }
}

// === Еда: режимы (дневник / мои продукты) ===
let foodMode = 'diary';

function setFoodMode(mode) {
  foodMode = mode;
  document.querySelectorAll('#foodlog .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  $('food-diary').classList.toggle('hidden', mode !== 'diary');
  $('food-products').classList.toggle('hidden', mode !== 'products');
  if (mode === 'diary') loadFoodLog(); else loadProducts();
}

// --- Мои продукты (справочник, что бот знает) ---
async function loadProducts() {
  $('prod-loading').classList.remove('hidden');
  $('prod-error').classList.add('hidden');
  $('prod-empty').classList.add('hidden');
  $('prod-list').classList.add('hidden');
  $('food-sub').textContent = '';
  setRefreshing('food-refresh', true);
  try {
    const d = await api('products');
    if (d.ok === false) throw new Error(d.error || 'Не удалось загрузить');
    renderProducts(d.items || []);
    $('prod-loading').classList.add('hidden');
  } catch (e) {
    $('prod-loading').classList.add('hidden');
    $('prod-error').textContent = e.message || 'Ошибка загрузки';
    $('prod-error').classList.remove('hidden');
  } finally {
    setRefreshing('food-refresh', false);
  }
}

function renderProducts(items) {
  const list = $('prod-list');
  if (!items.length) {
    $('prod-empty').classList.remove('hidden');
    list.classList.add('hidden');
    return;
  }
  $('prod-empty').classList.add('hidden');
  $('food-sub').textContent = `${items.length} продукт(ов)`;
  list.innerHTML = '';
  for (const p of items) {
    const row = document.createElement('div');
    row.className = 'food pick';
    const main = document.createElement('div');
    main.className = 'food-main';
    const nm = document.createElement('div');
    nm.className = 'food-desc';
    nm.textContent = p.name || '(без названия)';
    const sub = document.createElement('div');
    sub.className = 'muted small';
    const parts = [`${round(p.kcal_per_100g)} ккал/100г`];
    if (p.protein_per_100g != null) parts.push(`Б${round(p.protein_per_100g)}`);
    if (p.fat_per_100g != null) parts.push(`Ж${round(p.fat_per_100g)}`);
    if (p.carbs_per_100g != null) parts.push(`У${round(p.carbs_per_100g)}`);
    sub.textContent = parts.join(' · ');
    main.appendChild(nm);
    main.appendChild(sub);
    row.appendChild(main);
    row.addEventListener('click', () => openProdForm(p));   // тап → правка
    list.appendChild(row);
  }
  list.classList.remove('hidden');
}

// --- Создать / изменить продукт вручную ---
function openProdForm(p) {
  const e = p || {};
  $('pf-title').textContent = p ? 'Изменить продукт' : 'Новый продукт';
  $('pf-name').value = e.name || '';
  $('pf-kcal').value = e.kcal_per_100g ?? '';
  $('pf-serving').value = e.default_serving_g ?? '';
  $('pf-protein').value = e.protein_per_100g ?? '';
  $('pf-fat').value = e.fat_per_100g ?? '';
  $('pf-carbs').value = e.carbs_per_100g ?? '';
  showScreen('prodform');
}

async function prodSave() {
  const name = $('pf-name').value.trim();
  const kcal = Number($('pf-kcal').value);
  if (!name) { showStatus('Впиши название', true); return; }
  if (!kcal) { showStatus('Впиши ккал/100г', true); return; }
  try {
    const res = await api('save-product', {
      name,
      kcal_per_100g: kcal,
      protein_per_100g: Number($('pf-protein').value) || 0,
      fat_per_100g: Number($('pf-fat').value) || 0,
      carbs_per_100g: Number($('pf-carbs').value) || 0,
      default_serving_g: Number($('pf-serving').value) || 100,
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Сохранено ✓', false, 1500);
    showScreen('foodlog');
    setFoodMode('products');
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// --- Добавить еду: сперва поиск в базе (OFF), ручной ввод — fallback ---
// Ручной ввод: по умолчанию режим «на 100г + граммы» (запись пересчитываемая).
// Переключатель «знаю только итог» возвращает старое поведение (итоговые КБЖУ, grams опц.).
let mfPer100 = true;

function openManualFood() {
  ['mf-desc', 'mf-kcal', 'mf-grams', 'mf-protein', 'mf-fat', 'mf-carbs'].forEach(id => $(id).value = '');
  $('mf-meal').value = '';
  $('mf-search').value = '';
  $('mf-results').innerHTML = '';
  $('mf-manual').classList.add('hidden');
  $('mf-manual-toggle').classList.remove('hidden');
  pendingMeal = null;
  mfPer100 = true;
  mfApplyMode();
  showScreen('manualfood');
  setTimeout(() => $('mf-search').focus(), 100);
}

// Переключить подписи/превью под текущий режим ручного ввода.
function mfApplyMode() {
  $('mf-l-kcal').textContent    = mfPer100 ? 'ккал / 100г'      : 'ккал';
  $('mf-l-protein').textContent = mfPer100 ? 'белок / 100г'     : 'белок, г';
  $('mf-l-fat').textContent     = mfPer100 ? 'жир / 100г'       : 'жир, г';
  $('mf-l-carbs').textContent   = mfPer100 ? 'углеводы / 100г'  : 'углеводы, г';
  $('mf-l-grams').textContent   = mfPer100 ? 'сколько съел, г'  : 'граммы (необяз.)';
  $('mf-mode-toggle').textContent = mfPer100 ? 'знаю только итог' : 'ввести на 100г';
  $('mf-preview').classList.toggle('hidden', !mfPer100);
  mfUpdatePreview();
}

function toggleMfMode() {
  mfPer100 = !mfPer100;
  mfApplyMode();
}

// Живой пересчёт итога из «на 100г» × граммы (только в режиме per-100g).
function mfUpdatePreview() {
  if (!mfPer100) { $('mf-preview').textContent = ''; return; }
  const g = Number($('mf-grams').value) || 0;
  if (!g) { $('mf-preview').textContent = 'Впиши граммы — посчитаю итог.'; return; }
  const m = v => round((Number($(v).value) || 0) * g / 100);
  $('mf-preview').textContent =
    `Итог ${g}г: ${m('mf-kcal')} ккал · Б${m('mf-protein')} · Ж${m('mf-fat')} · У${m('mf-carbs')}`;
}

// Поиск по названию в Open Food Facts (то же API, что и для штрихкодов).
let _mfSeq = 0, _mfDebounce = null;
async function mfSearch(q) {
  q = (q || '').trim();
  const box = $('mf-results');
  if (q.length < 2) { box.innerHTML = ''; return; }
  const seq = ++_mfSeq;
  box.innerHTML = '<div class="loading">Ищу…</div>';
  try {
    const items = await searchOFF(q);
    if (seq !== _mfSeq) return;            // пришёл ответ устаревшего запроса
    renderMfResults(items, q);
  } catch (e) {
    if (seq !== _mfSeq) return;
    box.innerHTML = '<div class="muted small">Не вышло выполнить поиск. Попробуй ещё раз — или впиши КБЖУ вручную ниже.</div>';
    revealMfManual(q);
  }
}

function renderMfResults(items, q) {
  const box = $('mf-results');
  box.innerHTML = '';
  if (!items.length) {
    box.innerHTML = '<div class="muted small">Ничего не нашлось — впиши КБЖУ вручную ниже.</div>';
    revealMfManual(q);
    return;
  }
  for (const p of items.slice(0, 12)) {
    const row = document.createElement('div');
    row.className = 'food pick';
    const main = document.createElement('div'); main.className = 'food-main';
    const nm = document.createElement('div'); nm.className = 'food-desc'; nm.textContent = p.name;
    const sub = document.createElement('div'); sub.className = 'muted small';
    sub.textContent = `${p.kcal_per_100g} ккал/100г${p.brand ? ' · ' + p.brand : ''}`;
    main.appendChild(nm); main.appendChild(sub);
    row.appendChild(main);
    row.addEventListener('click', () => openLogFood(p, 'manualfood'));
    box.appendChild(row);
  }
}

// Открыть ручной ввод КБЖУ (опц. подставить название из поиска).
function revealMfManual(prefillName) {
  $('mf-manual').classList.remove('hidden');
  $('mf-manual-toggle').classList.add('hidden');
  if (prefillName && !$('mf-desc').value) $('mf-desc').value = prefillName;
}

async function manualFoodSave() {
  const desc = $('mf-desc').value.trim();
  const kcal = Number($('mf-kcal').value);
  if (!desc) { showStatus('Впиши, что съел', true); return; }
  if (!kcal) { showStatus('Впиши ккал', true); return; }
  const meal = $('mf-meal').value;
  const grams = Number($('mf-grams').value) || 0;

  let payload;
  if (mfPer100) {
    // «на 100г» + граммы → считаем итог, пишем grams (запись пересчитываемая)
    if (!grams) { showStatus('Впиши граммы', true); return; }
    const m = v => round((Number($(v).value) || 0) * grams / 100);
    payload = {
      description: desc,
      kcal: m('mf-kcal'), protein: m('mf-protein'), fat: m('mf-fat'), carbs: m('mf-carbs'),
      grams,
    };
  } else {
    // «знаю только итог» → итоговые КБЖУ, граммы опц.
    payload = {
      description: desc,
      kcal,
      protein: Number($('mf-protein').value) || 0,
      fat: Number($('mf-fat').value) || 0,
      carbs: Number($('mf-carbs').value) || 0,
      ...(grams > 0 ? { grams } : {}),
    };
  }
  try {
    const res = await api('repeat-food', {
      date: viewDate || serverToday,
      ...payload,
      ...(meal ? { meal_type: meal } : {}),
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Добавлено в дневник ✓', false, 1500);
    showScreen('foodlog');
    setFoodMode('diary');
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// --- Добавить позицию дневника в «Мои продукты» ---
let apEntry = null;

function parseGrams(desc) {
  const m = String(desc || '').match(/(\d+(?:[.,]\d+)?)\s*г\b/);
  return m ? Number(m[1].replace(',', '.')) : null;
}

function openAddProduct(it) {
  apEntry = it;
  const grams = parseGrams(it.description);
  const name = String(it.description || '').replace(/\s*\d+(?:[.,]\d+)?\s*г\b/, '').trim() || (it.description || '');
  $('ap-name').value = name;
  $('ap-grams').value = grams || '';
  apUpdatePreview();
  showScreen('addproduct');
}

function apUpdatePreview() {
  const g = Number($('ap-grams').value) || 0;
  const e = apEntry;
  if (!e || !g) {
    $('ap-preview').textContent = 'Укажи граммовку порции, чтобы посчитать на 100г.';
    return;
  }
  const per = v => round((Number(v) || 0) / g * 100);
  $('ap-preview').textContent = `На 100г: ${per(e.kcal)} ккал · Б${per(e.protein)} · Ж${per(e.fat)} · У${per(e.carbs)}`;
}

async function apSave() {
  const name = $('ap-name').value.trim();
  const g = Number($('ap-grams').value) || 0;
  if (!name) { showStatus('Впиши название', true); return; }
  if (!g) { showStatus('Впиши граммовку порции', true); return; }
  const per = v => round((Number(v) || 0) / g * 100);
  const e = apEntry;
  try {
    const res = await api('save-product', {
      name, default_serving_g: g,
      kcal_per_100g: per(e.kcal), protein_per_100g: per(e.protein),
      fat_per_100g: per(e.fat), carbs_per_100g: per(e.carbs),
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Добавлено в продукты ✓', false, 1800);
    goTab('foodlog');
  } catch (err) {
    showStatus('Не вышло: ' + err.message, true, 3000);
  }
}

// --- Быстро добавить еду из «Моих продуктов» ---
let lfProduct = null;
let _ppItems = [];
let pendingMeal = null;   // в какой приём добавляем (по «＋» приёма); null = по времени

async function openPickProduct(meal) {
  pendingMeal = (typeof meal === 'string') ? meal : null;  // из обработчика клика прилетает event — игнорим
  showScreen('pickproduct');
  $('pp-search').value = '';
  $('pp-empty').classList.add('hidden');
  $('pp-list').innerHTML = '<div class="loading">Загрузка…</div>';
  try {
    const d = await api('products');
    _ppItems = d.items || [];
    renderPickList('');
  } catch (e) {
    $('pp-list').innerHTML = '';
    showStatus('Ошибка: ' + e.message, true, 3000);
  }
}

function renderPickList(q) {
  const list = $('pp-list');
  if (!_ppItems.length) { $('pp-empty').classList.remove('hidden'); list.innerHTML = ''; return; }
  const f = (q || '').trim().toLowerCase();
  const items = f ? _ppItems.filter(p => (p.name || '').toLowerCase().includes(f)) : _ppItems;
  list.innerHTML = '';
  for (const p of items) {
    const row = document.createElement('div');
    row.className = 'food pick';
    const main = document.createElement('div');
    main.className = 'food-main';
    const nm = document.createElement('div'); nm.className = 'food-desc'; nm.textContent = p.name;
    const sub = document.createElement('div'); sub.className = 'muted small';
    sub.textContent = `${round(p.kcal_per_100g)} ккал/100г`;
    main.appendChild(nm); main.appendChild(sub);
    row.appendChild(main);
    row.addEventListener('click', () => openLogFood(p));
    list.appendChild(row);
  }
}

let lfReturn = 'pickproduct';   // куда вернуться по «Назад» из грамовки
let lfForceToday = false;       // повтор: добавляем в сегодня независимо от открытого дня
function openLogFood(p, ret) {
  lfReturn = ret || 'pickproduct';
  lfForceToday = false;   // обычный путь добавления; повтор выставит флаг сам
  lfProduct = p;
  $('lf-name').textContent = p.name;
  $('lf-per100').textContent =
    `${round(p.kcal_per_100g)} ккал · Б${round(p.protein_per_100g)} · Ж${round(p.fat_per_100g)} · У${round(p.carbs_per_100g)} на 100г`;
  $('lf-grams').value = p.default_serving_g || 100;
  lfUpdatePreview();
  showScreen('logfood');
}

function lfUpdatePreview() {
  const g = Number($('lf-grams').value) || 0;
  const p = lfProduct;
  if (!p || !g) { $('lf-preview').textContent = ''; return; }
  const m = v => round((Number(v) || 0) * g / 100);
  $('lf-add').textContent = `Добавить ${g}г → ${m(p.kcal_per_100g)} ккал`;
  $('lf-preview').textContent = `${m(p.kcal_per_100g)} ккал · Б${m(p.protein_per_100g)} · Ж${m(p.fat_per_100g)} · У${m(p.carbs_per_100g)}`;
}

async function lfAdd() {
  const g = Number($('lf-grams').value) || 0;
  const p = lfProduct;
  if (!p || !g) { showStatus('Впиши граммы', true); return; }
  const m = v => round((Number(v) || 0) * g / 100);
  try {
    const res = await api('repeat-food', {
      date: lfForceToday ? serverToday : (viewDate || serverToday),  // повтор → всегда сегодня
      description: `${p.name} ${g}г`,
      kcal: m(p.kcal_per_100g), protein: m(p.protein_per_100g),
      fat: m(p.fat_per_100g), carbs: m(p.carbs_per_100g),
      grams: g,   // граммовка известна → запись весовая, правится пересчётом
      ...(pendingMeal ? { meal_type: pendingMeal } : {}),
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    pendingMeal = null;
    lfForceToday = false;
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Добавлено в дневник ✓', false, 1500);
    goTab('foodlog');
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

// === Еда за день (Фаза 2) ===
let viewDate = null;      // YYYY-MM-DD — открытый день
let serverToday = null;   // YYYY-MM-DD — «сегодня» по серверу (из первого ответа)

const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function addDaysStr(s, delta) { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + delta); return ymd(d); }
function dayLabel(s, srvToday) {
  if (s === srvToday) return 'Сегодня';
  if (srvToday && s === addDaysStr(srvToday, -1)) return 'Вчера';
  const d = new Date(s + 'T00:00:00');
  const mon = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()];
  return `${d.getDate()} ${mon}`;
}

async function loadFoodLog() {
  $('food-loading').classList.remove('hidden');
  $('food-error').classList.add('hidden');
  $('food-empty').classList.add('hidden');
  $('food-list').classList.add('hidden');
  setRefreshing('food-refresh', true);
  try {
    const d = await api('food-log', viewDate ? { date: viewDate } : {});
    if (d.ok === false) throw new Error(d.error || 'Не удалось загрузить');
    if (!serverToday) serverToday = d.date;   // первый ответ = серверное «сегодня»
    if (!viewDate) viewDate = d.date;
    renderFoodLog(d);
    updateDayNav();
    $('food-loading').classList.add('hidden');
  } catch (e) {
    $('food-loading').classList.add('hidden');
    const box = $('food-error');
    box.textContent = e.message || 'Ошибка загрузки';
    box.classList.remove('hidden');
  } finally {
    setRefreshing('food-refresh', false);
  }
}

function updateDayNav() {
  $('food-day').textContent = dayLabel(viewDate, serverToday);
  // вперёд за сегодня нельзя
  $('food-next').disabled = !!serverToday && viewDate >= serverToday;
}

function stepDay(delta) {
  if (!viewDate) return;
  const next = addDaysStr(viewDate, delta);
  if (delta > 0 && serverToday && next > serverToday) return; // не уходим в будущее
  viewDate = next;
  loadFoodLog();
}

let currentFood = { date: null, items: [] };

// --- Приёмы пищи (группировка дневника) ---
const MEAL_ORDER = ['завтрак', 'обед', 'перекус', 'ужин'];
const MEAL_LABEL = { 'завтрак': 'Завтрак', 'обед': 'Обед', 'перекус': 'Перекус', 'ужин': 'Ужин' };
// Приём по времени — фолбэк для старых записей без meal_type (как на бэке meal_type_for_hour).
function mealForTime(t) {
  const h = parseInt(String(t || '').split(':')[0], 10);
  if (isNaN(h)) return 'ужин';
  if (h < 11) return 'завтрак';
  if (h < 16) return 'обед';
  if (h < 19) return 'перекус';
  return 'ужин';
}
function mealOf(it) { return it.meal_type || mealForTime(it.time); }

// --- Всплывающее меню строки («…») ---
let _menuEl = null, _menuItem = null;
function rowMenuEl() {
  if (_menuEl) return _menuEl;
  _menuEl = document.createElement('div');
  _menuEl.className = 'row-menu hidden';
  _menuEl.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(_menuEl);
  return _menuEl;
}
function closeRowMenu() { if (_menuEl) { _menuEl.classList.add('hidden'); _menuItem = null; } }
document.addEventListener('click', closeRowMenu);
window.addEventListener('scroll', closeRowMenu, true);

function positionMenu(m, btn) {
  const r = btn.getBoundingClientRect();
  const mw = 224;
  let left = Math.max(8, r.right - mw);
  m.style.left = left + 'px';
  m.style.width = mw + 'px';
  m.style.top = '-9999px';
  m.classList.remove('hidden');         // померить высоту
  let top = r.bottom + 6;
  if (top + m.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - 6 - m.offsetHeight);
  m.style.top = top + 'px';
}

function toggleRowMenu(it, btn) {
  const m = rowMenuEl();
  if (_menuItem === it && !m.classList.contains('hidden')) { closeRowMenu(); return; }
  _menuItem = it;
  m.innerHTML = '';
  const actions = [
    { ico: 'edit',   label: 'Изменить',          fn: () => openEditFood(it) },
    { ico: 'meal',   label: 'Перенести в приём', fn: () => openMealPicker(it, btn) },
    { ico: 'repeat', label: 'Повторить сегодня',  fn: () => openRepeatFood(it) },
    { ico: 'plus',   label: 'В мои продукты',     fn: () => openAddProduct(it) },
    { ico: 'close',  label: 'Удалить', danger: true, fn: () => deleteFood(it) },
  ];
  for (const a of actions) {
    if (a.danger) { const sep = document.createElement('div'); sep.className = 'row-menu-sep'; m.appendChild(sep); }
    const b = document.createElement('button');
    b.className = 'row-menu-item' + (a.danger ? ' danger' : '');
    b.innerHTML = iconSvg(a.ico, 18) + `<span class="rm-grow">${a.label}</span>`;
    b.addEventListener('click', (e) => { e.stopPropagation(); closeRowMenu(); a.fn(); });
    m.appendChild(b);
  }
  positionMenu(m, btn);
}

// Подменю выбора приёма — переносит запись в другой приём.
function openMealPicker(it, btn) {
  const m = rowMenuEl();
  _menuItem = it;
  m.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'row-menu-title';
  title.textContent = 'Перенести в приём';
  m.appendChild(title);
  const cur = mealOf(it);
  for (const meal of MEAL_ORDER) {
    const b = document.createElement('button');
    b.className = 'row-menu-item' + (meal === cur ? ' active' : '');
    b.innerHTML = `<span class="rm-grow">${MEAL_LABEL[meal]}</span>` + (meal === cur ? iconSvg('check', 18) : '');
    b.addEventListener('click', (e) => { e.stopPropagation(); closeRowMenu(); if (meal !== cur) changeMeal(it, meal); });
    m.appendChild(b);
  }
  positionMenu(m, btn);
}

async function changeMeal(it, meal) {
  const prev = it.meal_type;
  it.meal_type = meal;            // оптимистично
  renderFoodList();
  try {
    const res = await api('update-food', { id: it.id, meal_type: meal });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.selectionChanged?.();
  } catch (e) {
    it.meal_type = prev;         // откат
    renderFoodList();
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

function buildMealHeader(meal, kcal) {
  const h = document.createElement('div');
  h.className = 'meal-head';
  const nm = document.createElement('span');
  nm.className = 'meal-name';
  nm.textContent = MEAL_LABEL[meal] || meal;
  const k = document.createElement('span');
  k.className = 'meal-kcal';
  k.textContent = `${kcal} ккал`;
  const add = document.createElement('button');
  add.className = 'meal-add';
  add.setAttribute('aria-label', `Добавить в «${MEAL_LABEL[meal] || meal}»`);
  add.innerHTML = iconSvg('plus', 16);
  add.addEventListener('click', () => openPickProduct(meal));
  h.appendChild(nm);
  h.appendChild(k);
  h.appendChild(add);
  return h;
}

function renderFoodLog(d) {
  currentFood = { date: d.date, items: (d.items || []).slice() };
  renderFoodList();
}

// Перерисовать список + сумму из currentFood.items (без перезапроса).
function renderFoodList() {
  const items = currentFood.items;
  const list = $('food-list');

  if (!items.length) {
    $('food-sub').textContent = '';
    $('food-budget').classList.add('hidden');
    list.classList.add('hidden');
    list.innerHTML = '';
    $('food-empty').classList.remove('hidden');
    return;
  }
  $('food-empty').classList.add('hidden');

  const s = items.reduce((a, i) => ({
    kcal: a.kcal + (i.kcal || 0), protein: a.protein + (i.protein || 0),
    fat: a.fat + (i.fat || 0), carbs: a.carbs + (i.carbs || 0),
  }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });
  $('food-sub').textContent = '';
  const eaten = Math.round(s.kcal);
  const target = lastKcalTarget;   // дневная норма из дашборда (если уже загружали)
  const macros = `Б${round(s.protein)} · Ж${round(s.fat)} · У${round(s.carbs)}`;
  if (target) {
    const leftK = target - eaten;
    const over = leftK < 0;
    $('fb-label').textContent = over ? 'Перебор' : 'Осталось на сегодня';
    $('fb-kcal').innerHTML = `${Math.abs(leftK)} <span class="fb-unit">ккал</span>`;
    $('fb-kcal').classList.toggle('over', over);
    $('fb-bar').style.width = Math.min(100, target > 0 ? eaten / target * 100 : 0) + '%';
    $('fb-bar').classList.toggle('over', over);
    $('fb-bar-wrap').classList.remove('hidden');
    $('fb-macros').textContent = `${eaten} из ${target} · ${macros}`;
  } else {
    // нормы пока не знаем (дашборд не открывали) — показываем съеденное за день
    $('fb-label').textContent = 'Съедено за день';
    $('fb-kcal').innerHTML = `${eaten} <span class="fb-unit">ккал</span>`;
    $('fb-kcal').classList.remove('over');
    $('fb-bar-wrap').classList.add('hidden');
    $('fb-macros').textContent = macros;
  }
  $('food-budget').classList.remove('hidden');

  // группируем по приёмам пищи, рисуем заголовок приёма + подытог + строки
  list.innerHTML = '';
  const groups = {};
  for (const it of items) { const mk = mealOf(it); (groups[mk] || (groups[mk] = [])).push(it); }
  const order = MEAL_ORDER.filter(m => groups[m]);
  for (const m in groups) if (!order.includes(m)) order.push(m);  // незнакомые приёмы — в конец
  for (const m of order) {
    const g = groups[m];
    const mk = g.reduce((a, i) => a + (i.kcal || 0), 0);
    list.appendChild(buildMealHeader(m, Math.round(mk)));
    for (const it of g) list.appendChild(buildFoodRow(it));
  }
  list.classList.remove('hidden');
}

function buildFoodRow(it) {
  const row = document.createElement('div');
  row.className = 'food';

  const main = document.createElement('div');
  main.className = 'food-main';
  const desc = document.createElement('div');
  desc.className = 'food-desc';
  desc.textContent = it.description || '(без описания)';
  const sub = document.createElement('div');
  sub.className = 'muted small';
  const parts = [];
  if (it.time) parts.push(it.time);
  parts.push(`Б${round(it.protein)} · Ж${round(it.fat)} · У${round(it.carbs)}`);
  sub.textContent = parts.join(' · ');
  main.appendChild(desc);
  main.appendChild(sub);

  const kcal = document.createElement('div');
  kcal.className = 'food-kcal';
  kcal.textContent = Math.round(it.kcal || 0);

  // одна кнопка «…» со всплывающим меню действий
  const more = document.createElement('button');
  more.className = 'food-more';
  more.setAttribute('aria-label', 'Действия');
  more.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>';
  more.addEventListener('click', (e) => { e.stopPropagation(); toggleRowMenu(it, more); });

  row.appendChild(main);
  row.appendChild(kcal);
  row.appendChild(more);
  return row;
}

// Повтор приёма пищи в сегодня. Весовая запись (есть grams) → открываем граммовку
// с предзаполнением, чтобы можно было уменьшить порцию. Порционная (grams нет) →
// добавляем как есть (пересчитывать не от чего).
function openRepeatFood(it) {
  const g0 = Number(it.grams) || 0;
  if (g0 > 0) {
    const per100 = v => (Number(v) || 0) / g0 * 100;
    const name = String(it.description || '').replace(/\s*\d+(?:[.,]\d+)?\s*г\b/, '').trim()
      || (it.description || 'запись');
    const p = {
      name,
      kcal_per_100g: round(per100(it.kcal)),
      protein_per_100g: round(per100(it.protein)),
      fat_per_100g: round(per100(it.fat)),
      carbs_per_100g: round(per100(it.carbs)),
      default_serving_g: round(g0, 0),
    };
    pendingMeal = it.meal_type || null;
    openLogFood(p, 'foodlog');
    lfForceToday = true;   // повтор всегда в сегодня, даже если открыт прошлый день
    return;
  }
  repeatFood(it);   // граммовки нет — повтор как есть
}

async function repeatFood(it) {
  const ok = await confirmDialog(`Добавить «${it.description || 'запись'}» в сегодня?`);
  if (!ok) return;
  try {
    const res = await api('repeat-food', {
      description: it.description || '',
      kcal: it.kcal, protein: it.protein, fat: it.fat, carbs: it.carbs,
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    if (viewDate === serverToday) loadFoodLog();   // смотрим сегодня — покажем новую запись
    else showStatus('Добавлено в сегодня ✓', false, 1800);
  } catch (e) {
    showStatus('Не вышло: ' + e.message, true, 3000);
  }
}

function confirmDialog(msg) {
  return new Promise((res) => {
    if (tg?.showConfirm) tg.showConfirm(msg, (ok) => res(!!ok));
    else res(window.confirm(msg));
  });
}

async function deleteFood(it) {
  const ok = await confirmDialog(`Удалить «${it.description || 'запись'}»?`);
  if (!ok) return;

  // оптимистично убираем из списка
  currentFood.items = currentFood.items.filter((x) => x !== it);
  renderFoodList();

  try {
    const res = await api('delete-food', { id: it.id });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
  } catch (e) {
    showStatus('Не удалилось: ' + e.message + '. Обновляю список.', true, 3500);
    loadFoodLog();   // вернуть правду с сервера
  }
}

// === Правка уже внесённой записи ===
// Весовая запись (grams известны) → меняем граммы, КБЖУ пересчитываются от базы на 1г.
// Порционная (grams == null) → блок граммов скрыт, правим только числа КБЖУ.
let efItem = null;     // ссылка на редактируемый объект из currentFood.items
let efBase = null;     // база на 1г {kcal,protein,fat,carbs}; null для порционной записи

function openEditFood(it) {
  efItem = it;
  $('ef-desc').value = it.description || '';
  $('ef-kcal').value = Math.round(it.kcal || 0);
  $('ef-protein').value = round(it.protein);
  $('ef-fat').value = round(it.fat);
  $('ef-carbs').value = round(it.carbs);
  $('ef-meal').value = it.meal_type || '';
  const g = Number(it.grams) || 0;
  if (g > 0) {
    efBase = {
      kcal: (it.kcal || 0) / g, protein: (it.protein || 0) / g,
      fat: (it.fat || 0) / g, carbs: (it.carbs || 0) / g,
    };
    $('ef-grams').value = round(g, 0);
    $('ef-base').textContent =
      `${round(efBase.kcal * 100)} ккал · Б${round(efBase.protein * 100)} · Ж${round(efBase.fat * 100)} · У${round(efBase.carbs * 100)} на 100г`;
    $('ef-grams-box').classList.remove('hidden');
  } else {
    efBase = null;
    $('ef-grams-box').classList.add('hidden');
  }
  showScreen('editfood');
}

// Пересчёт КБЖУ при смене граммов (пустое/0 — не трогаем поля).
function efUpdatePreview() {
  if (!efBase) return;
  const g = Number($('ef-grams').value) || 0;
  if (!g) return;
  $('ef-kcal').value = Math.round(efBase.kcal * g);
  $('ef-protein').value = round(efBase.protein * g);
  $('ef-fat').value = round(efBase.fat * g);
  $('ef-carbs').value = round(efBase.carbs * g);
}

async function saveEditFood() {
  const it = efItem;
  if (!it) return;
  const desc = $('ef-desc').value.trim();
  if (!desc) { showStatus('Впиши описание', true); return; }
  let grams = null;                                  // порционная по умолчанию
  if (efBase) { const gv = Number($('ef-grams').value) || 0; grams = gv > 0 ? gv : null; }
  const next = {
    description: desc,
    kcal: Math.round(Number($('ef-kcal').value) || 0),
    protein: Number($('ef-protein').value) || 0,
    fat: Number($('ef-fat').value) || 0,
    carbs: Number($('ef-carbs').value) || 0,
    meal_type: $('ef-meal').value,                   // '' = «по времени» (бэк примет как пусто)
    grams,
  };
  // снапшот для отката + оптимистичное обновление
  const prev = { description: it.description, kcal: it.kcal, protein: it.protein,
    fat: it.fat, carbs: it.carbs, meal_type: it.meal_type, grams: it.grams };
  Object.assign(it, next);
  renderFoodList();                                  // пересчитает сумму/бюджет дня
  showScreen('foodlog');
  try {
    const res = await api('update-food', { id: it.id, ...next });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus('Сохранено ✓', false, 1500);
  } catch (e) {
    Object.assign(it, prev);                         // откат
    renderFoodList();
    showStatus('Не сохранилось: ' + e.message, true, 3500);
  }
}

// === ZXing scanner ===
async function startScanner() {
  scanning = true;
  showScreen('scanner');

  // Подсказки: только штрихкоды товаров (EAN-13/8, UPC-A/E), быстрее и точнее.
  const hints = new Map();
  const fmts = ZXingBrowser.BarcodeFormat
    ? [ZXingBrowser.BarcodeFormat.EAN_13, ZXingBrowser.BarcodeFormat.EAN_8,
       ZXingBrowser.BarcodeFormat.UPC_A,  ZXingBrowser.BarcodeFormat.UPC_E]
    : null;
  if (fmts && ZXingBrowser.DecodeHintType) {
    hints.set(ZXingBrowser.DecodeHintType.POSSIBLE_FORMATS, fmts);
    hints.set(ZXingBrowser.DecodeHintType.TRY_HARDER, true);
  }

  try {
    codeReader = new ZXingBrowser.BrowserMultiFormatReader(hints, 100);
    showStatus('Включаю камеру…', false, 0);

    const constraints = {
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    };

    await codeReader.decodeFromConstraints(constraints, $('video'), (result, err) => {
      if (!scanning) return;
      if (result) {
        const code = result.getText();
        scanning = false;
        tg?.HapticFeedback?.notificationOccurred?.('success');
        $('status').classList.add('hidden');
        handleBarcode(code);
      }
      // err каждые ~80мс на «ничего не нашли» — это норма, не показываем.
    });

    setupTorch();   // показать кнопку фонарика, если устройство умеет
    showStatus('Наведи на штрихкод…', false, 0);
  } catch (e) {
    console.error(e);
    showStatus('Камера: ' + (e.message || e.name || 'ошибка'), true, 6000);
  }
}

// === Фонарик (torch) ===
let torchTrack = null;
let torchOn = false;

function setupTorch() {
  const btn = $('btn-torch');
  torchTrack = null; torchOn = false;
  btn.classList.remove('on');
  try {
    const stream = $('video').srcObject;
    const track = stream && stream.getVideoTracks ? stream.getVideoTracks()[0] : null;
    const caps = track && track.getCapabilities ? track.getCapabilities() : {};
    if (track && caps && caps.torch) {
      torchTrack = track;
      btn.classList.remove('hidden');     // устройство умеет вспышку
    } else {
      btn.classList.add('hidden');        // iOS Safari и т.п. — torch в вебе недоступен
    }
  } catch { btn.classList.add('hidden'); }
}

async function toggleTorch() {
  if (!torchTrack) return;
  const next = !torchOn;
  try {
    await torchTrack.applyConstraints({ advanced: [{ torch: next }] });
    torchOn = next;
    $('btn-torch').classList.toggle('on', torchOn);
    tg?.HapticFeedback?.impactOccurred?.('light');
  } catch (e) {
    showStatus('Фонарик недоступен', true, 2000);
  }
}

function stopScanner() {
  scanning = false;
  try { codeReader?.reset?.(); } catch {}
  torchTrack = null; torchOn = false;
  $('btn-torch').classList.add('hidden');
  $('btn-torch').classList.remove('on');
  $('status').classList.add('hidden');   // не оставляем висящий статус при уходе со сканера
}

// === Open Food Facts lookup ===
async function fetchOFF(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,quantity,serving_quantity,nutriments`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('OFF: HTTP ' + r.status);
  return await r.json();
}

// Поиск продуктов по названию. Идём в наш бэк (эндпоинт product-search), который
// сам ходит в Open Food Facts server-side и возвращает уже нормализованный список
// (на 100г). Так фронт не упирается в CORS и 503-капризы OFF.
async function searchOFF(q) {
  const d = await api('product-search', { q });
  if (d.ok === false) throw new Error(d.error || 'fail');
  return d.items || [];
}

// === Главный поток ===
async function handleBarcode(barcode) {
  currentBarcode = barcode;
  stopScanner();
  showStatus(`Код: ${barcode} — ищу в OFF…`, false, 0);
  try {
    const data = await fetchOFF(barcode);
    if (data.status === 0 || !data.product?.nutriments?.['energy-kcal_100g']) {
      $('status').classList.add('hidden');
      showNotFound(barcode);
      return;
    }
    $('status').classList.add('hidden');
    showCard(data.product, barcode);
  } catch (e) {
    console.error(e);
    showStatus(`OFF ошибка (${barcode}): ${e.message}`, true, 6000);
    showNotFound(barcode);
  }
}

function showCard(p, barcode) {
  const n = p.nutriments || {};
  currentProduct = {
    name: p.product_name || '(без названия)',
    brand: p.brands || '',
    kcal100: round(n['energy-kcal_100g']),
    p100: round(n['proteins_100g']),
    f100: round(n['fat_100g']),
    c100: round(n['carbohydrates_100g']),
    default_serving_g: Math.round(Number(p.serving_quantity) || 100),
  };

  $('prod-name').textContent = currentProduct.name;
  $('prod-brand').textContent = currentProduct.brand;
  $('prod-kcal').textContent = `${currentProduct.kcal100} ккал / 100г`;
  $('prod-macros').textContent = `Б ${currentProduct.p100} · Ж ${currentProduct.f100} · У ${currentProduct.c100}`;
  $('prod-barcode').textContent = `Штрихкод: ${barcode}`;
  $('grams').value = currentProduct.default_serving_g;
  recomputeEatPreview();
  showScreen('card');
}

function showNotFound(barcode) {
  $('nf-barcode').textContent = barcode;
  ['nf-name','nf-kcal','nf-protein','nf-fat','nf-carbs','nf-serving'].forEach(id => $(id).value = '');
  showScreen('notfound');
}

function recomputeEatPreview() {
  if (!currentProduct) return;
  const g = Number($('grams').value) || 0;
  const k = currentProduct.kcal100 * g / 100;
  $('btn-eat').textContent = `Съел ${g}г → ${round(k)} ккал`;
  $('computed').textContent = `${round(k)} ккал · Б${round(currentProduct.p100*g/100)} · Ж${round(currentProduct.f100*g/100)} · У${round(currentProduct.c100*g/100)}`;
}

function round(v, d = 1) {
  if (v == null || v === '') return 0;
  const f = Math.pow(10, d);
  return Math.round(Number(v) * f) / f;
}

// === POST на n8n webhook ===
let inFlight = false;
const _btnState = new WeakMap();

function setBusy(busy, activeBtn) {
  inFlight = busy;
  document.querySelectorAll('button').forEach(b => b.disabled = busy);
  if (busy && activeBtn) {
    _btnState.set(activeBtn, activeBtn.innerHTML);
    activeBtn.innerHTML = '<span class="spinner"></span> Отправляю…';
  } else if (!busy) {
    document.querySelectorAll('button').forEach(b => {
      const orig = _btnState.get(b);
      if (orig) { b.innerHTML = orig; _btnState.delete(b); }
    });
  }
}

async function postWebhook(payload, activeBtn) {
  if (inFlight) return;
  setBusy(true, activeBtn);
  showStatus('<span class="spinner"></span> Отправляю…', false, 0);
  try {
    // Content-Type text/plain намеренно — чтоб не было CORS preflight (OPTIONS).
    const r = await withMinDelay(fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ initData: INIT_DATA, ...payload }),
    }));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const out = await r.json().catch(() => ({}));
    showStatus('✓ ' + (out.message || 'Готово'), false, 1500);
    setTimeout(() => tg?.close?.(), 1500);
  } catch (e) {
    showStatus('Ошибка: ' + e.message, true, 4000);
    setBusy(false);
  }
}

// Минимальная задержка чтобы спиннер было видно даже на быстрых ответах
const MIN_SPIN_MS = 500;
async function withMinDelay(promise) {
  const start = Date.now();
  try { return await promise; }
  finally {
    const dt = Date.now() - start;
    if (dt < MIN_SPIN_MS) await new Promise(r => setTimeout(r, MIN_SPIN_MS - dt));
  }
}

function eatPayload() {
  const g = Number($('grams').value) || 0;
  const kcal = round(currentProduct.kcal100 * g / 100);
  const protein = round(currentProduct.p100 * g / 100);
  const fat = round(currentProduct.f100 * g / 100);
  const carbs = round(currentProduct.c100 * g / 100);
  return {
    action: 'log_food',
    barcode: currentBarcode,
    description: `${currentProduct.name}${currentProduct.brand ? ' (' + currentProduct.brand + ')' : ''} ${g}г`,
    grams: g,
    kcal, protein, fat, carbs,
    kcal_per_100g: currentProduct.kcal100,
    protein_per_100g: currentProduct.p100,
    fat_per_100g: currentProduct.f100,
    carbs_per_100g: currentProduct.c100,
    default_serving_g: currentProduct.default_serving_g,
    name: currentProduct.name,
  };
}

function savePayload() {
  return {
    action: 'add_product',
    barcode: currentBarcode,
    name: currentProduct.name,
    aliases: currentProduct.brand || '',
    kcal_per_100g: currentProduct.kcal100,
    protein_per_100g: currentProduct.p100,
    fat_per_100g: currentProduct.f100,
    carbs_per_100g: currentProduct.c100,
    default_serving_g: currentProduct.default_serving_g,
    notes: 'из OFF по штрихкоду',
  };
}

// === Handlers ===
$('grams').addEventListener('input', recomputeEatPreview);
$('btn-eat').addEventListener('click', (e) => postWebhook(eatPayload(), e.currentTarget));
$('btn-save').addEventListener('click', (e) => postWebhook(savePayload(), e.currentTarget));
$('btn-rescan').addEventListener('click', startScanner);
$('btn-rescan2').addEventListener('click', startScanner);

$('btn-torch').addEventListener('click', toggleTorch);
$('btn-manual').addEventListener('click', () => {
  stopScanner();
  $('manual-code').value = '';
  showScreen('manual');
  setTimeout(() => $('manual-code').focus(), 100);
});
$('btn-manual-back').addEventListener('click', startScanner);
$('btn-manual-go').addEventListener('click', () => {
  const code = $('manual-code').value.trim();
  if (!/^\d{6,14}$/.test(code)) { showStatus('Введи 6-14 цифр штрихкода', true); return; }
  handleBarcode(code);
});

$('btn-save-manual').addEventListener('click', () => {
  const name = $('nf-name').value.trim();
  const kcal = Number($('nf-kcal').value);
  const protein = Number($('nf-protein').value);
  const fat = Number($('nf-fat').value);
  const carbs = Number($('nf-carbs').value);
  const serving = Number($('nf-serving').value) || 100;
  if (!name || !kcal) { showStatus('Заполни хотя бы название и ккал/100г', true); return; }
  postWebhook(_buildManualPayload(name, kcal, protein, fat, carbs, serving), $('btn-save-manual'));
});
function _buildManualPayload(name, kcal, protein, fat, carbs, serving) {
  return {
    action: 'add_product',
    barcode: currentBarcode,
    name, aliases: '',
    kcal_per_100g: kcal,
    protein_per_100g: protein,
    fat_per_100g: fat,
    carbs_per_100g: carbs,
    default_serving_g: serving,
    notes: 'добавлено вручную из сканера',
  };
}

// Таб-бар + кнопка обновления дашборда
document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => goTab(t.dataset.tab)));
$('dash-settings').addEventListener('click', openSettings);
$('kcal-help').addEventListener('click', openLimitInfo);
$('info-modal-close').addEventListener('click', closeInfoModal);
$('info-modal').addEventListener('click', (e) => { if (e.target.id === 'info-modal') closeInfoModal(); });
fillLimitInfo();
$('card-workout').addEventListener('click', () => goTab('workout'));
$('card-weekly').addEventListener('click', openProgress);
$('prog-close').addEventListener('click', () => goTab('dashboard'));
$('prog-save').addEventListener('click', bodyLogSave);
$('water-minus').addEventListener('click', () => logWater(-250));
$('water-add-250').addEventListener('click', () => logWater(250));
$('water-add-500').addEventListener('click', () => logWater(500));
// геро-облако: тап разворачивает/сворачивает длинную реплику
$('hero-bubble').addEventListener('click', () => $('hero-bubble').classList.toggle('open'));
// входы в Рыж AI (дашборд / еда / трен)
$('ai-promo').addEventListener('click', () => goTab('ryzhai'));
$('food-dictate').addEventListener('click', () => goTab('ryzhai'));
$('wkt-aiplan').addEventListener('click', () => goTab('ryzhai'));
// экран Рыж AI: выбор плана / оформление / чат
document.querySelectorAll('#ai-plans .plan-row').forEach(r =>
  r.addEventListener('click', () => setAiPlan(r.dataset.plan)));
$('ai-subscribe').addEventListener('click', aiSubscribe);
$('ai-openchat').addEventListener('click', openRyzhBot);
// документы/поддержка (профиль) + легал-ссылки в пейволле
document.querySelectorAll('.doc-row').forEach(b =>
  b.addEventListener('click', () => openDoc(b.dataset.doc)));
document.querySelectorAll('.ai-legal a[data-doc]').forEach(a =>
  a.addEventListener('click', (e) => { e.preventDefault(); openDoc(a.dataset.doc); }));
$('docview-close').addEventListener('click', () => showScreen(docReturn || 'settings'));
$('set-close').addEventListener('click', () => goTab('dashboard'));
$('set-save').addEventListener('click', saveSettings);
// сегменты Пол/Цель + живой пересчёт нормы
document.querySelectorAll('#set-sex-seg .seg-btn, #set-goal-seg .seg-btn').forEach(b =>
  b.addEventListener('click', () => { segSet(b.parentElement.id, b.dataset.val); refreshNorms(); }));
['set-height', 'set-weight', 'set-age', 'set-activity'].forEach(id =>
  $(id).addEventListener('input', refreshNorms));
$('set-auto').addEventListener('change', applyAutoState);
// Преференсы: применяем сразу + тихо шлём на сервер (оптимистично, без блокировки).
$('set-theme').addEventListener('change', (e) => {
  applyTheme(e.target.checked ? 'dark' : 'light');
  tg?.HapticFeedback?.selectionChanged?.();
  api('prefs-save', { theme: e.target.checked ? 'dark' : 'light' }).catch(() => {});
});
$('set-notif').addEventListener('change', (e) => {
  tg?.HapticFeedback?.selectionChanged?.();
  api('prefs-save', { notifications_enabled: e.target.checked }).catch(() => {});
});
$('reg-bot').addEventListener('click', () => tg?.close?.());
$('wkt-prev').addEventListener('click', () => stepWktDay(-1));
$('wkt-next').addEventListener('click', () => stepWktDay(1));
$('wkt-complete').addEventListener('click', () => completeWorkout());
$('wkt-editblock').addEventListener('click', () => openBlockForm(currentWorkout?.block_num, currentWorkout?.label || ''));
$('wkt-newblock').addEventListener('click', () => openBlockForm(null, ''));
$('wkt-uncomplete').addEventListener('click', uncompleteWorkout);
$('wkt-edit').addEventListener('click', toggleWktEdit);
$('wkt-addex').addEventListener('click', () => openExForm(null));
$('exf-save').addEventListener('click', exfSave);
$('exf-cancel').addEventListener('click', () => showScreen('workout'));
$('bf-save').addEventListener('click', blockSave);
$('bf-delete').addEventListener('click', blockDelete);
$('bf-cancel').addEventListener('click', () => showScreen('workout'));
document.querySelectorAll('[data-wmode]').forEach(b =>
  b.addEventListener('click', () => setWktMode(b.dataset.wmode)));
$('walk-save').addEventListener('click', walkSave);
$('sport-save').addEventListener('click', sportSave);
$('sport-activity').addEventListener('change', sportUpdatePreview);
$('sport-min').addEventListener('input', sportUpdatePreview);
$('sport-kcal').addEventListener('input', sportUpdatePreview);
$('food-prev').addEventListener('click', () => stepDay(-1));
$('food-next').addEventListener('click', () => stepDay(1));
document.querySelectorAll('#foodlog .seg-btn').forEach(b =>
  b.addEventListener('click', () => setFoodMode(b.dataset.mode)));
$('ap-grams').addEventListener('input', apUpdatePreview);
$('ap-save').addEventListener('click', apSave);
$('ap-cancel').addEventListener('click', () => goTab('foodlog'));
$('food-add-from').addEventListener('click', openPickProduct);
$('food-add-manual').addEventListener('click', openManualFood);
$('prod-new').addEventListener('click', () => openProdForm(null));
$('pf-save').addEventListener('click', prodSave);
$('pf-cancel').addEventListener('click', () => showScreen('foodlog'));
$('mf-save').addEventListener('click', manualFoodSave);
$('mf-cancel').addEventListener('click', () => showScreen('foodlog'));
$('mf-manual-toggle').addEventListener('click', () => revealMfManual());
$('mf-mode-toggle').addEventListener('click', toggleMfMode);
['mf-kcal', 'mf-protein', 'mf-fat', 'mf-carbs', 'mf-grams'].forEach(id =>
  $(id).addEventListener('input', mfUpdatePreview));
$('mf-search').addEventListener('input', (e) => {
  clearTimeout(_mfDebounce);
  const v = e.target.value;
  _mfDebounce = setTimeout(() => mfSearch(v), 350);
});
$('pp-close').addEventListener('click', () => goTab('foodlog'));
$('pp-search').addEventListener('input', (e) => renderPickList(e.target.value));
$('lf-grams').addEventListener('input', lfUpdatePreview);
$('lf-add').addEventListener('click', lfAdd);
$('lf-cancel').addEventListener('click', () => showScreen(lfReturn));

$('ef-grams').addEventListener('input', efUpdatePreview);
$('ef-save').addEventListener('click', saveEditFood);
$('ef-cancel').addEventListener('click', () => showScreen('foodlog'));

// Статичные иконки/списки бренд-набором (DOM уже распарсен — main.js в конце body).
initStaticUi();

// === Старт: профиль не заполнен → онбординг на Настройках, иначе Главная ===
window.addEventListener('load', boot);
