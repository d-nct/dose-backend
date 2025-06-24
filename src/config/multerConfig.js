// config/multerConfig.js
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + file.originalname;
    cb(null, nomeUnico);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;