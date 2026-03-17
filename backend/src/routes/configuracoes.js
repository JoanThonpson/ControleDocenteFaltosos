// Arquivo: ControleDocenteFaltosos/backend/src/routes/configuracoes.js
// Função: Disciplinas, cursos, justificativas

const express = require('express');
const router = express.Router();

// ===== DISCIPLINAS =====
router.get('/disciplinas', (req, res) => {
  res.json({ message: 'Lista de disciplinas - em desenvolvimento' });
});

router.post('/disciplinas', (req, res) => {
  res.json({ message: 'Criar disciplina - em desenvolvimento' });
});

router.delete('/disciplinas/:nome', (req, res) => {
  res.json({ message: `Remover disciplina ${req.params.nome} - em desenvolvimento` });
});

// ===== CURSOS =====
router.get('/cursos', (req, res) => {
  res.json({ message: 'Lista de cursos - em desenvolvimento' });
});

router.post('/cursos', (req, res) => {
  res.json({ message: 'Criar curso - em desenvolvimento' });
});

router.delete('/cursos/:nome', (req, res) => {
  res.json({ message: `Remover curso ${req.params.nome} - em desenvolvimento` });
});

// ===== JUSTIFICATIVAS =====
router.get('/justificativas', (req, res) => {
  res.json({ message: 'Lista de justificativas - em desenvolvimento' });
});

router.post('/justificativas', (req, res) => {
  res.json({ message: 'Criar justificativa - em desenvolvimento' });
});

router.delete('/justificativas/:nome', (req, res) => {
  res.json({ message: `Remover justificativa ${req.params.nome} - em desenvolvimento` });
});

module.exports = router;