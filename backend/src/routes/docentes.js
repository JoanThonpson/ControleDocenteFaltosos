// Arquivo: ControleDocenteFaltosos/backend/src/routes/docentes.js
// Função: CRUD de docentes

const express = require('express');
const router = express.Router();

// Listar todos
router.get('/', (req, res) => {
  res.json({ message: 'Lista de docentes - em desenvolvimento' });
});

// Buscar por ID
router.get('/:id', (req, res) => {
  res.json({ message: `Docente ${req.params.id} - em desenvolvimento` });
});

// Criar novo
router.post('/', (req, res) => {
  res.json({ message: 'Criar docente - em desenvolvimento', data: req.body });
});

// Atualizar
router.put('/:id', (req, res) => {
  res.json({ message: `Atualizar docente ${req.params.id} - em desenvolvimento` });
});

// Remover
router.delete('/:id', (req, res) => {
  res.json({ message: `Remover docente ${req.params.id} - em desenvolvimento` });
});

module.exports = router;