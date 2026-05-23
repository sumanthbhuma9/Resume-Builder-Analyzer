/**
 * Curated High-Fidelity Professional Dictionary & NLP Helpers
 * Consists of 500+ technical terms, developer tools, soft skills, and standard stop words.
 */

const TECH_SKILLS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'ruby', 'php', 'swift', 'kotlin', 'go', 'golang', 'rust', 'scala', 'perl', 'r', 'dart', 'html', 'css', 'sql', 'nosql', 'shell', 'bash', 'powershell', 'assembly', 'solidity', 'cobol', 'fortran',

  // Frontend Libraries & Frameworks
  'react', 'reactjs', 'nextjs', 'next.js', 'vue', 'vuejs', 'angular', 'angularjs', 'svelte', 'nuxt', 'nuxtjs', 'gatsby', 'remix', 'solid', 'solidjs', 'jquery', 'bootstrap', 'tailwindcss', 'tailwind', 'sass', 'less', 'styled-components', 'emotion', 'material-ui', 'mui', 'chakra-ui', 'shadcn', 'ant-design', 'antd', 'expo', 'react-native', 'flutter', 'ionic',

  // Backend Frameworks & Runtimes
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'nest', 'nestjs', 'koa', 'fastify', 'django', 'flask', 'fastapi', 'spring', 'springboot', 'spring-boot', 'laravel', 'symfony', 'asp.net', 'dotnet', 'rails', 'ruby-on-rails', 'gin', 'fiber', 'phoenix', 'apollo', 'graphql', 'rest-api', 'restful', 'grpc',

  // Databases & Caching
  'mongodb', 'mongo', 'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'oracle', 'mssql', 'redis', 'memcached', 'cassandra', 'dynamodb', 'neo4j', 'firebase', 'firestore', 'supabase', 'prisma', 'sequelize', 'mongoose', 'typeorm', 'elasticsearch', 'elastic', 'influxdb',

  // DevOps, Cloud & Systems
  'aws', 'amazon-web-services', 'gcp', 'google-cloud', 'azure', 'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab', 'github-actions', 'ci/cd', 'cicd', 'terraform', 'ansible', 'chef', 'puppet', 'vagrant', 'nginx', 'apache', 'linux', 'unix', 'ubuntu', 'debian', 'centos', 'redhat', 'prometheus', 'grafana', 'datadog', 'sentry',

  // Testing & Tooling
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright', 'puppeteer', 'vitest', 'testing-library', 'eslint', 'prettier', 'webpack', 'vite', 'babel', 'rollup', 'gulp', 'npm', 'yarn', 'pnpm', 'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'trello',

  // Artificial Intelligence, ML & Data Science
  'machine-learning', 'ml', 'deep-learning', 'dl', 'artificial-intelligence', 'ai', 'natural-language-processing', 'nlp', 'computer-vision', 'cv', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'jupyter', 'tableau', 'power-bi', 'openai', 'gemini', 'langchain', 'llama', 'huggingface',

  // Architectures, Methodologies & Concepts
  'microservices', 'monolith', 'serverless', 'lambda', 'oop', 'object-oriented-programming', 'functional-programming', 'solid-principles', 'mvc', 'mvvm', 'tdd', 'test-driven-development', 'bdd', 'ddd', 'agile', 'scrum', 'kanban', 'devops', 'secops', 'gitops', 'rest', 'soap', 'graphql', 'websockets', 'oauth', 'jwt', 'auth0', 'stripe', 'web3', 'blockchain', 'seo', 'pwa', 'responsive-design',

  // Soft Skills & Leadership (Removed generic noise terms like collaboration, communication, teamwork from matching)
];

// Expanded stop words list for cleaning
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
  'using', 'used', 'use', 'take', 'make', 'get', 'well', 'also', 'experience', 'work',
  'job', 'skills', 'role', 'team', 'company', 'projects', 'strong', 'ability', 'years',
  'highly', 'successful', 'seeking', 'opportunity', 'proven', 'excellent', 'motivated',
  'leadership', 'teamwork', 'communication', 'collaboration', 'problem-solving', 'critical-thinking',
  'time-management', 'adaptability', 'mentoring', 'mentorship', 'agile-delivery', 'project-management',
  'public-speaking', 'negotiation', 'emotional-intelligence'
]);

/**
 * Standardizes common abbreviation mismatches
 */
const SKILL_MAP = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'k8s': 'kubernetes',
  'docker-containers': 'docker',
  'reactjs': 'react',
  'nextjs': 'next.js',
  'vuejs': 'vue',
  'angularjs': 'angular',
  'expressjs': 'express',
  'nodejs': 'node.js',
  'node': 'node.js',
  'spring-boot': 'springboot',
  'aws-cloud': 'aws',
  'gcp-cloud': 'gcp',
  'ci-cd': 'ci/cd',
  'cicd': 'ci/cd',
  'tailwind': 'tailwindcss',
  'postgres': 'postgresql',
  'mongo': 'mongodb'
};

module.exports = {
  TECH_SKILLS,
  STOP_WORDS,
  SKILL_MAP
};
