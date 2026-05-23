const { PDFParse } = require('pdf-parse');

/**
 * Parses a PDF resume buffer and extracts cleaned text
 * @param {Buffer} pdfBuffer - The uploaded PDF file buffer
 * @returns {Promise<string>} Cleaned extracted plain text
 */
const parseResumePDF = async (pdfBuffer) => {
  try {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Invalid input: Expected a file buffer representing a PDF.');
    }

    const parser = new PDFParse({ data: pdfBuffer });
    const data = await parser.getText({ lineEnforce: true, lineThreshold: 4.6 });
    
    if (!data || !data.text) {
      throw new Error('PDF extraction returned empty text contents.');
    }

    // Clean and preprocess text
    const cleanedText = cleanParsedText(data.text);
    return cleanedText;
  } catch (error) {
    console.error('PDF parsing error details:', error.message);
    throw new Error(`Failed to parse PDF resume: ${error.message}`);
  }
};

/**
 * Normalizes punctuation, hyphens, spaces, and removes weird control characters
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned, uniform text stream
 */
const cleanParsedText = (text) => {
  if (!text) return '';

  let cleaned = text
    // Replace non-breaking spaces and vertical tabs with normal spaces
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\v]/g, ' ')
    // Replace weird bullet characters with uniform bullets or spaces
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, ' • ')
    // Replace smart double quotes and single quotes with standard quotes
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Replace em-dash and en-dash with standard hyphens
    .replace(/[\u2013\u2014]/g, '-')
    // Strip control characters (ASCII 0-31 except tab/newlines)
    .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Reduce duplicate empty lines
    .replace(/\n\s*\n/g, '\n')
    // Compress consecutive spaces
    .replace(/[ \t]+/g, ' ');

  return cleaned.trim();
};

module.exports = {
  parseResumePDF,
  cleanParsedText
};
