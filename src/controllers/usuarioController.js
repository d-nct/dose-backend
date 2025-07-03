const Usuario = require('../models/Usuario.js');
const Avaliacao = require('../models/Avaliacao.js');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken.js'); // Importamos nosso gerador

/**
 * @desc    Adiciona ou remove um drink da lista de favoritos de um usuário.
 * - Se o usuário logado for comum, altera a própria lista.
 * - Se o usuário logado tiver credencial 3, pode alterar a lista de outro usuário.
 * @route   POST /api/usuarios/favoritos/drinks/:drinkId
 * @access  Protegido
 */
const alternarFavoritoDrink = async (req, res) => {
  try {
    const usuarioLogado = req.user; // Usuário autenticado pelo middleware 'protect'
    const { drinkId } = req.params;

    let usuarioAlvoId;

    // Autorização
    if (usuarioLogado.credencial === 3 && req.body.usuarioAlvoId) {
      // Se for super-usuário e especificar um alvo, ele age sobre o alvo
      usuarioAlvoId = req.body.usuarioAlvoId;
    } else {
      // Caso contrário, age sobre a própria conta
      usuarioAlvoId = usuarioLogado.id;
    }

    
    const usuarioAlvo = await Usuario.findById(usuarioAlvoId);
    if (!usuarioAlvo) {
      return res.status(404).json({ message: 'Usuário alvo não encontrado.' });
    }

    // Atualiza
    const jaFavoritou = usuarioAlvo.drinksFavoritos.includes(drinkId);
    const update = jaFavoritou
      ? { $pull: { drinksFavoritos: drinkId } }
      : { $addToSet: { drinksFavoritos: drinkId } };

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(usuarioAlvoId, update, { new: true });
    
    res.json({
      message: `Operação realizada com sucesso para o usuário: ${usuarioAlvo.nomeUsuario}`,
      drinksFavoritos: usuarioAtualizado.drinksFavoritos,
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

/**
 * @desc    Adiciona ou remove um estabelecimento da lista de favoritos
 * @route   POST /api/usuarios/favoritos/estabelecimentos/:estId
 * @access  Protegido
 */
const alternarFavoritoEstabelecimento = async (req, res) => {
  try {
    const usuarioLogado = req.user;
    const { estId } = req.params; // ID do estabelecimento

    let usuarioAlvoId;

    // Autorização
    if (usuarioLogado.credencial === 3 && req.body.usuarioAlvoId) {
      // Se for super-usuário e especificar um alvo, ele age sobre o alvo
      usuarioAlvoId = req.body.usuarioAlvoId;
    } else {
      // Caso contrário, age sobre a própria conta
      usuarioAlvoId = usuarioLogado.id;
    }

    const usuarioAlvo = await Usuario.findById(usuarioAlvoId);
    if (!usuarioAlvo) {
      return res.status(404).json({ message: 'Usuário alvo não encontrado.' });
    }

    const jaFavoritou = usuarioAlvo.estabelecimentosFavoritos.includes(estId);

    const update = jaFavoritou
      ? { $pull: { estabelecimentosFavoritos: estId } }
      : { $addToSet: { estabelecimentosFavoritos: estId } };

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(usuarioAlvoId, update, { new: true });

    res.json({
      message: `Operação de favorito (estabelecimento) realizada com sucesso para o usuário: ${usuarioAlvo.nomeUsuario}`,
      estabelecimentosFavoritos: usuarioAtualizado.estabelecimentosFavoritos,
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

/**
 * @desc    Seguir ou deixar de seguir outro usuário.
 * - Usuário comum segue/deixa de seguir com sua própria conta.
 * - Super-usuário (credencial 3) pode fazer um usuário A seguir um usuário B.
 * @route   POST /api/usuarios/seguir/:alvoId
 * @access  Protegido
 */
const alternarSeguirUsuario = async (req, res) => {
  try {
    const usuarioLogado = req.user;
    const { alvoId } = req.params; // O usuário a ser seguido

    let seguidorId; // O usuário que fará a ação de seguir

    // Lógica de permissão
    if (usuarioLogado.credencial === 3 && req.body.seguidorId) {
      // Se for super-usuário e especificar um seguidor, ele age em nome desse seguidor
      seguidorId = req.body.seguidorId;
    } else {
      // Caso contrário, o próprio usuário logado é o seguidor
      seguidorId = usuarioLogado.id;
    }

    if (seguidorId === alvoId) {
      return res.status(400).json({ message: 'Um usuário não pode seguir a si mesmo.' });
    }

    const seguidor = await Usuario.findById(seguidorId);
    const alvo = await Usuario.findById(alvoId);

    if (!seguidor || !alvo) {
      return res.status(404).json({ message: 'Usuário seguidor ou alvo não encontrado.' });
    }

    const jaSegue = seguidor.seguindo.includes(alvoId);

    let seguidorUpdate, alvoUpdate;

    if (jaSegue) {
      seguidorUpdate = { $pull: { seguindo: alvoId } };
      alvoUpdate = { $pull: { seguidores: seguidorId } };
    } else {
      seguidorUpdate = { $addToSet: { seguindo: alvoId } };
      alvoUpdate = { $addToSet: { seguidores: seguidorId } };
    }

    // Executa as duas atualizações em paralelo para garantir a consistência
    await Promise.all([
      Usuario.findByIdAndUpdate(seguidorId, seguidorUpdate),
      Usuario.findByIdAndUpdate(alvoId, alvoUpdate)
    ]);

    res.json({ message: jaSegue ? 'Deixou de seguir com sucesso.' : 'Seguindo com sucesso.' });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

/**
 * @desc    Se tornar ou deixar de ser ADM de Conteúdo (nível 1)
 * @route   POST /api/usuarios/adm/:id
 * @access  Protegido
 */
const alternarAdm = async (req, res) => {
  try {
    const emissorId = req.user.id;
    const { alvoId } = req.params;

    const emissor = await Usuario.findById(emissorId);
    const alvo = await Usuario.findById(alvoId);

    if (!alvo) {
      return res.status(404).json({ message: 'Usuário alvo não encontrado.' });
    }

    // Autenticação
    if (avaliacao.usuario.toString() !== req.user.id &&
      req.user.credencial < 2
    ) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    // Verifica se está no escopo da função
    if (alvo.credencial > 1) {
      return res.status(401).json({ message: 'Usuário alvo não pode ser gerenciado por essa função.' });
    }

    // Alterna
    const usrAtualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: { credencial: !(alvo.credencial) } }, // alterna
      { new: true, runValidators: true } // {new: true} retorna o documento atualizado
    );

    res.json(usrAtualizado);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

  
const loginUsuario = async (req, res) => {
  const { nome_usuario, senha } = req.body;

  try {
    // Encontra o usuário
    const usuario = await Usuario.findOne({ nome_usuario });

    // Se não existe, reclama
    if (!usuario) {
      return res.status(401).json({ message: 'Usuário inexistente.' });
    }

    // Compara a senha enviada com a senha criptografada no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.hash_senha);

    if (senhaCorreta) {
      // Se a senha estiver correta, gera um token e o envia
      res.json({
        _id: usuario._id,
        nome_usuario: usuario.nome_usuario,
        credencial: usuario.credencial,
        token: generateToken(usuario._id, usuario.credencial),
      });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
  
// GET /api/usuario
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.' });
  }
};

// POST /api/usuario
const criarUsuario = async (req, res) => {
  const { nome_usuario, senha } = req.body;
  
  if (!nome_usuario || !senha) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }
  
  // Processa a senha
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(senha, salt);

  // Cria o usuário
  const objeto = new Usuario({
    nome_usuario: nome_usuario,
    hash_senha: hash
  });

  try {
    const objSalvo = await objeto.save();
    res.status(201).json(objSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar usuário.', error: err.message });
  }
};

// POST /api/usuarios/:id
const obterUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .populate('usuario', 'nome_usuario')
      .populate('drink', 'nome');
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario não encontrada.' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// PUT /api/usuarios/:id
const atualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario não encontrada.' });
    }

    // Autenticação
    if (usuario.id !== req.user.id &&
      req.user.credencial < 2
    ) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    // Verifica se há campos a atualiazar
    const novidade = {}
    if (req.body.nome) novidade.nome = req.body.nome
    if (req.body.email) novidade.email = req.body.email
    if (req.body.hash_senha) novidade.hash_senha = req.body.hash_senha

    if (Object.keys(novidade).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    // Alteração
    const usrAtualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true } // {new: true} retorna o documento atualizado
    );

    res.json(usrAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar usuario.', error: err.message });
  }
};

// DELETE /api/usuarios/:id
const deletarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario não encontrada.' });
    }

    // Autenticação
    if (usuario.id !== req.user.id &&
      req.user.credencial < 2
    ) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }
    
    // Deleta
    await Usuario.findByIdAndDelete(req.params.id);

    res.json({ message: 'Usuario removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
};


const obterAvaliacoesPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const avaliacoes = await Avaliacao.find({ usuario: id });
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliações do usuário.', error: error.message });
  }
};

const obterDrinksFavoritosPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).populate('drinksFavoritos');
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(usuario.drinksFavoritos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar drinks favoritos do usuário.', error: error.message });
  }
};

const obterEstabelecimentosFavoritosPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).populate('estabelecimentosFavoritos');
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(usuario.estabelecimentosFavoritos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estabelecimentos favoritos do usuário.', error: error.message });
  }
};

module.exports = {
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
};''
