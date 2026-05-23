const mongoose = require('mongoose');

// Schema for Personal Information
const PersonalInfoSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  address: { type: String, default: '' },
  summary: { type: String, default: '' },
  photo: { type: String, default: '' },
});

// Schema for Education History
const EducationSchema = new mongoose.Schema({
  school: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  currentlyStudying: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

// Schema for Work Experience
const ExperienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  currentlyWorking: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

// Schema for Projects
const ProjectSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  technologies: { type: String, default: '' }, // Comma separated or string
  link: { type: String, default: '' },
  github: { type: String, default: '' },
});

// Schema for Skills
const SkillSchema = new mongoose.Schema({
  category: { type: String, default: '' }, // e.g. Frontend, Languages
  items: { type: String, default: '' }, // Comma separated or string list
});

// Schema for Certifications
const CertificationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  issuingOrganization: { type: String, default: '' },
  issueDate: { type: String, default: '' },
  expirationDate: { type: String, default: '' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
});

// Schema for Achievements
const AchievementSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  date: { type: String, default: '' },
});

// Config Schema (A4 spacing and sizing choices)
const ConfigSchema = new mongoose.Schema({
  fontSize: { type: String, default: 'medium' },
  spacing: { type: String, default: 'standard' },
});

// Sub-schema for snapshots (Version History)
const ResumeSnapshotSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  personalInfo: PersonalInfoSchema,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  projects: [ProjectSchema],
  skills: [SkillSchema],
  certifications: [CertificationSchema],
  achievements: [AchievementSchema],
  template: { type: String, default: 'modern' },
  config: {
    type: ConfigSchema,
    default: () => ({ fontSize: 'medium', spacing: 'standard' }),
  },
  savedAt: { type: Date, default: Date.now },
});

// Main Resume Schema
const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'My Resume',
      trim: true,
    },
    personalInfo: {
      type: PersonalInfoSchema,
      default: () => ({}),
    },
    education: {
      type: [EducationSchema],
      default: [],
    },
    experience: {
      type: [ExperienceSchema],
      default: [],
    },
    projects: {
      type: [ProjectSchema],
      default: [],
    },
    skills: {
      type: [SkillSchema],
      default: [],
    },
    certifications: {
      type: [CertificationSchema],
      default: [],
    },
    achievements: {
      type: [AchievementSchema],
      default: [],
    },
    template: {
      type: String,
      default: 'modern', // Options: 'modern', 'professional', 'minimal', 'creative', 'executive', 'elegant'
      enum: ['modern', 'professional', 'minimal', 'creative', 'executive', 'elegant'],
    },
    config: {
      type: ConfigSchema,
      default: () => ({ fontSize: 'medium', spacing: 'standard' }),
    },
    versionNumber: {
      type: Number,
      default: 1,
    },
    versionHistory: {
      type: [ResumeSnapshotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);
