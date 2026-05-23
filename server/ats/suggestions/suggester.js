const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Maps common technical skills to a recommended learning path/technologies (Local Skill Gap Analyzer)
 */
const SKILL_GAP_RECOMMENDATIONS = {
  'react': ['Next.js (React Framework)', 'TypeScript (Strongly-typed JS)', 'Redux Toolkit / Zustand (State Management)'],
  'node.js': ['Express.js or NestJS (API Frameworks)', 'PostgreSQL / MongoDB (Databases)', 'JWT & OAuth (Auth patterns)'],
  'typescript': ['TypeScript Design Patterns', 'Advanced generic programming', 'Zod (Runtime Validation)'],
  'aws': ['Docker & ECS (Container hosting)', 'Terraform (Infrastructure as Code)', 'AWS Certified Solutions Architect basics'],
  'docker': ['Kubernetes (Orchestration)', 'CI/CD Pipelines (Github Actions)', 'Microservices Architecture'],
  'mongodb': ['Prisma or Mongoose (ODMs)', 'NoSQL schema design patterns (embedding vs referencing)', 'Database indexing and aggregation pipeline performance tuning'],
  'postgresql': ['SQL Indexing & Performance tuning', 'Redis (Caching)', 'Prisma (ORM)'],
  'graphql': ['Apollo Client/Server', 'REST APIs integration patterns', 'GraphQL Federation'],
  'ci/cd': ['GitHub Actions / GitLab CI', 'Docker Containers', 'AWS or GCP deployment automations'],
  'python': ['FastAPI / Django (Web Dev)', 'Pandas & NumPy (Data Science)', 'PyTest (Unit Testing)'],
  'communication': ['Professional Leadership Communication standards', 'Technical documentation & system design writing patterns', 'Active listening & collaborative feedback loops in agile teams'],
  'github': ['Git branch management workflows (GitFlow, trunk-based)', 'GitHub Actions for CI/CD automation pipelines', 'Pull Request review protocols and collaborative code feedback'],
  'rest': ['RESTful API design best practices (HTTP methods, status codes, query filters)', 'API security patterns (JWT authentication, rate limiting, CORS configuration)', 'Automated API testing tools (Postman, Supertest, Jest)'],
  'java': ['Spring Boot framework (Enterprise microservices)', 'Hibernate / JPA (Object-Relational Mapping)', 'Java Concurrency & Multi-threading patterns'],
  'c++': ['Modern C++ standards (C++17/C++20 features)', 'Memory management & Smart pointers', 'STL (Standard Template Library) data structures & algorithms'],
  'problem-solving': ['Data Structures & Algorithms paradigms (LeetCode study patterns)', 'System Design fundamentals (Scaling, Caching, Load Balancers)', 'Root cause analysis methodologies (5 Whys framework)'],
  'javascript': ['Asynchronous JavaScript (Promises, Async/Await)', 'ES6+ modern syntaxes & concepts (closure, event loop)', 'JavaScript performance tuning & bundle sizes optimization'],
  'css': ['TailwindCSS utility framework', 'CSS Grid & Flexbox responsive layouts', 'CSS animations and micro-interaction transitions'],
  'html': ['Semantic HTML5 elements best practices', 'Accessibility (a11y) standards & ARIA roles', 'Web Page SEO optimization structures'],
  'git': ['Basic commands (rebase, interactive stash, merging)', 'Conflict resolution strategies', 'Git Hooks for commit quality safeguards'],
  'agile': ['Agile Scrum & Kanban frameworks', 'Sprint planning & backlog grooming best practices', 'Collaborative estimation and velocity tracking'],
  'scrum': ['Certified Scrum Product Owner (CSPO) syllabus', 'Sprint retro & velocity analysis', 'Jira workflow dashboard management']
};

/**
 * Local Rule-Based Professional Intelligence (Fallback when Gemini API is offline)
 */
const getLocalIntelligence = (resumeText, jobDescriptionText) => {
  // Extract keywords to customize the summary dynamically
  const { extractKeywords } = require('../keywordExtractor/extractor');
  const skills = extractKeywords(resumeText).slice(0, 5);
  const skillList = skills.length > 0 ? skills.map(s => s.toUpperCase()).join(', ') : 'Software Engineering, Full Stack Web Development';
  
  const linkedinSummary = `Innovative and results-driven Professional specialized in ${skillList}. Experienced in architecting robust software solutions, spearheading end-to-end development lifecycles, and optimizing database performance. Collaborative team player dedicated to translating complex business requirements into high-quality digital products.`;

  return {
    aiSuggestions: [
      `Integrate more metrics (e.g., optimized server latency by 30%, boosted conversion rate by 15%) to make your projects stand out.`,
      `Add direct hyperlinks to your GitHub portfolios or hosting deployments to allow recruiters to review your code easily.`,
      `Structure your bullet points using the STAR method (Situation, Task, Action, Result) for high-impact experience descriptions.`
    ],
    linkedinSummary,
    readabilityFeedback: `Overall formatting is clean. Keep bullet points concise and focus on metrics-driven results.`
  };
};

/**
 * Local Rule-Based Improvement Suggester
 */
const generateLocalSuggestions = (scoreCard) => {
  const suggestions = [];

  // 1. Analyze Section Validation
  if (scoreCard.sectionValidation && scoreCard.sectionValidation.missingSections) {
    scoreCard.sectionValidation.missingSections.forEach(section => {
      suggestions.push({
        type: 'structural',
        category: 'Section Missing',
        message: `Add an explicit **${section.toUpperCase()}** section. ATS crawlers specifically scan for standard headings like 'Education' or 'Experience' and penalize resumes that omit them.`,
        urgency: 'High'
      });
    });
  }

  // 2. Analyze Missing Skills
  if (scoreCard.missingSkills && scoreCard.missingSkills.length > 0) {
    const missingShowcase = scoreCard.missingSkills.slice(0, 4).join(', ');
    suggestions.push({
      type: 'skills',
      category: 'Technical Match',
      message: `The job description emphasizes **${missingShowcase}**. Try to weave these technical keywords into your Experience bullets or Skills section if you have worked with them.`,
      urgency: 'High'
    });
  }

  // 3. Analyze Keyword Density
  if (scoreCard.keywordDensity && scoreCard.keywordDensity.length > 0) {
    const overusedList = scoreCard.keywordDensity.filter(item => item.status === 'Overused');
    if (overusedList.length > 0) {
      const overusedNames = overusedList.map(i => `'${i.keyword}'`).join(', ');
      suggestions.push({
        type: 'content',
        category: 'Keyword Density',
        message: `The terms **${overusedNames}** are appearing with high frequency (density >5%). Avoid 'keyword stuffing' (repeating terms unnecessarily) as modern ATS algorithms filter or penalize repetitive formatting. Refine your phrasing.`,
        urgency: 'Medium'
      });
    }
  }

  // 4. Analyze Readability
  if (scoreCard.readabilityScore < 50) {
    suggestions.push({
      type: 'readability',
      category: 'Verbosity',
      message: `Your resume readability index is slightly low (${scoreCard.readabilityScore}/100). Use shorter, action-oriented sentences. Break down bulky paragraphs into concise, single-line bullet points starting with strong action verbs.`,
      urgency: 'Medium'
    });
  }

  // 5. Standard Premium suggestions
  suggestions.push({
    type: 'content',
    category: 'Measurable Achievements',
    message: `Incorporate **measurable achievements** (metrics-driven bullets) in your experience descriptions. Rather than writing 'Responsible for database scaling', write 'Scaled database performance, reducing API response times by 40% using Redis caching'.`,
    urgency: 'High'
  });

  suggestions.push({
    type: 'content',
    category: 'Certifications & Linkages',
    message: `Add industry-standard certifications (e.g., AWS, Scrum Master) and hyperlinked credentials to improve professional credibility and fill standard templates perfectly.`,
    urgency: 'Low'
  });

  return suggestions;
};

/**
 * Computes skill recommendations and courses (Skill Gap Analyzer)
 */
const getSkillGapAnalysis = (missingSkills) => {
  const gapAnalysis = [];

  if (!missingSkills || missingSkills.length === 0) {
    return [
      {
        skill: 'Modern Cloud Architecture',
        suggestions: ['AWS Cloud Practitioner', 'Docker container systems orchestration']
      }
    ];
  }

  // Look up missing skills in dictionary
  missingSkills.slice(0, 5).forEach(skill => {
    const stdSkill = skill.toLowerCase();
    const recommendations = SKILL_GAP_RECOMMENDATIONS[stdSkill] || [
      `Learn core fundamentals of ${skill}`,
      `Build a miniature portfolio project showcasing ${skill}`,
      `Explore standard documentation and tutorials for ${skill}`
    ];

    gapAnalysis.push({
      skill,
      suggestions: recommendations
    });
  });

  return gapAnalysis;
};

/**
 * AI-powered analysis fallback wrapper utilizing Google Gemini API if configured
 */
const getGeminiIntelligence = async (resumeText, jobDescriptionText, actionType = 'fullAnalysis') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // If no key, return null to prompt standard rule-based fallbacks
    return null;
  }

  try {
    // Initialize standard Gemini client
    // Note: The @google/generative-ai package uses standard structures
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We target gemini-1.5-flash or gemini-2.5-flash which are incredibly fast and accurate
    // Wait, the new SDK utilizes the model structure
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';

    if (actionType === 'fullAnalysis') {
      prompt = `
You are an expert ATS (Applicant Tracking System) recruiter auditor.
Analyze the following Resume Text against the Job Description.

Resume:
"""
${resumeText}
"""

Job Description:
"""
${jobDescriptionText}
"""

Provide a detailed evaluation in structured JSON format ONLY. Do not write any conversational text before or after the JSON.
The JSON must strictly have the following keys:
- "aiSuggestions": Array of strings (3 detailed, action-oriented, metrics-driven bullets for resume improvement)
- "linkedinSummary": String (A highly compelling, professional 3-sentence summary optimized for a LinkedIn profile About section)
- "readabilityFeedback": String (Feedback on formatting and tone)
`;
    } else if (actionType === 'rewriteBullet') {
      prompt = `
You are an elite career coach. Rewrite the following resume experience bullet point to be highly professional, impactful, and metrics-driven (e.g. use terms like 'spearheaded', 'optimized', and include imaginary realistic statistics like 'boosted performance by 35%'):

Original Bullet Point:
"${resumeText}"

Target Job Role Context:
"${jobDescriptionText}"

Provide 3 different professional rewritten alternatives in a JSON array of strings ONLY. Do not write any conversational text before or after the JSON.
`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Clean JSON response boundaries
    const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error('Gemini AI integration failed details:', err.message);
    return null; // Graceful fallback to rule-based engines on API failure
  }
};

/**
 * AI-powered high-fidelity skills extraction directly from Resume and JD (highly accurate)
 */
const getGeminiSkillsExtraction = async (resumeText, jobDescriptionText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser. Your task is to accurately extract technical skills from the provided Resume and Job Description.

Resume Text:
"""
${resumeText}
"""

Job Description Text:
"""
${jobDescriptionText}
"""

Instructions:
1. "skillsInResume": Extract a clean, precise list of technical skills, languages, frameworks, databases, developer tools, cloud platforms, and architectures actually present in the Resume. Avoid soft skills, company names, degrees, or journal titles (e.g., "Collaboration" or "Journal of ML" are NOT skills).
2. "skillsInJob": Extract a clean, precise list of required technical skills, languages, frameworks, databases, developer tools, and cloud platforms mentioned in the Job Description.
3. "matchedSkills": A list of technical skills from "skillsInJob" that are successfully present in "skillsInResume".
4. "missingSkills": A list of technical skills from "skillsInJob" that are NOT present in "skillsInResume".

Provide the output in structured JSON format ONLY. Do not write any conversational text before or after the JSON.
The JSON must strictly have the following keys:
- "skillsInResume": Array of strings (lowercase)
- "skillsInJob": Array of strings (lowercase)
- "matchedSkills": Array of strings (lowercase)
- "missingSkills": Array of strings (lowercase)
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (Array.isArray(data.matchedSkills) && Array.isArray(data.missingSkills)) {
        return {
          matchedSkills: data.matchedSkills.map(s => s.trim().toLowerCase()),
          missingSkills: data.missingSkills.map(s => s.trim().toLowerCase())
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Gemini skills extraction failed details:', err.message);
    return null;
  }
};

module.exports = {
  generateLocalSuggestions,
  getSkillGapAnalysis,
  getGeminiIntelligence,
  getLocalIntelligence,
  getGeminiSkillsExtraction
};

