// Arquivo: ControleDocenteFaltosos/backend/src/routes/relatorios.js
// Função: Estatísticas e relatórios

const express = require('express');
const router = express.Router();

// Estatísticas gerais
router.get('/estatisticas', (req, res) => {
  res.json({ message: 'Estatísticas - em desenvolvimento' });
});

// Faltas por período
router.get('/faltas-por-periodo', (req, res) => {
  res.json({ message: 'Relatório por período - em desenvolvimento', params: req.query });
});

// Relatório de um docente
router.get('/docente/:id', (req, res) => {
  res.json({ message: `Relatório do docente ${req.params.id} - em desenvolvimento` });
});

module.exports = router;