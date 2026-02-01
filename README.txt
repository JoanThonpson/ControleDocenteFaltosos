-----------------------------------------------------------------------PREVIA DA AESTRUTURA---------------------------------------------------------------------------------

sistema-faltas/                # Pasta raiz do projeto
│
├── frontend/                  # Frontend
│   ├── login.html            
|   ├── login.html            
│       ├── css/              # Estilos
│       │   ├── styles.css    # Principal
│       │   ├── login.css     # Específico login
│       │   └── modais.css    # Específico modais
│       │
│       ├── js/               # JavaScript
│       │   ├── app.js        # Inicialização
|       |    ├── login.js        # Inicialização
│       │   ├── services/     # Serviços/lógica
│       │   │
│       │   ├── components/   # Componentes UI
│       │   │
│       │   ├── utils/        # Utilitários
│       │   │   ├── storage.js│       │   │
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






----------------------------------------------------------------------------------------------------------------------------

🔐 Sistema de Permissões Sugerido
Permissão	Master	Administrador	Usuário
Cadastrar docente	✅	✅	❌
Editar docente	✅	✅	Apenas próprios
Excluir docente	✅	✅	❌
Registrar falta	✅	✅	✅
Editar falta	✅	✅	Apenas próprias
Configurações	✅	✅	❌
Gerenciar usuários	✅	❌	❌
Relatórios	✅	✅	Apenas visualizar

---------------------------------------------------------------------------------------------------------------

📊 Melhorias Adicionais Sugeridas
Histórico de alterações: Registrar quem fez cada modificação

Backup automático: Salvar dados em JSON periodicamente

Validação de CPF: Para login de usuários

Recuperação de senha: Via email ou token

Dashboard inicial: Com gráficos de faltas por mês/docente
