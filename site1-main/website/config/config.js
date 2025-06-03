/**
 * Конфигурация для приложения
 * Замените значения на ваши Discord Client ID и Secret
 */
module.exports = {
  // Настройки сервера
  PORT: process.env.PORT || 3000,
  
  // MongoDB подключение
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/minestory',
  
  // Discord OAuth2 настройки
  DISCORD: {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID || 'ВАШ_DISCORD_CLIENT_ID',
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || 'ВАШ_DISCORD_CLIENT_SECRET',
    CALLBACK_URL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
    SCOPE: ['identify', 'email']
  },
  
  // Секрет для сессий
  SESSION_SECRET: process.env.SESSION_SECRET || 'MineStorySecretChangeThis'
}; 