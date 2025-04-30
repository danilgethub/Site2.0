// Скрипт для создания файла .env
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Создание файла .env для MineStory website');
console.log('Пожалуйста, введите следующие данные:');

let clientId, clientSecret, callbackUrl, sessionSecret;

rl.question('Discord Client ID: ', (answer) => {
  clientId = answer;
  rl.question('Discord Client Secret: ', (answer) => {
    clientSecret = answer;
    rl.question('Discord Callback URL (по умолчанию http://localhost:3000/auth/discord/callback): ', (answer) => {
      callbackUrl = answer || 'http://localhost:3000/auth/discord/callback';
      rl.question('Session Secret (случайная строка): ', (answer) => {
        sessionSecret = answer || Math.random().toString(36).substring(2, 15);
        
        // Создаем содержимое файла .env
        const envContent = `# Discord OAuth2 credentials
DISCORD_CLIENT_ID=${clientId}
DISCORD_CLIENT_SECRET=${clientSecret}
DISCORD_CALLBACK_URL=${callbackUrl}

# Session secret
SESSION_SECRET=${sessionSecret}
`;

        // Записываем файл
        fs.writeFileSync(path.join(__dirname, '.env'), envContent);
        console.log('Файл .env успешно создан!');
        rl.close();
      });
    });
  });
}); 