const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer();


const {
  listarEstabelecimentos,
  criarEstabelecimento,
  obterEstabelecimentoPorId,
  atualizarEstabelecimento,
  deletarEstabelecimento
} = require('../controllers/estabelecimentoController');

// Define as rotas de CRUD
router.post('/', protect, upload.single('imagem'), criarEstabelecimento);        // CREATE
router.get('/', listarEstabelecimentos);                // READ ALL
router.get('/:id', obterEstabelecimentoPorId);          // REAL ONE
router.put('/:id', protect, atualizarEstabelecimento);  // UPDATE
router.delete('/:id', protect, deletarEstabelecimento); // DELETE

module.exports = router;