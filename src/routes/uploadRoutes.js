const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// A rota espera um único arquivo com o nome do campo 'image'
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Por favor, envie um arquivo.' });
  }

  // Constrói a URL completa para ser salva no banco de dados
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  // Retorna a URL para o frontend
  res.status(200).json({
    message: 'Upload realizado com sucesso!',
    url: imageUrl,
  });
});

module.exports = router;