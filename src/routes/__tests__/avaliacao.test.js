const request = require('supertest');
const app = require('../../../server'); // Importa seu app Express
const mongoose = require('mongoose');
const generateToken = require('../../utils/generateToken');

// Importa os modelos para criar dados de teste
const Usuario = require('../../models/Usuario');
const Drink = require('../../models/Drink');

describe('Testes das Rotas de Avaliação', () => {
  let token;
  let usuarioId;
  let drinkId;

  // Cria um usuário e um drink de teste antes dos testes rodarem
  beforeEach(async () => {
    const usuario = await Usuario.create({ 
      nome_usuario: 'usuarioteste', 
      hash_senha: 'senhahash',
      credencial: 0,
    });
    usuarioId = usuario._id;

    // Gera um token para este usuário
    token = generateToken(usuarioId, 0);

    const drink = await Drink.create({
      nome: 'Drink de Teste',
      usuario: usuarioId // Associa o drink ao usuário criado
    });
    drinkId = drink._id;
  });

  it('Deve criar uma nova avaliação com sucesso', async () => {
    const novaAvaliacao = {
      drink: drinkId.toString(),
      nota: 5,
      comentario: 'Teste de comentário'
    };

    const response = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`) // Envia o token
      .send(novaAvaliacao);

    // Verificações (Assertions)
    expect(response.statusCode).toBe(201); // Espera que o status seja 201 Created
    expect(response.body).toHaveProperty('_id'); // Espera que a resposta tenha um _id
    expect(response.body.nota).toBe(5);
  });

  it('Deve falhar ao tentar criar uma avaliação sem nota', async () => {
    const avaliacaoInvalida = {
      usuario: usuarioId.toString(),
      drink: drinkId.toString(),
      comentario: 'Faltou a nota'
    };

    const response = await request(app)
      .post('/api/avaliacoes')
      .send(avaliacaoInvalida);
      
    expect(response.statusCode).toBe(400); // Espera um erro de Bad Request
  });
});