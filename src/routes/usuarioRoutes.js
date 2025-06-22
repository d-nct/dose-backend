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
  alternarAdm
} = require('../controllers/usuarioController');

// Define as rotas de CRUD
router.post('/', criarUsuario);        // CREATE
router.get('/', listarUsuarios);       // READ ALL
router.get('/:id', obterUsuarioPorId); // REAL ONE
router.put('/:id', protect, atualizarUsuario);  // UPDATE
router.delete('/:id', protect, deletarUsuario); // DELETE

router.post('/login', loginUsuario);

router.post('/favoritos/drinks/:drinkId', protect, alternarFavoritoDrink);
router.post('/favoritos/estabelecimentos/:estId', protect, alternarFavoritoEstabelecimento);
router.post('/seguir/:alvoId', protect, alternarSeguirUsuario);

router.post('/adm/:id', protect, alternarAdm);

module.exports = router;