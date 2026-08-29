# FormGen Studio ✨

> **Plataforma Moderna de Criação de Formulários Dinâmicos com Arquitetura Zero-Database, Integração com Google Drive e Validação Visual Exclusiva.**

Desenvolvido pela **Agenc-IA**, o **FormGen Studio** combina a flexibilidade do design moderno com a segurança e privacidade de uma infraestrutura descentralizada. Seus formulários residem como arquivos `.json` na sua própria pasta do Google Drive, e os dados preenchidos pelos respondentes são encaminhados diretamente para os seus webhooks e planilhas, sem retenção em servidores intermediários.

---

## 🚀 Principais Recursos

### 1. Arquitetura "Zero-Database"
- **Privacidade Absoluta:** O sistema não possui banco de dados relacional para formulários ou respostas.
- **Armazenamento no Google Drive:** Cada formulário é salvo como arquivo `.json` diretamente na pasta `FormGen Agenc-ia` do seu Drive pessoal, utilizando o escopo restrito `drive.file` do Google OAuth.
- **Respostas Diretas:** Os dados de submissão são despachados diretamente para a automação do usuário (n8n, Make, Zapier, Google Sheets, Supabase ou E-mail).

### 2. Opções Exclusivas ✨ ("Nenhum / Não se aplica")
- **Regra de Seleção Única:** Apenas uma opção por pergunta de múltipla escolha pode ser configurada como exclusiva.
- **Pré-seleção Automática como Padrão:** A opção definida como exclusiva já vem marcada (`defaultChecked`) por padrão no formulário público, agilizando o preenchimento para o usuário que não tem alternativas adicionais a declarar.
- **Desmarcação Mútua e Inteligente:** Marcar qualquer opção comum desmarca a exclusiva instantaneamente; marcar a exclusiva desmarca todas as comuns.
- **Validação de Obrigatoriedade:** Se o campo for obrigatório, o sistema bloqueia o avanço ou envio caso o usuário desmarque todas as alternativas.

### 3. Sistema de Mensagens e Diálogos 100% Exclusivos
- **Zero Alertas Nativos de Navegador:** `window.alert()` e `window.confirm()` foram banidos e substituídos pelo `CustomDialogContext`.
- **Formulários sem Balões Cinzas:** Formulários utilizam `noValidate`, implementando alertas visuais inline (`AlertCircle`), bordas avermelhadas suaves e scroll suave automático para o primeiro campo inválido.
- **Toasts Flutuantes com Efeito de Vidro (*Glassmorphism*):** Notificações elegantes de sucesso, aviso e erro com animações fluidas e auto-dispensa.

### 4. Reconexão Automática e Inteligente com Google Drive
- **Gestão Contínua de Sessão:** Caso o token temporário de 60 minutos do Google expire, o sistema **não desloga** o usuário.
- **Disponível no Dashboard e no Construtor:**
  - **No Dashboard:** Uma janela modal personalizada solicita a reconexão em 1 clique e recarrega os formulários sem recarregar a página.
  - **No Construtor:** Ao clicar em *"Reconectar e Salvar"*, as alterações em edição são preservadas e sincronizadas imediatamente no Drive.

### 5. Modos de Visualização & Design System
- **Modo Passo a Passo (*Multi-step / Typeform-Style*):** Foco pergunta por pergunta com barra de progresso em tempo real e validação etapa por etapa.
- **Modo Completo (*Single Page*):** Todos os campos dispostos verticalmente em um único card clean.
- **Identidade Visual Avançada:**
  - Temas corporativos, cores primárias customizadas, controle de arredondamento (*border-radius*) e sombras.
  - Tipografia moderna (Google Fonts) e suporte para CSS customizado.
  - Upload de logomarca com opções de alinhamento e dimensionamento.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, Vite, React Router DOM
- **Autenticação:** `@react-oauth/google` (Google OAuth 2.0 com escopo `drive.file`)
- **Ícones & Estilo:** Lucide React, Glassmorphism, CSS puro responsivo
- **Proxy Serverless:** Vercel Serverless Functions (`/api/proxy`, `/api/subscription`, `/api/send-email`)
- **Integrações:** Google Drive API v3, Google Sheets (Apps Script), Supabase, Webhooks HTTP

---

## 📦 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/celiogomesalves/gerador-de-formularios.git
   cd gerador-de-formularios
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🌐 Produção

A aplicação está disponível em:
**[https://formularios.agenc-ia.net](https://formularios.agenc-ia.net)**

---

© 2026 Agenc-IA. Todos os direitos reservados.
