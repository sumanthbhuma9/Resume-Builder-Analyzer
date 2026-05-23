const natural = require('natural');
const nlp = require('compromise');
const { TECH_SKILLS, STOP_WORDS, SKILL_MAP } = require('../utils/dictionary');

const tokenizer = new natural.WordTokenizer();

/**
 * Normalizes a tech term to a standardized representation (e.g., "NodeJS" -> "node.js")
 * @param {string} term - The word or n-gram
 * @returns {string} Standardized skill representation
 */
const normalizeTerm = (term) => {
  if (!term) return '';
  // Convert standard technical terms
  let clean = term.toLowerCase().trim();
  
  // Strip punctuation but keep forward slash (for ci/cd), dot (for node.js), and pluses (for c++)
  clean = clean.replace(/[^a-z0-9.+/#-]/g, '');

  if (SKILL_MAP[clean]) {
    return SKILL_MAP[clean];
  }
  return clean;
};

/**
 * Extracts all technical keywords and skills from a block of text
 * @param {string} text - Raw input text (resume or job description)
 * @returns {Array<string>} List of unique extracted skills
 */
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];

  const foundSkills = new Set();
  
  // --- Step 1: Normalize text stream for matching ---
  const words = tokenizer.tokenize(text.toLowerCase()) || [];
  
  // Create 1-gram, 2-gram, and 3-gram arrays to capture multi-word skills like "node.js" or "machine learning"
  // Let's create our own fast, robust N-gram matcher
  const textNormalized = text.toLowerCase();
  
  // Loop over every skill in our predefined technical catalog
  for (const skill of TECH_SKILLS) {
    // Escape special characters in skill name for a safe regex search
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Look for exact word matches.
    // Since skills contain special chars (C++, .NET, Node.js), standard word boundaries (\b) can fail.
    // Instead, we use custom boundary checks that allow characters like +, #, /, and .
    // A boundary is either a start/end of string, or any char that is not in the set [a-zA-Z0-9.+/#-]
    const boundaryPattern = `(?<=^|[^a-zA-Z0-9.+/#-])${escapedSkill}(?=$|[^a-zA-Z0-9.+/#-])`;
    const regex = new RegExp(boundaryPattern, 'g');
    
    if (regex.test(textNormalized)) {
      // Map back to our standard mapped keys
      const standardSkill = SKILL_MAP[skill] || skill;
      foundSkills.add(standardSkill);
    }
  }

  // --- Step 2: Use compromise to capture any other proper nouns / tech titles ---
  // Compromise can scan for nouns, software terms, or corporate nouns that are not in our hardcoded dictionary!
  try {
    const doc = nlp(text);
    
    // Extract proper nouns, acronyms, and organization tags using standard compromise tag queries
    const docOrganizations = doc.organizations().out('array');
    const properNouns = doc.match('#ProperNoun').out('array');
    
    // Add proper nouns that match technical titles or represent corporate technology
    const potentialTechTerms = [...docOrganizations, ...properNouns];
    for (const term of potentialTechTerms) {
      const cleanTerm = term.toLowerCase().trim();
      
      // If it exists in our tech dictionary or is a multi-word sequence ending in tech tags, add it
      if (TECH_SKILLS.includes(cleanTerm)) {
        foundSkills.add(SKILL_MAP[cleanTerm] || cleanTerm);
      }
    }
  } catch (err) {
    console.warn('Compromise NLP scanning bypassed details:', err.message);
  }

  // Convert Set to sorted Array and filter out stop words/soft skills
  return Array.from(foundSkills)
    .filter(skill => !STOP_WORDS.has(skill.toLowerCase()))
    .sort();
};

/**
 * Removes stop words and returns the token frequency counts for keyword density
 * @param {string} text - Input text
 * @returns {Array<{word: string, count: number}>} Array of words and their counts
 */
const getKeywordFrequency = (text) => {
  if (!text) return [];

  const rawTokens = tokenizer.tokenize(text.toLowerCase()) || [];
  
  // Filter stop words and single-character noises
  const filteredTokens = rawTokens.filter(token => {
    return token.length > 1 && !STOP_WORDS.has(token);
  });

  const frequencies = {};
  filteredTokens.forEach(token => {
    // Normalize abbreviations
    const standardWord = SKILL_MAP[token] || token;
    frequencies[standardWord] = (frequencies[standardWord] || 0) + 1;
  });

  // Convert to array of objects and sort by frequency descending
  return Object.keys(frequencies)
    .map(word => ({
      keyword: word,
      count: frequencies[word],
      density: ((frequencies[word] / rawTokens.length) * 100).toFixed(1) + '%'
    }))
    .sort((a, b) => b.count - a.count);
};

module.exports = {
  extractKeywords,
  getKeywordFrequency,
  normalizeTerm
};
