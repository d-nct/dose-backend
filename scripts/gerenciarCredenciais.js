import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from '../src/models/Usuario.js';
import bcrypt from 'bcryptjs';

// Carrega o .env
dotenv.config({ path: '.env' });

// Conecta ao BD
try {
  // const mongoURI = process.env.MONGO_URI;
  const mongoURI = process.env.MONGO_URI_PROD;
  const conn = await mongoose.connect(mongoURI);
  console.log(`MongoDB Conectado: ${conn.connection.host}`);
} catch (error) {
  console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
  process.exit(1);
}


const gerenciarCredencial = async () => {
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

const criaAdm = async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(process.env.ADM_PWD, salt);

  const adm = new Usuario({
    nome_usuario: process.env.ADM_USR,
    credencial: 3,
    hash_senha: hash
  })

  try {
    adm.save();
    console.log("Conta de administração criada!");
  } catch (err) {
    console.log("Falha em salvar a conta de administração no BD!");
  } finally {
    mongoose.disconnect();
  }
}

// Executa a função
if (process.argv[2] == "adm") {
  criaAdm();
} else {
  gerenciarCredencial();
}