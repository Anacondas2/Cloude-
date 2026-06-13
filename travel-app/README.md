# 🌍 Trewel — В каких странах ты был?

Премиальная мобильная веб-форма для Telegram-групп. Пользователь выбирает
страны, в которых побывал, отправляет ответ — и его список появляется в
**общей публичной ленте** путешествий группы.

Дизайн в стиле **spatial web / dark-green luxury**: глассморфизм, мягкий
неоморфизм, кинематографичные переходы и «живые» карточки стран с
анимациями выбора (Framer Motion).

## ✨ Возможности

- **Лендинг** с парящими 3D-объектами и cinematic-входом
- **Шаг с именем / Telegram-юзернеймом** (неоморфный инпут)
- **Выбор стран** — 90+ стран, поиск, фильтр по регионам, премиальные карточки
- **Анимация выбора** — spring-чекмарк, свечение, световой свип, акцент страны
- **Модалка подтверждения** перед публикацией
- **Публичная лента** «Карта путешествий группы»:
  - Все участники
  - 🔥 Самые популярные страны
  - 🏆 Кто посетил больше всего стран
  - 💎 Редкие страны
  - Анимированные счётчики
- **Шеринг в Telegram** одной кнопкой
- Работает как **Telegram Mini App** (авто-разворот, haptics, prefill имени)

## 🧱 Стек

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase

## 🚀 Запуск локально

```bash
npm install
cp .env.example .env.local   # заполни Supabase ключи (необязательно для теста)
npm run dev
```

> Без Supabase приложение работает на `localStorage` — данные хранятся
> локально в браузере, чтобы можно было сразу всё потрогать.

## 🗄️ Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. SQL Editor → выполни `supabase/schema.sql`
3. Project Settings → API → скопируй `URL` и `anon key` в `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

RLS настроен так, что любой может **читать** публичные записи и **создавать**
свои, но **не может редактировать или удалять** чужие.

## ☁️ Деплой на Vercel

1. Импортируй репозиторий на [vercel.com](https://vercel.com)
2. Добавь env-переменные (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`)
3. Deploy → получишь публичный URL

## 🤖 Telegram Mini App

1. @BotFather → создай бота → **Mini Apps → Enable** → вставь URL с Vercel
2. (Опционально) запусти `bot/bot.mjs` с `BOT_TOKEN` и `WEBAPP_URL`, чтобы
   `/start` открывал приложение кнопкой.

## 📁 Структура

```
app/            — страницы (flow + /results)
components/     — переиспользуемые компоненты (см. список в задаче)
lib/            — данные стран, типы, supabase, статистика
supabase/       — SQL-схема
bot/            — Telegram-бот (long polling)
```
