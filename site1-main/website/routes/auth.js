const express = require('express');
const passport = require('passport');
const router = express.Router();

/**
 * Маршруты авторизации через Discord
 */

// Начало авторизации через Discord
router.get('/discord', passport.authenticate('discord'));

// Обработка колбэка после авторизации
router.get('/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: '/?error=auth_failed'
  }), 
  (req, res) => {
    // Успешная авторизация, перенаправление на профиль
    res.redirect('/profile');
  }
);

// Выход из аккаунта
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Ошибка при выходе:', err);
    }
    res.redirect('/');
  });
});

/**
 * Middleware для проверки авторизации пользователя
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/?error=auth_required');
}

module.exports = {
  router,
  isAuthenticated
}; 