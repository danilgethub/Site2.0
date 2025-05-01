const express = require('express');
const path = require('path');
const compression = require('compression');
const session = require('express-session');
const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Конфигурация Discord-бота
const DISCORD_BOT_API = process.env.DISCORD_BOT_API || 'http://localhost:3001';

// Функция для отправки данных пользователя боту
async function registerUserWithBot(user) {
  try {
    const response = await fetch(`${DISCORD_BOT_API}/api/register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        discordId: user.id,
        username: user.username,
        avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null
      })
    });
    
    const data = await response.json();
    console.log('Регистрация пользователя у бота:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при регистрации пользователя у бота:', error);
    return { error: 'Ошибка связи с ботом' };
  }
}

// Функция для отправки уведомления пользователю
async function sendNotificationToUser(discordId, message) {
  try {
    const response = await fetch(`${DISCORD_BOT_API}/api/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        discordId,
        message
      })
    });
    
    const data = await response.json();
    console.log('Отправка уведомления пользователю:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при отправке уведомления пользователю:', error);
    return { error: 'Ошибка связи с ботом' };
  }
}

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
    // После успешной авторизации регистрируем пользователя у бота
    if (req.user) {
      await registerUserWithBot(req.user);
    }
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
  }
  
  res.redirect('/');
});

// Роут для получения информации о пользователе
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Роут для выхода
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Роут для отправки уведомления пользователю
app.post('/api/notify-user', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Сообщение не указано' });
  }
  
  try {
    const result = await sendNotificationToUser(req.user.id, message);
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при отправке уведомления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Роут для обработки всех остальных запросов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.json({ status: 'Bot API running', uptime: process.uptime() });
});

app.use(cors());

// На динамический import с async/await
const fetch = require('node-fetch'); 

// На динамический import с async/await
import('node-fetch').then(module => {
  const fetch = module.default;
  // Код, использующий fetch
}); 
