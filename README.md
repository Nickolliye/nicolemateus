# Lista de Presentes de Casamento | Nicole & Mateus 💍

Site premium, funcional e elegante para a lista de presentes físicos de casamento de **Nicole e Mateus**. 

Desenvolvido para que familiares e convidados possam visualizar os itens domésticos que o casal precisa, consultar os que já foram garantidos e reservar presentes de forma simples e intuitiva, sem carrinhos de compras ou transações financeiras.

---

## ✨ Funcionalidades Principais

### Para Convidados (Público)
- **Design Romântico e Sofisticado**: Paleta bordô/marsala, bege e dourado com tipografia elegante e microinterações.
- **Catálogo Inteligente**:
  - Filtros rápidos: *Todos*, *Ainda Precisamos*, *Já Garantidos*, *Já Temos*.
  - Busca instantânea por nome ou descrição (com suporte a acentuação).
  - Contador de itens por categoria/status.
- **Diferenciação Clara de Modos**:
  - **Quantidade Fixa**: Exibe quantas unidades foram pedidas e quantas restam.
  - **Quantidade Ilimitada**: Itens que o casal aceita receber múltiplos (ex: panos de prato, toalhas).
- **Reserva Segura e Concorrente**:
  - Validação atômica no banco de dados via função PostgreSQL (`reserve_gift`), prevenindo reservas excedentes ou conflitos concorrentes (*race conditions*).
  - Modal com seleção de quantidade disponível, campo de nome do convidado e mensagem comemorativa pós-confirmação.

### Para os Noivos (Painel Administrativo)
- **Autenticação Segura**: Login restrito via Supabase Auth com sessão persistida.
- **Gestão Completa de Presentes**:
  - Cadastro e edição de presentes (título, descrição, imagem, modo de quantidade, status inicial, ordem de exibição e visibilidade).
  - Exclusão com proteção referencial.
- **Gestão de Reservas**:
  - Consulta detalhada de quem reservou cada item, data da reserva e quantidade.
  - Cancelamento de reserva com restauração automática da quantidade disponível para outros convidados.
- **Métricas em Tempo Real**:
  - Total de itens, itens necessários, garantidos, já possuídos e reservas ativas.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Vite
- **Roteamento**: React Router DOM (v7)
- **Ícones**: Lucide React
- **Estilização**: CSS Modular & Design Tokens (paleta personalizada para casamento)
- **Backend & Banco de Dados**: Supabase (PostgreSQL com RLS, Stored Procedures e Triggers)
- **Autenticação**: Supabase Auth (Email + Senha)
- **Storage**: Supabase Storage (`gift-images`)
- **Deploy**: GitHub Pages (com GitHub Actions CI/CD e suporte a SPA via `404.html`)

---

## 🚀 Como Configurar e Rodar o Projeto

### 1. Clonar e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd nicole-mateus-gifts
npm install
```

### 2. Configurar o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Acesse o **SQL Editor** no painel do Supabase.
3. Execute o script `supabase/migrations/001_initial_schema.sql` para criar as tabelas (`gifts`, `gift_reservations`, `admin_audit_log`), índices, políticas de RLS e funções seguras (`reserve_gift`, `cancel_reservation`).
4. (Opcional) Execute o script `supabase/migrations/002_seed_data.sql` para popular a lista com presentes iniciais de exemplo.
5. Crie o bucket de imagens no **Storage**:
   - Vá em **Storage** > **New bucket**.
   - Nome: `gift-images`.
   - Marque como **Public bucket**.
6. Crie o usuário administrador dos noivos:
   - Vá em **Authentication** > **Users** > **Add user** > **Create user**.
   - Defina o e-mail e a senha que Nicole e Mateus usarão para acessar o painel (`/admin`).

### 3. Configurar as Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
VITE_BASE_URL=/
```

> **Atenção**: Nunca compartilhe a chave `service_role`. Utilize apenas a `anon public key` no frontend.

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no seu navegador: `http://localhost:5173`.

### 5. Compilar para Produção
```bash
npm run build
```

---

## 🌐 Publicação no GitHub Pages

O repositório já inclui o fluxo automatizado em `.github/workflows/deploy.yml`.

1. Suba o projeto para o GitHub:
   ```bash
   git add .
   git commit -m "feat: site lista de presentes Nicole e Mateus"
   git push origin main
   ```
2. No repositório no GitHub, acesse **Settings** > **Secrets and variables** > **Actions** e crie os secrets:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Anon Key pública do Supabase.
3. Se o site for hospedado sob subdiretório (ex: `https://usuario.github.io/nicole-mateus-gifts/`), configure a variável `VITE_BASE_URL=/nicole-mateus-gifts/`.
4. Em **Settings** > **Pages**, selecione o source **GitHub Actions**. O deploy será executado automaticamente a cada push na branch `main`.

---

## 🔒 Segurança e Integridade de Dados

- **Row Level Security (RLS)**: Visitantes anônimos só têm permissão para ler itens com `is_visible = true`.
- **Nomes de Convidado Protegidos**: Visitantes não têm permissão de leitura sobre a tabela `gift_reservations`. O público só enxerga o saldo restante consolidado, garantindo a privacidade dos convidados. Apenas os noivos logados têm acesso aos nomes de quem reservou.
- **Função Atômica com `FOR UPDATE`**: A função `reserve_gift` trava temporariamente o registro do item durante a reserva, evitando que dois convidados reservem o mesmo último item simultaneamente.
