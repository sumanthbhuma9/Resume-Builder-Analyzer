const { extractKeywords, getKeywordFrequency } = require('../keywordExtractor/extractor');

/**
 * Validates if standard sections are present in the text
 * @param {string} text - Cleaned resume text
 * @returns {{isValid: boolean, details: Object}} Validation results
 */
const validateSections = (text) => {
  if (!text) return { isValid: false, details: {} };

  const normalized = text.toLowerCase();
  
  // Section heading pattern matchers
  const checks = {
    contact: /(email|phone|address|contact|linkedin|github)/i.test(normalized),
    education: /(education|school|university|college|degree|academic)/i.test(normalized),
    experience: /(experience|employment|work|history|professional|career)/i.test(normalized),
    skills: /(skills|expertise|technologies|proficiencies|languages)/i.test(normalized),
    projects: /(projects|portfolio|personal projects|creations)/i.test(normalized)
  };

  const sectionsList = Object.keys(checks);
  const presentSections = sectionsList.filter(s => checks[s]);
  const score = Math.round((presentSections.length / sectionsList.length) * 100);

  return {
    score,
    checks,
    presentSections,
    missingSections: sectionsList.filter(s => !checks[s])
  };
};

/**
 * Calculates readability of the text (Simple approximation of syllable & sentence complexity)
 * @param {string} text - Cleaned text
 * @returns {number} Score from 0 to 100
 */
const calculateReadability = (text) => {
  if (!text) return 0;

  // Count sentences, words, and syllables roughly
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter(w => w.length > 0).length || 1;
  
  // Syllables rough estimation (vowels count)
  let syllables = 0;
  const vowels = /[aeiouy]/ig;
  const matches = text.match(vowels);
  if (matches) syllables = matches.length;
  
  // Flesch Reading Ease Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  const averageSentenceLength = words / sentences;
  const averageSyllablesPerWord = syllables / words;
  
  let score = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);
  
  // Bound score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  return Math.round(score);
};

/**
 * Calculates how complete the resume is
 * @param {string} text - Cleaned resume text
 * @returns {number} Score from 0 to 100
 */
const calculateCompleteness = (text) => {
  if (!text) return 0;
  
  let score = 0;
  const normalized = text.toLowerCase();

  // 1. Has email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(normalized)) score += 20;
  // 2. Has phone
  if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(normalized)) score += 20;
  // 3. Has links (LinkedIn / GitHub)
  if (/(linkedin|github)\.com/i.test(normalized)) score += 20;
  // 4. Word count check (Professional resumes are typically 300 - 800 words)
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 300) score += 20;
  // 5. Section richness: Experience and Projects both present
  if (/(experience|employment|work)/i.test(normalized) && /(projects|portfolio)/i.test(normalized)) score += 20;

  return score;
};

/**
 * Runs the comprehensive ATS scoring engine
 * @param {string} resumeText - Cleaned resume text
 * @param {string} jobDescriptionText - Paste job description text
 * @returns {Object} Analytical scoring output
 */
const calculateATSScore = (resumeText, jobDescriptionText) => {
  if (!resumeText || !jobDescriptionText) {
    return {
      atsScore: 0,
      matchedSkills: [],
      missingSkills: [],
      jobMatchPercentage: 0,
      strengthLevel: 'Weak',
      keywordDensity: [],
      sectionValidation: {},
      readabilityScore: 0,
      completenessScore: 0
    };
  }

  // 1. Extract keywords/skills
  const resumeSkills = extractKeywords(resumeText);
  const jobSkills = extractKeywords(jobDescriptionText);

  // If no job skills are extracted, assume standard comparison
  const targetRequiredSkills = jobSkills.length > 0 ? jobSkills : ['javascript', 'react', 'node.js', 'git', 'sql', 'agile'];

  // 2. Compare skills
  const matchedSkills = targetRequiredSkills.filter(skill => resumeSkills.includes(skill));
  const missingSkills = targetRequiredSkills.filter(skill => !resumeSkills.includes(skill));

  // Matched percentage: (Matched / Required) * 100
  const jobMatchPercentage = Math.round((matchedSkills.length / targetRequiredSkills.length) * 100);

  // 3. Section validation
  const sectionValidation = validateSections(resumeText);

  // 4. Readability and Completeness
  const readabilityScore = calculateReadability(resumeText);
  const completenessScore = calculateCompleteness(resumeText);

  // 5. Calculate overall Multi-Dimensional ATS Score
  // Weighted: 50% Job Match + 25% Sections + 15% Completeness + 10% Readability
  let atsScore = Math.round(
    (0.50 * jobMatchPercentage) +
    (0.25 * sectionValidation.score) +
    (0.15 * completenessScore) +
    (0.10 * readabilityScore)
  );

  // Cap at 100 and floor at 0
  atsScore = Math.max(0, Math.min(100, atsScore));

  // 6. Set strength level
  let strengthLevel = 'Weak';
  if (atsScore >= 75) {
    strengthLevel = 'Strong';
  } else if (atsScore >= 45) {
    strengthLevel = 'Average';
  }

  // 7. Keyword density & Stuffing flags
  const keywordFrequencies = getKeywordFrequency(resumeText);
  const totalWords = resumeText.split(/\s+/).filter(w => w.length > 0).length || 1;

  const keywordDensity = keywordFrequencies.slice(0, 15).map(item => {
    const rawPct = (item.count / totalWords) * 100;
    
    // Flag terms that are stuffed (>5.0% density AND count > 6)
    let status = 'Perfect';
    if (rawPct > 5.0 && item.count > 6) {
      status = 'Overused';
    } else if (rawPct < 0.5) {
      status = 'Low';
    }

    return {
      keyword: item.keyword,
      count: item.count,
      density: rawPct.toFixed(1) + '%',
      status
    };
  });

  return {
    atsScore,
    matchedSkills,
    missingSkills,
    jobMatchPercentage,
    strengthLevel,
    keywordDensity,
    sectionValidation,
    readabilityScore,
    completenessScore
  };
};

module.exports = {
  calculateATSScore,
  validateSections,
  calculateReadability,
  calculateCompleteness
};
