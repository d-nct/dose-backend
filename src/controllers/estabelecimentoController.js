const Estabelecimento = require('../models/Estabelecimento.js');
const { deleteImage } = require('../utils/fileHelper.js');

// GET /api/estabelecimento
const listarEstabelecimentos = async (req, res) => {
  try {
    const estabelecimentos = await Estabelecimento.find()
    res.json(estabelecimentos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.' });
  }
};

// POST /api/estabelecimento
const criarEstabelecimento = async (req, res) => {
  const { nome, endereco } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório.' });
  }

  const dadosEstabelecimento = {
    nome,
  };

  if (endereco) dadosEstabelecimento.endereco = endereco;

  if (req.file) {
    dadosEstabelecimento.imagem = req.file.path;
  }

  const novoEstabelecimento = new Estabelecimento(dadosEstabelecimento);

  try {
    const estabelecimentoSalvo = await novoEstabelecimento.save();
    res.status(201).json(estabelecimentoSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao salvar estabelecimento.', error: err.message });
  }
};

// POST /api/estabelecimentos/:id
const obterEstabelecimentoPorId = async (req, res) => {
  try {
    const estabelecimento = await Estabelecimento.findById(req.params.id)
      .populate('usuario', 'nome_usuario')
      .populate('drink', 'nome');
    
    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrada.' });
    }
    res.json(estabelecimento);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// PUT /api/estabelecimentos/:id
const atualizarEstabelecimento = async (req, res) => {
  try {
    const estabelecimento = await Estabelecimento.findById(req.params.id);
    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
    }

    if (req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    const novidade = {};
    if (req.body.nome) novidade.nome = req.body.nome;
    if (req.body.endereco) novidade.endereco = req.body.endereco;

    if (req.file) {
      if (estabelecimento.imagem) {
        deleteImage(estabelecimento.imagem);
      }
      novidade.imagem = req.file.path;
    }

    if (Object.keys(novidade).length === 0 && !req.file) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const estAtualizado = await Estabelecimento.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true }
    );

    res.json(estAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar estabelecimento.', error: err.message });
  }
};

// DELETE /api/estabelecimentos/:id
const deletarEstabelecimento = async (req, res) => {
  try {
    const estabelecimento = await Estabelecimento.findById(req.params.id);

    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
    }

    if (req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    if (estabelecimento.imagem) {
      deleteImage(estabelecimento.imagem);
    }

    await Estabelecimento.findByIdAndDelete(req.params.id);

    res.json({ message: 'Estabelecimento removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
};

module.exports = {
  listarEstabelecimentos,
  criarEstabelecimento,
  obterEstabelecimentoPorId,
  atualizarEstabelecimento,
  deletarEstabelecimento,
};
