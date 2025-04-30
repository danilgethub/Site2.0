document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const username = document.getElementById('username');

    // Проверяем статус авторизации при загрузке страницы
    checkAuthStatus();

    // Обработчик кнопки входа
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/auth/discord';
    });

    // Обработчик кнопки выхода
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fetch('/logout', { method: 'GET' })
            .then(() => {
                window.location.reload();
            });
    });

    // Функция проверки статуса авторизации
    function checkAuthStatus() {
        fetch('/api/user')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Not authenticated');
            })
            .then(user => {
                // Пользователь авторизован
                loginBtn.style.display = 'none';
                userProfile.style.display = 'flex';
                userAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                username.textContent = user.username;
            })
            .catch(() => {
                // Пользователь не авторизован
                loginBtn.style.display = 'block';
                userProfile.style.display = 'none';
            });
    }
}); 