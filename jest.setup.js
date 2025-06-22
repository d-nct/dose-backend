const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Antes de todos os testes, inicie o servidor em memória
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Depois de todos os testes, pare o servidor e feche a conexão
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Antes de cada teste, limpe todas as coleções do banco
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});