const mongoose = require('mongoose');
const { Schema } = mongoose;

const categoriaSchema = new Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  descricao: {
    type: String,
    trim: true,
  },
}, {
  timestamps: { createdAt: 'data_criacao', updatedAt: 'data_modificacao' }
});

const Categoria = mongoose.model('Categoria', categoriaSchema);

module.exports = Categoria;