const Avaliacao = require('../models/Avaliacao.js');

/**
 * @desc    Votar em uma avaliação (upvote/downvote)
 * @route   POST /api/avaliacoes/:id/voto
 * @access  Protegido
 */
const votarAvaliacao = async (req, res) => {
  // O tipo de voto ('upvote' ou 'downvote') vem no corpo da requisição
  const { tipoVoto } = req.body;
  const avaliacaoId = req.params.id;
  const usuarioId = req.user.id; // ID do usuário logado (vem do middleware 'protect')

  if (tipoVoto !== 'upvote' && tipoVoto !== 'downvote') {
    return res.status(400).json({ message: "Tipo de voto inválido. Use 'upvote' ou 'downvote'." });
  }

  try {
    const avaliacao = await Avaliacao.findById(avaliacaoId);

    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }

    if (avaliacao.usuario.toString() === usuarioId) {
      return res.status(400).json({ message: 'Você não pode votar na sua própria avaliação.' });
    }

    // Converte os IDs para string para facilitar a verificação
    const upvotesStrings = avaliacao.upvotes.map(id => id.toString());
    const downvotesStrings = avaliacao.downvotes.map(id => id.toString());

    const jaDeuUpvote = upvotesStrings.includes(usuarioId);
    const jaDeuDownvote = downvotesStrings.includes(usuarioId);

    let update = {};

    if (tipoVoto === 'upvote') {
      // Se já deu upvote, o clique remove o voto (toggle)
      if (jaDeuUpvote) {
        update = { $pull: { upvotes: usuarioId } };
      } else {
        // Se não, adiciona o upvote e remove qualquer downvote que exista
        update = { 
          $addToSet: { upvotes: usuarioId },
          $pull: { downvotes: usuarioId } 
        };
      }
    } else { // tipoVoto === 'downvote'
      // Se já deu downvote, o clique remove o voto (toggle)
      if (jaDeuDownvote) {
        update = { $pull: { downvotes: usuarioId } };
      } else {
        // Se não, adiciona o downvote e remove qualquer upvote que exista
        update = {
          $addToSet: { downvotes: usuarioId },
          $pull: { upvotes: usuarioId }
        };
      }
    }

    // Executa a atualização e retorna o documento atualizado
    const avaliacaoAtualizada = await Avaliacao.findByIdAndUpdate(
      avaliacaoId,
      update,
      { new: true }
    ).populate('usuario', 'nome_usuario') 
     .populate('drink', 'nome')           

    res.json(avaliacaoAtualizada);

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};


// GET /api/avaliacoes
const listarAvaliacoes = async (req, res) => {
  try {
    // const avaliacoes = await Avaliacao.find().populate('usuario', 'nome_usuario');
    const avaliacoes = await Avaliacao.find()
      .populate('usuario', 'nome_usuario') 
      .populate('drink', 'nome imagem')           
      .populate('estabelecimento', 'nome')           
      .sort({ data_criacao: -1 });         

    res.json(avaliacoes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.' });
  }
};

// POST /api/avaliacoes
const criarAvaliacao = async (req, res) => {
  const usuario = req.user.id; // Usa o usuário logado

  // Cria o objeto dinamicamente
  const novidade = {}
  novidade.usuario = usuario
  novidade.drink = req.body.drink
  novidade.nota = req.body.nota
  if (req.body.comentario) novidade.comentario = req.body.comentario
  if (req.body.destilado_base) novidade.destilado_base = req.body.destilado_base
  if (req.body.estabelecimento) novidade.estabelecimento = req.body.estabelecimento
  if (req.body.preco) novidade.preco = req.body.preco
  if (req.file) novidade.imagem = req.file.path

  const novaAvaliacao = new Avaliacao(novidade);

  try {
    const avaliacaoSalva = await novaAvaliacao.save();
    res.status(201).json(avaliacaoSalva);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao salvar avaliação.', error: err.message });
  }
};

// POST /api/avaliacoes/:id
const obterAvaliacaoPorId = async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findById(req.params.id)
      .populate('usuario', 'nome_usuario')
      .populate('drink', 'nome imagem')           
    
    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }
    res.json(avaliacao);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// PUT /api/avaliacoes/:id
const atualizarAvaliacao = async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findById(req.params.id);
    
    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }

    // Autenticação
    if (avaliacao.usuario.toString() !== req.user.id &&
        req.user.credencial < 1
    ) {
        return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    // Verifica se há campos a atualiazar
    const novidade = {}
    if (req.body.nota) novidade.nota = req.body.nota
    if (req.body.comentario) novidade.comentario = req.body.comentario

    if (Object.keys(novidade).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    // Alteração
    const avAtualizada = await Avaliacao.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true } // {new: true} retorna o documento atualizado
    );

    res.json(avAtualizada);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar avaliação.', error: err.message });
  }
};

// DELETE /api/avaliacoes/:id
const deletarAvaliacao = async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findById(req.params.id);

    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }

    // Autenticação
    if (avaliacao.usuario._id !== req.user.id ||
        req.user.credencial < 1
    ) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }
    // Remoção
    await Avaliacao.findByIdAndDelete(req.params.id);
    res.json({ message: 'Avaliação removida com sucesso.' });
    
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
};

/**
 * @desc    Lista todas as avaliações feitas pelo usuário logado.
 * @route   GET /api/avaliacoes/minhas  (ou /api/usuarios/meu-perfil/avaliacoes, como no frontend)
 * @access  Protegido
 */
const listarMinhasAvaliacoes = async (req, res) => {
  try {
    const usuarioLogadoId = req.user._id;

    const minhasAvaliacoes = await Avaliacao.find({ usuario: usuarioLogadoId })
      .populate('drink', 'nome imagem') // Exemplo: popular nome e imagem do drink avaliado
      .populate('estabelecimento', 'nome endereco') // Exemplo: popular nome e imagem do drink avaliado
      .sort({ createdAt: -1 }); // Opcional: Ordenar pelas mais recentes

    res.json(minhasAvaliacoes);
  } catch (error) {
    console.error('Erro ao listar minhas avaliações:', error); // Log mais detalhado no servidor
    res.status(500).json({ message: 'Erro interno do servidor ao buscar avaliações.' });
  }
};



module.exports = {
  listarAvaliacoes,
  criarAvaliacao,
  obterAvaliacaoPorId,
  atualizarAvaliacao,
  deletarAvaliacao,
  votarAvaliacao,
  listarMinhasAvaliacoes,
};