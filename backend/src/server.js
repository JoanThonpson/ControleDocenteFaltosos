// Arquivo: ControleDocenteFaltosos/backend/src/server.js
// Função: Arquivo principal do servidor

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors()); // Permite requisições de qualquer origem
app.use(express.json()); // Parse de JSON no body

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API do Sistema de Controle de Faltas',
    timestamp: new Date().toISOString()
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}/api`);
});