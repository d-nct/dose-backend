const mongoose = require('mongoose');
const { Schema } = mongoose;

const drinkSchema = new Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  descricao: {
    type: String,
    trim: true,
  },
  imagem: {
    type: String,
    trim: true,
  },
  usuario: { // FK
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria',
    required: false,
  },
  ondeEncontrar: [{
    estabelecimento: {
      type: Schema.Types.ObjectId,
      ref: 'Estabelecimento',
      required: true,
    },
    preco: {
      type: Schema.Types.Decimal128, 
    },
    data_preco: {
      type: Date,
      default: Date.now,
    }
  }]
}, {
  timestamps: { createdAt: 'data_criacao', updatedAt: 'data_modificacao' }
});

const Drink = mongoose.model('Drink', drinkSchema);

module.exports = Drink;