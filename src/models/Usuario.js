const mongoose = require('mongoose');
const { Schema } = mongoose;

const usuarioSchema = new Schema({
  nome_usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: { 
    type: String, 
    required: false, 
    unique: false, 
    // sparse: true,
    lowercase: true, 
    trim: true 
  },
  hash_senha: {
    type: String,
    required: true,
  },
  credencial: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0 // O padrão para novos usuários é 0 (usuário comum)
    // Mapeamento de Níveis:
    // 0: usuario
    // 1: adm de conteúdo
    // 2: adm de conteúdo e usuários
    // 3: owner
  },

  drinksFavoritos: [{
    type: Schema.Types.ObjectId,
    ref: 'Drink'
  }],
  estabelecimentosFavoritos: [{
    type: Schema.Types.ObjectId,
    ref: 'Estabelecimento'
  }],
  seguindo: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario' 
  }],
  seguidores: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }]
}, {
  timestamps: { createdAt: 'data_criacao', updatedAt: 'data_modificacao' } 
});

// Evita que o hash vá na resposta da req
usuarioSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        // 'document' é o documento original do Mongoose
        // 'returnedObject' é o objeto JavaScript puro que será enviado como resposta

        // Copia o _id para um campo 'id'
        returnedObject.id = returnedObject._id.toString();

        // Remove o _id, o __v (versão interna do Mongoose) e o hash_senha do objeto de resposta
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.hash_senha; // A MÁGICA ACONTECE AQUI
    }
});

module.exports = mongoose.model('Usuario', usuarioSchema);