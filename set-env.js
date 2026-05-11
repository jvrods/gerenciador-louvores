const fs = require('fs');
const path = require('path');

// Tenta carregar variáveis de um arquivo .env se ele existir (para uso local)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  envFileContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
  console.log('ℹ️ Variáveis carregadas do arquivo .env local.');
}

// Caminhos dos arquivos
const envDir = path.join(__dirname, 'src', 'environments');
const envFile = path.join(envDir, 'environment.ts');
const devEnvFile = path.join(envDir, 'environment.development.ts');

const config = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

// Conteúdo que será gerado
const envConfigFile = `export const environment = {
  production: true,
  firebaseConfig: ${JSON.stringify(config, null, 2)}
};
`;

const devEnvConfigFile = `export const environment = {
  production: false,
  firebaseConfig: ${JSON.stringify(config, null, 2)}
};
`;

// Cria a pasta se não existir
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Escreve os arquivos
fs.writeFileSync(envFile, envConfigFile);
fs.writeFileSync(devEnvFile, devEnvConfigFile);

console.log('✅ Arquivos de ambiente gerados com sucesso.');
