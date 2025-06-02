/**
 * JavaScript для функционала рулетки на странице профиля MineStory
 * Управляет вращением рулетки, проверкой кулдауна и отображением результатов
 */
document.addEventListener('DOMContentLoaded', function() {
  // Элементы DOM
  const spinButton = document.getElementById('spin-button');
  const demoButton = document.getElementById('demo-button');
  const cooldownTimer = document.getElementById('cooldown-timer');
  const rouletteWheel = document.getElementById('roulette-wheel');
  const coinsBalance = document.getElementById('coins-balance');
  const rouletteBalance = document.getElementById('roulette-balance');
  const prizeModal = document.getElementById('prize-modal');
  const prizeAmount = document.getElementById('prize-amount');
  const closePrizeBtn = document.getElementById('close-prize-btn');
  
  // Таймер обратного отсчета
  let countdownInterval;
  // Флаг, показывающий, что рулетка в процессе вращения
  let isSpinning = false;
  
  // Проверка статуса рулетки при загрузке страницы
  checkRouletteStatus();
  
  // Получение баланса пользователя при загрузке
  updateUserBalance();
  
  // Проверка статуса рулетки (доступна или на кулдауне)
  function checkRouletteStatus() {
    fetch('/profile/api/roulette/status')
      .then(response => response.json())
      .then(data => {
        if (data.canSpin) {
          // Рулетка доступна
          spinButton.disabled = false;
          spinButton.textContent = 'КРУТИ!';
          cooldownTimer.style.display = 'none';
        } else {
          // Рулетка на кулдауне
          spinButton.disabled = true;
          spinButton.textContent = 'ПОДОЖДИТЕ...';
          cooldownTimer.style.display = 'block';
          
          // Запускаем таймер обратного отсчета
          startCountdown(data.timeRemaining);
        }
      })
      .catch(error => {
        console.error('Ошибка при проверке статуса рулетки:', error);
      });
  }
  
  // Таймер обратного отсчета
  function startCountdown(remainingTime) {
    // Очищаем предыдущий интервал, если есть
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    // Обновляем отображение таймера каждую секунду
    countdownInterval = setInterval(() => {
      remainingTime -= 1000;
      
      if (remainingTime <= 0) {
        // Время вышло, рулетка доступна
        clearInterval(countdownInterval);
        checkRouletteStatus();
        return;
      }
      
      // Форматируем оставшееся время
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      
      cooldownTimer.textContent = `Доступно через: ${hours}ч ${minutes}м ${seconds}с`;
    }, 1000);
  }
  
  // Обновление баланса пользователя
  function updateUserBalance() {
    fetch('/profile/api/user')
      .then(response => response.json())
      .then(data => {
        // Обновляем отображение баланса
        const coins = data.coins || 0;
        coinsBalance.textContent = coins;
        rouletteBalance.textContent = coins;
      })
      .catch(error => {
        console.error('Ошибка при получении данных пользователя:', error);
      });
  }
  
  // Вращение рулетки и получение приза
  function spinRoulette() {
    // Проверяем, не вращается ли уже рулетка
    if (isSpinning) return;
    
    // Устанавливаем флаг вращения
    isSpinning = true;
    
    // Блокируем кнопки на время запроса
    spinButton.disabled = true;
    demoButton.disabled = true;
    spinButton.textContent = 'ЗАПУСК...';
    
    fetch('/profile/api/roulette/spin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Анимируем вращение колеса
        animateWheel(data.prize, data.newBalance, false);
      }
    })
    .catch(error => {
      // Обрабатываем ошибки
      if (error.json) {
        error.json().then(errData => {
          console.error('Ошибка запуска рулетки:', errData.error);
          alert(errData.error || 'Произошла ошибка при запуске рулетки');
        });
      } else {
        console.error('Ошибка запуска рулетки:', error);
        alert('Произошла ошибка при запуске рулетки');
      }
      
      // Возвращаем кнопки в исходное состояние
      spinButton.disabled = false;
      demoButton.disabled = false;
      spinButton.textContent = 'КРУТИ!';
      isSpinning = false;
    });
  }
  
  // Демо-вращение рулетки (без влияния на баланс)
  function spinRouletteDemo() {
    // Проверяем, не вращается ли уже рулетка
    if (isSpinning) return;
    
    // Устанавливаем флаг вращения
    isSpinning = true;
    
    // Блокируем кнопки на время вращения
    spinButton.disabled = true;
    demoButton.disabled = true;
    demoButton.textContent = 'ЗАПУСК...';
    
    // Генерируем случайный приз для демонстрации
    const prizes = [5, 10, 20, 50, 100];
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    // Получаем текущий баланс для демонстрации (не будет изменять реальный баланс)
    const currentBalance = parseInt(coinsBalance.textContent) || 0;
    
    // Анимируем вращение колеса
    animateWheel(randomPrize, currentBalance, true);
  }
  
  // Анимация вращения колеса
  function animateWheel(prize, newBalance, isDemo) {
    // Определяем количество оборотов для анимации
    const rotations = 8;
    
    // Добавляем случайный угол для реалистичности
    const randomAngle = Math.floor(Math.random() * 360);
    
    // Рассчитываем общий угол поворота
    const totalAngle = (rotations * 360) + randomAngle;
    
    // Добавляем стиль анимации (плавное замедление к концу)
    rouletteWheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.89, 0.98)';
    rouletteWheel.style.transform = `rotate(${totalAngle}deg)`;
    
    // После завершения анимации
    setTimeout(() => {
      // Показываем модальное окно с призом
      prizeAmount.textContent = isDemo ? `+${prize} (демо)` : `+${prize}`;
      prizeModal.style.display = 'flex';
      
      // Обновляем отображение баланса только если это не демо-режим
      if (!isDemo) {
        coinsBalance.textContent = newBalance;
        rouletteBalance.textContent = newBalance;
      }
      
      // Проверяем статус рулетки только если это не демо-режим
      if (!isDemo) {
        checkRouletteStatus();
      } else {
        // Для демо-режима просто возвращаем кнопки в исходное состояние
        setTimeout(() => {
          spinButton.disabled = false;
          demoButton.disabled = false;
          demoButton.textContent = 'ДЕМО';
          isSpinning = false;
        }, 500);
      }
      
      // Сбрасываем анимацию колеса
      setTimeout(() => {
        rouletteWheel.style.transition = 'none';
        rouletteWheel.style.transform = 'rotate(0deg)';
      }, 500);
    }, 5000); // Время анимации
  }
  
  // Обработчик кнопки запуска рулетки
  spinButton.addEventListener('click', function() {
    spinRoulette();
  });
  
  // Обработчик кнопки демо-режима
  demoButton.addEventListener('click', function() {
    spinRouletteDemo();
  });
  
  // Закрытие модального окна с призом
  closePrizeBtn.addEventListener('click', function() {
    prizeModal.style.display = 'none';
  });
}); 
