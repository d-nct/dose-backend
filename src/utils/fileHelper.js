const fs = require('fs');
const path = require('path');

// Função para deletar a imagem antiga
const deleteImage = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '../..', imagePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Erro ao deletar a imagem: ${fullPath}`, err);
      }
    });
  }
};

module.exports = { deleteImage };
