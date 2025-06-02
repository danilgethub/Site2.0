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
    discordId: req.user.discordId,
    username: req.user.username,
    discriminator: req.user.discriminator,
    avatar: req.user.avatar,
    minecraftUsername: req.user.minecraftUsername,
    roles: req.user.roles,
    subscription: req.user.subscription,
    joinedAt: req.user.joinedAt,
    coins: req.user.coins || 0,
    lastSpinTime: req.user.lastSpinTime,
    totalSpins: req.user.totalSpins || 0
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

// API для проверки готовности рулетки
router.get('/api/roulette/status', isAuthenticated, (req, res) => {
  const now = new Date();
  const lastSpin = req.user.lastSpinTime;
  const cooldownHours = 5; // Время между вращениями в часах
  
  // Проверяем, прошло ли достаточно времени с последнего вращения
  let canSpin = true;
  let timeRemaining = 0;
  
  if (lastSpin) {
    const cooldownTime = cooldownHours * 60 * 60 * 1000;
    const timePassed = now.getTime() - new Date(lastSpin).getTime();
    
    if (timePassed < cooldownTime) {
      canSpin = false;
      timeRemaining = cooldownTime - timePassed;
    }
  }
  
  res.json({
    canSpin: canSpin,
    timeRemaining: timeRemaining,
    cooldownHours: cooldownHours
  });
});

// API для запуска рулетки
router.post('/api/roulette/spin', isAuthenticated, async (req, res) => {
  try {
    const now = new Date();
    const lastSpin = req.user.lastSpinTime;
    const cooldownHours = 5; // Время между вращениями в часах
    
    // Проверяем, прошло ли достаточно времени с последнего вращения
    if (lastSpin) {
      const cooldownTime = cooldownHours * 60 * 60 * 1000;
      const timePassed = now.getTime() - new Date(lastSpin).getTime();
      
      if (timePassed < cooldownTime) {
        return res.status(400).json({ 
          error: 'Рулетка еще не готова',
          timeRemaining: cooldownTime - timePassed
        });
      }
    }
    
    // Генерируем случайное количество монет
    const prizes = [
      { value: 5, probability: 0.25 },
      { value: 10, probability: 0.35 },
      { value: 20, probability: 0.20 },
      { value: 50, probability: 0.15 },
      { value: 100, probability: 0.05 }
    ];
    
    // Выбираем приз на основе вероятности
    const random = Math.random();
    let cumulativeProbability = 0;
    let wonPrize = prizes[0].value;
    
    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        wonPrize = prize.value;
        break;
      }
    }
    
    // Обновляем данные пользователя
    req.user.coins = (req.user.coins || 0) + wonPrize;
    req.user.lastSpinTime = now;
    req.user.totalSpins = (req.user.totalSpins || 0) + 1;
    await req.user.save();
    
    // Возвращаем результат
    res.json({
      success: true,
      prize: wonPrize,
      newBalance: req.user.coins,
      totalSpins: req.user.totalSpins
    });
  } catch (err) {
    console.error('Ошибка запуска рулетки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 
