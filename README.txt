Sistema em desenvolvimento para controle de faltas de docentes, com arquitetura separada entre frontend e backend.

Possui autenticação, controle de permissões por perfil de usuário (Mestre, Gestor, Operador e Supervisor) e organização de dados com SQLite.

A aplicação segue uma estrutura baseada em rotas, controladores, modelos e middlewares, simulando um ambiente real de sistemas corporativos.

Tecnologias: Node.js, Express, SQLite, JavaScript

------------------------------------ESTRUTURA---------------------------------------------

sistema-faltas/                # Pasta raiz do projeto
│
├── frontend/                  # Frontend
│   ├── login.html            
|   ├── Sistema.html            
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
│           └── 
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


------------------------------------------------------------------------------------------------------------------
🔐 Sistema de Permissões: (WORK PIO 3.2)

****************MASTER (não editável)- deve fazer tudo do sistema****************
📍 CONTROLE DE FALTAS
[✓] Visualizar faltas
[✓] Registrar nova falta
[✓] Editar falta
[✓] Excluir faltas

📍 DADOS DO DOCENTE  
[✓] Visualizar docentes
[✓] Cadastrar novo docente
[✓] Editar docente
[✓] Excluir docentes

📍 JUSTIFICATIVAS
[✓] Visualizar justificativas
[✓] Cadastrar/editar justificativas

📍 RELATÓRIOS E ESTATÍSTICAS
[✓] Visualizar relatórios
[✓] Gerar relatório PDF

📍 CONFIGURAÇÕES
[✓] Acessar configurações
  ├── [✓] Gerenciar disciplinas
  ├── [✓] Gerenciar cursos
  ├── [✓] Gerenciar justificativas
  ├── [✓] Gerenciar usuários
  |  ├── [✓] Editar usuário
  |  ├── [✓] Resetar senhas
  |  └── [✓] Visualizar logs de atividade
  ├── [✓] Gerenciar perfis
  └── [✓] Visualizar logs

***********Gestor*********************
📍 CONTROLE DE FALTAS
[✓] Visualizar faltas
[✓] Registrar nova falta
[✓] Editar falta
[✓] Excluir faltas

📍 DADOS DO DOCENTE  
[✓] Visualizar docentes
[✓] Cadastrar novo docente
[✓] Editar docente
[✓] Excluir docentes

📍 JUSTIFICATIVAS
[✓] Visualizar justificativas
[✓] Cadastrar/editar justificativas

📍 RELATÓRIOS E ESTATÍSTICAS
[✓] Visualizar relatórios
[✓] Gerar relatório PDF

📍 CONFIGURAÇÕES
[✓] Acessar configurações
  ├── [✓] Gerenciar disciplinas
  ├── [✓] Gerenciar cursos
  ├── [✓] Gerenciar justificativas
  ├── [✓] Gerenciar usuários
  |  ├── [✓] Editar usuário
  |  ├── [✓] Resetar senhas
  |  └── [✓] Visualizar logs de atividade
  ├── [✓] Gerenciar perfis
  └── [✓] Visualizar logs


********OPERADOR*********
📍 CONTROLE DE FALTAS
[✓] Visualizar faltas
[✓] Registrar nova falta
[✗] Editar falta
[✗] Excluir faltas

📍 DADOS DO DOCENTE  
[✓] Visualizar docentes
[✗] Cadastrar novo docente
[✓] Editar docente
[✗] Excluir docentes

📍 JUSTIFICATIVAS
[✓] Visualizar justificativas

📍 RELATÓRIOS E ESTATÍSTICAS
[✓] Visualizar relatórios
[✗] Gerar relatório PDF

📍 CONFIGURAÇÕES
[✗] Acessar configurações
  ├── [✗] Gerenciar disciplinas
  ├── [✗] Gerenciar cursos
  ├── [✗] Gerenciar justificativas
  ├── [✗] Gerenciar usuários
  |  ├── [✗] Editar usuário
  |  ├── [✗] Resetar senhas
  |  └── [✗] Visualizar logs de atividade
  ├── [✗] Gerenciar perfis
  └── [✗] Visualizar logs

********SUPERVISOR*********
📍 CONTROLE DE FALTAS
[✓] Visualizar faltas
[✗] Registrar nova falta
[✗] Editar qualquer falta
[✗] Editar apenas próprias faltas
[✗] Excluir faltas

📍 DADOS DO DOCENTE  
[✓] Visualizar docentes
[✗] Cadastrar novo docente
[✗] Editar docente
[✗] Excluir docentes

📍 JUSTIFICATIVAS
[✓] Visualizar justificativas

📍 RELATÓRIOS E ESTATÍSTICAS
[✓] Visualizar relatórios
[✓] Gerar relatório PDF

📍 CONFIGURAÇÕES
[✗] Acessar configurações
  ├── [✗] Gerenciar disciplinas
  ├── [✗] Gerenciar cursos
  ├── [✗] Gerenciar justificativas
  ├── [✗] Gerenciar usuários
  |  ├── [✗] Editar usuário
  |  ├── [✗] Resetar senhas
  |  └── [✗] Visualizar logs de atividade
  ├── [✗] Gerenciar perfis
  └── [✗] Visualizar logs
---------------------------------------------------------------------------------------------------------------

📊 Melhorias Adicionais Sugeridas
Histórico de alterações: Registrar quem fez cada modificação

Backup automático: Salvar dados em JSON periodicamente

Validação de CPF: Para login de usuários

Recuperação de senha: Via e-mail ou token

Dashboard inicial: Com gráficos de faltas por mês/docente

---------------------------------------------------------------------------------------------------------------


Carla Lima (789.123.456-00) - Operador - Ativo [✏️ Editar] [🗑️ Excluir*]

*Só pode excluir se não tiver registros (faltas, logs, etc.)

