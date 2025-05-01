const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');
const config = require('./config');

// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Десериализация пользователя
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Настройка Discord стратегии
passport.use(new DiscordStrategy({
  clientID: config.DISCORD.CLIENT_ID,
  clientSecret: config.DISCORD.CLIENT_SECRET,
  callbackURL: config.DISCORD.CALLBACK_URL,
  scope: config.DISCORD.SCOPE
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Ищем пользователя в БД
    let user = await User.findOne({ discordId: profile.id });
    
    // Если пользователя нет, создаем нового
    if (!user) {
      user = await User.create({
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email
      });
    } else {
      // Обновляем информацию о пользователе
      user.username = profile.username;
      user.discriminator = profile.discriminator;
      user.avatar = profile.avatar;
      user.email = profile.email;
      user.lastLoginAt = Date.now();
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport; 