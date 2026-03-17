// Arquivo: ControleDocenteFaltosos/backend/src/routes/usuarios.js
// Função: CRUD de usuários (admin)

const express = require('express');
const router = express.Router();

// Listar usuários
router.get('/', (req, res) => {
  res.json({ message: 'Lista de usuários - em desenvolvimento' });
});

// Criar usuário
router.post('/', (req, res) => {
  res.json({ message: 'Criar usuário - em desenvolvimento' });
});

// Editar usuário
router.put('/:id', (req, res) => {
  res.json({ message: `Editar usuário ${req.params.id} - em desenvolvimento` });
});

// Remover usuário
router.delete('/:id', (req, res) => {
  res.json({ message: `Remover usuário ${req.params.id} - em desenvolvimento` });
});

module.exports = router;