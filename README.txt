sistema-faltas/                # Pasta raiz do projeto
│
├── frontend/                  # Frontend completo
│   ├── index.html            # Página principal (FORA do src)
│   └── src/                  # Código fonte organizado
│       ├── css/              # Estilos
│       │   ├── styles.css    # Principal
│       │   ├── login.css     # Específico login
│       │   └── modais.css    # Específico modais
│       │
│       ├── js/               # JavaScript
│       │   ├── app.js        # Inicialização
│       │   ├── services/     # Serviços/lógica
│       │   │   ├── auth.service.js
│       │   │   ├── docente.service.js
│       │   │   ├── falta.service.js
│       │   │   ├── config.service.js
│       │   │   └── relatorio.service.js
│       │   │
│       │   ├── components/   # Componentes UI
│       │   │   ├── ModalManager.js
│       │   │   ├── TableRenderer.js
│       │   │   ├── FormHandler.js
│       │   │   └── FilterManager.js
│       │   │
│       │   ├── utils/        # Utilitários
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