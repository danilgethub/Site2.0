/**
 * JavaScript для страницы профиля MineStory
 * Управляет отображением данных пользователя и изменением имени Minecraft
 */
document.addEventListener('DOMContentLoaded', function() {
  // Элементы DOM
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userBadges = document.getElementById('user-badges');
  const discordTag = document.getElementById('discord-tag');
  const joinedDate = document.getElementById('joined-date');
  const minecraftUsername = document.getElementById('minecraft-username');
  const subscriptionInfo = document.getElementById('subscription-info');
  
  // Модальное окно изменения ника
  const usernameModal = document.getElementById('username-modal');
  const editUsernameBtn = document.getElementById('edit-username');
  const closeModal = document.querySelector('#username-modal .close');
  const usernameForm = document.getElementById('username-form');
  const usernameInput = document.getElementById('minecraft-username-input');
  
  // Загрузка данных пользователя
  fetchUserData();
  
  // Загрузка данных пользователя с сервера
  function fetchUserData() {
    fetch('/profile/api/user')
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных пользователя');
        }
        return response.json();
      })
      .then(userData => {
        updateUserInterface(userData);
      })
      .catch(error => {
        console.error('Ошибка:', error);
        // При ошибке перенаправляем на главную страницу
        window.location.href = '/?error=auth_failed';
      });
  }
  
  // Обновление интерфейса пользователя
  function updateUserInterface(userData) {
    // Обновление аватара
    if (userData.avatar) {
      userAvatar.src = `https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.avatar}.png`;
    }
    
    // Имя пользователя
    userName.textContent = userData.username;
    
    // Discord тег
    discordTag.textContent = userData.discriminator === '0' 
      ? userData.username 
      : `${userData.username}#${userData.discriminator}`;
    
    // Дата регистрации
    const joinedDateObj = new Date(userData.joinedAt);
    joinedDate.textContent = joinedDateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Minecraft имя
    if (userData.minecraftUsername) {
      minecraftUsername.textContent = userData.minecraftUsername;
      usernameInput.value = userData.minecraftUsername;
    } else {
      minecraftUsername.textContent = 'Не указано';
    }
    
    // Роли и бейджи
    userBadges.innerHTML = '';
    if (userData.roles && userData.roles.length > 0) {
      userData.roles.forEach(role => {
        const badge = document.createElement('span');
        badge.classList.add('badge');
        
        if (role === 'admin') {
          badge.classList.add('badge-admin');
          badge.textContent = 'Администратор';
        } else if (role === 'player') {
          badge.classList.add('badge-player');
          badge.textContent = 'Игрок';
        }
        
        userBadges.appendChild(badge);
      });
    }
    
    // Подписка MS+
    if (userData.subscription && userData.subscription.type === 'msplus') {
      const expiresDate = new Date(userData.subscription.expiresAt);
      const formattedDate = expiresDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      subscriptionInfo.innerHTML = `
        <div class="active-subscription">
          <div class="subscription-badge">MS+</div>
          <div class="subscription-details">
            <div class="subscription-name">MineStory Plus</div>
            <div class="subscription-expires">Действует до: ${formattedDate}</div>
          </div>
        </div>
      `;
      
      // Добавляем бейдж MS+
      const msPlusBadge = document.createElement('span');
      msPlusBadge.classList.add('badge', 'badge-msplus');
      msPlusBadge.textContent = 'MS+';
      userBadges.appendChild(msPlusBadge);
    }
  }
  
  // Обработчики для модального окна изменения имени
  editUsernameBtn.addEventListener('click', function() {
    usernameModal.style.display = 'block';
  });
  
  closeModal.addEventListener('click', function() {
    usernameModal.style.display = 'none';
  });
  
  window.addEventListener('click', function(event) {
    if (event.target === usernameModal) {
      usernameModal.style.display = 'none';
    }
  });
  
  // Сохранение нового имени Minecraft
  usernameForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const minecraftUsernameValue = usernameInput.value.trim();
    
    if (!minecraftUsernameValue) {
      alert('Пожалуйста, введите имя пользователя');
      return;
    }
    
    updateMinecraftUsername(minecraftUsernameValue);
  });
  
  // Отправка запроса на обновление имени в Minecraft
  function updateMinecraftUsername(newUsername) {
    fetch('/profile/api/minecraft-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ minecraftUsername: newUsername })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при обновлении имени');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        minecraftUsername.textContent = data.minecraftUsername;
        usernameModal.style.display = 'none';
        
        // Показываем уведомление об успешном обновлении
        alert('Имя пользователя Minecraft успешно обновлено!');
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при обновлении имени. Пожалуйста, попробуйте еще раз.');
    });
  }
}); 