document.addEventListener('DOMContentLoaded', function() {
    // Открытие модального окна при нажатии на кнопку "Купить"
    const buyButtons = document.querySelectorAll('.buy-btn');
    const modal = document.getElementById('payment-modal');
    const closeBtn = document.querySelector('.close');
    const selectedPackage = document.getElementById('selected-package');
    const packagePrice = document.getElementById('package-price');
    const paymentForm = document.getElementById('payment-form');
    const msplusPrice = document.getElementById('msplus-price');

    // Цены по периодам для товаров
    const prices = {
        hearts: {
            price: 99,
        },
        title: {
            price: 79,
        },
        size: {
            price: 59,
        },
        unban: {
            price: 59,
        },
        doublejump: {
            price: 150,
        }
    };

    // Названия пакетов
    const packageNames = {
        hearts: '+2 Сердца навсегда',
        title: 'Титул',
        size: 'Изменение размера',
        unban: 'Разбан',
        doublejump: 'Двойной прыжок'
    };
    
    // Текущий выбранный пакет
    let currentPackage = 'hearts';
    
    // Обработчик нажатия на кнопку "Купить"
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentPackage = button.dataset.package;
            const price = button.dataset.price || prices[currentPackage].price;
            
            document.getElementById('selected-package').textContent = packageNames[currentPackage];
            document.getElementById('package-price').textContent = price;
            
            // Заполняем суммы для способов оплаты
            if (document.getElementById('card-amount')) document.getElementById('card-amount').textContent = price;
            if (document.getElementById('yoomoney-amount')) document.getElementById('yoomoney-amount').textContent = price;
            
            // Добавляем скрытые поля с типом пакета
            let packageInput = document.getElementById('package-type');
            
            if (!packageInput) {
                packageInput = document.createElement('input');
                packageInput.type = 'hidden';
                packageInput.id = 'package-type';
                packageInput.name = 'package-type';
                paymentForm.appendChild(packageInput);
            }
            
            packageInput.value = currentPackage;
            

            
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
