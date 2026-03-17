// Arquivo: ControleDocenteFaltosos/backend/src/routes/faltas.js
// Função: CRUD de faltas

const express = require('express');
const router = express.Router();

// Listar faltas (com filtros)
router.get('/', (req, res) => {
  res.json({ message: 'Lista de faltas - em desenvolvimento', filtros: req.query });
});

// Buscar falta por ID
router.get('/:id', (req, res) => {
  res.json({ message: `Falta ${req.params.id} - em desenvolvimento` });
});

// Registrar falta
router.post('/', (req, res) => {
  res.json({ message: 'Registrar falta - em desenvolvimento', data: req.body });
});

// Editar falta
router.put('/:id', (req, res) => {
  res.json({ message: `Editar falta ${req.params.id} - em desenvolvimento` });
});

// Remover falta
router.delete('/:id', (req, res) => {
  res.json({ message: `Remover falta ${req.params.id} - em desenvolvimento` });
});

module.exports = router;