const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  listarEstabelecimentos,
  criarEstabelecimento,
  obterEstabelecimentoPorId,
  atualizarEstabelecimento,
  deletarEstabelecimento
} = require('../controllers/estabelecimentoController');

// Define as rotas de CRUD
router.post('/', protect, upload.single('imagem'), criarEstabelecimento);
router.get('/', listarEstabelecimentos);
router.get('/:id', obterEstabelecimentoPorId);
router.put('/:id', protect, atualizarEstabelecimento);
router.delete('/:id', protect, deletarEstabelecimento);

module.exports = router;