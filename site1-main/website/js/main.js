document.addEventListener('DOMContentLoaded', function() {
    // Открытие модального окна при нажатии на кнопку "Купить"
    const buyButtons = document.querySelectorAll('.buy-btn');
    const modal = document.getElementById('payment-modal');
    const closeBtn = document.querySelector('.close');
    const selectedPackage = document.getElementById('selected-package');
    const packagePrice = document.getElementById('package-price');
    const paymentForm = document.getElementById('payment-form');
    const msplusPrice = document.getElementById('msplus-price');
    const subscriptionOptions = document.querySelectorAll('.subscription-option');

    // Цены по периодам для MS+
    const prices = {
        msplus: {
            monthly: 300,
            quarterly: 800,  // скидка за 3 месяца
            yearly: 3000     // скидка за год
        },
        title: {
            monthly: 100,    // скидка 50%
            quarterly: 100,
            yearly: 100
        },
        size: {
            monthly: 50,     // скидка 50%
            quarterly: 50,
            yearly: 50
        }
    };

    // Названия пакетов
    const packageNames = {
        msplus: 'MineStory Plus',
        title: 'Титул',
        size: 'Изменение размера'
    };
    
    // Текущий выбранный период подписки
    let currentPeriod = 'monthly';
    let currentPackage = 'msplus';
    
    // Обработчик нажатия на опцию подписки
    subscriptionOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Удаляем активный класс у всех опций
            subscriptionOptions.forEach(opt => opt.classList.remove('active'));
            
            // Добавляем активный класс выбранной опции
            this.classList.add('active');
            
            // Обновляем текущий период
            currentPeriod = this.dataset.period;
            
            // Обновляем цену на кнопке
            updatePrice();
            
            // Обновляем атрибут data-period у кнопки
            document.querySelector('.buy-btn').setAttribute('data-period', currentPeriod);
        });
    });
    
    // Функция обновления отображаемой цены
    function updatePrice() {
        if (currentPackage === 'msplus') {
            msplusPrice.textContent = `${prices[currentPackage][currentPeriod]} ₽`;
        }
    }
    
    // Функция для получения названия периода в читаемом виде
    function getPeriodName(period) {
        switch(period) {
            case 'monthly': return '1 месяц';
            case 'quarterly': return '3 месяца';
            case 'yearly': return '1 год';
            default: return '1 месяц';
        }
    }

    // Обработчик нажатия на кнопку "Купить"
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentPackage = button.dataset.package;
            const price = button.dataset.price || prices[currentPackage][currentPeriod];
            
            document.getElementById('selected-package').textContent = packageNames[currentPackage];
            document.getElementById('package-price').textContent = price;
            
            // Заполняем суммы для способов оплаты
            if (document.getElementById('card-amount')) document.getElementById('card-amount').textContent = price;
            if (document.getElementById('yoomoney-amount')) document.getElementById('yoomoney-amount').textContent = price;
            
            // Добавляем скрытые поля с типом пакета и периодом
            let packageInput = document.getElementById('package-type');
            let periodInput = document.getElementById('subscription-period');
            
            if (!packageInput) {
                packageInput = document.createElement('input');
                packageInput.type = 'hidden';
                packageInput.id = 'package-type';
                packageInput.name = 'package-type';
                paymentForm.appendChild(packageInput);
            }
            
            if (!periodInput) {
                periodInput = document.createElement('input');
                periodInput.type = 'hidden';
                periodInput.id = 'subscription-period';
                periodInput.name = 'subscription-period';
                paymentForm.appendChild(periodInput);
            }
            
            packageInput.value = currentPackage;
            periodInput.value = currentPeriod;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'visible'; // Разрешаем прокрутку страницы
    });

    // Закрытие модального окна при клике за пределами окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'visible';
        }
    });

    // Обработка отправки формы
    paymentForm.addEventListener('submit', function(event) {
        event.preventDefault();
    });

    // Кнопка закрытия модального окна
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'visible';
        });
    }

    // Плавная прокрутка к секциям при нажатии на ссылки в меню
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Учитываем высоту шапки
                    behavior: 'smooth'
                });
            }
        });
    });

    // Анимация при прокрутке
    const animateOnScroll = function() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('fade-in');
            }
        });
    };
    
    // Добавляем класс для CSS-анимации
    const style = document.createElement('style');
    style.textContent = `
        section {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        section.fade-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // Запускаем анимацию при загрузке и прокрутке
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Вызываем один раз при загрузке

    // Переключение между способами оплаты
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const ukrCardInstructions = document.getElementById('ukr-card-instructions');
    const yoomoneyInstructions = document.getElementById('yoomoney-instructions');

    if (paymentMethods.length > 0) {
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => {
                if (method.value === 'ukr-card') {
                    ukrCardInstructions.style.display = 'block';
                    yoomoneyInstructions.style.display = 'none';
                } else if (method.value === 'yoomoney') {
                    ukrCardInstructions.style.display = 'none';
                    yoomoneyInstructions.style.display = 'block';
                }
            });
        });
    }
}); 
