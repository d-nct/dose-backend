const mongoose = require('mongoose');
const { Schema } = mongoose;

const avaliacaoSchema = new Schema({
  nota: {
    type: Number,
    required: true,
    min: 0,  
    max: 10, 
  },
  comentario: {
    type: String,
    trim: true,
  },
  destilado_base: {
    type: String,
    trim: true,
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  estabelecimento: {
    type: Schema.Types.ObjectId,
    ref: 'Estabelecimento',
    required: false,
  },
  drink: {
    type: Schema.Types.ObjectId,
    ref: 'Drink',
    required: true,
  },
  preco: {
    type: Schema.Types.Decimal128, 
    required: false,
  },
  imagem: {
    type: String,
    trim: true,
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }]
}, {
  timestamps: { createdAt: 'data_criacao', updatedAt: 'data_modificacao' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Garante que um usuário só pode avaliar um drink uma única vez.
// avaliacaoSchema.index({ usuario: 1, drink: 1 }, { unique: true });

avaliacaoSchema.virtual('score').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

const Avaliacao = mongoose.model('Avaliacao', avaliacaoSchema);

module.exports = Avaliacao;