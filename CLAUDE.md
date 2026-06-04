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

> **Сессия 2026-06-04:** написаны Фазы 0, 1, 2, 3 (порядок: 0→1→3→2 по просьбе).
> Фаза 1 (дашборд) задеплоена и подтверждена. Фазы 0, 2, 3 — код локально готов, ждут
> коммита/деплоя. Также добавлен бэклог «Apple Watch → авто-калории» (см. ниже).
> Дальше: задеплоить 0/2/3, проверить в Telegram; на очереди Фаза 4 (полировка) или бэклог.
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

### Фаза 2 — Логи еды за день — `[~]` код готов, ждёт деплоя
- [~] Фронт: экран `#foodlog` — список записей за сегодня (описание · время · Б/Ж/У · ккал),
      сумма за день в подзаголовке, пустое состояние. `loadFoodLog()`/`renderFoodLog()`.
- [~] Бэк: `../n8n-fitness/Fitness_Bot_FoodLog.json`, `POST /webhook/food-log`.
      Validate → Read Food Log → `Compute Food Log` (фильтр по дате, сорт по времени, сумма) → Respond.
- [~] Удаление записи: фронт — кнопка `✕` на строке + `tg.showConfirm` + оптимистичное
      удаление, при ошибке `loadFoodLog()` возвращает правду. `deleteFood()`.
- [~] Бэк: `../n8n-fitness/Fitness_Bot_DeleteFood.json`, `POST /webhook/delete-food`.
      Validate → Read Food Log → `Verify Delete Target` → `Delete Food Row` → Respond.
      Удаляет по `row` (=idx+2, как в Phase 3 `Delete Food Row`), но СНАЧАЛА сверяет, что строка
      на этом месте всё ещё совпадает по `date`+`description` (защита от сдвига). Несовпадение →
      нода бросает ошибку → вебхук 500 → фронт показывает ошибку и перезагружает список.
- [~] **Переключение дней:** стрелки `‹ ›` (шаг в день, вперёд за сегодня нельзя). `viewDate`/
      `serverToday` (серверное «сегодня» берём из первого ответа, чтобы не зависеть от TZ клиента).
      `food-log` принимает опц. `date` в payload. `stepDay()`/`updateDayNav()`/`dayLabel()`.
- [~] **Повтор позиции:** кнопка `↻` на строке → `tg.showConfirm` → копия пишется в СЕГОДНЯ
      (независимо от открытого дня), тихо (без Telegram). `repeatFood()`.
- [~] Бэк: `../n8n-fitness/Fitness_Bot_RepeatFood.json`, `POST /webhook/repeat-food`.
      Validate (date=сегодня, time=сейчас, meal_type по часу) → `Append food_log`
      (нода из Barcode, мапит `payload.*` + `date/time/meal_type`) → Respond. GPT не трогает.
- **Юзеру:** импортировать `Fitness_Bot_FoodLog.json` (обновлён — `row` + приём `date`),
      `Fitness_Bot_DeleteFood.json`, `Fitness_Bot_RepeatFood.json`; креды `Google Sheets (SA)`,
      **активировать все три**.

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

## Бэклог / идеи на будущее

### Apple Watch → авто-калории тренировки → n8n
Цель: подтягивать **реальные** активные калории с Apple Watch вместо MET-оценки, чтобы
точнее считать дефицит. `Build Context` уже умеет: «если факт `kcal_burned` залогирован —
берём факт вместо плановой оценки», поэтому считалку менять не придётся.

Поток: `Apple Watch → HealthKit → Shortcuts/приложение → POST на n8n → upsert workout_log по дате`.

Варианты реализации (по росту автоматизма):
1. **Shortcuts по расписанию** (бесплатно, старт): Personal Automation «вечером в XX:00»,
   Run Immediately → `Find Workouts` (за сегодня) → active energy + duration → `Get Contents
   of URL` POST. ⚠️ Надёжного триггера «в момент конца тренировки» в Shortcts НЕТ — только
   расписание или ручная кнопка/Action Button.
2. **Health Auto Export** (платное приложение): REST-экспорт HealthKit по своим
   автоматизациям, почти сразу при новых данных. Самый «само и сразу».
3. Свой HealthKit-апп — оверкилл, не надо.

Что нужно на нашей стороне:
- **Отдельный вебхук** `POST /webhook/log-workout-burn` (или похожий). Авторизация НЕ через
  `initData` (у Shortcuts его нет) — **статичный секрет-токен** в `$env` n8n + в шорткате.
- Внутри: upsert в `workout_log` по `date`, поле `kcal_burned` (+ `duration_min`,
  `source='apple_watch'`).

Подводные камни:
- Брать active energy **конкретной тренировки**, НЕ дневной тотал (иначе задвоение с
  `baseline` + `walking_log`). Per-workout active energy ≈ «сверх покоя» — ложится в модель
  `BMR + baseline + walk + workout` без двойного счёта.
- Дату слать строкой `YYYY-MM-DD` (n8n в `Europe/Moscow`).
- Несколько тренировок в день — суммировать; ключ upsert — дата.

## Оценка (грубо, при условии: код пишет Claude, деплоит пользователь)

- Фаза 0: ~0.5 дня · Фаза 1: ~0.5 дня · Фаза 2: ~0.3 дня ·
  Фаза 3 (с персистентными тогглами): ~0.5–1 день · Фаза 4: ~0.5 дня.
- **Итого v1: ~2–3 сфокусированных дня.** Рискованного в стеке нет.

## Решения и допущения

- Остаёмся на **ванилле** (3–4 простых экрана). Фреймворк/сборка — оверкилл; вернуться
  к вопросу, только если приложение сильно разрастётся.
- Переезд на БД: **не трогает фронт** — переписываются только n8n-эндпоинты под теми же
  контрактами. Поэтому контракты выше фиксированы заранее.
