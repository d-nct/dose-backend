const Drink = require('../models/Drink.js');
const { deleteImage } = require('../utils/fileHelper.js');

// Funções auxiliares

/**
 * @desc    Adiciona uma nova relação de estabelecimento/preço a um drink
 * @route   POST /api/drinks/:id/ondeEncontrar
 * @access  Protegido
 */
const adicionarOndeEncontrar = async (req, res) => {
  try {
    const { estabelecimento, preco } = req.body; // Pega os dados do corpo da requisição

    if (!estabelecimento || preco === undefined) {
      return res.status(400).json({ message: 'Estabelecimento e preço são obrigatórios.' });
    }

    const drink = await Drink.findById(req.params.id);
    if (!drink) {
      return res.status(404).json({ message: 'Drink não encontrado.' });
    }

    // verificar se a relação já existe. TODO: ver se faz sentido
    const jaExiste = drink.ondeEncontrar.some(item => item.estabelecimento.toString() === estabelecimento);
    if (jaExiste) {
      return res.status(400).json({ message: 'Este estabelecimento já está na lista do drink.' });
    }
    
    // Cria o novo subdocumento
    const novaEntrada = {
      estabelecimento,
      preco,
    };
    
    // Usa o operador $push para adicionar a nova entrada ao array
    const drinkAtualizado = await Drink.findByIdAndUpdate(
      req.params.id,
      { $push: { ondeEncontrar: novaEntrada } },
      { new: true, runValidators: true }
    );

    res.status(201).json(drinkAtualizado);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

/**
 * @desc    Atualiza um item específico na lista ondeEncontrar (ex: preço)
 * @route   PUT /api/drinks/:id/ondeEncontrar/:subId
 * @access  Protegido
 */
const atualizarOndeEncontrar = async (req, res) => {
  try {
    const { preco } = req.body;
    if (preco === undefined) {
      return res.status(400).json({ message: 'O novo preço é obrigatório.' });
    }
    
    // Encontra o drink e o subdocumento pelo seu respectivo _id
    const drinkAtualizado = await Drink.findOneAndUpdate(
      { "_id": req.params.id, "ondeEncontrar._id": req.params.subId },
      { 
        $set: { 
          "ondeEncontrar.$.preco": preco, // O '$' representa o elemento encontrado
          "ondeEncontrar.$.data_preco": new Date() 
        }
      },
      { new: true, runValidators: true }
    );

    if (!drinkAtualizado) {
      return res.status(404).json({ message: 'Drink ou entrada não encontrados.' });
    }

    res.json(drinkAtualizado);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

/**
 * @desc    Remove uma relação de estabelecimento/preço de um drink
 * @route   DELETE /api/drinks/:id/ondeEncontrar/:subId
 * @access  Protegido
 */
const removerOndeEncontrar = async (req, res) => {
  try {
    const drinkAtualizado = await Drink.findByIdAndUpdate(
      req.params.id,
      { 
        $pull: { 
          ondeEncontrar: { _id: req.params.subId } // Remove do array o item com este _id
        } 
      },
      { new: true }
    );

    if (!drinkAtualizado) {
      return res.status(404).json({ message: 'Drink não encontrado.' });
    }

    res.json({ message: 'Entrada removida com sucesso.', drink: drinkAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};



// GET /api/drink
const listarDrinks = async (req, res) => {
  try {
    const drinks = await Drink.find()
    res.json(drinks);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar drinks.' });
  }
};

/**
 * @desc    Cria um novo drink, aceitando campos opcionais
 * @route   POST /api/drinks
 * @access  Protegido
 */
const criarDrink = async (req, res) => {
  try {
    const { nome, descricao, categoria, ondeEncontrar } = req.body;
    const usuarioId = req.user.id;

    if (!nome) {
      return res.status(400).json({ message: 'O nome do drink é um campo obrigatório.' });
    }

    const dadosDoDrink = {
      nome,
      usuario: usuarioId,
    };

    if (descricao) dadosDoDrink.descricao = descricao;
    if (categoria) dadosDoDrink.categoria = categoria;
    if (req.file) {
      dadosDoDrink.imagem = req.file.path;
    }

    if (ondeEncontrar && Array.isArray(ondeEncontrar)) {
      dadosDoDrink.ondeEncontrar = ondeEncontrar;
    }

    const novoDrink = new Drink(dadosDoDrink);
    const drinkSalvo = await novoDrink.save();

    res.status(201).json(drinkSalvo);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar o drink.', error: error.message });
  }
};

// POST /api/drinks/:id
const obterDrinkPorId = async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id)
      .populate('usuario', 'nome_usuario')
      .populate('drink', 'nome');
    
    if (!drink) {
      return res.status(404).json({ message: 'Drink não encontrada.' });
    }
    res.json(drink);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// PUT /api/drinks/:id
const atualizarDrink = async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);

    if (!drink) {
      return res.status(404).json({ message: 'Drink não encontrado.' });
    }

    if (drink.usuario.toString() !== req.user.id && req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    const novidade = {};
    if (req.body.nome) novidade.nome = req.body.nome;
    if (req.body.descricao) novidade.descricao = req.body.descricao;

    if (req.file) {
      if (drink.imagem) {
        deleteImage(drink.imagem);
      }
      novidade.imagem = req.file.path;
    }

    if (Object.keys(novidade).length === 0 && !req.file) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const drinkAtualizado = await Drink.findByIdAndUpdate(
      req.params.id,
      { $set: novidade },
      { new: true, runValidators: true }
    );

    res.json(drinkAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar drink.', error: err.message });
  }
};

// DELETE /api/drinks/:id
const deletarDrink = async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);

    if (!drink) {
      return res.status(404).json({ message: 'Drink não encontrado.' });
    }

    if (drink.usuario.toString() !== req.user.id && req.user.credencial < 1) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    if (drink.imagem) {
      deleteImage(drink.imagem);
    }

    await Drink.findByIdAndDelete(req.params.id);

    res.json({ message: 'Drink removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
};

module.exports = {
  listarDrinks,
  criarDrink,
  obterDrinkPorId,
  atualizarDrink,
  deletarDrink,
  adicionarOndeEncontrar,
  atualizarOndeEncontrar,
  removerOndeEncontrar,
};
