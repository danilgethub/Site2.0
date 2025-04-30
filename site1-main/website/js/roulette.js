document.addEventListener('DOMContentLoaded', () => {
    // Элементы рулетки
    const rouletteBtn = document.getElementById('roulette-btn');
    const rouletteModal = document.getElementById('roulette-modal');
    const closeRoulette = document.getElementById('close-roulette');
    const spinButton = document.getElementById('spin-button');
    const rouletteItems = document.querySelector('.roulette-items');
    const resultMessage = document.getElementById('result-message');
    const userCoinsElement = document.getElementById('user-coins');
    const cooldownMessage = document.getElementById('cooldown-message');
    
    // Расчет ширины для позиционирования
    const itemWidth = 60; // ширина каждого элемента в пикселях
    
    // Инициализация рулетки
    initializeRoulette();
    
    // Открыть модальное окно рулетки при нажатии на кнопку
    rouletteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        rouletteModal.style.display = 'block';
        updateCoinsDisplay();
        checkCooldown();
    });
    
    // Закрыть модальное окно
    closeRoulette.addEventListener('click', () => {
        rouletteModal.style.display = 'none';
    });
    
    // Закрыть модальное окно при клике вне его содержимого
    window.addEventListener('click', (e) => {
        if (e.target === rouletteModal) {
            rouletteModal.style.display = 'none';
        }
    });
    
    // Вращение рулетки при нажатии на кнопку
    spinButton.addEventListener('click', spinRoulette);
    
    // Инициализация рулетки
    function initializeRoulette() {
        // Создаем дубликаты элементов для бесконечного вращения
        const items = Array.from(document.querySelectorAll('.roulette-item'));
        const totalWidth = items.length * itemWidth;
        
        // Повторяем элементы для создания "бесконечной" ленты
        for (let i = 0; i < 3; i++) {
            items.forEach(item => {
                const clone = item.cloneNode(true);
                rouletteItems.appendChild(clone);
            });
        }
        
        // Центрирование рулетки
        rouletteItems.style.transform = `translateX(-${totalWidth}px)`;
        
        // Загрузка монет из localStorage
        updateCoinsDisplay();
    }
    
    // Обновление отображения монет
    function updateCoinsDisplay() {
        const coins = localStorage.getItem('userCoins') || 0;
        userCoinsElement.textContent = coins;
    }
    
    // Проверка кулдауна
    function checkCooldown() {
        const lastSpin = localStorage.getItem('lastSpinTime');
        if (lastSpin) {
            const now = new Date().getTime();
            const timeDiff = now - parseInt(lastSpin);
            const cooldownTime = 6 * 60 * 60 * 1000; // 6 часов в миллисекундах
            
            if (timeDiff < cooldownTime) {
                const hoursLeft = Math.floor((cooldownTime - timeDiff) / (60 * 60 * 1000));
                const minutesLeft = Math.floor(((cooldownTime - timeDiff) % (60 * 60 * 1000)) / (60 * 1000));
                
                cooldownMessage.textContent = `Вы сможете крутить рулетку через ${hoursLeft} ч ${minutesLeft} мин`;
                cooldownMessage.style.display = 'block';
                spinButton.disabled = true;
            } else {
                cooldownMessage.style.display = 'none';
                spinButton.disabled = false;
            }
        } else {
            cooldownMessage.style.display = 'none';
            spinButton.disabled = false;
        }
    }
    
    // Вращение рулетки
    function spinRoulette() {
        // Отключаем кнопку на время вращения
        spinButton.disabled = true;
        
        // Скрываем предыдущий результат
        resultMessage.classList.remove('show');
        
        // Генерируем результат
        // Определяем вероятности для разных значений (в процентах):
        // 0 монет - 40%
        // 5 монет - 35%
        // 10 монет - 20%
        // 100 монет - 4%
        // 1000 монет - 1%
        const randomValue = Math.random() * 100;
        let winValue;
        
        if (randomValue < 40) {
            winValue = 0;
        } else if (randomValue < 75) {
            winValue = 5;
        } else if (randomValue < 95) {
            winValue = 10;
        } else if (randomValue < 99) {
            winValue = 100;
        } else {
            winValue = 1000;
        }
        
        // Находим все элементы с выигрышным значением
        const winningElements = Array.from(document.querySelectorAll(`.roulette-item[data-value="${winValue}"]`));
        
        // Если есть элементы с выигрышным значением
        if (winningElements.length > 0) {
            // Выбираем случайный элемент из выигрышных
            const winningElement = winningElements[Math.floor(Math.random() * winningElements.length)];
            
            // Вычисляем позицию для остановки (центрирование выигрышного элемента)
            const winningElementIndex = Array.from(document.querySelectorAll('.roulette-item')).indexOf(winningElement);
            const shiftPosition = winningElementIndex * itemWidth;
            
            // Рассчитываем случайное дополнительное смещение для разнообразия
            const additionalShift = Math.floor(Math.random() * 20) - 10;
            
            // Общее смещение
            const totalShift = -(shiftPosition + additionalShift);
            
            // Анимация вращения
            rouletteItems.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.24, 0.99)';
            rouletteItems.style.transform = `translateX(${totalShift}px)`;
            
            // Обработка результатов после завершения анимации
            setTimeout(() => {
                // Определяем фактическое значение, которое попало под указатель
                const allItems = document.querySelectorAll('.roulette-item');
                const centerX = rouletteItems.getBoundingClientRect().width / 2;
                let closestItem = null;
                let minDistance = Infinity;
                
                // Находим элемент, который наиболее близок к центру
                Array.from(allItems).forEach(item => {
                    const rect = item.getBoundingClientRect();
                    const itemCenterX = rect.left + rect.width / 2;
                    const distance = Math.abs(itemCenterX - centerX);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestItem = item;
                    }
                });
                
                // Получаем фактическое значение выигрыша из элемента под указателем
                const actualWinValue = closestItem ? parseInt(closestItem.getAttribute('data-value')) : winValue;
                
                // Добавляем монеты пользователю в соответствии с фактическим результатом
                if (actualWinValue > 0) {
                    const currentCoins = parseInt(localStorage.getItem('userCoins') || 0);
                    localStorage.setItem('userCoins', currentCoins + actualWinValue);
                    updateCoinsDisplay();
                    
                    // Показываем сообщение о выигрыше
                    resultMessage.textContent = `Поздравляем! Вы выиграли ${actualWinValue} монет!`;
                    resultMessage.style.color = actualWinValue >= 100 ? '#ffd700' : '#5cffbc';
                } else {
                    // Показываем сообщение о проигрыше
                    resultMessage.textContent = 'К сожалению, вы ничего не выиграли. Попробуйте ещё раз!';
                    resultMessage.style.color = '#ff5555';
                }
                
                // Показываем сообщение о результате
                resultMessage.classList.add('show');
                
                // Устанавливаем время последнего вращения для кулдауна
                localStorage.setItem('lastSpinTime', new Date().getTime());
                
                // Сбрасываем кнопку и проверяем кулдаун
                setTimeout(() => {
                    spinButton.disabled = false;
                    checkCooldown();
                }, 1000);
                
            }, 3000); // Время анимации вращения
        }
    }
}); 
