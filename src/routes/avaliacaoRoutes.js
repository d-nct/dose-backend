const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const {
  listarAvaliacoes,
  criarAvaliacao,
  obterAvaliacaoPorId,
  atualizarAvaliacao,
  deletarAvaliacao,
  votarAvaliacao,
  listarMinhasAvaliacoes
} = require('../controllers/avaliacaoController');

// Define as rotas de CRUD
router.post('/', protect, upload.single('imagem'), criarAvaliacao);        // CREATE
router.get('/', listarAvaliacoes);                // READ ALL
router.get('/:id', obterAvaliacaoPorId);          // REAL ONE
router.put('/:id', protect, atualizarAvaliacao);  // UPDATE
router.delete('/:id', protect, deletarAvaliacao); // DELETE

router.post('/:id/voto', protect, votarAvaliacao); // upvote ou downvote
router.get('/me', protect, listarMinhasAvaliacoes);

module.exports = router;