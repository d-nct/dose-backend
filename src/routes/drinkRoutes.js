const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Importa o middleware de upload

const {
  listarDrinks,
  criarDrink,
  obterDrinkPorId,
  atualizarDrink,
  deletarDrink,
  adicionarOndeEncontrar,
  atualizarOndeEncontrar,
  removerOndeEncontrar
} = require('../controllers/drinkController');

// Define as rotas de CRUD
// A rota de criação agora usa o middleware de upload para aceitar uma imagem
router.post('/', protect, upload.single('imagem'), criarDrink); // CREATE
router.get('/', listarDrinks);         // READ ALL
router.get('/:id', obterDrinkPorId);   // REAL ONE
router.put('/:id', protect, atualizarDrink);    // UPDATE
router.delete('/:id', protect, deletarDrink);   // DELETE

// E dos dados aninhados de onde encontrar o drink
router.post('/:id/ondeEncontrar', protect, adicionarOndeEncontrar);
router.put('/:id/ondeEncontrar/:subId', protect, atualizarOndeEncontrar);
router.delete('/:id/ondeEncontrar/:subId', protect, removerOndeEncontrar);

module.exports = router;