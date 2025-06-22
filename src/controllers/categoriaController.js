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
    // Autenticação
    if (req.user.credencial == "adm" ||
        req.user.credencial == "super adm"
    ) {
        // Criacao
        const { nome, descricao } = req.body;

        const objeto = new Categoria({
            nome,
            descricao
        });

        try {
            const objSalvo = await objeto.save();
            res.status(201).json(objSalvo);
        } catch (err) {
            res.status(400).json({ message: 'Erro ao salvar categoria.', error: err.message });
        }
    }
    return res.status(401).json({ message: 'Usuário não autorizado.' });
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
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Autenticação
    if (req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    // Verifica se há campos a atualiazar
    const novidade = {}
    if (req.body.nome) novidade.nome = req.body.nome
    if (req.body.descricao) novidade.descricao = req.body.descricao

    if (Object.keys(novidade).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    // Atualização
    const categoriaAtualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true } // {new: true} retorna o documento atualizado
    );
    res.json(categoriaAtualizada);

  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar categoria.', error: err.message });
  }
};

// DELETE /api/categorias/:id
const deletarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Autenticação
    if (req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    // Remoção
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoria removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

module.exports = {
  listarCategorias,
  criarCategoria,
  obterCategoriaPorId,
  atualizarCategoria,
  deletarCategoria,
};
