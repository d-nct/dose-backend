// Sessão de Importações
// =====================
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const path = require('path');

// Configurações de sistema
// ========================
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Publica o diretório public
app.use(express.static(path.join(__dirname, 'public')));

// Rotas de API
// ============
app.use('/apinga/avaliacoes', require('./src/routes/avaliacaoRoutes'));
app.use('/apinga/categorias', require('./src/routes/categoriaRoutes'));
app.use('/apinga/estabelecimentos', require('./src/routes/estabelecimentoRoutes'));
app.use('/apinga/usuarios', require('./src/routes/usuarioRoutes'));
app.use('/apinga/drinks', require('./src/routes/drinkRoutes'));
app.use('/apinga/uploads', require('./src/routes/uploadRoutes'));

// Rota de teste
app.get('/', (req, res) => {
  res.send("APINGA está viva!")
})

// Só inicia o servidor se o arquivo for executado diretamente e não pelo jest
if (process.env.NODE_ENV !== 'test') {
  connectDB();

  // Pari o servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app; // Para o jest