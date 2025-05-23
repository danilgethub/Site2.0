const mongoose = require('mongoose');

/**
 * Модель пользователя для хранения данных игроков
 * Содержит информацию об учетной записи Discord и данные игрока
 */
const userSchema = new mongoose.Schema({
  // Discord данные
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  discriminator: {
    type: String
  },
  avatar: {
    type: String
  },
  email: {
    type: String
  },
  
  // Игровые данные
  minecraftUsername: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Роли и привилегии
  roles: {
    type: [String], 
    default: ['player']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // Статистика и настройки
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  
  // Подписки и донат
  subscription: {
    type: {
      type: String,
      enum: ['none', 'msplus'],
      default: 'none'
    },
    expiresAt: Date
  },
  
  // Баланс и рулетка
  coins: {
    type: Number,
    default: 0
  },
  lastSpinTime: {
    type: Date,
    default: null
  },
  totalSpins: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema); 
