const fs = require('fs').promises; 
const path = require('path');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// @desc    Upload de um arquivo
// @route   POST /api/uploads
// @access  Private
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Por favor, envie um arquivo.' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  res.status(201).json({
    message: 'Upload realizado com sucesso!',
    url: imageUrl,
  });
};

// @desc    Listar todos os arquivos
// @route   GET /api/uploads
// @access  Public
const getFiles = async (req, res) => {
  try {
    const files = await fs.readdir(uploadDir);

    const fileUrls = files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file}`);
    
    res.status(200).json(fileUrls);
  } catch (err) {
    console.error('Erro ao listar arquivos:', err); // Log do erro para debugging
    res.status(500).json({ message: 'Não foi possível listar os arquivos.' });
  }
};

// @desc    Pega uma imagem
// @route   GET /api/uploads/:id
// @access  Public
const getOneFile = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      const extensao = path.extname(filename);
      res.setHeader('Content-Type', 'image/' + extensao);
      
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).send({
        error: 'Imagem não encontrada!'
      })
    }
  } catch (err) {
    res.status(500).json({ message: 'Não foi possível listar os arquivos.', error: err});
  }
};

// @desc    Deletar um arquivo
// @route   DELETE /api/uploads/:filename
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // [SECURITY] Adicionada verificação de segurança contra "Path Traversal"
    // Isso impede que um usuário mal-intencionado tente deletar arquivos fora da pasta 'uploads'
    // Ex: ../../importante.txt
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    await fs.unlink(filePath);
    
    res.status(200).json({ message: 'Arquivo deletado com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar arquivo:', err);

    if (err.code === 'ENOENT') { // ENOENT = Error NO ENTry (arquivo não existe)
      return res.status(404).json({ message: 'Arquivo não encontrado.' });
    }
    
    res.status(500).json({ message: 'Não foi possível deletar o arquivo.' });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile,
  getOneFile,
};