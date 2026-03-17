// Arquivo: ControleDocenteFaltosos/backend/src/routes/auth.js
// Função: Rotas de autenticação (login, logout, etc)

const express = require('express');
const router = express.Router();

// Rota de login
router.post('/login', (req, res) => {
  res.json({ message: 'Rota de login - em desenvolvimento' });
});

// Rota de logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Rota de logout - em desenvolvimento' });
});

// Dados do usuário atual
router.get('/me', (req, res) => {
  res.json({ message: 'Dados do usuário - em desenvolvimento' });
});

module.exports = router;