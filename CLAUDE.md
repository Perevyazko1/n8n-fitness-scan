# CLAUDE.md — n8n-fitness-scan (фронт Mini App)

Заметки для Claude Code. **Это репозиторий фронтенда.** Бэкенд (n8n-воркфлоу,
вебхуки, Google Sheets) живёт в соседнем репо `../n8n-fitness`.

## Что это

Telegram Mini App для фитнес-бота. Ванильный HTML/JS/CSS, **без сборки**,
хостинг — **GitHub Pages** (`https://perevyazko1.github.io/n8n-fitness-scan/`).
Изначально — только сканер штрихкодов; сейчас расширяем до многостраничного
приложения (дашборд / еда / тренировка).

## Куда ходим править (карта файлов)

- `index.html` — разметка всех экранов. Паттерн: `<div class="screen">`,
  активный помечается классом `.active`, переключается `showScreen(name)`.
- `main.js` — вся логика. Ключевые хелперы уже есть и переиспользуются:
  - `showScreen(name)` — навигация между экранами;
  - `postWebhook(payload, btn)` / `setBusy()` / `showStatus()` — отправка в n8n + UI;
  - авторизация: `INIT_DATA = tg.initData` шлётся в каждом запросе;
  - **трюк против CORS preflight:** запросы POST с `Content-Type: text/plain`
    (не application/json!) — иначе браузер шлёт OPTIONS, а вебхук n8n его не ловит.
- `styles.css` — стили. Темизация бесплатно через CSS-переменные Telegram
  (`--tg-theme-bg-color`, `--tg-theme-button-color`, `--tg-theme-text-color`, …).
- `README.md` — описание сканера (не трогаем без нужды).

**Деплой:** пуш в `main` → GitHub Pages обновляется за ~1 мин. Локально камера на
`http://` не работает — фронт-логику новых страниц можно гонять локально
(`python3 -m http.server 8000`), но финальная проверка — в Telegram.

## Разделение ролей (как в основном репо)

- **Локально:** правки в файлах делает Claude. `git add/commit/push` — пользователь.
- **n8n-вебхуки:** Claude правит JSON-экспорты в репо `../n8n-fitness`; импорт в n8n
  и любые действия на VPS (`217.60.61.145`) — только пользователь. На сервере
  Claude read-only.

## Архитектура связи с бэком

Фронт НЕ знает про Google Sheets. Он ходит в **вебхуки n8n**, которые отдают/пишут
JSON. Это специально: при будущем переезде Sheets → нормальная БД меняются только
воркфлоу/бэкенд, а Mini App остаётся как есть. **Поэтому контракты вебхуков ниже —
это стабильный API, держим его неизменным.**

Все новые эндпоинты: `POST`, `Content-Type: text/plain`, тело `{ initData, ...}`,
ответ — JSON. (Существующий `/webhook/scan-barcode` — пример записи.)

### Контракты (целевые)

`POST /webhook/dashboard` → состояние на сегодня:
```json
{ "date":"2026-06-04",
  "workout_today": { "is_workout": true, "label":"№1 — Грудь + Бицепс", "block_num":1 },
  "kcal":    { "target":1687, "eaten":243, "left":1444 },
  "protein": { "target":137,  "eaten":17,  "left":120 },
  "fat":     { "target":76,   "eaten":5 },
  "carbs":   { "target":193,  "eaten":3 } }
```
Источник почти готов: нода `Build Context` в `Fitness_Bot_Phase_3` уже считает
`expected_today`, `targetKcalTodayClamped`, `todaySum` — переиспользуем логику.

`POST /webhook/food-log` → съеденное за сегодня:
```json
{ "date":"2026-06-04",
  "items":[{"time":"08:30","description":"творог 5% 100г","kcal":121,"protein":17,"fat":5,"carbs":3}],
  "sum":{"kcal":243,"protein":17,"fat":5,"carbs":3} }
```

`POST /webhook/workout-today` → план на сегодня + статус галочек:
```json
{ "date":"2026-06-04","is_workout":true,"label":"№1 — Грудь + Бицепс","block_num":1,
  "exercises":[{"id":"1::Жим лёжа","group":"Грудь","exercise":"Жим лёжа","sets":"4","reps":"8-10","weight":"60","done":false}] }
```

`POST /webhook/toggle-exercise` → переключить галочку (upsert):
```json
// запрос: { initData, date:"2026-06-04", block_num:1, exercise:"Жим лёжа", done:true }
// ответ:  { "ok": true }
```

### Новая сущность данных (для тогглов)

Тогглов «выполнил/не выполнил» по упражнениям сейчас НЕТ — `workout_log` хранит
тренировку одной строкой. Нужен отдельный лист/таблица **`workout_done`**:

| date | block_num | exercise | done | updated_at |
|------|-----------|----------|------|------------|

Ключ upsert = `date + block_num + exercise`. Спроектировано как чистая сущность
`(date, exercise, done)` — 1:1 ляжет в будущую таблицу БД.

## ПЛАН (по фазам) и СТАТУС

> Легенда: `[ ]` не начато · `[~]` код готов локально, НЕ задеплоен · `[x]` готово и задеплоено.
> Обновлять этот раздел в КОНЦЕ каждой сессии.

> **Сессия 2026-06-04:** написаны Фазы 0, 1, 3 (Фазу 3 делали раньше Фазы 2 по просьбе).
> Фаза 1 (дашборд) — пользователь уже задеплоил и подтвердил, работает. Фазы 0 и 3 —
> код локально готов, ждут коммита/деплоя. Дальше после деплоя Фазы 3: проверить тренировку
> с тогглами в Telegram, затем Фаза 2 (логи еды).
>
> **⚠️ Перед активацией Фазы 3:** в Google-таблице создать вкладку **`workout_done`**
> с шапкой в первой строке: `date | block_num | exercise | done | updated_at`.
> Без неё read/upsert-ноды упадут (read стоит с `onError: continue`, но upsert требует лист).

### Фаза 0 — Каркас (фронт) — `[~]` код готов, ждёт деплоя
- [~] Нижний таб-бар (`index.html` `<nav.tabbar>`, `main.js` `goTab()`).
      Еда/Трен — заглушки `.soon` до Фаз 2–3.
- [~] `showScreen` обобщён; `goTab()` рулит вкладками, гасит камеру при уходе со сканера
      и стартует её только на вкладке «Сканер». Старт приложения теперь с «Главной».
- [~] Хелпер `api(path, payload)` в `main.js` (POST+text/plain, шлёт `initData`, JSON).
- [~] Состояния `loading` / `error-box` / `soon` (`styles.css`).

### Фаза 1 — Главная (дашборд) — `[x]` задеплоено, работает
- [~] Фронт: экран `#dashboard` — карточки «тренировка сегодня», «калории» (бар + остаток),
      «макросы» Б/Ж/У. Рефреш при открытии + кнопка `⟳`. `loadDashboard()`/`renderDashboard()`.
- [~] Бэк: `../n8n-fitness/Fitness_Bot_Dashboard.json`, `POST /webhook/dashboard`.
      Webhook → Inject Env → Validate & Parse (HMAC initData, как в Barcode) →
      6 read-нод (parallel) → Merge(6) → `Compute Dashboard` (расчёт из `Build Context`) →
      Respond (JSON + CORS `*`).
      **Юзеру:** импортировать в n8n, проверить креды `Google Sheets (SA)`, **активировать**.

### Фаза 2 — Логи еды за день
- [ ] Фронт: список записей `food_log` за сегодня + сумма; (опц.) удаление записи.
- [ ] Бэк: `POST /webhook/food-log`.

### Фаза 3 — Упражнения с тогглами — `[~]` код готов, ждёт деплоя
- [ ] **Данные (за юзером):** создать вкладку `workout_done` с шапкой
      `date | block_num | exercise | done | updated_at`. **Обязательно до активации.**
- [~] Бэк: `../n8n-fitness/Fitness_Bot_WorkoutToday.json`, `POST /webhook/workout-today`.
      5 read-нод (+ новый `Read Workout Done`, `onError: continue`) → Merge(5) →
      `Compute Workout Today` (expected_today + мерж плана `workouts_flat` с галочками) → Respond.
- [~] Бэк: `../n8n-fitness/Fitness_Bot_ToggleExercise.json`, `POST /webhook/toggle-exercise`.
      Validate → `Prepare Row` → `Upsert workout_done` (appendOrUpdate, match по
      `date+block_num+exercise`, пишет `done=TRUE/FALSE`) → Respond.
- [~] Фронт: экран `#workout` — список упражнений со свитчерами, подзаголовок «выполнено N из M»,
      оптимистичный тоггл + POST + откат при ошибке. `loadWorkout()`/`renderWorkout()`/`toggleExercise()`.
- РЕШЕНИЕ: тогглы **персистентные** (держатся между открытиями), single-user — в `workout_done`
  нет колонки chat_id (как и в food_log/workout_log: вся таблица = один человек).
- **Юзеру:** импортировать оба workflow, проверить креды `Google Sheets (SA)`, **активировать оба**.

### Фаза 4 — Дизайн/полировка
- [ ] Единый визуальный стиль карточек, отступы, типографика.
- [ ] Состояния загрузки/ошибки/пусто на всех экранах.
- [ ] (опц.) Pull-to-refresh / кнопка обновить.

## Оценка (грубо, при условии: код пишет Claude, деплоит пользователь)

- Фаза 0: ~0.5 дня · Фаза 1: ~0.5 дня · Фаза 2: ~0.3 дня ·
  Фаза 3 (с персистентными тогглами): ~0.5–1 день · Фаза 4: ~0.5 дня.
- **Итого v1: ~2–3 сфокусированных дня.** Рискованного в стеке нет.

## Решения и допущения

- Остаёмся на **ванилле** (3–4 простых экрана). Фреймворк/сборка — оверкилл; вернуться
  к вопросу, только если приложение сильно разрастётся.
- Переезд на БД: **не трогает фронт** — переписываются только n8n-эндпоинты под теми же
  контрактами. Поэтому контракты выше фиксированы заранее.
