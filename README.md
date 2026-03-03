# 💎 Real Balance🚀

<div align="center">
  <img src="./docs/images/dashboard.png" alt="Real Balance Dashboard" width="100%" />
</div>

> **Domine o seu património com elegância e precisão.** O Real Balance é uma solução de gestão financeira de alta performance, desenhada para quem não aceita menos que o topo. Com uma interface baseada em *Glassmorphism* e uma arquitetura robusta, oferecemos o controle que você merece.

---

## ✨ Por que o Real Balance?

O mercado está cheio de aplicativos genéricos. O **Real Balance** destaca-se por ser uma ferramenta **Premium**, focada na experiência do usuário e na integridade dos dados.

### 🏛️ Arquitetura de Elite
Diferente de sistemas básicos, o Real Balance utiliza uma separação lógica rigorosa entre **Receitas** e **Despesas**, garantindo que as suas categorias de entrada nunca se misturem com as de saída. Isso permite uma análise granular e limpa do seu fluxo de caixa.

<div align="center">
  <img src="./docs/images/analytics.png" alt="Analytics Visual" width="80%" />
</div>

---

## 🛠️ Funcionalidades Core

### 📈 Dashboard Inteligente
Visualize o seu património total, receitas e despesas mensais num relance. Nossos gráficos dinâmicos mostram a evolução do seu capital ao longo do tempo.

### 💳 Gestão de Multicaixas & Carteiras
Controle múltiplas contas bancárias (BFA, BAI, Sol, etc.), cartões Multicaixa e dinheiro vivo.

### 📑 Relatórios Profissionais
Gere relatórios detalhados em **PDF** ou **Excel**. O sistema mantém um histórico dos relatórios gerados para que você possa consultar estados passados do seu património a qualquer momento.

### 🧮 Simuladores de Performance
- **Regra 50/30/20**: Ajuste o seu estilo de vida para o sucesso financeiro.
- **Projeção de Riqueza**: Simule o seu património futuro com base em taxas de juros e poupanças mensais.

---

## 🔒 Segurança em Primeiro Lugar

A sua privacidade e segurança são inegociáveis. 

<div align="center">
  <img src="./docs/images/security.png" alt="Security Visual" width="60%" />
</div>

- **Proteção Bcrypt**: Senhas encriptadas com os padrões mais altos do mercado.
- **Autenticação JWT**: Sessões seguras e controladas para acesso aos seus dados financeiros.
- **Otimização de Assets**: Fotos de perfil são comprimidas localmente (Edge Compression) antes do upload, garantindo privacidade e velocidade.

---

## 🚀 Como Começar (Guia Rápido)

### 📋 Pré-requisitos
- **Node.js** (v18+)
- **MySQL** (Instância local ou remota)

### ⚙️ Instalação Passo a Passo

1. **Clone & Base de Dados**:
   ```sql
   -- No seu MySQL workbench ou terminal, importe o arquivo:
   SOURCE realbalance.sql;
   ```

2. **Configuração Backend**:
   - Entre na pasta `backend`
   - `npm install`
   - Configure o `.env` seguindo o modelo:
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASS=sua_senha
     DB_NAME=realbalance
     JWT_SECRET=chave_secreta_aqui
     ```
   - `npm run dev`

3. **Configuração Frontend**:
   - Entre na pasta `frontend`
   - `npm install`
   - `npm run dev`

O sistema estará ativo em `http://localhost:5173`.

---

## 🛠️ Tecnologias de Ponta

- **Frontend**: `React 19`, `Tailwind CSS`, `Framer Motion`, `Lucide Icons`.
- **Backend**: `Node.js`, `Express`, `MySQL2` (Promise-based).
- **Design System**: *Future Glassmorphism v2.0*.

---

### 👨‍💻 Realizado por
Projecto focado em excelência técnica e design de produto.
