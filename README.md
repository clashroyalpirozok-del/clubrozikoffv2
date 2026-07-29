# Club Rozikoff

Сайт статистики клуба Brawl Stars: React-фронтенд + FastAPI-бэкенд,
задеплоенные на Vercel одним проектом (единый домен, без CORS-проблем).

## Структура проекта

```
├── api/                # Serverless-функция для Vercel (FastAPI)
│   ├── index.py         # все /api/* маршруты
│   ├── brawl.py          # клиент Brawl Stars API + трансформация данных
│   └── requirements.txt
├── frontend/            # React (CRA + craco) приложение
├── backend/             # Полноценный FastAPI-сервер для локальной разработки
│                         # / альтернативного (не-Vercel) хостинга. В деплой
│                         # на Vercel не участвует — используется папка api/.
└── vercel.json          # Конфигурация сборки и роутинга для Vercel
```

## Деплой на Vercel

1. Запушьте репозиторий в GitHub/GitLab/Bitbucket.
2. На vercel.com → **Add New Project** → выберите репозиторий.
   Root Directory оставляйте по умолчанию (корень репозитория) —
   `vercel.json` сам описывает, как собрать и фронтенд, и бэкенд.
3. В **Project Settings → Environment Variables** добавьте (см. `.env.example`):
   - `BRAWL_API_TOKEN` — токен с https://developer.brawlstars.com
     (важно: IP-адреса серверов Vercel динамические, поэтому в кабинете
     Brawl Stars API нужно использовать токен без привязки к IP, либо
     прокси-провайдера, который это поддерживает — см. раздел ниже).
   - `CLUB_TAG` — тег клуба по умолчанию, например `#29QLUYOPO`.
   - `CORS_ORIGINS` — можно оставить `*`.
4. Нажмите **Deploy**.

После деплоя фронтенд и API живут на одном домене:
- `/` — React-приложение
- `/api/club`, `/api/player/{tag}`, `/api/snapshot` — API

Фронтенд обращается к API по относительному пути `/api/...`
(см. `frontend/.env.production`), поэтому никаких дополнительных
настроек CORS/URL после деплоя не требуется.

### Про IP-привязку Brawl Stars API

Официальный Brawl Stars API требует привязку токена к конкретному IP,
а у serverless-функций Vercel IP не фиксирован. Если официальный API
будет отклонять запросы, есть два варианта:
- использовать прокси вроде RoyaleAPI (переменная окружения
  `BRAWL_API_BASE`, по умолчанию `https://api.brawlstars.com/v1`,
  можно заменить на `https://bsproxy.royaleapi.dev/v1`), которые не
  требуют статичного IP;
- либо держать бэкенд (папку `backend/`) на отдельном хостинге со
  статичным IP, а на Vercel оставить только фронтенд.

## Локальная разработка

Фронтенд:
```bash
cd frontend
yarn install
yarn start
```

Бэкенд (полная версия из папки backend, для локальной разработки):
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

Либо можно поднять именно serverless-версию из `api/` через Vercel CLI:
```bash
npm i -g vercel
vercel dev
```
