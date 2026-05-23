import React from 'react';
import { Mail, Phone, Globe, MapPin, Calendar, Award } from 'lucide-react';

// Custom inline SVG icons for brands that are missing in this version of lucide-react
const Github = ({ size = 12, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 12, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Helper to safely display lists like technologies or skills
const parseCommaList = (str) => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

// Dynamic styling utility based on custom layout spacing and font size choices
const getTemplateStyles = (config = {}) => {
  const fontSize = config.fontSize || 'medium';
  const spacing = config.spacing || 'standard';

  let fontStyles = {};
  switch (fontSize) {
    case 'small':
      fontStyles = {
        body: 'text-[9.5px]',
        sub: 'text-[8.5px]',
        title: 'text-[10px]',
        sectionHeader: 'text-[10.5px]',
        name: 'text-2xl',
        summary: 'text-[9.5px]',
      };
      break;
    case 'large':
      fontStyles = {
        body: 'text-[12.5px]',
        sub: 'text-[11px]',
        title: 'text-[13px]',
        sectionHeader: 'text-[14px]',
        name: 'text-4xl',
        summary: 'text-[12px]',
      };
      break;
    case 'medium':
    default:
      fontStyles = {
        body: 'text-[11px]',
        sub: 'text-[9.5px]',
        title: 'text-[11.5px]',
        sectionHeader: 'text-[12px]',
        name: 'text-3xl',
        summary: 'text-[10.5px]',
      };
      break;
  }

  let spacingStyles = {};
  switch (spacing) {
    case 'compact':
      spacingStyles = {
        padding: 'p-4',
        sectionGap: 'gap-2.5',
        itemGap: 'gap-1.5',
        margin: 'mb-2',
        headerPad: 'pb-2 mb-2',
        sectionHeaderPad: 'mb-1 pb-0.5',
      };
      break;
    case 'spacious':
      spacingStyles = {
        padding: 'p-8',
        sectionGap: 'gap-6',
        itemGap: 'gap-4',
        margin: 'mb-4',
        headerPad: 'pb-5 mb-5',
        sectionHeaderPad: 'mb-3 pb-1',
      };
      break;
    case 'standard':
    default:
      spacingStyles = {
        padding: 'p-6',
        sectionGap: 'gap-4',
        itemGap: 'gap-2',
        margin: 'mb-3',
        headerPad: 'pb-4 mb-4',
        sectionHeaderPad: 'mb-2 pb-0.5',
      };
      break;
  }

  return { fonts: fontStyles, spacing: spacingStyles };
};

// ==========================================
// 1. MODERN TEMPLATE (REDESIGNED & PREMIUM)
// ==========================================
export const ModernTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certifications = [], achievements = [], config = {} } = data;
  const styles = getTemplateStyles(config);

  return (
    <div className={`bg-white text-slate-800 shadow-sm font-sans min-h-[29.7cm] w-full max-w-[21cm] mx-auto box-border leading-relaxed flex flex-col ${styles.spacing.padding} ${styles.fonts.body}`}>
      <div>
        {/* Header Panel with modern centered layout */}
        <div className={`text-center flex flex-col items-center justify-center border-slate-100 ${styles.spacing.headerPad}`}>
          {personalInfo.photo && (
            <div className="mb-3 relative">
              <img 
                src={personalInfo.photo} 
                alt="Profile Avatar" 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-indigo-100"
              />
            </div>
          )}
          
          <h1 className={`font-extrabold tracking-tight text-slate-900 uppercase ${styles.fonts.name}`}>
            {personalInfo.firstName || ''} <span className="text-indigo-600">{personalInfo.lastName || ''}</span>
          </h1>
          
          {personalInfo.summary && (
            <p className={`font-medium text-slate-500 mt-2 max-w-xl mx-auto italic leading-normal ${styles.fonts.summary}`}>
              {personalInfo.summary}
            </p>
          )}
          
          {/* Centered Contact Info Row */}
          <div className={`flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 mt-3.5 text-slate-600 max-w-2xl ${styles.fonts.sub}`}>
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail size={11} className="text-indigo-500" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone size={11} className="text-indigo-500" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-indigo-500" />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.website && (
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <Globe size={11} className="text-indigo-500" />
                <span>{personalInfo.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {personalInfo.github && (
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-700 transition-colors">
                <Github size={11} className="text-indigo-500" />
                <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-700 transition-colors">
                <Linkedin size={11} className="text-indigo-500" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left Side Column */}
          <div className={`col-span-1 border-r border-slate-100 pr-4 flex flex-col ${styles.spacing.sectionGap}`}>
            {/* Key Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className={`font-bold text-indigo-700 uppercase tracking-wider border-b-2 border-indigo-50 ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Skills Focus
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {skills.map((skill, idx) => (
                    <div key={idx}>
                      {skill.category && <p className={`font-bold text-slate-700 ${styles.fonts.sub}`}>{skill.category}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parseCommaList(skill.items).map((item, itemIdx) => (
                          <span key={itemIdx} className={`bg-indigo-50/70 text-indigo-700 px-2 py-0.5 rounded-md font-semibold ${styles.fonts.sub}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h2 className={`font-bold text-indigo-700 uppercase tracking-wider border-b-2 border-indigo-50 ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Certifications
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {cert.name && <p className="font-bold text-slate-700 leading-snug">{cert.name}</p>}
                      {cert.issuingOrganization && (
                        <p className="text-slate-500">
                          {cert.issuingOrganization}
                          {cert.credentialId && <span className="text-[8.5px] font-mono text-slate-400 ml-1">({cert.credentialId})</span>}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[8.5px] block mt-0.5 font-semibold">
                          View Credential
                        </a>
                      )}
                      <p className="text-slate-400 text-[8.5px] mt-0.5">{cert.issueDate} {cert.expirationDate ? `- ${cert.expirationDate}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div>
                <h2 className={`font-bold text-indigo-700 uppercase tracking-wider border-b-2 border-indigo-50 ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Honors
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {ach.title && <p className="font-bold text-slate-700 leading-snug">{ach.title}</p>}
                      {ach.description && <p className="text-slate-500 text-[9.5px] mt-0.5 leading-snug">{ach.description}</p>}
                      {ach.date && <p className="text-slate-400 text-[8.5px] mt-0.5">{ach.date}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Column */}
          <div className={`col-span-2 flex flex-col ${styles.spacing.sectionGap}`}>
            {/* Work Experience */}
            {experience.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Work Experience
                </h2>
                <div className={`flex flex-col relative pl-3 border-l border-slate-100 ${styles.spacing.itemGap}`}>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Node dot */}
                      <div className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white" />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          {exp.position && <h3 className={`font-bold text-slate-800 ${styles.fonts.title}`}>{exp.position}</h3>}
                          <p className={`text-indigo-600 font-bold ${styles.fonts.body}`}>
                            {exp.company || ''}{exp.location ? `, ${exp.location}` : ''}
                          </p>
                        </div>
                        <span className={`font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 whitespace-nowrap ${styles.fonts.sub}`}>
                          {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.description && (
                        <p className={`text-slate-600 mt-1 leading-relaxed whitespace-pre-line text-justify ${styles.fonts.body}`}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Projects */}
            {projects.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Technical Projects
                </h2>
                <div className={`flex flex-col pl-3 border-l border-slate-100 ${styles.spacing.itemGap}`}>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-white" />
                      <div className="flex justify-between items-baseline">
                        {proj.title && <h3 className={`font-bold text-slate-800 ${styles.fonts.title}`}>{proj.title}</h3>}
                        <div className={`flex gap-2 font-semibold ${styles.fonts.sub}`}>
                          {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">GitHub</a>}
                          {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Live Link</a>}
                        </div>
                      </div>
                      {proj.technologies && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parseCommaList(proj.technologies).map((tech, tIdx) => (
                            <span key={tIdx} className={`bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium ${styles.fonts.sub}`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {proj.description && (
                        <p className={`text-slate-600 mt-1 leading-relaxed text-justify ${styles.fonts.body}`}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Education
                </h2>
                <div className={`flex flex-col pl-3 border-l border-slate-100 ${styles.spacing.itemGap}`}>
                  {education.map((edu, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-white" />
                      <div className="flex justify-between items-start">
                        <div>
                          {edu.degree && (
                            <h3 className={`font-bold text-slate-800 ${styles.fonts.title}`}>
                              {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                            </h3>
                          )}
                          {edu.school && <p className={`text-slate-600 font-medium ${styles.fonts.body}`}>{edu.school}</p>}
                        </div>
                        <span className={`text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100 whitespace-nowrap ${styles.fonts.sub}`}>
                          {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                        </span>
                      </div>
                      {edu.description && (
                        <p className={`text-slate-500 mt-1 italic ${styles.fonts.sub}`}>
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Honors/Achievements */}
            {achievements.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Honors
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {ach.title && <p className="font-bold text-slate-800 leading-snug">{ach.title}</p>}
                      {ach.description && <p className="text-slate-500 text-[9.5px] mt-0.5 leading-snug">{ach.description}</p>}
                      {ach.date && <p className="text-slate-400 text-[8.5px] mt-0.5">{ach.date}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PROFESSIONAL TEMPLATE (CLEAN DUMMIES)
// ==========================================
export const ProfessionalTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certifications = [], achievements = [], config = {} } = data;
  const styles = getTemplateStyles(config);

  return (
    <div className={`bg-white text-slate-900 shadow-sm font-serif min-h-[29.7cm] w-full max-w-[21cm] mx-auto box-border leading-relaxed flex flex-col ${styles.spacing.padding} ${styles.fonts.body}`}>
      <div>
        {/* Centered Executive Header */}
        <div className={`text-center border-b-2 border-slate-800 flex flex-col items-center justify-center ${styles.spacing.headerPad}`}>
          {personalInfo.photo && (
            <div className="mb-3 relative">
              <img 
                src={personalInfo.photo} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-800 shadow-md"
              />
            </div>
          )}
          
          <h1 className={`font-bold tracking-wide text-slate-900 uppercase font-sans ${styles.fonts.name}`}>
            {personalInfo.firstName || ''} {personalInfo.lastName || ''}
          </h1>
          
          {/* Contact Strip */}
          <div className={`flex flex-wrap justify-center items-center gap-x-3.5 gap-y-1 mt-2 text-slate-700 font-sans ${styles.fonts.sub}`}>
            {personalInfo.address && (
              <span className="flex items-center gap-0.5"><MapPin size={11} className="text-slate-500" />{personalInfo.address}</span>
            )}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.email && <span>• {personalInfo.email}</span>}
            {personalInfo.website && (
              <span className="flex items-center gap-0.5">• <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.website.replace(/^https?:\/\//, '')}</a></span>
            )}
            {personalInfo.linkedin && (
              <span>• <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a></span>
            )}
            {personalInfo.github && (
              <span>• <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a></span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <div className={styles.spacing.margin}>
            <p className={`text-slate-800 text-justify leading-relaxed ${styles.fonts.summary}`}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* 1. Work Experience */}
        {experience.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
              Professional Experience
            </h2>
            <div className={`flex flex-col ${styles.spacing.itemGap}`}>
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-sans">
                    <div className="flex gap-1.5 items-baseline">
                      {exp.company && <span className={`font-bold text-slate-900 ${styles.fonts.body}`}>{exp.company}</span>}
                      {exp.location && <span className={`text-slate-500 font-medium ${styles.fonts.sub}`}>— {exp.location}</span>}
                    </div>
                    <span className={`text-slate-600 font-semibold ${styles.fonts.sub}`}>
                      {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.position && (
                    <div className={`italic text-slate-700 font-medium mt-0.5 font-sans ${styles.fonts.sub}`}>
                      {exp.position}
                    </div>
                  )}
                  {exp.description && (
                    <p className={`text-slate-800 mt-1 leading-relaxed text-justify whitespace-pre-line ${styles.fonts.body}`}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Projects */}
        {projects.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
              Technical Projects
            </h2>
            <div className={`flex flex-col ${styles.spacing.itemGap}`}>
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-sans">
                    {proj.title && <span className={`font-bold text-slate-900 ${styles.fonts.body}`}>{proj.title}</span>}
                    <div className={`flex gap-2 font-medium ${styles.fonts.sub}`}>
                      {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">GitHub</a>}
                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">Live Link</a>}
                    </div>
                  </div>
                  {proj.technologies && (
                    <p className={`text-slate-600 font-sans mt-0.5 font-semibold ${styles.fonts.sub}`}>
                      Technologies: {proj.technologies}
                    </p>
                  )}
                  {proj.description && (
                    <p className={`text-slate-800 mt-1 leading-relaxed text-justify ${styles.fonts.body}`}>
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Education */}
        {education.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
              Education
            </h2>
            <div className={`flex flex-col ${styles.spacing.itemGap}`}>
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-sans">
                    {edu.school && <span className={`font-bold text-slate-900 ${styles.fonts.body}`}>{edu.school}</span>}
                    <span className={`text-slate-600 font-semibold ${styles.fonts.sub}`}>
                      {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  {(edu.degree || edu.fieldOfStudy) && (
                    <div className={`text-slate-700 font-medium mt-0.5 font-sans ${styles.fonts.sub}`}>
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </div>
                  )}
                  {edu.description && (
                    <p className={`text-slate-600 mt-1 italic ${styles.fonts.sub}`}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                Key Skills
              </h2>
              <div className={`flex flex-col ${styles.spacing.itemGap} font-sans ${styles.fonts.sub}`}>
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex flex-col">
                    {skill.category && <span className="font-bold text-slate-800">{skill.category}:</span>}
                    <span className="text-slate-600 mt-0.5 leading-snug">{skill.items}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications and Achievements */}
          <div className="flex flex-col gap-3">
            {certifications.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Certifications
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {cert.name && <p className="font-bold text-slate-800 leading-snug">{cert.name}</p>}
                      {cert.issuingOrganization && (
                        <p className="text-slate-500">
                          {cert.issuingOrganization}
                          {cert.credentialId && <span className="text-[8.5px] font-mono text-slate-400 ml-1">({cert.credentialId})</span>}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[8.5px] block mt-0.5 font-semibold">
                          View Credential
                        </a>
                      )}
                      <p className="text-slate-400 text-[8.5px] mt-0.5">{cert.issueDate} {cert.expirationDate ? `- ${cert.expirationDate}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
                  Honors & Achievements
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap} ${styles.fonts.sub} text-slate-700 font-sans`}>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="leading-snug">
                      {ach.title && <span className="font-bold text-slate-800">{ach.title}</span>}
                      {ach.description ? `: ${ach.description}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MINIMAL TEMPLATE (CLEAN DUMMIES)
// ==========================================
export const MinimalTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certifications = [], achievements = [], config = {} } = data;
  const styles = getTemplateStyles(config);

  return (
    <div className={`bg-white text-stone-800 shadow-sm font-sans min-h-[29.7cm] w-full max-w-[21cm] mx-auto box-border leading-relaxed flex flex-col ${styles.spacing.padding} ${styles.fonts.body}`}>
      <div>
        {/* Centered / Flat Profile Header */}
        <div className={`flex flex-col items-center border-b border-stone-200 text-center ${styles.spacing.headerPad}`}>
          {personalInfo.photo && (
            <div className="mb-3">
              <img 
                src={personalInfo.photo} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover filter grayscale border border-stone-300 shadow-sm"
              />
            </div>
          )}
          
          <h1 className={`font-bold tracking-tight text-stone-900 uppercase ${styles.fonts.name}`}>
            {personalInfo.firstName || ''} {personalInfo.lastName || ''}
          </h1>
          
          {/* Flat Minimal Contact Panel */}
          <div className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 mt-2 text-stone-600 ${styles.fonts.sub}`}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.address && <span>• {personalInfo.address}</span>}
            {personalInfo.website && (
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline font-semibold text-stone-800">• Portfolio</a>
            )}
            {personalInfo.github && (
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline font-semibold text-stone-800">• GitHub</a>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline font-semibold text-stone-800">• LinkedIn</a>
            )}
          </div>
        </div>

        {/* Core Summary if available */}
        {personalInfo.summary && (
          <div className={`${styles.spacing.margin} text-stone-600 text-justify leading-relaxed ${styles.fonts.summary}`}>
            {personalInfo.summary}
          </div>
        )}

        {/* Grid structure for clean minimal layout */}
        <div className={`flex flex-col ${styles.spacing.sectionGap}`}>
          
          {/* Work Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className={`font-bold text-stone-400 uppercase tracking-widest mb-1.5 ${styles.fonts.sectionHeader}`}>
                Experience
              </h2>
              <div className={`border-t border-stone-100 flex flex-col ${styles.spacing.itemGap} pt-1.5`}>
                {experience.map((exp, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4">
                    <div className={`col-span-1 text-stone-500 font-semibold tracking-wider ${styles.fonts.sub}`}>
                      {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                    </div>
                    <div className="col-span-3">
                      {exp.position && <h3 className={`font-bold text-stone-900 ${styles.fonts.body}`}>{exp.position}</h3>}
                      <p className={`text-stone-600 font-medium ${styles.fonts.sub}`}>
                        {exp.company || ''} {exp.location ? `• ${exp.location}` : ''}
                      </p>
                      {exp.description && (
                        <p className={`text-stone-600 mt-1 leading-relaxed whitespace-pre-line text-justify ${styles.fonts.body}`}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className={`font-bold text-stone-400 uppercase tracking-widest mb-1.5 ${styles.fonts.sectionHeader}`}>
                Projects
              </h2>
              <div className={`border-t border-stone-100 flex flex-col ${styles.spacing.itemGap} pt-1.5`}>
                {projects.map((proj, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4">
                    <div className={`col-span-1 font-semibold text-stone-500 uppercase ${styles.fonts.sub}`}>
                      {proj.technologies ? parseCommaList(proj.technologies)[0] || 'Technical' : 'Project'}
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1.5">
                        {proj.title && <h3 className={`font-bold text-stone-900 ${styles.fonts.body}`}>{proj.title}</h3>}
                        <span className={`text-stone-400 ${styles.fonts.sub}`}>
                          {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="hover:underline text-stone-500 font-medium mr-1.5">GitHub</a>}
                          {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="hover:underline text-stone-500 font-medium">Link</a>}
                        </span>
                      </div>
                      {proj.technologies && (
                        <p className={`text-stone-500 italic mt-0.5 ${styles.fonts.sub}`}>
                          Build: {proj.technologies}
                        </p>
                      )}
                      {proj.description && (
                        <p className={`text-stone-600 mt-1 leading-relaxed text-justify ${styles.fonts.body}`}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className={`font-bold text-stone-400 uppercase tracking-widest mb-1.5 ${styles.fonts.sectionHeader}`}>
                Education
              </h2>
              <div className={`border-t border-stone-100 flex flex-col ${styles.spacing.itemGap} pt-1.5`}>
                {education.map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4">
                    <div className={`col-span-1 text-stone-500 font-semibold tracking-wider ${styles.fonts.sub}`}>
                      {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                    </div>
                    <div className="col-span-3">
                      {edu.degree && (
                        <h3 className={`font-bold text-stone-900 ${styles.fonts.body}`}>
                          {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                        </h3>
                      )}
                      {edu.school && <p className={`text-stone-600 ${styles.fonts.sub}`}>{edu.school}</p>}
                      {edu.description && (
                        <p className={`text-stone-500 mt-1 italic ${styles.fonts.sub}`}>
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className={`font-bold text-stone-400 uppercase tracking-widest mb-1.5 ${styles.fonts.sectionHeader}`}>
                Expertise
              </h2>
              <div className="border-t border-stone-100 pt-1.5 text-stone-700">
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex gap-2">
                      {skill.category && <span className={`font-bold text-stone-900 whitespace-nowrap min-w-[70px] ${styles.fonts.sub}`}>{skill.category}:</span>}
                      <span className={`text-stone-600 ${styles.fonts.sub}`}>{skill.items}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certs and Achievements Footer */}
          {(certifications.length > 0 || achievements.length > 0) && (
            <div className="grid grid-cols-2 gap-6 mt-1 pt-1.5 border-t border-stone-100">
              {certifications.length > 0 && (
                <div>
                  <h3 className={`font-bold text-stone-400 uppercase tracking-wider mb-1.5 ${styles.fonts.sectionHeader}`}>
                    Credentials
                  </h3>
                  <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                    {certifications.map((cert, idx) => (
                      <div key={idx} className={styles.fonts.sub}>
                        {cert.name && <p className="font-bold text-stone-800 leading-snug">{cert.name}</p>}
                        {cert.issuingOrganization && (
                          <p className="text-stone-500">
                            {cert.issuingOrganization}
                            {cert.credentialId && <span className="text-[8px] font-mono text-stone-400 ml-1">({cert.credentialId})</span>}
                          </p>
                        )}
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-stone-500 hover:underline text-[8px] block mt-0.5 font-semibold">
                            View Credential
                          </a>
                        )}
                        <p className="text-stone-400 text-[8px] mt-0.5">{cert.issueDate} {cert.expirationDate ? `- ${cert.expirationDate}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements.length > 0 && (
                <div>
                  <h3 className={`font-bold text-stone-400 uppercase tracking-wider mb-1.5 ${styles.fonts.sectionHeader}`}>
                    Honors
                  </h3>
                  <div className={`flex flex-col ${styles.spacing.itemGap} ${styles.fonts.sub} text-stone-600`}>
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="leading-tight">
                        {ach.title && <span className="font-semibold text-stone-800">{ach.title}</span>}
                        {ach.description && <span className="text-stone-500"> — {ach.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. NEW TEMPLATE: CREATIVE DESIGNER
// ==========================================
export const CreativeTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certifications = [], achievements = [], config = {} } = data;
  const styles = getTemplateStyles(config);

  return (
    <div className={`bg-white text-slate-800 p-0 shadow-sm font-sans min-h-[29.7cm] w-full max-w-[21cm] mx-auto box-border leading-relaxed overflow-hidden relative ${styles.fonts.body}`}>
      {/* Top Banner Gradient */}
      <div className="h-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 w-full" />
      
      <div className={styles.spacing.padding}>
        {/* Creative Centered Header */}
        <div className={`flex flex-col items-center justify-center text-center border-b border-slate-100 ${styles.spacing.headerPad}`}>
          {personalInfo.photo ? (
            <div className="mb-3 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-cyan-400 rounded-full blur-sm opacity-60 scale-105" />
              <img 
                src={personalInfo.photo} 
                alt="Profile Avatar" 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-3xl bg-indigo-50 flex items-center justify-center mb-2.5 text-indigo-600">
              <Award size={24} />
            </div>
          )}

          <h1 className={`font-extrabold tracking-tight bg-gradient-to-r from-violet-700 to-indigo-900 bg-clip-text text-slate-900 ${styles.fonts.name}`}>
            {personalInfo.firstName || ''} {personalInfo.lastName || ''}
          </h1>
          
          {personalInfo.summary && (
            <p className={`text-slate-500 font-medium max-w-xl mx-auto leading-normal ${styles.fonts.summary} ${styles.spacing.margin}`}>
              {personalInfo.summary}
            </p>
          )}

          {/* Social circular outline buttons */}
          <div className={`flex flex-wrap justify-center items-center gap-2 mt-3 ${styles.fonts.sub}`}>
            {personalInfo.email && (
              <span className="flex items-center gap-1 bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-bold">
                <Mail size={10} /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                <Phone size={10} /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.address && (
              <span className="flex items-center gap-1 bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-full font-bold">
                <MapPin size={10} /> {personalInfo.address}
              </span>
            )}
            {personalInfo.website && (
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold hover:bg-slate-200 transition-colors">
                <Globe size={10} /> Portfolio
              </a>
            )}
            {personalInfo.github && (
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold hover:bg-slate-200 transition-colors">
                <Github size={10} /> GitHub
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold hover:bg-slate-200 transition-colors">
                <Linkedin size={10} /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main Side (Experience, Projects) */}
          <div className={`col-span-2 flex flex-col ${styles.spacing.sectionGap}`}>
            {/* Work experience with left gradient border */}
            {experience.length > 0 && (
              <div>
                <h2 className={`font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider mb-3 ${styles.fonts.sectionHeader}`}>
                  Professional Journey
                </h2>
                <div className="flex flex-col gap-4 border-l-2 border-violet-100 pl-4.5">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="relative">
                      {/* Ring indicator */}
                      <div className="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-violet-500 shadow-sm" />
                      <div className="flex justify-between items-start">
                        <div>
                          {exp.position && <h3 className={`font-bold text-slate-800 ${styles.fonts.body}`}>{exp.position}</h3>}
                          <p className={`font-bold text-violet-600 ${styles.fonts.sub}`}>
                            {exp.company || ''}{exp.location ? `, ${exp.location}` : ''}
                          </p>
                        </div>
                        <span className={`font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 whitespace-nowrap ${styles.fonts.sub}`}>
                          {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.description && (
                        <p className={`text-slate-600 mt-1.5 leading-relaxed text-justify whitespace-pre-line ${styles.fonts.body}`}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Projects with custom graphic dots */}
            {projects.length > 0 && (
              <div>
                <h2 className={`font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent uppercase tracking-wider mb-3 ${styles.fonts.sectionHeader}`}>
                  Creative Projects
                </h2>
                <div className="flex flex-col gap-4 border-l-2 border-indigo-100 pl-4.5">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                      <div className="flex justify-between items-baseline font-sans">
                        {proj.title && <h3 className={`font-bold text-slate-800 ${styles.fonts.body}`}>{proj.title}</h3>}
                        <div className={`flex gap-2 font-bold text-indigo-600 ${styles.fonts.sub}`}>
                          {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="hover:underline">Source</a>}
                          {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="hover:underline">Live</a>}
                        </div>
                      </div>
                      {proj.technologies && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parseCommaList(proj.technologies).map((tech, tIdx) => (
                            <span key={tIdx} className={`bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100/50 ${styles.fonts.sub}`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {proj.description && (
                        <p className={`text-slate-600 mt-1.5 leading-relaxed text-justify ${styles.fonts.body}`}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (Skills, Education, Certs) */}
          <div className={`col-span-1 flex flex-col ${styles.spacing.sectionGap}`}>
            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <h3 className={`font-bold text-indigo-900 uppercase tracking-wider mb-3 ${styles.fonts.sectionHeader}`}>
                  Competencies
                </h3>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      {skill.category && <span className={`font-extrabold text-slate-500 uppercase ${styles.fonts.sub}`}>{skill.category}</span>}
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {parseCommaList(skill.items).map((item, itemIdx) => (
                          <span key={itemIdx} className={`bg-white text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-slate-200 shadow-2xs ${styles.fonts.sub}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 className={`font-bold text-indigo-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-indigo-50 ${styles.fonts.sectionHeader}`}>
                  Education
                </h3>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {education.map((edu, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {edu.degree && <h4 className="font-bold text-slate-800 leading-snug">{edu.degree}</h4>}
                      {edu.school && <p className="text-slate-500">{edu.school}</p>}
                      <span className="text-[8.5px] font-semibold text-slate-400 block mt-0.5">
                        {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            {certifications.length > 0 && (
              <div>
                <h3 className={`font-bold text-indigo-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-indigo-50 ${styles.fonts.sectionHeader}`}>
                  Credentials
                </h3>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {cert.name && <h4 className="font-bold text-slate-800 leading-snug">{cert.name}</h4>}
                      {cert.issuingOrganization && (
                        <p className="text-slate-500 text-[9px]">
                          {cert.issuingOrganization}
                          {cert.credentialId && <span className="text-[8px] font-mono text-slate-400 ml-1">({cert.credentialId})</span>}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[8px] block mt-0.5 font-semibold">
                          View Credential
                        </a>
                      )}
                      <p className="text-slate-400 text-[8px] mt-0.5">{cert.issueDate} {cert.expirationDate ? `- ${cert.expirationDate}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. NEW TEMPLATE: EXECUTIVE CORPORATE
// ==========================================
export const ExecutiveTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certifications = [], achievements = [], config = {} } = data;
  const styles = getTemplateStyles(config);

  return (
    <div className={`bg-white text-slate-900 shadow-sm font-serif min-h-[29.7cm] w-full max-w-[21cm] mx-auto box-border leading-relaxed flex flex-col ${styles.spacing.padding} ${styles.fonts.body}`}>
      <div>
        {/* Traditional Centered Executive Header with Gold/Navy Border */}
        <div className={`text-center border-b-2 border-amber-600 flex flex-col items-center justify-center ${styles.spacing.headerPad}`}>
          {personalInfo.photo && (
            <div className="mb-3 relative">
              <img 
                src={personalInfo.photo} 
                alt="Profile" 
                className="w-20 h-20 object-cover rounded-md border border-slate-300 shadow-md p-1 bg-white"
              />
            </div>
          )}
          
          <h1 className={`font-extrabold tracking-wide text-slate-900 font-serif leading-tight ${styles.fonts.name}`}>
            {personalInfo.firstName || ''} {personalInfo.lastName || ''}
          </h1>
          
          {/* Contact Strip */}
          <div className={`flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2.5 text-slate-600 uppercase font-sans tracking-wider font-semibold ${styles.fonts.sub}`}>
            {personalInfo.address && <span>{personalInfo.address}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.email && <span>• {personalInfo.email}</span>}
            {personalInfo.website && (
              <span>• <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:text-amber-700">{personalInfo.website.replace(/^https?:\/\//, '')}</a></span>
            )}
            {personalInfo.linkedin && (
              <span>• <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:text-amber-700">LinkedIn</a></span>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {personalInfo.summary && (
          <div className={styles.spacing.margin}>
            <p className={`text-slate-800 text-justify leading-relaxed italic ${styles.fonts.summary}`}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
              Professional Qualifications & History
            </h2>
            <div className={`flex flex-col ${styles.spacing.itemGap}`}>
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-sans">
                    <div className="flex gap-2 items-baseline">
                      {exp.company && <span className={`font-extrabold text-slate-900 ${styles.fonts.body}`}>{exp.company}</span>}
                      {exp.location && <span className={`text-slate-500 font-medium ${styles.fonts.sub}`}>• {exp.location}</span>}
                    </div>
                    <span className={`text-slate-600 font-bold tracking-wider ${styles.fonts.sub}`}>
                      {exp.startDate} – {exp.currentlyWorking ? 'PRESENT' : exp.endDate.toUpperCase()}
                    </span>
                  </div>
                  {exp.position && (
                    <div className={`italic text-slate-700 font-medium mt-0.5 font-sans ${styles.fonts.sub}`}>
                      {exp.position}
                    </div>
                  )}
                  {exp.description && (
                    <p className={`text-slate-800 mt-1.5 leading-relaxed text-justify whitespace-pre-line ${styles.fonts.body}`}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Projects */}
        {projects.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
              Core Ventures & Projects
            </h2>
            <div className={`flex flex-col ${styles.spacing.itemGap}`}>
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-sans">
                    {proj.title && <span className={`font-extrabold text-slate-900 uppercase ${styles.fonts.body}`}>{proj.title}</span>}
                    <div className={`flex gap-2.5 font-bold text-slate-600 ${styles.fonts.sub}`}>
                      {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="hover:underline">Repository</a>}
                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="hover:underline">Deployment</a>}
                    </div>
                  </div>
                  {proj.technologies && (
                    <p className={`text-slate-600 font-sans mt-0.5 font-bold tracking-wide uppercase ${styles.fonts.sub}`}>
                      Core Technologies: {proj.technologies}
                    </p>
                  )}
                  {proj.description && (
                    <p className={`text-slate-805 mt-1.5 leading-relaxed text-justify ${styles.fonts.body}`}>
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 font-sans ${styles.fonts.sectionHeader} ${styles.spacing.sectionHeaderPad}`}>
              Academic Background
            </h2>
            <div className={`flex flex-col ${styles.spacing.itemGap}`}>
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start font-sans">
                    {edu.school && <span className={`font-extrabold text-slate-900 ${styles.fonts.body}`}>{edu.school}</span>}
                    <span className={`text-slate-600 font-bold ${styles.fonts.sub}`}>
                      {edu.startDate} – {edu.currentlyStudying ? 'PRESENT' : edu.endDate}
                    </span>
                  </div>
                  {(edu.degree || edu.fieldOfStudy) && (
                    <div className={`text-slate-700 font-medium mt-0.5 font-sans ${styles.fonts.sub}`}>
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </div>
                  )}
                  {edu.description && (
                    <p className={`text-slate-500 mt-1.5 italic ${styles.fonts.sub}`}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Accolades Grid */}
        <div className="grid grid-cols-3 gap-6 pt-3 border-t border-slate-200">
          {/* Skills */}
          {skills.length > 0 && (
            <div className="col-span-2">
              <h2 className={`font-bold text-slate-900 uppercase tracking-widest mb-2 font-sans ${styles.fonts.sectionHeader}`}>
                Expertise & Skills
              </h2>
              <div className={`flex flex-col ${styles.spacing.itemGap} font-sans ${styles.fonts.sub}`}>
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    {skill.category && <span className="font-bold text-slate-900 whitespace-nowrap min-w-[80px] uppercase tracking-wider">{skill.category}:</span>}
                    <span className="text-slate-600 leading-snug">{skill.items}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          <div className="col-span-1">
            {certifications.length > 0 && (
              <div className="mb-4">
                <h2 className={`font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans ${styles.fonts.sectionHeader}`}>
                  Credentials
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {cert.name && <p className="font-bold text-slate-800 leading-snug">{cert.name}</p>}
                      {cert.issuingOrganization && (
                        <p className="text-slate-500 text-[9px]">
                          {cert.issuingOrganization}
                          {cert.credentialId && <span className="text-[8px] font-mono text-slate-400 ml-1">({cert.credentialId})</span>}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline text-[8px] block mt-0.5 font-semibold">
                          View Credential
                        </a>
                      )}
                      <p className="text-slate-400 text-[8px] mt-0.5">{cert.issueDate} {cert.expirationDate ? `- ${cert.expirationDate}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div>
                <h2 className={`font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans ${styles.fonts.sectionHeader}`}>
                  Accolades
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap} ${styles.fonts.sub} text-slate-700 font-sans`}>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="leading-snug">
                      {ach.title && <span className="font-bold text-slate-800">{ach.title}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. ELEGANT TEMPLATE (REFINED & SERIF-BASED)
// ==========================================
export const ElegantTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certifications = [], achievements = [], config = {} } = data;
  const styles = getTemplateStyles(config);

  return (
    <div className={`bg-[#fdfbf7] text-slate-800 shadow-sm font-serif min-h-[29.7cm] w-full max-w-[21cm] mx-auto box-border leading-relaxed flex flex-col ${styles.spacing.padding} ${styles.fonts.body}`}>
      <div>
        {/* Centered Sophisticated Header */}
        <div className={`text-center flex flex-col items-center justify-center border-b-2 border-double border-slate-700 ${styles.spacing.headerPad}`}>
          {personalInfo.photo && (
            <div className="mb-3 relative">
              <img 
                src={personalInfo.photo} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border border-slate-400 p-1 bg-white shadow-sm"
              />
            </div>
          )}
          
          <h1 className={`font-semibold tracking-wide text-slate-900 leading-tight uppercase ${styles.fonts.name}`}>
            {personalInfo.firstName || ''} {personalInfo.lastName || ''}
          </h1>
          
          {/* Elegant Sub-Header Detail Band */}
          <div className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-2.5 text-slate-600 font-sans tracking-wide ${styles.fonts.sub}`}>
            {personalInfo.address && <span>{personalInfo.address}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.email && <span>• {personalInfo.email}</span>}
            {personalInfo.website && (
              <span>• <a href={personalInfo.website} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">{personalInfo.website.replace(/^https?:\/\//, '')}</a></span>
            )}
            {personalInfo.linkedin && (
              <span>• <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">LinkedIn</a></span>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        {personalInfo.summary && (
          <div className={styles.spacing.margin}>
            <p className={`text-slate-700 text-justify leading-relaxed italic ${styles.fonts.summary}`}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-semibold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-2 font-sans ${styles.fonts.sectionHeader}`}>
              Professional Experience
            </h2>
            <div className={`flex flex-col ${styles.spacing.sectionGap}`}>
              {experience.map((exp, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between items-baseline font-sans">
                    <span className={`font-bold text-slate-800 ${styles.fonts.body}`}>
                      {exp.position}{exp.company ? ` | ${exp.company}` : ''}
                    </span>
                    <span className={`text-slate-600 text-xs font-semibold whitespace-nowrap`}>
                      {exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && <span className={`text-slate-500 italic mt-0.5 ${styles.fonts.sub}`}>{exp.location}</span>}
                  {exp.description && (
                    <p className={`text-slate-600 mt-1.5 leading-relaxed text-justify whitespace-pre-line ${styles.fonts.body}`}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Projects */}
        {projects.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-semibold text-slate-900 uppercase tracking-widest border-b border-slate-350 pb-0.5 mb-2 font-sans ${styles.fonts.sectionHeader}`}>
              Selected Projects
            </h2>
            <div className={`flex flex-col ${styles.spacing.sectionGap}`}>
              {projects.map((proj, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between items-baseline font-sans">
                    <span className={`font-bold text-slate-800 ${styles.fonts.body}`}>
                      {proj.title}
                    </span>
                    <div className={`flex gap-2 text-xs font-semibold`}>
                      {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">GitHub</a>}
                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">Live</a>}
                    </div>
                  </div>
                  {proj.technologies && (
                    <span className={`text-slate-500 italic mt-0.5 ${styles.fonts.sub}`}>
                      Technologies: {proj.technologies}
                    </span>
                  )}
                  {proj.description && (
                    <p className={`text-slate-600 mt-1 leading-relaxed text-justify ${styles.fonts.body}`}>
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education History */}
        {education.length > 0 && (
          <div className={styles.spacing.margin}>
            <h2 className={`font-semibold text-slate-900 uppercase tracking-widest border-b border-slate-350 pb-0.5 mb-2 font-sans ${styles.fonts.sectionHeader}`}>
              Education History
            </h2>
            <div className={`flex flex-col ${styles.spacing.sectionGap}`}>
              {education.map((edu, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between items-baseline font-sans">
                    <span className={`font-bold text-slate-800 ${styles.fonts.body}`}>
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </span>
                    <span className={`text-slate-600 text-xs font-semibold whitespace-nowrap`}>
                      {edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  {edu.school && <span className={`text-slate-500 italic mt-0.5 ${styles.fonts.sub}`}>{edu.school}</span>}
                  {edu.description && (
                    <p className={`text-slate-600 mt-1 italic ${styles.fonts.sub}`}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Certs Row */}
        <div className="grid grid-cols-2 gap-8 pt-3 border-t border-slate-200">
          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className={`font-semibold text-slate-900 uppercase tracking-widest mb-2 font-sans ${styles.fonts.sectionHeader}`}>
                Key Expertise
              </h2>
              <div className={`flex flex-col ${styles.spacing.itemGap} font-sans ${styles.fonts.sub}`}>
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex flex-col">
                    {skill.category && <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px]">{skill.category}:</span>}
                    <span className="text-slate-600 leading-snug">{skill.items}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          <div>
            {certifications.length > 0 && (
              <div className="mb-4">
                <h2 className={`font-semibold text-slate-900 uppercase tracking-widest mb-2 font-sans ${styles.fonts.sectionHeader}`}>
                  Certifications
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap}`}>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className={styles.fonts.sub}>
                      {cert.name && <p className="font-bold text-slate-800 leading-snug">{cert.name}</p>}
                      {cert.issuingOrganization && (
                        <p className="text-slate-500 text-[9px]">
                          {cert.issuingOrganization}
                          {cert.credentialId && <span className="text-[8px] font-mono text-slate-400 ml-1">({cert.credentialId})</span>}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline text-[8px] block mt-0.5 font-semibold font-sans">
                          Verify Credential
                        </a>
                      )}
                      <p className="text-slate-400 text-[8px] mt-0.5">{cert.issueDate} {cert.expirationDate ? `- ${cert.expirationDate}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div>
                <h2 className={`font-semibold text-slate-900 uppercase tracking-widest mb-2 font-sans ${styles.fonts.sectionHeader}`}>
                  Honors & Awards
                </h2>
                <div className={`flex flex-col ${styles.spacing.itemGap} ${styles.fonts.sub} text-slate-700`}>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="leading-snug">
                      {ach.title && <span className="font-bold text-slate-800 block">{ach.title}</span>}
                      {ach.description && <span className="text-slate-500 text-[9px] block">{ach.description}</span>}
                      {ach.date && <span className="text-slate-400 text-[8px] mt-0.5 block">{ach.date}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dispatcher Component based on selected template name
const ResumeTemplateDispatcher = ({ template = 'modern', data }) => {
  switch (template) {
    case 'professional':
      return <ProfessionalTemplate data={data} />;
    case 'minimal':
      return <MinimalTemplate data={data} />;
    case 'creative':
      return <CreativeTemplate data={data} />;
    case 'executive':
      return <ExecutiveTemplate data={data} />;
    case 'elegant':
      return <ElegantTemplate data={data} />;
    case 'modern':
    default:
      return <ModernTemplate data={data} />;
  }
};

export default ResumeTemplateDispatcher;
