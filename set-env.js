const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const envDir = path.join(__dirname, 'src', 'environments');
const envFile = path.join(envDir, 'environment.ts');
const devEnvFile = path.join(envDir, 'environment.development.ts');

// Conteúdo que será gerado usando as variáveis de ambiente do sistema
const envConfigFile = `export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}"
  }
};
`;

const devEnvConfigFile = `export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}"
  }
};
`;

// Cria a pasta se não existir
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Escreve os arquivos
fs.writeFileSync(envFile, envConfigFile);
fs.writeFileSync(devEnvFile, devEnvConfigFile);

console.log('✅ Arquivos de ambiente gerados com sucesso usando variáveis de ambiente.');
