const Categoria = require('../models/Categoria.js');

// GET /api/categoria
const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find()
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar categorias.' });
  }
};

// POST /api/categoria
const criarCategoria = async (req, res) => {
  try {
    if (req.user.credencial < 1) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para criar categorias.' });
    }

    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
    }

    const novaCategoria = new Categoria({
      nome,
      descricao,
      usuario: req.user.id,
    });

    const categoriaSalva = await novaCategoria.save();
    res.status(201).json(categoriaSalva);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar a categoria.', error: err.message });
  }
};

// POST /api/categorias/:id
const obterCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id)
      .populate('usuario', 'nome_usuario')
      .populate('drink', 'nome');
    
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// PUT /api/categorias/:id
const atualizarCategoria = async (req, res) => {
  try {
    if (req.user.credencial < 1) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para atualizar categorias.' });
    }

    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const { nome, descricao } = req.body;
    const novidade = {};
    if (nome) novidade.nome = nome;
    if (descricao) novidade.descricao = descricao;

    if (Object.keys(novidade).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const categoriaAtualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true }
    );

    res.json(categoriaAtualizada);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar categoria.', error: err.message });
  }
};

// DELETE /api/categorias/:id
const deletarCategoria = async (req, res) => {
  try {
    if (req.user.credencial < 1) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar categorias.' });
    }

    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoria removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
};

module.exports = {
  listarCategorias,
  criarCategoria,
  obterCategoriaPorId,
  atualizarCategoria,
  deletarCategoria,
};
