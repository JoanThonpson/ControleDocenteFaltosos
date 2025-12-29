sistema-faltas/                # Pasta raiz do projeto
│
├── frontend/                  # Frontend completo
│   ├── login.html            # (FORA do src)
|   ├── login.html            # (FORA do src)
│   └── src/                  # Código fonte organizado
│       ├── css/              # Estilos
│       │   ├── styles.css    # Principal
│       │   ├── login.css     # Específico login
│       │   └── modais.css    # Específico modais
│       │
│       ├── js/               # JavaScript
│       │   ├── app.js        # Inicialização
|       |    ├── login.js        # Inicialização
│       │   ├── services/     # Serviços/lógica
│       │   │   ├── auth.service.js
│       │   │   ├── docente.service.js
│       │   │   ├── falta.service.js
│       │   │   ├── config.service.js
|       |   |    ├── usuario.service.js 
│       │   │   └── relatorio.service.js
│       │   │
│       │   ├── components/   # Componentes UI
│       │   │   ├── ModalManager.js
│       │   │   ├── TableRenderer.js
│       │   │   ├── FormHandler.js falta esse 
│       │   │   └── FilterManager.js
│       │   │
│       │   ├── utils/        # Utilitários
|       |    |   ├── formatters.js
|       |    |   ├── state.js
│       │   │   ├── storage.js
│       │   │   ├── helpers.js
│       │   │   └── validators.js
│       │   │
│       │   └── api/          # (Futuro) API client
│       │       └── client.js
│       │
│       ├── assets/           # Imagens/ícones
│       │   ├── logo.png      # (se houver)
│       │   └── icons/        # (se houver)
│       │
│       └── fonts/            # Fontes customizadas
│           └── custom-font.woff2
│
├── backend/                  # Backend Node.js (Futuro)
│   ├── src/                  # Código fonte backend
│   │   ├── models/           # Modelos de dados
│   │   ├── routes/           # Rotas API
│   │   └── utils/            # Utilitários
│   │
│   ├── package.json          # Dependências Node.js
│   ├── .env                  # Variáveis ambiente
│   └── server.js             # Arquivo principal
│
└── database/                 # Scripts SQL (Futuro)
    ├── schema.sql            # Schema completo
    └── migrations/           # Migrações do banco






------------------------------------------------------------------

PERGUNTAS PARA VOCÊ:
Quer implementar o módulo state.js primeiro?

Quer ajustar o index.html para referenciar os arquivos corretamente?

Quer focar primeiro na navegação ou nos serviços de autenticação?



----------------------------------------------------------------------


<style> 
.hidden { display: none; } 
.login-container { max-width: 400px; margin: 100px auto; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); } 
.admin-login { background-color: #fff3cd; border: 1px solid #ffeaa7; } 
.badge-justificada { background-color: #28a745; } 
.badge-falta { background-color: #dc3545; } 
.filtro-container { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; } 
.nav-tabs .nav-link.active { font-weight: bold; } 
.table th { background-color: #343a40; color: white; } 
.config-item { padding: 8px 12px; border-bottom: 1px solid #dee2e6; } 
.config-item:last-child { border-bottom: none; } 
</style>