const express = require('express');
const router = express.Router();
const { 
  createResume, 
  getAllResumes, 
  getResumeById, 
  updateResume, 
  rollbackVersion, 
  deleteResume 
} = require('../controllers/resumeController');
const auth = require('../middleware/auth');

// Protect all routes within this router
router.use(auth);

// @route   POST /api/resume
// @desc    Create a new resume
router.post('/', createResume);

// @route   GET /api/resume
// @desc    Get all resumes for active user
router.get('/', getAllResumes);

// @route   GET /api/resume/:id
// @desc    Get detailed resume by ID
router.get('/:id', getResumeById);

// @route   PUT /api/resume/:id
// @desc    Update a resume (optionally creating a snapshot)
router.put('/:id', updateResume);

// @route   POST /api/resume/:id/rollback
// @desc    Rollback a resume to a historical version snapshot
router.post('/:id/rollback', rollbackVersion);

// @route   DELETE /api/resume/:id
// @desc    Delete a resume
router.delete('/:id', deleteResume);

module.exports = router;
