/**
 * JavaScript для функционала рулетки на странице профиля MineStory
 * Управляет вращением рулетки, проверкой кулдауна и отображением результатов
 */
document.addEventListener('DOMContentLoaded', function() {
  // Элементы DOM
  const spinButton = document.getElementById('spin-button');
  const cooldownTimer = document.getElementById('cooldown-timer');
  const rouletteWheel = document.getElementById('roulette-wheel');
  const coinsBalance = document.getElementById('coins-balance');
  const rouletteBalance = document.getElementById('roulette-balance');
  const prizeModal = document.getElementById('prize-modal');
  const prizeAmount = document.getElementById('prize-amount');
  const closePrizeBtn = document.getElementById('close-prize-btn');
  
  // Таймер обратного отсчета
  let countdownInterval;
  
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
    // Блокируем кнопку на время запроса
    spinButton.disabled = true;
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
        animateWheel(data.prize, data.newBalance);
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
      
      // Возвращаем кнопку в исходное состояние
      spinButton.disabled = false;
      spinButton.textContent = 'КРУТИ!';
    });
  }
  
  // Анимация вращения колеса
  function animateWheel(prize, newBalance) {
    // Определяем угол поворота в зависимости от приза
    let rotations = 5; // Базовое количество полных оборотов
    
    // Получаем случайный угол для дополнительной реалистичности
    const randomAngle = Math.floor(Math.random() * 30) - 15;
    
    // Определяем конечный угол в зависимости от приза
    let finalAngle;
    switch (prize) {
      case 5:
        finalAngle = 0;
        break;
      case 10:
        finalAngle = 72;
        break;
      case 20:
        finalAngle = 144;
        break;
      case 50:
        finalAngle = 216;
        break;
      case 100:
        finalAngle = 288;
        break;
      default:
        finalAngle = 0;
    }
    
    // Рассчитываем общий угол поворота
    const totalAngle = (rotations * 360) + finalAngle + randomAngle;
    
    // Добавляем стиль анимации
    rouletteWheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
    rouletteWheel.style.transform = `rotate(${totalAngle}deg)`;
    
    // После завершения анимации
    setTimeout(() => {
      // Показываем модальное окно с призом
      prizeAmount.textContent = `+${prize}`;
      prizeModal.style.display = 'flex';
      
      // Обновляем отображение баланса
      coinsBalance.textContent = newBalance;
      rouletteBalance.textContent = newBalance;
      
      // Проверяем статус рулетки (перейдет в режим кулдауна)
      checkRouletteStatus();
      
      // Сбрасываем анимацию колеса
      setTimeout(() => {
        rouletteWheel.style.transition = 'none';
        rouletteWheel.style.transform = 'rotate(0deg)';
      }, 500);
    }, 4000);
  }
  
  // Обработчик кнопки запуска рулетки
  spinButton.addEventListener('click', function() {
    spinRoulette();
  });
  
  // Закрытие модального окна с призом
  closePrizeBtn.addEventListener('click', function() {
    prizeModal.style.display = 'none';
  });
}); 
