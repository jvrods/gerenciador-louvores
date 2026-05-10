# 🎵 Gerenciador de Louvores / Worship Management Platform

[PT-BR] Um sistema moderno para gerenciar os louvores da sua igreja.  
[EN] A modern system to manage your church's worship songs.

---

## 🇧🇷 Português (PT-BR)

### 🚀 Guia de Implementação

Siga este guia para colocar o sistema no ar para sua igreja.

#### 1. Configuração do Firebase
1.  Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2.  **Authentication:** Ative o método **E-mail/Senha**.
3.  **Firestore Database:** Inicie um banco de dados em "Test Mode".
4.  **Regras:** Na aba "Rules", cole:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }
    ```
5.  **App Web:** Registre um Web App e guarde as credenciais.

#### 2. Configuração Local
1.  **Clone e Instale:**
    ```bash
    git clone https://github.com/SEU_USUARIO/gerenciador-louvores.git
    npm install
    ```
2.  **Variáveis de Ambiente:** Crie um arquivo `.env` na raiz com suas chaves (veja a lista abaixo).
3.  **Inicie:** `npm start`

#### 3. Deploy na Vercel
1.  Conecte seu GitHub à [Vercel](https://vercel.com/).
2.  Importe o projeto e adicione as **Environment Variables**:
    `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.
3.  Clique em **Deploy**.

---

## 🇺🇸 English (EN)

### 🚀 Implementation Guide

Follow this guide to get the system up and running for your church.

#### 1. Firebase Setup
1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Authentication:** Enable **Email/Password** method.
3.  **Firestore Database:** Start a database in "Test Mode".
4.  **Rules:** In the "Rules" tab, paste:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }
    ```
5.  **Web App:** Register a Web App and save the credentials.

#### 2. Local Setup
1.  **Clone and Install:**
    ```bash
    git clone https://github.com/YOUR_USER/gerenciador-louvores.git
    npm install
    ```
2.  **Environment Variables:** Create a `.env` file in the root with your keys (see list below).
3.  **Start:** `npm start`

#### 3. Vercel Deployment
1.  Connect your GitHub to [Vercel](https://vercel.com/).
2.  Import the project and add the **Environment Variables**:
    `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.
3.  Click **Deploy**.

---

## ✨ Features / Funcionalidades
- ✅ **Dashboard:** Organization by themes (Holy Supper, Missions, etc).
- ✅ **Repository:** Search by title or artist.
- ✅ **Lyric Viewer:** Optimized typography for reading.
- ✅ **Integrated Player:** YouTube video playback in-app.
- ✅ **Admin Panel:** Secure management of all content.

## 🛠️ Tech Stack
- **Angular 17+**
- **Firebase Firestore**
- **Vercel**
- **Material Icons**
