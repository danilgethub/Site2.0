const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const path = require('path');
const fs = require('fs');

/**
 * Маршруты профиля пользователя
 * Все маршруты защищены middleware isAuthenticated
 */

// Страница профиля пользователя
router.get('/', isAuthenticated, (req, res) => {
  // Читаем HTML файл
  const filePath = path.join(__dirname, '../profile.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла профиля:', err);
      return res.status(500).send('Ошибка сервера');
    }
    
    // Отправляем страницу профиля
    res.send(data);
  });
});

// API для получения данных пользователя
router.get('/api/user', isAuthenticated, (req, res) => {
  // Отправляем данные пользователя (без чувствительной информации)
  const safeUser = {
    username: req.user.username,
    discriminator: req.user.discriminator,
    avatar: req.user.avatar,
    minecraftUsername: req.user.minecraftUsername,
    roles: req.user.roles,
    subscription: req.user.subscription,
    joinedAt: req.user.joinedAt
  };
  
  res.json(safeUser);
});

// API для обновления имени в Minecraft
router.post('/api/minecraft-username', isAuthenticated, async (req, res) => {
  try {
    const { minecraftUsername } = req.body;
    
    if (!minecraftUsername) {
      return res.status(400).json({ error: 'Имя пользователя Minecraft не указано' });
    }
    
    // Обновляем имя пользователя в Minecraft
    req.user.minecraftUsername = minecraftUsername;
    await req.user.save();
    
    res.json({ success: true, minecraftUsername });
  } catch (err) {
    console.error('Ошибка обновления имени в Minecraft:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 