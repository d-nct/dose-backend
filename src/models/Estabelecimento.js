const mongoose = require('mongoose');
const { Schema } = mongoose;

const estabelecimentoSchema = new Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  endereco: {
    type: String,
    trim: true,
  },
  imagem: {
    type: String,
    trim: true,
  },
}, {
  timestamps: { createdAt: 'data_criacao', updatedAt: 'data_modificacao' }
});

const Estabelecimento = mongoose.model('Estabelecimento', estabelecimentoSchema);

module.exports = Estabelecimento;