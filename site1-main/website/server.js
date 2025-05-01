const express = require('express');
const path = require('path');
const compression = require('compression');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const config = require('./config/config');

// Импорт маршрутов
const authRoutes = require('./routes/auth').router;
const profileRoutes = require('./routes/profile');

// Инициализация Express
const app = express();
const PORT = config.PORT;

// Подключение к MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('Подключение к MongoDB успешно установлено');
  })
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
  });

// Включаем сжатие для увеличения производительности
app.use(compression());

// Парсинг JSON и форм
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure в production
    maxAge: 1000 * 60 * 60 * 24 * 7 // Неделя
  },
  proxy: true // Важно для работы с Railway и другими прокси
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Настраиваем обслуживание статических файлов из текущей директории
app.use(express.static(path.join(__dirname)));

// Маршруты для авторизации и профиля
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Роут для обработки всех остальных запросов, возвращаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка 404 и 500 ошибок
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 
