const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  listarAvaliacoes,
  criarAvaliacao,
  obterAvaliacaoPorId,
  atualizarAvaliacao,
  deletarAvaliacao,
  votarAvaliacao
} = require('../controllers/avaliacaoController');

// Define as rotas de CRUD
router.post('/', protect, criarAvaliacao);        // CREATE
router.get('/', listarAvaliacoes);                // READ ALL
router.get('/:id', obterAvaliacaoPorId);          // REAL ONE
router.put('/:id', protect, atualizarAvaliacao);  // UPDATE
router.delete('/:id', protect, deletarAvaliacao); // DELETE

router.post('/:id/voto', protect, votarAvaliacao); // upvote ou downvote

module.exports = router;