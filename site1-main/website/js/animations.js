// Анимации и интерактивность для сайта

// Эффект прокрутки для хедера
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация появления элементов при прокрутке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдение за элементами для анимации
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.step, .package, .about-text, .server-info');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Эффект параллакса для фоновых изображений
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero, .about, .how-to-join, .donate');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        element.style.backgroundPosition = `center ${yPos}px`;
    });
});

// Добавление эффекта свечения при наведении на карточки
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.step, .package, .about-text, .server-info');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3), 0 0 30px rgba(102, 126, 234, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
        });
    });
});

// Анимация текста в hero секции
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero h2');
    const heroText = document.querySelector('.hero p');
    
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            heroTitle.style.transition = 'opacity 1s ease, transform 1s ease';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 500);
    }
    
    if (heroText) {
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroText.style.transition = 'opacity 1s ease, transform 1s ease';
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
        }, 800);
    }
});

// Функциональность двойного прыжка
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем эффект прыжка для всех элементов с классом jump-effect
    const jumpElements = document.querySelectorAll('.jump-effect');
    
    jumpElements.forEach(element => {
        element.addEventListener('click', () => {
            element.classList.add('double-jump');
            setTimeout(() => {
                element.classList.remove('double-jump');
            }, 1200);
        });
    });
    
    // Специальный эффект для пакета двойного прыжка
    const doubleJumpPackage = document.querySelector('.package[data-package="doublejump"]');
    if (doubleJumpPackage) {
        // Добавляем периодическую анимацию для привлечения внимания
        setInterval(() => {
            if (!doubleJumpPackage.matches(':hover')) {
                doubleJumpPackage.classList.add('high-jump');
                setTimeout(() => {
                    doubleJumpPackage.classList.remove('high-jump');
                }, 800);
            }
        }, 5000); // Каждые 5 секунд
    }
    
    // Добавляем эффект прыжка при клике на любой элемент страницы (демонстрация)
    let doubleJumpActive = false;
    
    // Функция для активации режима двойного прыжка
    window.activateDoubleJump = function() {
        doubleJumpActive = true;
        document.body.style.cursor = 'pointer';
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.innerHTML = '🎉 Двойной прыжок активирован! Кликайте по странице для прыжков!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            z-index: 10000;
            font-family: 'Minecraft', sans-serif;
            font-size: 14px;
            animation: fadeInUp 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };
    
    // Обработчик кликов для эффекта прыжка
    document.addEventListener('click', (e) => {
        if (doubleJumpActive && !e.target.closest('.modal') && !e.target.closest('button')) {
            // Создаем временный элемент для анимации в месте клика
            const jumpEffect = document.createElement('div');
            jumpEffect.innerHTML = '⬆️';
            jumpEffect.style.cssText = `
                position: fixed;
                left: ${e.clientX - 15}px;
                top: ${e.clientY - 15}px;
                font-size: 30px;
                pointer-events: none;
                z-index: 9999;
                animation: double-bounce 1.2s ease-in-out;
            `;
            
            document.body.appendChild(jumpEffect);
            
            setTimeout(() => {
                jumpEffect.remove();
            }, 1200);
        }
    });
});

// Эффект мерцания для популярного пакета
document.addEventListener('DOMContentLoaded', () => {
    const popularBadge = document.querySelector('.popular-badge');
    if (popularBadge) {
        setInterval(() => {
            popularBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                popularBadge.style.transform = 'scale(1)';
            }, 200);
        }, 3000);
    }
});

// Добавление эффекта печатания для заголовков
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Эффект частиц в фоне
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(102, 126, 234, 0.3);
            border-radius: 50%;
            animation: float ${Math.random() * 10 + 5}s infinite linear;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// CSS для анимации частиц
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes float {
        0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyles);

// Инициализация частиц
document.addEventListener('DOMContentLoaded', createParticles);