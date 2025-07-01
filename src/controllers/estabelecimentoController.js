const Estabelecimento = require('../models/Estabelecimento.js');

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
  if (!req.body.nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório.' });
  }

  // Cria o objeto dinamicamente
  const novidade = {}
  novidade.nome = req.body.nome
  if (req.body.endereco) novidade.endereco = req.body.endereco

  // Para imagem
  if (req.file) novidade.imagem = req.file.path

  const objeto = new Estabelecimento(novidade);

  try {
    const objSalvo = await objeto.save();
    res.status(201).json(objSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao salvar avaliação.', error: err.message });
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
    const estabelecimento = await Estabelecimento.findById(req.body.id);
    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
    }

    // Autenticação
    if (req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    // Verifica se há campos a atualiazar
    const novidade = {}
    if (req.body.nome) novidade.nome = req.body.nome
    if (req.body.endereco) novidade.endereco = req.body.endereco
    if (req.body.imagem) novidade.imagem = req.body.imagem

    if (Object.keys(novidade).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    // Alteração
    const estAtualizado = await Estabelecimento.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true } // {new: true} retorna o documento atualizado
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
      return res.status(404).json({ message: 'Estabelecimento não encontrada.' });
    }

    // Autenticação
    if (req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    await Estabelecimento.findByIdAndDelete(req.params.id);

    res.json({ message: 'Estabelecimento removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

module.exports = {
  listarEstabelecimentos,
  criarEstabelecimento,
  obterEstabelecimentoPorId,
  atualizarEstabelecimento,
  deletarEstabelecimento,
};
