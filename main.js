// === Конфиг ===
const API_BASE = 'https://n8n-fitness.ru/webhook';
const WEBHOOK_URL = `${API_BASE}/scan-barcode`;

// === Telegram WebApp ===
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const INIT_DATA = tg?.initData || '';

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
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
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
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

// === Навигация по вкладкам ===
function goTab(name) {
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
  if (name === 'workout') loadWorkout();
  if (name === 'foodlog') loadFoodLog();
}

// === Дашборд (Фаза 1) ===
async function loadDashboard() {
  $('dash-loading').classList.remove('hidden');
  $('dash-error').classList.add('hidden');
  $('dash-content').classList.add('hidden');
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
  }
}

function pct(part, whole) {
  if (!whole || whole <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(part / whole * 100)));
}

function renderDashboard(d) {
  $('dash-date').textContent = d.date || '';

  // --- Тренировка ---
  const w = d.workout_today || {};
  if (w.is_workout) {
    $('wk-ico').textContent = '💪';
    $('wk-title').textContent = 'Сегодня тренировка';
    $('wk-sub').textContent = w.label || '';
  } else {
    $('wk-ico').textContent = '😌';
    $('wk-title').textContent = 'Сегодня отдых';
    $('wk-sub').textContent = (w.days_until_next != null)
      ? `Следующая тренировка через ${w.days_until_next} дн` : '';
  }

  // --- Калории ---
  const k = d.kcal || {};
  const left = Math.round(k.left ?? 0);
  $('kcal-left').textContent = (left >= 0 ? left : left) + ' ккал';
  $('kcal-left').classList.toggle('over', left < 0);
  const kbar = $('kcal-bar');
  kbar.style.width = pct(k.eaten, k.target) + '%';
  kbar.classList.toggle('over', (k.eaten || 0) > (k.target || 0));
  $('kcal-sub').textContent = `${Math.round(k.eaten || 0)} из ${Math.round(k.target || 0)} ккал`
    + (left >= 0 ? ` · осталось ${left}` : ` · перебор ${-left}`);

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

// === Тренировка (Фаза 3) ===
let currentWorkout = null;   // { date, block_num }

async function loadWorkout() {
  $('wkt-loading').classList.remove('hidden');
  $('wkt-error').classList.add('hidden');
  $('wkt-rest').classList.add('hidden');
  $('wkt-list').classList.add('hidden');
  try {
    const d = await api('workout-today');
    if (d.ok === false) throw new Error(d.error || 'Не удалось загрузить');
    renderWorkout(d);
    $('wkt-loading').classList.add('hidden');
  } catch (e) {
    $('wkt-loading').classList.add('hidden');
    const box = $('wkt-error');
    box.textContent = e.message || 'Ошибка загрузки';
    box.classList.remove('hidden');
  }
}

function renderWorkout(d) {
  currentWorkout = { date: d.date, block_num: d.block_num };

  if (!d.is_workout) {
    $('wkt-sub').textContent = '';
    const rest = $('wkt-rest');
    rest.textContent = (d.days_until_next != null)
      ? `Сегодня отдых 😌 Следующая тренировка через ${d.days_until_next} дн.`
      : 'Сегодня отдых 😌';
    rest.classList.remove('hidden');
    return;
  }

  const exs = d.exercises || [];
  const doneCount = exs.filter(e => e.done).length;
  $('wkt-sub').textContent = `${d.label} · выполнено ${doneCount} из ${exs.length}`;

  const list = $('wkt-list');
  list.innerHTML = '';
  for (const ex of exs) list.appendChild(buildExerciseRow(ex));
  list.classList.remove('hidden');
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
  const parts = [];
  if (ex.group) parts.push(ex.group);
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
  if (ex.weight) parts.push(`${ex.weight}`);
  if (ex.note) parts.push(ex.note);
  sub.textContent = parts.join(' · ');
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

// === Еда за день (Фаза 2) ===
let viewDate = null;      // YYYY-MM-DD — открытый день
let serverToday = null;   // YYYY-MM-DD — «сегодня» по серверу (из первого ответа)

const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function addDaysStr(s, delta) { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + delta); return ymd(d); }
function dayLabel(s) {
  if (s === serverToday) return 'Сегодня';
  if (serverToday && s === addDaysStr(serverToday, -1)) return 'Вчера';
  const d = new Date(s + 'T00:00:00');
  const mon = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()];
  return `${d.getDate()} ${mon}`;
}

async function loadFoodLog() {
  $('food-loading').classList.remove('hidden');
  $('food-error').classList.add('hidden');
  $('food-empty').classList.add('hidden');
  $('food-list').classList.add('hidden');
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
  }
}

function updateDayNav() {
  $('food-day').textContent = dayLabel(viewDate);
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
  $('food-sub').textContent =
    `${Math.round(s.kcal)} ккал · Б${round(s.protein)} · Ж${round(s.fat)} · У${round(s.carbs)}`;

  list.innerHTML = '';
  for (const it of items) list.appendChild(buildFoodRow(it));
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

  const rep = document.createElement('button');
  rep.className = 'food-rep';
  rep.setAttribute('aria-label', 'Повторить сегодня');
  rep.textContent = '↻';
  rep.addEventListener('click', () => repeatFood(it));

  const del = document.createElement('button');
  del.className = 'food-del';
  del.setAttribute('aria-label', 'Удалить');
  del.textContent = '✕';
  del.addEventListener('click', () => deleteFood(it));

  row.appendChild(main);
  row.appendChild(kcal);
  row.appendChild(rep);
  row.appendChild(del);
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
    const res = await api('delete-food', {
      row: it.row,
      description: it.description || '',
      date: currentFood.date,
    });
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

    showStatus('Наведи на штрихкод…', false, 0);
  } catch (e) {
    console.error(e);
    showStatus('Камера: ' + (e.message || e.name || 'ошибка'), true, 6000);
  }
}

function stopScanner() {
  scanning = false;
  try { codeReader?.reset?.(); } catch {}
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
$('dash-refresh').addEventListener('click', loadDashboard);
$('wkt-refresh').addEventListener('click', loadWorkout);
$('food-refresh').addEventListener('click', loadFoodLog);
$('food-prev').addEventListener('click', () => stepDay(-1));
$('food-next').addEventListener('click', () => stepDay(1));

// === Старт: открываемся на главной (не на камере) ===
window.addEventListener('load', () => goTab('dashboard'));
