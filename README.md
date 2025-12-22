# Finances Frontend

Frontend do sistema de controle financeiro pessoal.

## Tecnologias

- **Vite** - Build tool
- **React** - Framework UI
- **TypeScript** - Tipagem estática
- **TanStack Router** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **react-hook-form** - Formulários
- **Zod** - Validação
- **Zustand** - Estado global (quando necessário)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:3000`.

## Build

```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── routes/              # Rotas do TanStack Router
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   ├── layout/         # Componentes de layout
│   └── modals/         # Modais
├── lib/                # Utilitários e configurações
│   ├── api/            # Funções de API
│   └── queries/        # Hooks do TanStack Query
├── contexts/           # Contextos React
└── types/              # Tipos TypeScript
```

## Configuração

O backend deve estar rodando em `http://localhost:8080` (ou configurar a variável de ambiente `VITE_API_URL`).

## Rotas

- `/login` - Página de login
- `/register` - Página de registro
- `/dashboard` - Dashboard com métricas
- `/transactions` - Lista de transações
- `/budgets` - Gerenciamento de orçamentos
- `/accounts` - Gerenciamento de contas
- `/settings` - Configurações do usuário

## Funcionalidades

- ✅ Autenticação (login/registro)
- ✅ Dashboard com métricas semana/mês
- ✅ Lista de transações com filtros
- ✅ Gerenciamento de orçamentos
- ✅ Gerenciamento de contas bancárias
- ✅ Transferências entre contas
- ✅ Modal global para adicionar transações/transferências
- ✅ Criação de categorias on-the-fly
- ✅ Configurações do usuário

