const Resume = require('../models/Resume');

// @desc    Create a new resume
// @route   POST /api/resume
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    const { title, template, personalInfo, education, experience, projects, skills, certifications, achievements, config } = req.body;

    // Create resume document associated with logged-in user
    const newResume = new Resume({
      userId: req.user.id,
      title: title || 'Untitled Resume',
      template: template || 'modern',
      personalInfo: personalInfo || {},
      education: education || [],
      experience: experience || [],
      projects: projects || [],
      skills: skills || [],
      certifications: certifications || [],
      achievements: achievements || [],
      config: config || { fontSize: 'medium', spacing: 'standard' },
      versionNumber: 1,
    });

    // Save initial version as the first snapshot in history
    newResume.versionHistory.push({
      versionNumber: 1,
      title: newResume.title,
      personalInfo: newResume.personalInfo,
      education: newResume.education,
      experience: newResume.experience,
      projects: newResume.projects,
      skills: newResume.skills,
      certifications: newResume.certifications,
      achievements: newResume.achievements,
      template: newResume.template,
      config: newResume.config,
      savedAt: new Date(),
    });

    const savedResume = await newResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully!',
      resume: savedResume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resumes for logged-in user
// @route   GET /api/resume
// @access  Private
exports.getAllResumes = async (req, res, next) => {
  try {
    // Return only light details for dashboard display (optimizing network weight)
    const resumes = await Resume.find({ userId: req.user.id })
      .select('title template versionNumber updatedAt createdAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single resume by ID
// @route   GET /api/resume/:id
// @access  Private
exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a resume and optionally create a version history snapshot
// @route   PUT /api/resume/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    const { 
      title, 
      template, 
      personalInfo, 
      education, 
      experience, 
      projects, 
      skills, 
      certifications, 
      achievements,
      config,
      createSnapshot // Boolean indicator from frontend to save current state as a history version
    } = req.body;

    // Find the resume first
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    // Update root level fields
    if (title !== undefined) resume.title = title;
    if (template !== undefined) resume.template = template;
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (education !== undefined) resume.education = education;
    if (experience !== undefined) resume.experience = experience;
    if (projects !== undefined) resume.projects = projects;
    if (skills !== undefined) resume.skills = skills;
    if (certifications !== undefined) resume.certifications = certifications;
    if (achievements !== undefined) resume.achievements = achievements;
    if (config !== undefined) resume.config = config;

    // Handle version history snapshotting
    if (createSnapshot) {
      const nextVersion = resume.versionNumber + 1;
      resume.versionNumber = nextVersion;

      resume.versionHistory.push({
        versionNumber: nextVersion,
        title: resume.title,
        personalInfo: resume.personalInfo,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects,
        skills: resume.skills,
        certifications: resume.certifications,
        achievements: resume.achievements,
        template: resume.template,
        config: resume.config,
        savedAt: new Date(),
      });

      // Limit version history to last 10 snapshots to avoid BSON doc overflow
      if (resume.versionHistory.length > 10) {
        resume.versionHistory.shift(); // Remove oldest
      }
    }

    const updatedResume = await resume.save();

    res.status(200).json({
      success: true,
      message: createSnapshot ? 'Resume updated and new version snapshot created!' : 'Resume updated successfully!',
      resume: updatedResume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rollback resume to a specific historical snapshot version
// @route   POST /api/resume/:id/rollback
// @access  Private
exports.rollbackVersion = async (req, res, next) => {
  try {
    const { versionNumber } = req.body;

    if (!versionNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the version number to rollback to',
      });
    }

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    // Find the historical snapshot
    const snapshot = resume.versionHistory.find(v => v.versionNumber === Number(versionNumber));

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message: `Version ${versionNumber} snapshot not found in history`,
      });
    }

    // Rollback current active data to snapshot content
    resume.title = snapshot.title;
    resume.personalInfo = snapshot.personalInfo;
    resume.education = snapshot.education;
    resume.experience = snapshot.experience;
    resume.projects = snapshot.projects;
    resume.skills = snapshot.skills;
    resume.certifications = snapshot.certifications;
    resume.achievements = snapshot.achievements;
    resume.template = snapshot.template;
    resume.config = snapshot.config || { fontSize: 'medium', spacing: 'standard' };

    // Increment version number for the rollback event itself, saving the rollback state as a new version
    const nextVersion = resume.versionNumber + 1;
    resume.versionNumber = nextVersion;
    
    resume.versionHistory.push({
      versionNumber: nextVersion,
      title: resume.title,
      personalInfo: resume.personalInfo,
      education: resume.education,
      experience: resume.experience,
      projects: resume.projects,
      skills: resume.skills,
      certifications: resume.certifications,
      achievements: resume.achievements,
      template: resume.template,
      config: resume.config,
      savedAt: new Date(),
    });

    if (resume.versionHistory.length > 10) {
      resume.versionHistory.shift();
    }

    const rolledBackResume = await resume.save();

    res.status(200).json({
      success: true,
      message: `Successfully rolled back to version ${versionNumber}!`,
      resume: rolledBackResume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    await Resume.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};
