import express from 'express';
import { uploadImage, deleteImage, getImageInfo } from '../controllers/imageController.js';

const router = express.Router();

// Upload image
router.post('/upload', uploadImage);

// Delete image
router.delete('/:publicId', deleteImage);

// Get image info
router.get('/:publicId/info', getImageInfo);

export default router;
