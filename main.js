// === Конфиг ===
const WEBHOOK_URL = 'https://n8n-fitness.ru/webhook/scan-barcode';

// === Telegram WebApp ===
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const INIT_DATA = tg?.initData || '';

// === Состояние ===
let codeReader = null;
let scanning = false;
let currentProduct = null;   // { name, brand, kcal100, p100, f100, c100, default_serving_g }
let currentBarcode = null;

// === UI helpers ===
const $ = id => document.getElementById(id);
const screens = { scanner: $('scanner'), card: $('card'), notfound: $('notfound') };

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function showStatus(text, isError = false, timeout = 2500) {
  const el = $('status');
  el.textContent = text;
  el.classList.remove('hidden', 'error');
  if (isError) el.classList.add('error');
  if (timeout) setTimeout(() => el.classList.add('hidden'), timeout);
}

// === ZXing scanner ===
async function startScanner() {
  if (!codeReader) codeReader = new ZXingBrowser.BrowserMultiFormatReader();
  scanning = true;
  showScreen('scanner');
  try {
    const devices = await ZXingBrowser.BrowserMultiFormatReader.listVideoInputDevices();
    const back = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];
    await codeReader.decodeFromVideoDevice(back?.deviceId, 'video', (result, err) => {
      if (!result || !scanning) return;
      const code = result.getText();
      if (!/^\d{8,14}$/.test(code)) return; // только EAN/UPC
      scanning = false;
      tg?.HapticFeedback?.notificationOccurred?.('success');
      handleBarcode(code);
    });
  } catch (e) {
    console.error(e);
    showStatus('Не удалось открыть камеру: ' + e.message, true, 5000);
  }
}

function stopScanner() {
  scanning = false;
  if (codeReader) codeReader.reset();
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
  showStatus('Ищу в Open Food Facts…', false, 0);
  try {
    const data = await fetchOFF(barcode);
    $('status').classList.add('hidden');

    if (data.status === 0 || !data.product?.nutriments?.['energy-kcal_100g']) {
      showNotFound(barcode);
      return;
    }
    showCard(data.product, barcode);
  } catch (e) {
    console.error(e);
    showStatus('Ошибка запроса к OFF: ' + e.message, true, 4000);
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
async function postWebhook(payload) {
  showStatus('Отправляю…', false, 0);
  try {
    // Content-Type text/plain намеренно — чтоб не было CORS preflight (OPTIONS).
    const r = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ initData: INIT_DATA, ...payload }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const out = await r.json().catch(() => ({}));
    showStatus(out.message || 'Готово', false, 1500);
    setTimeout(() => tg?.close?.(), 1500);
  } catch (e) {
    showStatus('Ошибка: ' + e.message, true, 4000);
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
$('btn-eat').addEventListener('click', () => postWebhook(eatPayload()));
$('btn-save').addEventListener('click', () => postWebhook(savePayload()));
$('btn-rescan').addEventListener('click', startScanner);
$('btn-rescan2').addEventListener('click', startScanner);

$('btn-save-manual').addEventListener('click', () => {
  const name = $('nf-name').value.trim();
  const kcal = Number($('nf-kcal').value);
  const protein = Number($('nf-protein').value);
  const fat = Number($('nf-fat').value);
  const carbs = Number($('nf-carbs').value);
  const serving = Number($('nf-serving').value) || 100;
  if (!name || !kcal) { showStatus('Заполни хотя бы название и ккал/100г', true); return; }
  postWebhook({
    action: 'add_product',
    barcode: currentBarcode,
    name, aliases: '',
    kcal_per_100g: kcal,
    protein_per_100g: protein,
    fat_per_100g: fat,
    carbs_per_100g: carbs,
    default_serving_g: serving,
    notes: 'добавлено вручную из сканера',
  });
});

// === Старт ===
window.addEventListener('load', startScanner);
