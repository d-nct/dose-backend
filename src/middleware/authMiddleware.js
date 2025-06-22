const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario.js');

const protect = async (req, res, next) => {
  let token;

  // O token geralmente é enviado no cabeçalho de autorização como "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extrai o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica se o token é válido usando nosso segredo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Busca o usuário no banco com o ID que estava no token
      //    e anexa o usuário ao objeto `req` para que as próximas rotas possam usá-lo
      req.user = await Usuario.findById(decoded.id).select('-hash_senha');

      next(); // Passa para o próximo middleware ou para o controller
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, lhe falta token.' });
  }
};

module.exports = { protect };