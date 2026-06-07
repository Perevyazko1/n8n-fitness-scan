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

> **Сессия 2026-06-07 (`?v=18`):** правки по скринам. (1) Убраны кнопки `⟳` со всех
> экранов (дашборд/еда/трен) — данные и так грузятся при открытии вкладки. (2) Отступ
> под «＋ Добавить из продуктов» (`#food-add-from { margin-bottom }`). (3) Логика бюджета
> тренировки переписана: расход тренировки попадает в лимит ккал ТОЛЬКО после
> «Завершить тренировку», и считается по ВЫПОЛНЕННЫМ (отмеченным) упражнениям
> (`calc.done_workout_stats`), а не по всему блоку. До подтверждения плановый расход в
> бюджет НЕ добавляется (убран pre-add в `compute_dashboard`). (4) Кнопка «Завершить
> тренировку» деактивируется, когда тренировка подтверждена (`d.logged`), и рядом
> появляется «Отменить завершение» (тест-кнопка) → эндпоинт `uncomplete-workout`
> удаляет строку `workout_log` → лимит ккал уменьшается. Бэк: новые
> `done_workout_stats`, `uncomplete_workout` + правка `complete_workout`/`compute_dashboard`.
> (5) Бот выровнен под ту же логику: в `Build Context` (ОБА файла `Fitness_Bot_Phase_3_PG.json`
> и `_PG_v2.json`) убран pre-add планового расхода — тренировка в бюджет только по факту
> `workout_log.kcal_burned` после подтверждения. Бот при импорте подхватит. **Юзеру:** чтобы
> применилось в боте — переимпортировать активный `Fitness_Bot_Phase_3_PG.json` (или сразу `_PG_v2`).
>
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

### Фаза 4 — Дизайн/полировка — `[~]` код готов, ждёт деплоя (фронт-only, бэк не трогали)
- [~] Дизайн-токены в `:root` (`--radius`, `--card-bg`, `--track`); карточки/строки/бары
      приведены к единым скруглению и фону.
- [~] Скелетоны загрузки (shimmer) вместо текста «Загрузка…» на всех 3 экранах.
- [~] Иконка `⟳` крутится во время запроса (`setRefreshing()` + `.icon-btn.spinning`).
- [~] Плавное появление контента вкладки (`fadeIn`), хаптик `selectionChanged` при смене таба.
- [~] Нативная тема Telegram: `setHeaderColor`/`setBackgroundColor` + `disableVerticalSwipes`
      (чтобы свайп-вниз не закрывал приложение при скролле). Всё под `try`/optional-chaining.
- РЕШЕНИЕ: **pull-to-refresh НЕ делаем** — конфликтует с жестом Telegram (свайп закрывает/
      сворачивает мини-апп). Обновление — кнопкой `⟳`.
- **Юзеру:** только фронт — commit/push (`?v=9`). Бэкенд не менялся.

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

### Переезд на нормальную БД + Django-бэкенд (главная веха)
**Детальный план:** `../n8n-fitness/MIGRATION_PLAN.md` (схема БД, порядок, риски, оценка).
РЕШЕНИЕ (2026-06-04): Google Sheets → нормальная БД, бэк, скорее всего, на **Django**.
До переезда — НИЧЕГО в n8n не консолидируем (см. ниже), правим всё уже на Django.

Что переезжает и как:
- **Контракты вебхуков из этого файла — это и есть будущий API Django.** Держать их
  стабильными: фронт (Mini App) при переезде НЕ меняется, переписывается только бэк.
  Пути: `dashboard`, `food-log`, `workout-today`, `toggle-exercise`, `delete-food`,
  `repeat-food`, `scan-barcode` (+ будущий `log-workout-burn` для Apple Watch).
- **Сущности БД** (из листов Sheets): `profile`, `food_log`, `workout_log`, `workouts_flat`,
  `workout_blocks`, `workout_done`, `walking_log`, `products`, `body_params`. Сейчас всё
  single-user (без `chat_id` в строках) — при переезде заложить `user` сразу, на будущее.
- **Авторизация:** валидацию Telegram `initData` (HMAC) — в одно место (middleware Django),
  сейчас она скопирована в 7 n8n-воркфлоу.
- **Общий расчёт** (`expected_today`, целевые ккал/дефицит) — сейчас дублируется в `Build
  Context` (бот), `Dashboard`, `WorkoutToday`. На Django станет одной функцией/сервисом.

Консолидация n8n — ОТЛОЖЕНА до переезда (обсудили 2026-06-04, решили не трогать):
- Слить 6 webhook'ов Mini App → один API (один `Validate`/auth). На Django это и так решится.
- Слить 5 кронов (Morning/Midday/Evening/Cron/Weekly) в один воркфлоу с N расписаниями.
  Вопрос на подумать: 4 пинга/день (08/14/21:30/23:00) — возможно, 23:00 и 14:00 дублируют друг друга.
- Удалить мёртвое: `Phase_1`, `Phase_2` (старые боты, заменены `Phase_3`), дубль `Phase_3` (05-06).
- LLM-бот (`Phase_3`) остаётся отдельным сервисом (Telegram + LLM) — не сливать с data-API.

### Бот «знает всю историю» — отвечать на любые вопросы по данным (после переезда на БД)
Хотим: «какая тренировка была вчера», «что я ел 15 августа», «расскажи мою программу».
РЕШЕНИЕ по подходу (2026-06-05): **НЕ векторная БД.** Данные структурные (точные
даты/числа в Postgres) → нужна **структурная выборка (tool-use), а не семантический поиск**.
Вектор для точных дат/чисел промахивается и выдумывает.
- **Подход A (рекоменд.):** набор безопасных параметризованных тулзов к БД —
  `get_food(дата|период)`, `get_workouts(период)`, `get_program()`, `get_progress()`,
  `summary(период)`. LLM выбирает тулзу+параметры, бэкенд гоняет SQL, LLM отвечает по JSON.
  SQL пишет НЕ модель → нет инъекций. Обобщение нынешнего `Build Context` (он уже грузит
  данные за сегодня) на «любой день/период по требованию».
- **Подход B (мощнее, позже):** text-to-SQL по схеме + read-only роль в PG + таймаут.
- НЕ грузить всю БД в контекст каждый запрос (токены/масштаб) — тулзы достают только нужное.
- **Вектора пригодятся отдельно** для НЕструктурированного: заметки, прошлые советы тренера,
  «когда я жаловался на колено» — семантический поиск по тексту бесед. Это дополнение, не основа.
- Делать ПОСЛЕ миграции (нужна queryable БД + API-слой для тулзов).

### Мультиюзер + пароль-гейт — ПОСТРОЕНО (2026-06-05), ждёт деплоя в порядке ниже
Реализовано: миграция `0002_tguser_approved` (existing→approved=True), gate в middleware
(не approved → 403 `not_registered`), фронт-экран `#reggate` (`?v=15`), бот `Fitness_Bot_Phase_3_PG_v2.json`
(reads фильтруются по chat_id, `Read Allowed Profiles WHERE approved`, ветка Reg Check→Register User→
Reply Registered), `REGISTRATION_PASSWORD` в compose/`.env`. Весь SQL провалидирован в живой БД.
**Порядок деплоя:** (1) задать `REGISTRATION_PASSWORD` в `.env`; (2) push+`deploy.sh` (применит миграцию,
включит gate); (3) **рестарт n8n** `docker compose up -d n8n` (подхватить env-пароль, краткий блип);
(4) импортировать `*_PG_v2` дублем; (5) тест со ВТОРОГО аккаунта (молчит → пароль → «доступ открыт»),
свой аккаунт работает; (6) ок → активировать v2, старый PG удалить.

Исходные решения (для справки):
Цель: новые юзеры регистрируются по паролю, у каждого свои данные. При первом старте бот
просит пароль: верный → доступ открыт; неверный → бот вообще НЕ реагирует (молчит).
РИСК: трогает живого бота (auth + ВСЕ чтения) — делать как PG-миграцию: новый бот дублем,
тест, потом переключение. НЕ big-bang.

План (всё подготовлено к реализации):
1. **БД:** `TgUser.approved` (bool). Дата-миграция: существующему юзеру (648226895) `approved=True`,
   иначе залочится. Новые → `approved=False` до регистрации.
2. **Бот `Phase_3_PG`, Auth Guard:** незнакомец/не-approved пишет →
   если `text == $env.REGISTRATION_PASSWORD` → upsert `TgUser(approved=True)` + ответ «доступ открыт»;
   иначе `return []` (молчим). `Read Allowed Profiles` → `... WHERE approved`.
3. **Бот, ВСЕ read-SELECT'ы:** добавить фильтр по юзеру —
   `WHERE user_id = (SELECT id FROM fitness_tguser WHERE telegram_id = {{ $('Telegram Trigger').first().json.message.from.id }})`
   (для profile-ридов — `WHERE t.telegram_id = {{chat_id}}`). Products оставить глобальным.
   Writes УЖЕ per-user (резолвят user по chat_id через JOIN) — их не трогать.
4. **Django middleware:** `ensure_user` создаёт с `approved=False`; если не approved → 403 `not_registered`.
5. **Фронт:** на 403 `not_registered` → РЕШЕНО: экран-блок «Отправь пароль боту, чтобы открыть приложение».
6. **Пароль:** `REGISTRATION_PASSWORD` в `.env` + в `docker-compose` n8n env (рядом с TELEGRAM_BOT_TOKEN) →
   рестарт n8n (короткий блип бота). Значение придумывает юзер.

Django УЖЕ мультиюзерный (вьюхи фильтруют по `request.tg_user`) — там только gate добавить.

## Оценка (грубо, при условии: код пишет Claude, деплоит пользователь)

- Фаза 0: ~0.5 дня · Фаза 1: ~0.5 дня · Фаза 2: ~0.3 дня ·
  Фаза 3 (с персистентными тогглами): ~0.5–1 день · Фаза 4: ~0.5 дня.
- **Итого v1: ~2–3 сфокусированных дня.** Рискованного в стеке нет.

## Решения и допущения

- Остаёмся на **ванилле** (3–4 простых экрана). Фреймворк/сборка — оверкилл; вернуться
  к вопросу, только если приложение сильно разрастётся.
- Переезд на БД: **не трогает фронт** — переписываются только n8n-эндпоинты под теми же
  контрактами. Поэтому контракты выше фиксированы заранее.
