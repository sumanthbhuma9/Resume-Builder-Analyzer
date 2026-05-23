const Resume = require('../models/Resume');
const { parseResumePDF } = require('../ats/parser/pdfParser');
const { calculateATSScore } = require('../ats/scoring/scoreCalculator');
const { generateLocalSuggestions, getSkillGapAnalysis, getGeminiIntelligence } = require('../ats/suggestions/suggester');

/**
 * Serializes a structured Resume database document into a unified text block for NLP scanning
 * @param {Object} resume - Mongoose Resume document
 * @returns {string} Plain text representation of the resume details
 */
const serializeResumeToText = (resume) => {
  if (!resume) return '';

  let text = '';

  // 1. Personal Information
  if (resume.personalInfo) {
    const { firstName = '', lastName = '', summary = '', email = '', phone = '', address = '' } = resume.personalInfo;
    text += `${firstName} ${lastName}\n`;
    text += `${email} | ${phone} | ${address}\n`;
    text += `${summary}\n\n`;
  }

  // 2. Work Experience
  if (resume.experience && resume.experience.length > 0) {
    text += 'WORK EXPERIENCE\n';
    resume.experience.forEach(exp => {
      text += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate})\n`;
      text += `${exp.description}\n`;
    });
    text += '\n';
  }

  // 3. Technical Projects
  if (resume.projects && resume.projects.length > 0) {
    text += 'TECHNICAL PROJECTS\n';
    resume.projects.forEach(proj => {
      text += `${proj.title} - Technologies: ${proj.technologies}\n`;
      text += `${proj.description}\n`;
    });
    text += '\n';
  }

  // 4. Skills Focus
  if (resume.skills && resume.skills.length > 0) {
    text += 'TECHNICAL AND PROFESSIONAL SKILLS\n';
    resume.skills.forEach(skill => {
      text += `${skill.category}: ${skill.items}\n`;
    });
    text += '\n';
  }

  // 5. Education History
  if (resume.education && resume.education.length > 0) {
    text += 'EDUCATION\n';
    resume.education.forEach(edu => {
      text += `${edu.degree} in ${edu.fieldOfStudy} - ${edu.school} (${edu.startDate} - ${edu.currentlyStudying ? 'Present' : edu.endDate})\n`;
      text += `${edu.description}\n`;
    });
    text += '\n';
  }

  // 6. Certifications & Achievements
  if (resume.certifications && resume.certifications.length > 0) {
    text += 'CERTIFICATIONS\n';
    resume.certifications.forEach(cert => {
      text += `${cert.name} issued by ${cert.issuingOrganization} (${cert.issueDate})\n`;
    });
    text += '\n';
  }

  if (resume.achievements && resume.achievements.length > 0) {
    text += 'HONORS AND AWARDS\n';
    resume.achievements.forEach(ach => {
      text += `${ach.title}: ${ach.description} (${ach.date})\n`;
    });
    text += '\n';
  }

  return text;
};

/**
 * Coordinates raw PDF or DB-loaded resume auditing against pasted JDs
 * @route   POST /api/ats/analyze
 * @access  Private
 */
exports.analyzeResume = async (req, res, next) => {
  try {
    const { jobDescription, resumeId } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the Job Description text for comparison.'
      });
    }

    let resumeText = '';
    let candidateName = 'Professional Candidate';

    // Scenario A: User uploaded a PDF file
    if (req.file) {
      resumeText = await parseResumePDF(req.file.buffer);
      // Attempt to extract name from PDF text roughly (first non-empty line)
      const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0 && lines[0].length < 50) {
        candidateName = lines[0];
      }
    } 
    // Scenario B: User selected a saved resume ID
    else if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Saved resume not found or unauthorized.'
        });
      }
      resumeText = serializeResumeToText(resume);
      candidateName = `${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}`.trim() || resume.title;
    } 
    // Scenario C: Neither provided
    else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a Resume PDF file or provide a saved resume ID.'
      });
    }

    // 1. Calculate base score metrics using Local NLP engine
    const scoreCard = calculateATSScore(resumeText, jobDescription);

    // AI high-fidelity skill extraction: If Gemini is configured, override the matched and missing skills with context-aware AI extraction!
    const isAiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    if (isAiConfigured) {
      const { getGeminiSkillsExtraction } = require('../ats/suggestions/suggester');
      const aiSkills = await getGeminiSkillsExtraction(resumeText, jobDescription);
      if (aiSkills) {
        scoreCard.matchedSkills = aiSkills.matchedSkills;
        scoreCard.missingSkills = aiSkills.missingSkills;
        
        // Recalculate job match percentage and overall ATS score with the high-fidelity AI matching!
        const totalSkills = scoreCard.matchedSkills.length + scoreCard.missingSkills.length;
        scoreCard.jobMatchPercentage = totalSkills > 0 ? Math.round((scoreCard.matchedSkills.length / totalSkills) * 100) : 100;
        
        // Update ATS score using new AI matched percentage
        let newAtsScore = Math.round(
          (0.50 * scoreCard.jobMatchPercentage) +
          (0.25 * scoreCard.sectionValidation.score) +
          (0.15 * scoreCard.completenessScore) +
          (0.10 * scoreCard.readabilityScore)
        );
        scoreCard.atsScore = Math.max(0, Math.min(100, newAtsScore));
        
        if (scoreCard.atsScore >= 75) {
          scoreCard.strengthLevel = 'Strong';
        } else if (scoreCard.atsScore >= 45) {
          scoreCard.strengthLevel = 'Average';
        } else {
          scoreCard.strengthLevel = 'Weak';
        }
      }
    }

    // 2. Generate local structural/casing suggestions (aligned with updated skills)
    const suggestions = generateLocalSuggestions(scoreCard);

    // 3. Compute skill gap analysis
    const skillGapAnalysis = getSkillGapAnalysis(scoreCard.missingSkills);

    // 4. Optionally query Gemini AI for premium summary and suggestions
    let aiIntelligence = null;
    
    if (isAiConfigured) {
      aiIntelligence = await getGeminiIntelligence(resumeText, jobDescription, 'fullAnalysis');
    }
    
    // If Gemini was offline, failed, or returned null/empty, fallback to local rule-based intelligence immediately!
    if (!aiIntelligence || !aiIntelligence.linkedinSummary) {
      const { getLocalIntelligence } = require('../ats/suggestions/suggester');
      aiIntelligence = getLocalIntelligence(resumeText, jobDescription);
    }

    // Blend AI insights if available
    const finalSuggestions = [...suggestions];
    let linkedinSummary = '';

    if (aiIntelligence) {
      if (aiIntelligence.aiSuggestions && Array.isArray(aiIntelligence.aiSuggestions)) {
        aiIntelligence.aiSuggestions.forEach(message => {
          finalSuggestions.unshift({
            type: 'ai',
            category: 'AI Recommendation',
            message,
            urgency: 'Medium'
          });
        });
      }
      if (aiIntelligence.linkedinSummary) {
        linkedinSummary = aiIntelligence.linkedinSummary;
      }
    }

    res.status(200).json({
      success: true,
      candidateName,
      atsScore: scoreCard.atsScore,
      matchedSkills: scoreCard.matchedSkills,
      missingSkills: scoreCard.missingSkills,
      jobMatchPercentage: scoreCard.jobMatchPercentage,
      strengthLevel: scoreCard.strengthLevel,
      keywordDensity: scoreCard.keywordDensity,
      sectionValidation: scoreCard.sectionValidation,
      readabilityScore: scoreCard.readabilityScore,
      completenessScore: scoreCard.completenessScore,
      suggestions: finalSuggestions,
      skillGapAnalysis,
      linkedinSummary,
      isAiConfigured
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Experience bullet rewriter endpoint
 * @route   POST /api/ats/ai-rewrite
 * @access  Private
 */
exports.aiRewriteBullet = async (req, res, next) => {
  try {
    const { text, jobRoleContext } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the text you wish to rewrite.'
      });
    }

    const isAiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    
    if (!isAiConfigured) {
      // Offline fallback: Rule-based premium rewrites!
      const fallbackOptions = [
        `Spearheaded the design and deployment of the feature, optimizing processing speed by 35% through custom caching.`,
        `Collaborated with stakeholders to architect the codebase, successfully reducing runtime latency and boosting page load speeds.`,
        `Orchestrated standard design procedures, improving data consistency across core user workflows by 20%.`
      ];
      return res.status(200).json({
        success: true,
        rewrites: fallbackOptions,
        isAiConfigured: false,
        message: 'Offline local rewriting rules loaded. Set GEMINI_API_KEY for hyper-targeted bullet points!'
      });
    }

    const aiResponse = await getGeminiIntelligence(text, jobRoleContext || 'Software Developer', 'rewriteBullet');
    
    if (aiResponse && Array.isArray(aiResponse)) {
      return res.status(200).json({
        success: true,
        rewrites: aiResponse,
        isAiConfigured: true
      });
    } else if (aiResponse && aiResponse.rewrites && Array.isArray(aiResponse.rewrites)) {
      return res.status(200).json({
        success: true,
        rewrites: aiResponse.rewrites,
        isAiConfigured: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI rewriter received malformed response. Please try again.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Parses uploaded PDF CV and returns standard contact detail structures for auto-filling
 * @route   POST /api/ats/parse-pdf
 * @access  Private
 */
exports.parsePDFOnly = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume file.'
      });
    }

    const extractedText = await parseResumePDF(req.file.buffer);

    // 1. Email extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const emailMatch = extractedText.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : '';

    // 2. Phone extraction
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = extractedText.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // 3. LinkedIn extraction
    const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
    const linkedinMatch = extractedText.match(linkedinRegex);
    const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '';

    // 4. GitHub extraction
    const githubRegex = /github\.com\/([a-zA-Z0-9_-]+)/i;
    const githubMatch = extractedText.match(githubRegex);
    const github = githubMatch ? `https://github.com/${githubMatch[1]}` : '';

    // 5. City State / Address search
    const addressRegex = /([a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?)/;
    const addressMatch = extractedText.match(addressRegex);
    const address = addressMatch ? addressMatch[0] : '';

    // 6. Name extraction: First line that is not empty
    const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let firstName = '';
    let lastName = '';
    if (lines.length > 0 && lines[0].length < 40) {
      const words = lines[0].split(/\s+/);
      if (words.length > 0) {
        firstName = words[0];
        lastName = words.slice(1).join(' ');
      }
    }

    res.status(200).json({
      success: true,
      personalInfo: {
        firstName,
        lastName,
        email,
        phone,
        linkedin,
        github,
        address
      }
    });
  } catch (error) {
    next(error);
  }
};
