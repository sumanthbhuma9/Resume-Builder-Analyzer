const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeResume, aiRewriteBullet, parsePDFOnly } = require('../controllers/atsController');
const auth = require('../middleware/auth');

// Multer memory storage configuration for file buffers
const storage = multer.memoryStorage();

// File filter to restrict uploads strictly to PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: Only PDF resume files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024 // Limit resume PDF size to 4MB max
  }
});

// Protect all routes in this router with our JWT Auth middleware
router.use(auth);

// @route   POST /api/ats/analyze
// @desc    Perform multi-dimensional ATS scan against JD
// @access  Private
router.post('/analyze', upload.single('resume'), analyzeResume);

// @route   POST /api/ats/ai-rewrite
// @desc    Rewrite project or work experience bullet points using Gemini AI
// @access  Private
router.post('/ai-rewrite', aiRewriteBullet);

// @route   POST /api/ats/parse-pdf
// @desc    High-fidelity raw PDF stream parsing to prefill personalInfo
// @access  Private
router.post('/parse-pdf', upload.single('resume'), parsePDFOnly);

module.exports = router;
