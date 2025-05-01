/**
 * JavaScript для управления авторизацией на сайте MineStory
 * Обрабатывает отображение кнопок авторизации/профиля и параметры URL
 */
document.addEventListener('DOMContentLoaded', function() {
  // Проверка авторизации пользователя
  const authButtons = document.getElementById('auth-buttons');
  
  // Функция для проверки, залогинен ли пользователь
  function checkAuthStatus() {
    fetch('/profile/api/user')
      .then(response => {
        if (response.ok) {
          // Пользователь авторизован
          return response.json().then(userData => {
            showUserMenu(userData);
          });
        } else {
          // Пользователь не авторизован
          showLoginButton();
        }
      })
      .catch(error => {
        console.error('Ошибка проверки авторизации:', error);
        showLoginButton();
      });
  }
  
  // Отображение кнопки логина
  function showLoginButton() {
    authButtons.innerHTML = `
      <a href="/auth/discord" class="auth-btn discord-btn">
        <i class="fab fa-discord"></i> Войти через Discord
      </a>
    `;
  }
  
  // Отображение меню пользователя
  function showUserMenu(userData) {
    const avatarUrl = userData.avatar 
      ? `https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.avatar}.png` 
      : 'images/avatar-placeholder.png';
    
    authButtons.innerHTML = `
      <div class="user-dropdown">
        <div class="user-avatar-small">
          <img src="${avatarUrl}" alt="Аватар">
        </div>
        <span class="username">${userData.username}</span>
        <i class="fas fa-chevron-down"></i>
        <div class="dropdown-menu">
          <a href="/profile"><i class="fas fa-user"></i> Профиль</a>
          <a href="/auth/logout"><i class="fas fa-sign-out-alt"></i> Выйти</a>
        </div>
      </div>
    `;
    
    // Добавляем обработчик для выпадающего меню
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
      userDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
      });
      
      document.addEventListener('click', function() {
        userDropdown.classList.remove('active');
      });
    }
  }
  
  // Обработка ошибок авторизации из URL
  function handleAuthErrors() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      let errorMessage = '';
      
      switch (errorParam) {
        case 'auth_failed':
          errorMessage = 'Ошибка авторизации. Пожалуйста, попробуйте еще раз.';
          break;
        case 'auth_required':
          errorMessage = 'Для доступа к этой странице необходимо авторизоваться.';
          break;
        default:
          errorMessage = 'Произошла ошибка. Пожалуйста, попробуйте еще раз.';
      }
      
      if (errorMessage) {
        alert(errorMessage);
        
        // Удаляем параметр ошибки из URL
        const url = new URL(window.location);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url);
      }
    }
  }
  
  // Инициализация
  checkAuthStatus();
  handleAuthErrors();
}); 