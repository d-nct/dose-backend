const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Usuario = require('../models/Usuario.js');
const connectDB = require('../config/db.js');

// Carrega o .env
dotenv.config({ path: '../../.env' });

// Conecta ao BD
connectDB();

const gerenciarCredencial = async () => {
  await connectDB();

  try {
    // Pegamos os argumentos da linha de comando
    // Ex: node scripts/gerenciarCredenciais.js nomeDoUsuario admLevel
    const nomeUsuario = process.argv[2];
    const novaCredencial = process.argv[3];

    // --- Validação dos Inputs ---
    if (!nomeUsuario || !novaCredencial) {
      console.error('ERRO: Forneça o nome de usuário e a nova credencial.');
      console.log('Uso: node scripts/gerenciarCredenciais.js <nomeUsuario> <credencial>');
      console.log('Credenciais válidas: 0 (usuario), 1 (adm de conteúdo), 2 (adm de pessoas), 3 (owner)');
      process.exit(1);
    }

    if (novaCredencial < 0 || novaCredencial > 3) {
      console.error(`ERRO: Credencial '${novaCredencial}' é inválida.`);
      console.log('Credenciais válidas: 0 (usuario), 1 (adm de conteúdo), 2 (adm de pessoas), 3 (owner)');
      process.exit(1);
    }

    // --- Lógica Principal ---
    const usuario = await Usuario.findOne({ nome_usuario: nomeUsuario });

    if (!usuario) {
      console.error(`ERRO: Usuário '${nomeUsuario}' não encontrado.`);
      process.exit(1);
    }

    usuario.credencial = novaCredencial;
    await usuario.save();

    console.log(`SUCESSO: A credencial de '${nomeUsuario}' foi atualizada para '${novaCredencial}'.`);
    
  } catch (error) {
    console.error('ERRO GERAL:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Conexão com MongoDB encerrada.');
  }
};

// Executa a função
gerenciarCredencial();