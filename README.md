# Real Balance - Premium Financial Management 🚀

[![Premium Version](https://img.shields.io/badge/Edition-Premium-emerald.svg?style=for-the-badge&logo=crown)](file:///c:/Users/hp/Documents/real-balance)
[![React](https://img.shields.io/badge/Frontend-React-blue.svg?style=for-the-badge&logo=react)](file:///c:/Users/hp/Documents/real-balance/frontend)
[![Node.js](https://img.badge.io/badge/Backend-Node.js-green.svg?style=for-the-badge&logo=node.js)](file:///c:/Users/hp/Documents/real-balance/backend)

O **Real Balance** é uma plataforma financeira de elite projetada para proporcionar controle total e absoluto sobre o seu património. Com uma interface futurista baseada em *Glassmorphism* e funcionalidades avançadas de análise, o sistema transforma a gestão de dinheiro numa experiência premium e intuitiva.

![Real Balance Hero](file:///C:/Users/hp/.gemini/antigravity/brain/2b9d80e7-67e4-414e-9e78-7948a205e695/real_balance_hero_1772101706471.png)

---

## 💎 Funcionalidades de Elite

### 📊 Painel de Controle (Dashboard)
- **Visão Holística**: Resumo em tempo real de saldo, receitas e despesas.
- **Evolução Patrimonial**: Gráficos dinâmicos que mostram o crescimento da sua riqueza.
- **Resumo de Atividades**: Log inteligente de tudo o que acontece no sistema.

### 💳 Gestão de Multicaixas
- **Múltiplas Contas**: Controle dinheiro vivo, contas bancárias (BFA, etc.) e investimentos num só lugar.
- **Saldos em Tempo Real**: Atualização instantânea de saldos após cada transação.

### 📅 Fluxo de Caixa Inteligente
- **Categorização Automática**: Organize os seus gastos por categorias personalizadas.
- **Transações Detalhadas**: Histórico completo com filtros avançados.

### 📄 Relatórios Dinâmicos
- **Exportação Premium**: Gere relatórios profissionais em **PDF** ou **Excel**.
- **Snapshots Históricos**: Guarde e visualize relatórios gerados anteriormente no banco de dados.

### 🧮 Simuladores Financeiros
- **Regra 50/30/20**: Planeie o seu orçamento com base nas melhores práticas do mercado.
- **Projeções de Futuro**: Saiba quanto terá daqui a 1, 5 ou 10 anos baseado nas suas poupanças atuais.

### 👤 Perfil & Segurança
- **Otimização de Imagem**: Upload de fotos de perfil com compressão automática premium para manter o sistema rápido.
- **Encriptação Bancária**: Senhas protegidas com algoritmos de encriptação robustos (**Bcrypt**).

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para colocar o sistema a funcionar na sua máquina local:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (v16 ou superior)
- [MySQL](https://www.mysql.com/)

### 2. Configuração da Base de Dados
1. Crie uma base de dados chamada `real_balance` no seu MySQL.
2. Importe o ficheiro [realbalance.sql](file:///c:/Users/hp/Documents/real-balance/realbalance.sql) localizado na raiz do projeto.

### 3. Configuração do Backend
```bash
cd backend
npm install
```
1. Crie um ficheiro `.env` na pasta `backend` com os seguintes dados:
```env
PORT=5000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=real_balance
JWT_SECRET=super_segredo_123
```
2. Execute a migração para preparar os usuários padrão:
```bash
node migrate.js
```
3. Inicie o servidor:
```bash
npm run dev
```

### 4. Configuração do Frontend
```bash
cd frontend
npm install
npm run dev
```

O sistema estará disponível em `http://localhost:5173`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, JWT, MySQL.
- **Design**: Figma Inspired / Future UI.

---

### 👨‍💻 Desenvolvedor
Desenvolvido com foco em excelência e performance. 
