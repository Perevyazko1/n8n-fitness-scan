// === Конфиг ===
// Новый Django-API (переезд с n8n-вебхуков). Пути те же, префикс /webhook → /api.
const API_BASE = 'https://n8n-fitness.ru/api';
const WEBHOOK_URL = `${API_BASE}/scan-barcode`;

// === Telegram WebApp ===
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Бренд Cream фиксирует свой тёплый цвет (шапка/фон), тему Telegram игнорируем.
  // disableVerticalSwipes — защита от случайного свайпа-вниз (закрытия) при скролле.
  // Всё под optional-chaining — на старых клиентах просто игнор.
  try { tg.setHeaderColor?.('#FBF4EA'); } catch {}
  try { tg.setBackgroundColor?.('#FBF4EA'); } catch {}
  try { tg.disableVerticalSwipes?.(); } catch {}
}
const INIT_DATA = tg?.initData || '';

// Крутим иконку обновления во время загрузки.
function setRefreshing(btnId, on) { const b = $(btnId); if (b) b.classList.toggle('spinning', on); }

// === Состояние ===
let codeReader = null;
let scanning = false;
let currentProduct = null;   // { name, brand, kcal100, p100, f100, c100, default_serving_g }
let currentBarcode = null;
let currentTab = null;       // dashboard | foodlog | workout | scanner

// === UI helpers ===
const $ = id => document.getElementById(id);
const screens = {
  dashboard: $('dashboard'), foodlog: $('foodlog'), workout: $('workout'),
  scanner: $('scanner'), card: $('card'), notfound: $('notfound'), manual: $('manual'),
  addproduct: $('addproduct'), pickproduct: $('pickproduct'), logfood: $('logfood'), exform: $('exform'),
  prodform: $('prodform'), manualfood: $('manualfood'),
  blockform: $('blockform'), burnform: $('burnform'),
  settings: $('settings'), reggate: $('reggate'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// === Линейные иконки (бренд Cream, без эмодзи) ===
const ICON_PATHS = {
  dumbbell: '<path d="M6.6 8 V16"/><path d="M4.2 9.6 V14.4"/><path d="M17.4 8 V16"/><path d="M19.8 9.6 V14.4"/><path d="M6.6 12 H17.4"/>',
  check:    '<path d="M5 12.5 l4.2 4.2 L19 6.8"/>',
  leaf:     '<path d="M5 19 C5 10.7 11.4 5 19 5 C19 13.3 12.6 19 5 19 Z"/><path d="M7.4 16.6 C10.3 12.8 14 9.4 17 7.4"/>',
  flame:    '<path d="M12 3.4 C12 7 16 8.6 16 12.8 A4 4 0 1 1 8 12.8 C8 10.9 9 9.5 10.2 8.7 C10 10.3 10.8 11.3 12 11.5 C13 9.9 12.4 6.5 12 3.4 Z"/>',
  snowflake:'<path d="M12 3.5 V20.5"/><path d="M4.6 7.75 L19.4 16.25"/><path d="M19.4 7.75 L4.6 16.25"/><path d="M12 3.5 l-1.8 1.9 M12 3.5 l1.8 1.9 M12 20.5 l-1.8-1.9 M12 20.5 l1.8-1.9"/><path d="M4.6 7.75 l0.3 2.6 M4.6 7.75 l2.6-0.3 M19.4 16.25 l-0.3-2.6 M19.4 16.25 l-2.6 0.3"/><path d="M19.4 7.75 l-2.6-0.3 M19.4 7.75 l-0.3 2.6 M4.6 16.25 l2.6 0.3 M4.6 16.25 l0.3-2.6"/>',
  plus:     '<path d="M12 5 V19 M5 12 H19"/>',
  repeat:   '<path d="M18.6 11.8 A6.8 6.8 0 1 0 17.2 16.6"/><path d="M18.9 5 V8.4 H15.5"/>',
  edit:     '<path d="M14.4 5.4 l4.2 4.2"/><path d="M5 19 l0.9-3.7 L15.4 5 l3.6 3.6 L9.7 18.1 Z"/>',
  close:    '<path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"/>',
};
function iconSvg(name, size = 22, fill = false) {
  const f = fill && name === 'flame' ? 'currentColor' : 'none';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${f}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ''}</svg>`;
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

// Голос Рыжа — одна живая строка по состоянию дня.
function ryzhVoice(d) {
  const st = d.streaks || {}, k = d.kcal || {}, w = d.workout_today || {};
  const left = Math.round(k.left ?? 0);
  const frozen = (st.nutrition && st.nutrition.status === 'frozen')
              || (st.workout && st.workout.status === 'frozen');
  if ((k.eaten || 0) <= 0) return 'Рыж проголодался — занеси, что ел сегодня, и он повеселеет.';
  if (frozen) return 'Стрик под угрозой — залогируй, пока я не замёрз.';
  if (left < 0) return `Перебор на ${-left} ккал. Завтра аккуратнее — я в тебя верю.`;
  if (w.is_workout && w.done) return 'Тренировка закрыта, питание в норме. Красавчик!';
  if (left > 0) return `Ещё ${left} ккал в запасе. Держим темп.`;
  return 'Идём по плану. Так держать!';
}

function renderDashboard(d) {
  $('dash-date').textContent = d.date || '';

  // --- Маскот-лис: тир тела (мышцы×живот) + эмоция на сегодня ---
  // Голодный сет (_hungry) добавляется в img/ постепенно; пока какого-то нет —
  // показываем «битую» картинку (это норм, заполняется по мере генерации арта).
  const av = d.avatar || {};
  const m = av.muscle_tier ?? 2, b = av.belly_tier ?? 1;  // дефолт — середина
  const mood = foxMood(d);
  const fox = $('fox-avatar');
  if (fox) {
    fox.onerror = null;          // не прячем и не откатываем — пусть будет битая, если арта нет
    fox.style.display = '';
    fox.src = mood === 'hungry'
      ? `img/fox_m${m}_b${b}_hungry.png`
      : `img/fox_m${m}_b${b}.png`;
  }

  // --- Голос Рыжа ---
  $('ryzh-says').innerHTML = `<b>Рыж:</b> ${ryzhVoice(d)}`;

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
}

function setMacro(key, m, unit) {
  m = m || {};
  const eaten = round(m.eaten || 0), target = Math.round(m.target || 0);
  $('bar-' + key).style.width = pct(eaten, target) + '%';
  $('val-' + key).textContent = target ? `${eaten} / ${target}${unit}` : `${eaten}${unit}`;
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
    $('set-username').textContent = u.username ? `@${u.username} · Telegram` : 'Telegram';
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
  $('wkt-rest').classList.add('hidden');
  $('wkt-list').classList.add('hidden');
  $('wkt-complete').classList.add('hidden');
  $('wkt-burn').classList.add('hidden');
  $('wkt-uncomplete').classList.add('hidden');
  $('wkt-addex').classList.add('hidden');
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
  // в режиме редактирования: переименовать текущий блок + создать новый
  if (wktEdit) {
    if (d.selected_block) {
      const rn = document.createElement('button');
      rn.className = 'chip';
      rn.innerHTML = iconSvg('edit', 15);
      rn.setAttribute('aria-label', 'Переименовать блок');
      rn.addEventListener('click', () => openBlockForm(d.selected_block, d.label));
      box.appendChild(rn);
    }
    const add = document.createElement('button');
    add.className = 'chip';
    add.innerHTML = iconSvg('plus', 15);
    add.setAttribute('aria-label', 'Новый блок');
    add.addEventListener('click', () => openBlockForm(null, ''));
    box.appendChild(add);
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
  if (wktMode === 'walk') loadWalking(); else loadWorkout();
}

function renderWorkout(d) {
  currentWorkout = { date: d.date, block_num: d.selected_block, label: d.label };
  currentExercises = d.exercises || [];
  renderWktBlocks(d);

  if (!d.selected_block) {
    // блок не выбран — просим выбрать (работает для любого дня, в т.ч. задним числом)
    $('wkt-sub').textContent = '';
    $('wkt-list').classList.add('hidden');
    $('wkt-complete').classList.add('hidden');
    $('wkt-burn').classList.add('hidden');
    $('wkt-uncomplete').classList.add('hidden');
    $('wkt-addex').classList.add('hidden');
    $('wkt-edit').classList.add('hidden');
    const hint = $('wkt-rest');
    hint.textContent = (d.is_today && d.rest_hint_days != null)
      ? 'Сегодня отдых. Если всё же потренировался — выбери блок выше, чтобы отметить.'
      : 'Выбери блок выше, чтобы отметить тренировку за этот день.';
    hint.classList.remove('hidden');
    return;
  }

  $('wkt-rest').classList.add('hidden');
  currentEstKcal = Math.round(d.est_kcal || 0);
  const exs = currentExercises;
  const doneCount = exs.filter(e => e.done).length;
  $('wkt-sub').textContent = wktEdit
    ? `${d.label} · редактирование плана`
    : `${d.label} · выполнено ${doneCount} из ${exs.length}`;

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

  // Кнопки завершения. В режиме редактирования обе прячем.
  const complete = $('wkt-complete');
  const uncomplete = $('wkt-uncomplete');
  const burn = $('wkt-burn');
  if (wktEdit) {
    complete.classList.add('hidden');
    burn.classList.add('hidden');
    uncomplete.classList.add('hidden');
  } else if (d.logged) {
    // тренировка уже подтверждена → кнопку деактивируем, показываем «отменить»
    complete.textContent = 'Тренировка завершена ✓';
    complete.disabled = true;
    complete.classList.remove('hidden');
    burn.classList.add('hidden');
    uncomplete.classList.remove('hidden');
  } else {
    complete.textContent = currentEstKcal > 0
      ? `Завершить · ~${currentEstKcal} ккал` : 'Завершить тренировку';
    complete.disabled = false;
    complete.classList.remove('hidden');
    burn.classList.remove('hidden');     // «Расход вручную»
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

function openExForm(ex) {
  exEditing = ex || null;
  $('exf-title').textContent = ex ? 'Изменить упражнение' : 'Новое упражнение';
  $('exf-group').value = ex?.group || '';
  $('exf-name').value = ex?.exercise || '';
  $('exf-sets').value = ex?.sets || '';
  $('exf-reps').value = ex?.reps || '';
  $('exf-weight').value = ex?.weight || '';
  $('exf-met').value = ex?.met ?? '';
  $('exf-min').value = ex?.default_min ?? '';
  $('exf-note').value = ex?.note || '';
  showScreen('exform');
}

async function exfSave() {
  const name = $('exf-name').value.trim();
  if (!name) { showStatus('Впиши название упражнения', true); return; }
  const met = $('exf-met').value.trim();
  const dmin = $('exf-min').value.trim();
  try {
    const res = await api('exercise-save', {
      id: exEditing?.db_id,
      block_num: currentWorkout.block_num,
      group: $('exf-group').value.trim(),
      exercise: name,
      sets: $('exf-sets').value.trim(),
      reps: $('exf-reps').value.trim(),
      weight: $('exf-weight').value.trim(),
      note: $('exf-note').value.trim(),
      ...(met ? { met: Number(met) } : {}),        // пусто → бэк оценит по категории
      ...(dmin ? { default_min: Number(dmin) } : {}),
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
  try {
    const res = await api('block-save', { ...(bfBlock ? { block_num: bfBlock } : {}), label });
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showScreen('workout');
    loadWorkout(res.block_num || bfBlock || currentWorkout.block_num);
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

// --- Ручной ввод расхода ---
function openBurnForm() {
  $('bn-kcal').value = currentEstKcal || '';
  showScreen('burnform');
}

async function burnSave() {
  const v = Number($('bn-kcal').value);
  if (!(v >= 0)) { showStatus('Впиши ккал', true); return; }
  showScreen('workout');
  completeWorkout(v);
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

async function completeWorkout(override) {
  const btn = $('wkt-complete');
  btn.disabled = true;
  try {
    const payload = { date: currentWorkout.date, block: currentWorkout.block_num };
    if (typeof override === 'number') payload.kcal_burned = override;   // ручной приоритет
    const res = await api('complete-workout', payload);
    if (res.ok === false) throw new Error(res.error || 'fail');
    tg?.HapticFeedback?.notificationOccurred?.('success');
    showStatus(`Тренировка зафиксирована ✓ (+${res.kcal_burned || 0} ккал)`, false, 2000);
    loadWorkout(currentWorkout.block_num);   // обновит статус кнопок (logged → деактив + «отменить»)
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
  if (ex.note) parts.push(ex.note);
  return parts.join(' · ');
}

function buildExerciseRow(ex) {
  const row = document.createElement('label');
  row.className = 'ex' + (ex.done ? ' is-done' : '');

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

  const sw = document.createElement('input');
  sw.type = 'checkbox';
  sw.className = 'switch';
  sw.checked = !!ex.done;
  sw.addEventListener('change', () => toggleExercise(ex, sw, row));

  row.appendChild(main);
  row.appendChild(sw);
  return row;
}

async function toggleExercise(ex, sw, row) {
  const newDone = sw.checked;
  sw.disabled = true;
  try {
    const res = await api('toggle-exercise', {
      date: currentWorkout.date,
      block_num: currentWorkout.block_num,
      exercise: ex.exercise,
      done: newDone,
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    ex.done = newDone;
    row.classList.toggle('is-done', newDone);
    tg?.HapticFeedback?.impactOccurred?.('light');
    bumpWorkoutCount();
  } catch (e) {
    sw.checked = !newDone;              // откат
    showStatus('Не сохранилось: ' + e.message, true, 3000);
  } finally {
    sw.disabled = false;
  }
}

// Пересчитать «выполнено N из M» в подзаголовке без перезапроса.
function bumpWorkoutCount() {
  const total = document.querySelectorAll('#wkt-list .ex').length;
  const done = document.querySelectorAll('#wkt-list .ex.is-done').length;
  const sub = $('wkt-sub').textContent.split(' · ')[0];
  $('wkt-sub').textContent = `${sub} · выполнено ${done} из ${total}`;
}

// === Ходьба (раздел в трен-вкладке) ===
let wktMode = 'train';   // train | walk
let walkPace = 'brisk';

function setWktMode(mode) {
  wktMode = mode;
  document.querySelectorAll('[data-wmode]').forEach(b => b.classList.toggle('active', b.dataset.wmode === mode));
  $('wkt-train').classList.toggle('hidden', mode !== 'train');
  $('wkt-walk').classList.toggle('hidden', mode !== 'walk');
  if (mode === 'walk') { $('wkt-sub').textContent = ''; loadWalking(); }
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

// --- Свободная запись еды в дневник (без продукта) ---
function openManualFood() {
  ['mf-desc', 'mf-kcal', 'mf-protein', 'mf-fat', 'mf-carbs'].forEach(id => $(id).value = '');
  $('mf-meal').value = '';
  showScreen('manualfood');
}

async function manualFoodSave() {
  const desc = $('mf-desc').value.trim();
  const kcal = Number($('mf-kcal').value);
  if (!desc) { showStatus('Впиши, что съел', true); return; }
  if (!kcal) { showStatus('Впиши ккал', true); return; }
  const meal = $('mf-meal').value;
  try {
    const res = await api('repeat-food', {
      date: viewDate || serverToday,
      description: desc,
      kcal,
      protein: Number($('mf-protein').value) || 0,
      fat: Number($('mf-fat').value) || 0,
      carbs: Number($('mf-carbs').value) || 0,
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

function openLogFood(p) {
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
      date: viewDate || serverToday,
      description: `${p.name} ${g}г`,
      kcal: m(p.kcal_per_100g), protein: m(p.protein_per_100g),
      fat: m(p.fat_per_100g), carbs: m(p.carbs_per_100g),
      ...(pendingMeal ? { meal_type: pendingMeal } : {}),
    });
    if (res.ok === false) throw new Error(res.error || 'fail');
    pendingMeal = null;
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
    { ico: 'edit',   label: 'Изменить приём',    fn: () => openMealPicker(it, btn) },
    { ico: 'repeat', label: 'Повторить сегодня',  fn: () => repeatFood(it) },
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
  $('fb-kcal').textContent = `${Math.round(s.kcal)} ккал`;
  $('fb-macros').textContent = `Б${round(s.protein)} · Ж${round(s.fat)} · У${round(s.carbs)}`;
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
$('card-workout').addEventListener('click', () => goTab('workout'));
$('set-close').addEventListener('click', () => goTab('dashboard'));
$('set-save').addEventListener('click', saveSettings);
// сегменты Пол/Цель + живой пересчёт нормы
document.querySelectorAll('#set-sex-seg .seg-btn, #set-goal-seg .seg-btn').forEach(b =>
  b.addEventListener('click', () => { segSet(b.parentElement.id, b.dataset.val); refreshNorms(); }));
['set-height', 'set-weight', 'set-age', 'set-activity'].forEach(id =>
  $(id).addEventListener('input', refreshNorms));
$('set-auto').addEventListener('change', applyAutoState);
$('reg-bot').addEventListener('click', () => tg?.close?.());
$('wkt-prev').addEventListener('click', () => stepWktDay(-1));
$('wkt-next').addEventListener('click', () => stepWktDay(1));
$('wkt-complete').addEventListener('click', () => completeWorkout());
$('wkt-burn').addEventListener('click', openBurnForm);
$('wkt-uncomplete').addEventListener('click', uncompleteWorkout);
$('wkt-edit').addEventListener('click', toggleWktEdit);
$('wkt-addex').addEventListener('click', () => openExForm(null));
$('exf-save').addEventListener('click', exfSave);
$('exf-cancel').addEventListener('click', () => showScreen('workout'));
$('bf-save').addEventListener('click', blockSave);
$('bf-delete').addEventListener('click', blockDelete);
$('bf-cancel').addEventListener('click', () => showScreen('workout'));
$('bn-save').addEventListener('click', burnSave);
$('bn-cancel').addEventListener('click', () => showScreen('workout'));
document.querySelectorAll('[data-wmode]').forEach(b =>
  b.addEventListener('click', () => setWktMode(b.dataset.wmode)));
$('walk-save').addEventListener('click', walkSave);
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
$('pp-close').addEventListener('click', () => goTab('foodlog'));
$('pp-search').addEventListener('input', (e) => renderPickList(e.target.value));
$('lf-grams').addEventListener('input', lfUpdatePreview);
$('lf-add').addEventListener('click', lfAdd);
$('lf-cancel').addEventListener('click', () => showScreen('pickproduct'));

// === Старт: профиль не заполнен → онбординг на Настройках, иначе Главная ===
window.addEventListener('load', boot);
