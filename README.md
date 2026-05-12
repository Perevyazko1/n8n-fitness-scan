# n8n-fitness-scan

Telegram Mini App — сканер штрихкодов для фитнес-бота.

## Что делает

1. Открывается из чата с ботом по кнопке «📷 Сканер».
2. Сканирует штрихкод камерой (ZXing-browser).
3. Ищет продукт в Open Food Facts.
4. Показывает карточку с КБЖУ.
5. Кнопки:
   - **Съел Nг** → пишет в Google Sheets `food_log`.
   - **В продукты** → пишет в Google Sheets `products` (upsert по штрихкоду).
6. Если штрихкод не нашёлся в OFF — даёт форму ввести КБЖУ руками.

## Без ИИ

Все запросы идут напрямую: камера → OFF API → webhook n8n → Google Sheets. LLM не задействована.

## Деплой

GitHub Pages: Settings → Pages → Deploy from branch `main` / root.
После пуша страница живая через ~1 минуту по адресу `https://perevyazko1.github.io/n8n-fitness-scan/`.

## Связка с ботом

URL мини-аппа указан в @BotFather (Menu Button). Webhook на стороне n8n: `https://n8n-fitness.ru/webhook/scan-barcode` (см. `Fitness_Bot_Barcode.json` в репо `n8n-fitness`).

## Локальная разработка

`python3 -m http.server 8000` в этой папке — но камера в браузере на `http://` не работает; для теста проще пушнуть и проверять прямо в Telegram.
