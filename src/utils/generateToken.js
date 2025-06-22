const jwt = require('jsonwebtoken');

const generateToken = (id, credencial) => {
  return jwt.sign(
    { id, credencial },
    process.env.JWT_SECRET, 
    { expiresIn: '30d' } 
  );
};

module.exports = generateToken;