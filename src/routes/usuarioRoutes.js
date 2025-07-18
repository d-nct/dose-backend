const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  loginUsuario,
  listarUsuarios,
  criarUsuario,
  obterUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
  alternarFavoritoDrink,
  alternarFavoritoEstabelecimento,
  alternarSeguirUsuario,
  alternarAdm,
  obterAvaliacoesPorUsuario,
  obterDrinksFavoritosPorUsuario,
  obterEstabelecimentosFavoritosPorUsuario,
  alterarSenhaUsuario
} = require('../controllers/usuarioController');

// Define as rotas de CRUD
router.post('/', criarUsuario);        // CREATE
router.get('/', listarUsuarios);       // READ ALL
router.get('/:id', obterUsuarioPorId); // REAL ONE
router.put('/:id', protect, atualizarUsuario);  // UPDATE
router.delete('/:id', protect, deletarUsuario); // DELETE

router.post('/login', loginUsuario);

router.post('/:id/favoritos/drinks/:drinkId', protect, alternarFavoritoDrink);
router.post('/:id/favoritos/estabelecimentos/:estId', protect, alternarFavoritoEstabelecimento);
router.post('/:id/seguir/:alvoId', protect, alternarSeguirUsuario);

router.post('/adm/:id', protect, alternarAdm);

// Novas rotas
router.get('/:id/avaliacoes', obterAvaliacoesPorUsuario);
router.get('/:id/favoritos/drinks', obterDrinksFavoritosPorUsuario);
router.get('/:id/favoritos/estabelecimentos', obterEstabelecimentosFavoritosPorUsuario);
router.put('/:id/senha', protect, alterarSenhaUsuario);

module.exports = router;''