// MOVIDO PARA uploadMiddleware.js
// // config/multerConfig.js
// import multer from 'multer';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => { cb(null, 'uploads/'); },
//   filename: (req, file, cb) => {
//     // Para evitar nomes duplicados, adicionamos um timestamp
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + '-' + path.extname(file.originalname));
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// export default upload;