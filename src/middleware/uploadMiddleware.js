const multer = require('multer');
const path = require('path');

// Configuração do armazenamento em disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Onde salvar os arquivos
  },
  filename: function (req, file, cb) {
    // Preserva o nome original do arquivo (substituindo espaços) e adiciona um sufixo único
    const originalName = path.basename(file.originalname, path.extname(file.originalname)).replace(/\s+/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}-${uniqueSuffix}${extension}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    return cb(null, true);
  }
  cb('Erro: O arquivo deve ser uma imagem válida (jpeg, jpg, png, gif)');
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB por arquivo
  fileFilter: fileFilter
});

module.exports = upload;