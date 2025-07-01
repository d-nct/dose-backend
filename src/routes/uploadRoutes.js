const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadFile,
  getFiles,
  deleteFile,
  getOneFile,
} = require('../controllers/uploadController');

// Rotas
router.post('/', protect, upload.single('image'), uploadFile);
router.get('/', getFiles);
router.get('/:id', getOneFile);

router.route('/:filename').delete(protect, deleteFile);

module.exports = router;