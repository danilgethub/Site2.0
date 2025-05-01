# Инструкция по деплою на Render

## 1. Подготовка Discord приложения

1. Перейдите на [Discord Developer Portal](https://discord.com/developers/applications)
2. Создайте новое приложение (New Application)
3. В разделе OAuth2 настройте:
   - Добавьте редиректы:
     - Для разработки: `http://localhost:3000/auth/discord/callback`
     - Для продакшена: `https://{ваш-render-url}/auth/discord/callback`
   - Скопируйте Client ID и Client Secret

## 2. Настройка проекта

1. Создайте файл `.env` в папке `/website` со следующим содержимым:
```
# Discord OAuth2 credentials
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# Session secret
SESSION_SECRET=your_random_secret_string_here
```

2. Установите необходимые пакеты:
```bash
cd website
npm install
npm install passport
npm install cors
```

## 3. Деплой на Render

1. Создайте аккаунт на [Render](https://render.com)
2. Нажмите "New" > "Web Service"
3. Подключите свой GitHub репозиторий (предварительно загрузите код на GitHub)
4. Настройте Web Service:
   - Name: `minestory-website` (или другое название)
   - Root Directory: `website`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Выберите Free Plan

5. Добавьте следующие переменные окружения в разделе "Environment":
   - `DISCORD_CLIENT_ID` = ваш Discord Client ID
   - `DISCORD_CLIENT_SECRET` = ваш Discord Client Secret
   - `DISCORD_CALLBACK_URL` = `https://{ваш-render-url}/auth/discord/callback`
   - `SESSION_SECRET` = случайная строка для шифрования сессий

6. Нажмите "Create Web Service"

## 4. После деплоя:

1. Получите URL вашего сайта (например, https://minestory-website.onrender.com)
2. Вернитесь в Discord Developer Portal
3. Обновите redirect URL, добавив ваш Render URL: `https://{ваш-render-url}/auth/discord/callback`
4. Сохраните изменения

Готово! Ваш сайт с авторизацией через Discord должен быть доступен на Render. 
