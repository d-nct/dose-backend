const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  listarCategorias,
  criarCategoria,
  obterCategoriaPorId,
  atualizarCategoria,
  deletarCategoria
} = require('../controllers/categoriaController');

// Define as rotas de CRUD
router.post('/', protect, criarCategoria);        // CREATE
router.get('/', listarCategorias);       // READ ALL
router.get('/:id', obterCategoriaPorId); // REAL ONE
router.put('/:id', protect, atualizarCategoria);  // UPDATE
router.delete('/:id', protect, deletarCategoria); // DELETE

module.exports = router;