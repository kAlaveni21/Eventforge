import { Router, Request, Response } from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = Router();

// @desc    Upload a single file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    sendSuccess(
      res,
      {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fileUrl,
      },
      'File uploaded successfully'
    );
  } catch (err: any) {
    sendError(res, 'File upload failed', 500, err);
  }
});

// @desc    Upload multiple files (e.g. brand assets or presentation slides)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('files', 10), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      sendError(res, 'No files uploaded', 400);
      return;
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fileUrl: `/uploads/${file.filename}`,
    }));

    sendSuccess(res, uploadedFiles, 'Files uploaded successfully');
  } catch (err: any) {
    sendError(res, 'Multiple file upload failed', 500, err);
  }
});

export default router;
