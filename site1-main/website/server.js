const express = require('express');
const path = require('path');
const compression = require('compression');
const session = require('express-session');
const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// URL для API бота Discord (локальное окружение или указанное в .env)
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001/api';

// Разрешаем парсинг JSON запросов
app.use(express.json());

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 час
  }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Настройка стратегии Discord
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
  scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
  // В реальном приложении здесь можно сохранить пользователя в базу данных
  return done(null, profile);
}));

// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Включаем сжатие для увеличения производительности
app.use(compression());

// Настраиваем обслуживание статических файлов из текущей директории
app.use(express.static(path.join(__dirname)));

// Роуты для авторизации
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), async (req, res) => {
  try {
    // Пользователь успешно авторизовался через Discord
    const user = req.user;
    
    // Отправляем уведомление боту о входе пользователя
    if (user && user.id) {
      try {
        const response = await fetch(`${BOT_API_URL}/user-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            username: user.username
          }),
        });
        
        if (response.ok) {
          console.log(`Уведомление о входе отправлено боту для пользователя ${user.username} (${user.id})`);
        } else {
          console.error('Ошибка при отправке уведомления боту:', await response.text());
        }
      } catch (error) {
        console.error('Ошибка при взаимодействии с ботом:', error);
      }
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('Ошибка после авторизации:', error);
    res.redirect('/');
  }
});

// Роут для получения информации о пользователе
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Роут для отправки сообщения через бота
app.post('/api/send-message', async (req, res) => {
  try {
    // Проверяем авторизацию
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }
    
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ success: false, message: 'Отсутствуют userId или сообщение' });
    }
    
    // Отправляем запрос боту для отправки сообщения
    const response = await fetch(`${BOT_API_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, message }),
    });
    
    if (response.ok) {
      return res.status(200).json(await response.json());
    } else {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения через бота:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Роут для выхода
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Роут для обработки всех остальных запросов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
