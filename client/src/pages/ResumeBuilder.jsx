import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resumeService } from '../services/api';
import ResumeTemplateDispatcher from '../components/ResumeTemplates';
import { 
  ArrowLeft, Save, Download, History, RefreshCw, Layout, Sliders,
  User, BookOpen, Briefcase, Cpu, FolderGit, Award, ShieldAlert,
  Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  // States
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [toast, setToast] = useState(null);
  
  // Accordion toggle states for list sub-items
  const [openItems, setOpenItems] = useState({});
  // Version history dropdown state
  const [showHistory, setShowHistory] = useState(false);

  // Load resume data
  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resumeService.getResumeById(id);
      if (data.success) {
        setResume(data.resume);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load resume data. Please ensure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeDetails();
  }, [id]);

  // A4 Page Fit State
  const [pageFit, setPageFit] = useState({ height: 0, percent: 0, status: 'Measuring...', pages: 1 });

  // A4 Page Fit DOM observer utilizing ResizeObserver for active layout updates
  useEffect(() => {
    if (!resume || !previewRef.current) return;

    const computePageFit = () => {
      if (previewRef.current) {
        const heightPx = previewRef.current.offsetHeight;
        const singlePageHeight = 1122; // Standard A4 pixel height (29.7cm)
        const pageCount = Math.ceil(heightPx / singlePageHeight) || 1;
        const baseOffset = (pageCount - 1) * singlePageHeight;
        const currentPageHeight = heightPx - baseOffset;
        const fillPercent = Math.round((currentPageHeight / singlePageHeight) * 100);

        let status = 'Underfilled';
        if (pageCount === 1) {
          if (fillPercent >= 90 && fillPercent <= 100) {
            status = 'Perfect Fit (1 Page)';
          } else if (fillPercent > 100) {
            status = 'Overfilled (Multi-Page)';
          }
        } else {
          status = `Page ${pageCount} (Flowing)`;
        }

        setPageFit({
          height: heightPx,
          percent: fillPercent,
          status,
          pages: pageCount
        });
      }
    };

    // Execute slightly delayed to ensure initial render painting is complete
    const timer = setTimeout(computePageFit, 400);

    const resizeObserver = new ResizeObserver(computePageFit);
    if (previewRef.current) {
      resizeObserver.observe(previewRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [resume]);

  // Automated layout optimizer to perfectly fill the A4 canvas
  const handleAutoFitA4 = async () => {
    if (!previewRef.current || !resume) return;

    triggerToast('Analyzing page dimensions for A4 optimization...', 'success');

    const currentHeight = previewRef.current.offsetHeight;
    const targetHeight = 1122; // A4 standard boundary

    let bestFontSize = resume.config?.fontSize || 'medium';
    let bestSpacing = resume.config?.spacing || 'standard';

    if (currentHeight > targetHeight) {
      // Overfilled: Shrink layout spacing first, then font size
      if (bestSpacing === 'spacious') {
        bestSpacing = 'standard';
      } else if (bestSpacing === 'standard') {
        bestSpacing = 'compact';
      } else if (bestFontSize === 'large') {
        bestFontSize = 'medium';
        bestSpacing = 'standard';
      } else if (bestFontSize === 'medium') {
        bestFontSize = 'small';
        bestSpacing = 'standard';
      } else if (bestSpacing === 'compact') {
        bestFontSize = 'small';
        bestSpacing = 'compact';
      }
    } else {
      // Underfilled: Enlarge spacing first, then font size
      if (bestSpacing === 'compact') {
        bestSpacing = 'standard';
      } else if (bestSpacing === 'standard') {
        bestSpacing = 'spacious';
      } else if (bestFontSize === 'small') {
        bestFontSize = 'medium';
        bestSpacing = 'standard';
      } else if (bestFontSize === 'medium') {
        bestFontSize = 'large';
        bestSpacing = 'standard';
      } else if (bestSpacing === 'spacious') {
        bestFontSize = 'large';
        bestSpacing = 'spacious';
      }
    }

    const updatedResume = {
      ...resume,
      config: {
        ...(resume.config || {}),
        fontSize: bestFontSize,
        spacing: bestSpacing
      }
    };

    setResume(updatedResume);
    triggerToast(`A4 balancing applied: ${bestFontSize} font & ${bestSpacing} spacing!`, 'success');

    try {
      await resumeService.updateResume(resume._id, {
        ...updatedResume,
        createSnapshot: false
      });
    } catch (err) {
      console.error('Failed to sync optimized config settings:', err);
    }
  };

  // Helper to trigger toast alerts
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Toggle active item index in lists
  const toggleAccordion = (section, idx) => {
    const key = `${section}-${idx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Real-time text changes at root level (like resume title or template)
  const handleRootChange = (field, value) => {
    setResume(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Real-time personal info changes
  const handlePersonalInfoChange = (field, value) => {
    setResume(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Real-time layout config changes
  const handleConfigChange = (field, value) => {
    setResume(prev => {
      const newResume = {
        ...prev,
        config: {
          ...(prev.config || { fontSize: 'medium', spacing: 'standard' }),
          [field]: value
        }
      };
      // Soft-save to database asynchronously to avoid blocking UI thread
      resumeService.updateResume(newResume._id, {
        ...newResume,
        createSnapshot: false
      }).catch(err => console.error('Failed to sync config layout options:', err));
      return newResume;
    });
  };

  // Load premium high-fidelity prefill mock data to fill standard A4 layout
  const loadSparkPrefill = async () => {
    if (!resume) return;
    
    const confirmOverwrite = window.confirm(
      "Spark Prefill will overwrite your current details with a premium, high-fidelity resume blueprint designed to fit an A4 page perfectly. Continue?"
    );
    if (!confirmOverwrite) return;

    const prefillData = {
      ...resume,
      personalInfo: {
        firstName: 'Sumanth',
        lastName: 'Bhuma',
        email: 'sumanth.bhuma@example.com',
        phone: '+1 (555) 019-2834',
        website: 'https://sumanthbhuma.dev',
        github: 'https://github.com/sumanthbhuma',
        linkedin: 'https://linkedin.com/in/sumanthbhuma',
        address: 'San Francisco, CA',
        summary: 'Senior Full Stack Engineer with 6+ years of expertise in architecting high-performance web applications using React, Node.js, and TypeScript. Specializing in cloud infrastructure orchestration, distributed databases, and responsive design systems. Passionate about engineering premium user experiences and optimizing application performance at scale.',
        photo: resume.personalInfo?.photo || ''
      },
      education: [
        {
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: 'September 2016',
          endDate: 'May 2020',
          currentlyStudying: false,
          description: 'Graduated with Honors. Specialized in Software Engineering and Distributed Systems. Actively contributed to Open Source projects.'
        }
      ],
      experience: [
        {
          company: 'TechCorp Solutions',
          position: 'Senior Full Stack Engineer',
          location: 'San Francisco, CA',
          startDate: 'June 2022',
          endDate: 'Present',
          currentlyWorking: true,
          description: '• Spearheaded migration of legacy monolith to Node.js & React microservices, boosting page speeds by 40%.\n• Designed interactive custom visualization dashboards and real-time collaborative editors.\n• Mentored 5 developers, established testing suites (Jest/Cypress), and reduced deployment cycles by 30%.'
        },
        {
          company: 'Innovate Labs',
          position: 'Software Engineer II',
          location: 'Austin, TX',
          startDate: 'July 2020',
          endDate: 'May 2022',
          currentlyWorking: false,
          description: '• Developed high-throughput RESTful/GraphQL API layers supporting 10M+ daily transactions with Redis caching.\n• Crafted pixel-perfect, responsive client features incorporating glassmorphism and modern styling paradigms.'
        }
      ],
      projects: [
        {
          title: 'CloudSphere Orchestrator',
          description: 'A premium developer dashboard simplifying Kubernetes clusters and serverless deployment workflows. Integrates real-time Prometheus statistics and automatic SSL renewal.',
          technologies: 'React, TypeScript, Go, Kubernetes, Tailwind, Docker',
          link: 'https://cloudsphere.demo',
          github: 'https://github.com/sumanthbhuma/cloudsphere'
        }
      ],
      skills: [
        {
          category: 'Languages & Core Frameworks',
          items: 'JavaScript, TypeScript, React, Next.js, Node.js, Express, Go, Python, HTML5, CSS3'
        },
        {
          category: 'Cloud & Database Infrastructure',
          items: 'AWS, Google Cloud, Docker, Kubernetes, PostgreSQL, MongoDB, Redis, GraphQL, Git, CI/CD'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect – Professional',
          issuingOrganization: 'Amazon Web Services (AWS)',
          issueDate: 'October 2024',
          expirationDate: 'October 2027',
          credentialId: 'SAP-C02-9283',
          credentialUrl: 'https://aws.amazon.com/verification/SAP-C02-9283'
        }
      ],
      achievements: [
        {
          title: 'First Place - Global FinTech Hackathon',
          description: 'Led a team of four to design a secure, low-latency micro-lending engine, outperforming 120 global teams.',
          date: 'November 2023'
        }
      ],
      config: {
        fontSize: 'medium',
        spacing: 'standard'
      }
    };

    setResume(prefillData);

    try {
      setSaving(true);
      const data = await resumeService.updateResume(resume._id, {
        ...prefillData,
        createSnapshot: false
      });

      if (data.success) {
        setResume(data.resume);
        triggerToast('Spark Prefill loaded and successfully synced to database!', 'success');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Could not auto-save prefilled details to backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Parse existing PDF resume file to auto-fill personal details
  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    triggerToast('Reading and parsing PDF resume stream...', 'success');

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target.result;
      
      // 1. Email extraction
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
      const emailMatch = rawText.match(emailRegex);
      const email = emailMatch ? emailMatch[0] : '';

      // 2. Phone extraction
      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const phoneMatch = rawText.match(phoneRegex);
      const phone = phoneMatch ? phoneMatch[0] : '';

      // 3. LinkedIn extraction
      const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
      const linkedinMatch = rawText.match(linkedinRegex);
      const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '';

      // 4. GitHub extraction
      const githubRegex = /github\.com\/([a-zA-Z0-9_-]+)/i;
      const githubMatch = rawText.match(githubRegex);
      const github = githubMatch ? `https://github.com/${githubMatch[1]}` : '';

      // 5. Name parsing from file name
      const namePart = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      const cleanName = namePart.replace(/_|-|resume|cv/gi, ' ').trim();
      const words = cleanName.split(/\s+/).filter(Boolean);
      let firstName = '';
      let lastName = '';
      if (words.length > 0) {
        firstName = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        lastName = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      // 6. Address search (search City, State or ZIP)
      const addressRegex = /([a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?)/;
      const addressMatch = rawText.match(addressRegex);
      const address = addressMatch ? addressMatch[0] : '';

      // Update resume state with parsed values
      setResume(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: firstName || prev.personalInfo?.firstName || '',
          lastName: lastName || prev.personalInfo?.lastName || '',
          email: email || prev.personalInfo?.email || '',
          phone: phone || prev.personalInfo?.phone || '',
          linkedin: linkedin || prev.personalInfo?.linkedin || '',
          github: github || prev.personalInfo?.github || '',
          address: address || prev.personalInfo?.address || '',
        }
      }));

      triggerToast('Extracted personal details successfully!', 'success');
    };

    reader.readAsText(file);
  };

  // Update dynamic array structures (Education, Experience, Skills, etc.)
  const handleArrayItemChange = (arrayName, idx, field, value) => {
    setResume(prev => {
      const updatedArray = [...prev[arrayName]];
      updatedArray[idx] = {
        ...updatedArray[idx],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: updatedArray
      };
    });
  };

  // Add sub-item inside arrays
  const addArrayItem = (arrayName, defaultObj) => {
    setResume(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), defaultObj]
    }));
    
    // Automatically expand the newly created item
    const nextIdx = (resume[arrayName] || []).length;
    const key = `${arrayName}-${nextIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: true }));
  };

  // Remove sub-item from arrays
  const removeArrayItem = (arrayName, idx) => {
    setResume(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== idx)
    }));
    triggerToast(`Item deleted from ${arrayName}.`, 'success');
  };

  // Calculate resume completeness percentage
  const calculateProgress = () => {
    if (!resume) return 0;
    
    let score = 0;
    let max = 6; // Sections evaluated

    // 1. Personal info basics
    if (resume.personalInfo?.firstName && resume.personalInfo?.email) score += 1;
    // 2. Summary
    if (resume.personalInfo?.summary && resume.personalInfo.summary.length > 10) score += 1;
    // 3. Education
    if (resume.education && resume.education.length > 0) score += 1;
    // 4. Experience
    if (resume.experience && resume.experience.length > 0) score += 1;
    // 5. Skills
    if (resume.skills && resume.skills.length > 0) score += 1;
    // 6. Projects or Certifications
    if ((resume.projects && resume.projects.length > 0) || (resume.certifications && resume.certifications.length > 0)) score += 1;

    return Math.round((score / max) * 100);
  };

  // Save changes to database (PUT /api/resume/:id)
  const handleSave = async (createSnapshot = false) => {
    try {
      setSaving(true);
      const data = await resumeService.updateResume(resume._id, {
        ...resume,
        createSnapshot // Pass indicator to save this as a version snapshot
      });

      if (data.success) {
        setResume(data.resume);
        triggerToast(
          createSnapshot 
            ? `Successfully saved and recorded Version ${data.resume.versionNumber} snapshot!` 
            : 'Resume updates synced successfully!',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      triggerToast('Could not save data. Please check connection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Rollback to specific version snapshot
  const handleRollback = async (versionNum) => {
    try {
      setRollingBack(true);
      setShowHistory(false);
      const data = await resumeService.rollbackVersion(resume._id, versionNum);
      if (data.success) {
        setResume(data.resume);
        triggerToast(`Successfully rolled back to Version ${versionNum}!`, 'success');
      }
    } catch (err) {
      console.error(err);
      triggerToast(`Could not restore version ${versionNum}.`, 'error');
    } finally {
      setRollingBack(false);
    }
  };

  // High-fidelity PDF Download utilizing jspdf + html2canvas
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    try {
      triggerToast('Generating PDF file. Please hold...', 'success');
      
      const element = previewRef.current;
      
      // Create a temporary off-screen container for high-fidelity capture
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // Standard A4 width in px estimation or raw css length
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      // Clone the preview element into our temporary container
      const clone = element.cloneNode(true);
      clone.style.width = '100%';
      clone.style.transform = 'none';
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.padding = '0';
      container.appendChild(clone);

      // Configure html2canvas for standard high-res print outputs using our off-screen clone
      const canvas = await html2canvas(clone, {
        scale: 2, // Doubles resolution for crystal clear lettering
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0
      });

      // Cleanup immediately
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 standard width in mm
      const pageHeight = 297; // A4 standard height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // First page print
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Multipage adaptive rendering support with threshold boundary to prevent trailing blank pages
      while (heightLeft >= 10) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const filename = `${resume.personalInfo?.firstName || 'Resume'}_${resume.personalInfo?.lastName || 'Builder'}_CV.pdf`;
      pdf.save(filename);
      triggerToast('PDF generated and downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF export failed details:', err);
      triggerToast(`Failed to export PDF file: ${err.message || err}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Loading builder workspace...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md shadow-xl text-center">
          <ShieldAlert size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load workspace</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Unknown error occurred.'}</p>
          <Link to="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors">
      
      {/* Toast Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-sm font-semibold transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
            : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
        }`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Builder Sub-Header Controls Panel */}
      <header className="sticky top-16 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850/80 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 transition-colors cursor-pointer"
            title="Go back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <input
              type="text"
              value={resume.title}
              onChange={(e) => handleRootChange('title', e.target.value)}
              className="text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-600 px-1 py-0.5 outline-none transition-colors max-w-[250px]"
              placeholder="Resume Name"
            />
            
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <Layout size={12} className="text-slate-400" />
              <select
                value={resume.template}
                onChange={(e) => handleRootChange('template', e.target.value)}
                className="bg-transparent font-bold capitalize outline-none cursor-pointer"
              >
                <option value="modern">Modern</option>
                <option value="professional">Professional</option>
                <option value="minimal">Minimal</option>
                <option value="creative">Creative</option>
                <option value="executive">Executive</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global actions bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Resume</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Builder layout space */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT COLUMN: Input form elements */}
        <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 p-6 flex flex-col gap-6 no-print">
          {/* Progress bar container */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-500" />
                <span>Resume Strength Progress</span>
              </span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{progress}%</span>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* A4 Page Fit Customizer */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={12} className="text-indigo-500" />
                <span>A4 Page Fit Customizer</span>
              </span>
              
              <button
                onClick={loadSparkPrefill}
                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Prefill resume with high-quality sample data that perfectly balances an A4 layout"
              >
                <Sparkles size={10} className="animate-pulse" />
                <span>Spark Prefill</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Font Size Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">
                  Font Size
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-700/60">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleConfigChange('fontSize', size)}
                      className={`flex-1 text-center py-1 rounded-lg text-[10px] font-extrabold capitalize transition-all duration-150 cursor-pointer ${
                        (resume?.config?.fontSize || 'medium') === size
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Spacing Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1.5">
                  Page Spacing
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-700/60">
                  {['compact', 'standard', 'spacious'].map((space) => (
                    <button
                      key={space}
                      onClick={() => handleConfigChange('spacing', space)}
                      className={`flex-1 text-center py-1 rounded-lg text-[10px] font-extrabold capitalize transition-all duration-150 cursor-pointer ${
                        (resume?.config?.spacing || 'standard') === space
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {space === 'spacious' ? 'Spaced' : space === 'compact' ? 'Tight' : 'Std'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time A4 height progress bar and auto-fit trigger */}
            <div className="mt-2 pt-2.5 border-t border-slate-200/40 dark:border-slate-800/60 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    pageFit.status.includes('Perfect') 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                      : pageFit.status.includes('Overfilled') 
                        ? 'bg-rose-500 animate-pulse' 
                        : 'bg-indigo-500'
                  }`} />
                  <span>A4 Page Fill Audit</span>
                </span>
                <span className={`${
                  pageFit.status.includes('Perfect') 
                    ? 'text-emerald-600 dark:text-emerald-450 font-extrabold' 
                    : pageFit.status.includes('Overfilled') 
                      ? 'text-rose-600 dark:text-rose-450 font-extrabold' 
                      : 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                }`}>
                  {pageFit.status} ({pageFit.percent}%)
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    pageFit.status.includes('Perfect') 
                      ? 'bg-emerald-500' 
                      : pageFit.status.includes('Overfilled') 
                        ? 'bg-rose-500' 
                        : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, pageFit.percent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal max-w-[65%]">
                  Target: 90% - 100% height for single page layout symmetry.
                </span>
                <button
                  onClick={handleAutoFitA4}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-extrabold flex items-center gap-1 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  title="Automatically adjusts font scale and layout margins to perfectly balance page height"
                >
                  <RefreshCw size={9} />
                  <span>Auto-Fit Page</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form tab selector strip */}
          <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 -mx-2 px-2 scrollbar-none">
            {[
              { id: 'personal', label: 'Personal', icon: <User size={13} /> },
              { id: 'education', label: 'Education', icon: <BookOpen size={13} /> },
              { id: 'experience', label: 'Experience', icon: <Briefcase size={13} /> },
              { id: 'skills', label: 'Skills', icon: <Cpu size={13} /> },
              { id: 'projects', label: 'Projects', icon: <FolderGit size={13} /> },
              { id: 'certifications', label: 'Certs', icon: <Award size={13} /> },
              { id: 'achievements', label: 'Honors', icon: <Award size={13} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab views content area */}
          <div className="flex-grow overflow-y-auto max-h-[calc(100vh-22rem)] pr-1">
            
            {/* 1. PERSONAL INFORMATION FORM */}
            {activeTab === 'personal' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Contact Information Details</h3>
                
                {/* PDF Import Upload zone */}
                <div className="p-4.5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-dashed border-indigo-250 dark:border-indigo-850 flex flex-col items-center gap-2.5 text-center transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Download size={18} className="rotate-180" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Import Details from Existing PDF</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Upload an existing PDF resume to automatically scan, extract contact information, and pre-fill details!
                    </p>
                  </div>
                  <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5">
                    <span>Upload PDF Resume</span>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={handlePDFUpload} 
                    />
                  </label>
                </div>
                
                {/* Photo upload area */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-indigo-500 shadow-inner shrink-0">
                    {resume.personalInfo?.photo ? (
                      <img 
                        src={resume.personalInfo.photo} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Profile Picture</span>
                    <p className="text-[10px] text-slate-400">PNG or JPG formats supported.</p>
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm">
                        Upload Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handlePersonalInfoChange('photo', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {resume.personalInfo?.photo && (
                        <button 
                          type="button"
                          onClick={() => handlePersonalInfoChange('photo', '')}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-extrabold transition-colors border border-rose-200 dark:border-rose-900 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                    <input
                      type="text"
                      value={resume.personalInfo?.firstName || ''}
                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                    <input
                      type="text"
                      value={resume.personalInfo?.lastName || ''}
                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={resume.personalInfo?.email || ''}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all"
                      placeholder="e.g. johndoe@gmail.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={resume.personalInfo?.phone || ''}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all"
                      placeholder="e.g. +1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Home Address / Location</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.address || ''}
                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                    className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Personal Website</label>
                    <input
                      type="url"
                      value={resume.personalInfo?.website || ''}
                      onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all"
                      placeholder="e.g. portfolio.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GitHub Link</label>
                    <input
                      type="url"
                      value={resume.personalInfo?.github || ''}
                      onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-855 rounded-xl text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all"
                      placeholder="e.g. github.com/username"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LinkedIn Link</label>
                    <input
                      type="url"
                      value={resume.personalInfo?.linkedin || ''}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-855 rounded-xl text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all"
                      placeholder="e.g. linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={resume.personalInfo?.summary || ''}
                    onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                    className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all"
                    placeholder="Brief professional bio highlighting your experience, key competencies, and career goals."
                  />
                </div>
              </div>
            )}

            {/* 2. EDUCATION FORM */}
            {activeTab === 'education' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Academic Background</h3>
                  <button
                    onClick={() => addArrayItem('education', { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', currentlyStudying: false, description: '' })}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add School</span>
                  </button>
                </div>

                {resume.education?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">No educational history loaded. Click Add School above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resume.education.map((edu, idx) => {
                      const isExpanded = openItems[`education-${idx}`];
                      return (
                        <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-850/30 overflow-hidden">
                          <div 
                            onClick={() => toggleAccordion('education', idx)}
                            className="p-3.5 flex justify-between items-center cursor-pointer bg-slate-100/50 dark:bg-slate-850 text-xs font-bold"
                          >
                            <span className="truncate">{edu.degree ? `${edu.degree} - ${edu.school || 'Unspecified'}` : 'New Education Entry'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeArrayItem('education', idx); }}
                                className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 flex flex-col gap-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">School / University</label>
                                  <input
                                    type="text"
                                    value={edu.school || ''}
                                    onChange={(e) => handleArrayItemChange('education', idx, 'school', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Stanford University"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Degree</label>
                                  <input
                                    type="text"
                                    value={edu.degree || ''}
                                    onChange={(e) => handleArrayItemChange('education', idx, 'degree', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Bachelor of Science"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Field of Study</label>
                                  <input
                                    type="text"
                                    value={edu.fieldOfStudy || ''}
                                    onChange={(e) => handleArrayItemChange('education', idx, 'fieldOfStudy', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Computer Science"
                                  />
                                </div>
                                
                                <div className="flex flex-col gap-1 justify-center pt-5.5">
                                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={edu.currentlyStudying || false}
                                      onChange={(e) => handleArrayItemChange('education', idx, 'currentlyStudying', e.target.checked)}
                                      className="rounded"
                                    />
                                    <span>Currently Studying</span>
                                  </label>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
                                  <input
                                    type="text"
                                    value={edu.startDate || ''}
                                    onChange={(e) => handleArrayItemChange('education', idx, 'startDate', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Sept 2022"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">End Date</label>
                                  <input
                                    type="text"
                                    value={edu.endDate || ''}
                                    disabled={edu.currentlyStudying}
                                    onChange={(e) => handleArrayItemChange('education', idx, 'endDate', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs disabled:opacity-50"
                                    placeholder="e.g. June 2026"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Notes / Achievements (Optional)</label>
                                <textarea
                                  value={edu.description || ''}
                                  onChange={(e) => handleArrayItemChange('education', idx, 'description', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                  placeholder="e.g. GPA 3.9, Dean's List honors"
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. EXPERIENCE FORM */}
            {activeTab === 'experience' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Professional History</h3>
                  <button
                    onClick={() => addArrayItem('experience', { company: '', position: '', location: '', startDate: '', endDate: '', currentlyWorking: false, description: '' })}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Position</span>
                  </button>
                </div>

                {resume.experience?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">No experience recorded yet. Click Add Position above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resume.experience.map((exp, idx) => {
                      const isExpanded = openItems[`experience-${idx}`];
                      return (
                        <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-850/30 overflow-hidden">
                          <div 
                            onClick={() => toggleAccordion('experience', idx)}
                            className="p-3.5 flex justify-between items-center cursor-pointer bg-slate-100/50 dark:bg-slate-850 text-xs font-bold"
                          >
                            <span className="truncate">{exp.position ? `${exp.position} - ${exp.company || 'Unspecified'}` : 'New Experience Entry'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeArrayItem('experience', idx); }}
                                className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 flex flex-col gap-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Company Name</label>
                                  <input
                                    type="text"
                                    value={exp.company || ''}
                                    onChange={(e) => handleArrayItemChange('experience', idx, 'company', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Google"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Position Title</label>
                                  <input
                                    type="text"
                                    value={exp.position || ''}
                                    onChange={(e) => handleArrayItemChange('experience', idx, 'position', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Software Engineer"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Job Location</label>
                                  <input
                                    type="text"
                                    value={exp.location || ''}
                                    onChange={(e) => handleArrayItemChange('experience', idx, 'location', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Mountain View, CA"
                                  />
                                </div>
                                
                                <div className="flex flex-col gap-1 justify-center pt-5.5">
                                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={exp.currentlyWorking || false}
                                      onChange={(e) => handleArrayItemChange('experience', idx, 'currentlyWorking', e.target.checked)}
                                      className="rounded"
                                    />
                                    <span>Currently Employed</span>
                                  </label>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
                                  <input
                                    type="text"
                                    value={exp.startDate || ''}
                                    onChange={(e) => handleArrayItemChange('experience', idx, 'startDate', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Jan 2021"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">End Date</label>
                                  <input
                                    type="text"
                                    value={exp.endDate || ''}
                                    disabled={exp.currentlyWorking}
                                    onChange={(e) => handleArrayItemChange('experience', idx, 'endDate', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs disabled:opacity-50"
                                    placeholder="e.g. Present"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Role Description & Achievements</label>
                                <textarea
                                  value={exp.description || ''}
                                  onChange={(e) => handleArrayItemChange('experience', idx, 'description', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs leading-relaxed"
                                  placeholder="Describe core duties and quantitative accomplishments (e.g. Engineered React structures increasing speed of loading page by 25%)."
                                  rows={4}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. SKILLS FORM */}
            {activeTab === 'skills' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Key Competencies</h3>
                  <button
                    onClick={() => addArrayItem('skills', { category: '', items: '' })}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Skill Group</span>
                  </button>
                </div>

                {resume.skills?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">No competencies added yet. Click Add Skill Group above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resume.skills.map((skill, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col gap-3 relative">
                        <button
                          onClick={() => removeArrayItem('skills', idx)}
                          className="absolute top-3 right-3 text-rose-500 p-1 bg-white dark:bg-slate-850 hover:bg-rose-50 rounded border border-slate-100 dark:border-slate-800 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                        
                        <div className="flex flex-col gap-1 w-[88%]">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Skill Category</label>
                          <input
                            type="text"
                            value={skill.category || ''}
                            onChange={(e) => handleArrayItemChange('skills', idx, 'category', e.target.value)}
                            className="p-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-850 rounded-xl outline-none text-xs font-semibold"
                            placeholder="e.g. Frontend Languages / Developer Tools"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Items (Comma separated list)</label>
                          <input
                            type="text"
                            value={skill.items || ''}
                            onChange={(e) => handleArrayItemChange('skills', idx, 'items', e.target.value)}
                            className="p-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-850 rounded-xl outline-none text-xs"
                            placeholder="e.g. React, JavaScript, HTML5, Tailwind CSS"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. PROJECTS FORM */}
            {activeTab === 'projects' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Featured Projects</h3>
                  <button
                    onClick={() => addArrayItem('projects', { title: '', description: '', technologies: '', link: '', github: '' })}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Project</span>
                  </button>
                </div>

                {resume.projects?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">No projects recorded. Click Add Project above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resume.projects.map((proj, idx) => {
                      const isExpanded = openItems[`projects-${idx}`];
                      return (
                        <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-850/30 overflow-hidden">
                          <div 
                            onClick={() => toggleAccordion('projects', idx)}
                            className="p-3.5 flex justify-between items-center cursor-pointer bg-slate-100/50 dark:bg-slate-850 text-xs font-bold"
                          >
                            <span className="truncate">{proj.title || 'New Project Entry'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeArrayItem('projects', idx); }}
                                className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 flex flex-col gap-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Project Title</label>
                                <input
                                  type="text"
                                  value={proj.title || ''}
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'title', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                  placeholder="e.g. Resume Builder & Analyzer app"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">GitHub URL</label>
                                  <input
                                    type="url"
                                    value={proj.github || ''}
                                    onChange={(e) => handleArrayItemChange('projects', idx, 'github', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. github.com/myusername/project"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Live Demo Link</label>
                                  <input
                                    type="url"
                                    value={proj.link || ''}
                                    onChange={(e) => handleArrayItemChange('projects', idx, 'link', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                    placeholder="e.g. project.vercel.app"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Technologies Used (Comma list)</label>
                                <input
                                  type="text"
                                  value={proj.technologies || ''}
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'technologies', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                  placeholder="e.g. React.js, Express, MongoDB, Tailwind"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Project Description</label>
                                <textarea
                                  value={proj.description || ''}
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'description', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                  placeholder="Summarize core scope, tech details, and outcome metrics of this project."
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 6. CERTIFICATIONS FORM */}
            {activeTab === 'certifications' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Professional Certifications</h3>
                  <button
                    onClick={() => addArrayItem('certifications', { name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' })}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Certification</span>
                  </button>
                </div>

                {resume.certifications?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">No credentials recorded. Click Add Certification above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resume.certifications.map((cert, idx) => {
                      const isExpanded = openItems[`certifications-${idx}`];
                      return (
                        <div key={idx} className="border border-slate-200 dark:border-slate-805 rounded-xl bg-slate-50 dark:bg-slate-850/30 overflow-hidden">
                          <div 
                            onClick={() => toggleAccordion('certifications', idx)}
                            className="p-3.5 flex justify-between items-center cursor-pointer bg-slate-100/50 dark:bg-slate-850 text-xs font-bold"
                          >
                            <span className="truncate">{cert.name || 'New Certification Entry'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeArrayItem('certifications', idx); }}
                                className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 flex flex-col gap-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Certification Name</label>
                                <input
                                  type="text"
                                  value={cert.name || ''}
                                  onChange={(e) => handleArrayItemChange('certifications', idx, 'name', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-xs"
                                  placeholder="e.g. AWS Certified Solutions Architect"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Issuing Organization</label>
                                <input
                                  type="text"
                                  value={cert.issuingOrganization || ''}
                                  onChange={(e) => handleArrayItemChange('certifications', idx, 'issuingOrganization', e.target.value)}
                                  className="p-2.5 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-905 rounded-lg outline-none text-xs"
                                  placeholder="e.g. Amazon Web Services"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Issue Date</label>
                                  <input
                                    type="text"
                                    value={cert.issueDate || ''}
                                    onChange={(e) => handleArrayItemChange('certifications', idx, 'issueDate', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-905 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Oct 2023"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Expiration Date (Optional)</label>
                                  <input
                                    type="text"
                                    value={cert.expirationDate || ''}
                                    onChange={(e) => handleArrayItemChange('certifications', idx, 'expirationDate', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-905 rounded-lg outline-none text-xs"
                                    placeholder="e.g. Oct 2026"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Credential ID</label>
                                  <input
                                    type="text"
                                    value={cert.credentialId || ''}
                                    onChange={(e) => handleArrayItemChange('certifications', idx, 'credentialId', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-905 rounded-lg outline-none text-xs"
                                    placeholder="e.g. AWS-12345"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Credential URL</label>
                                  <input
                                    type="url"
                                    value={cert.credentialUrl || ''}
                                    onChange={(e) => handleArrayItemChange('certifications', idx, 'credentialUrl', e.target.value)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-905 rounded-lg outline-none text-xs"
                                    placeholder="e.g. credly.com/aws/..."
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 7. ACHIEVEMENTS FORM */}
            {activeTab === 'achievements' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Academic & Professional Honors</h3>
                  <button
                    onClick={() => addArrayItem('achievements', { title: '', description: '', date: '' })}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Honor</span>
                  </button>
                </div>

                {resume.achievements?.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">No honors recorded yet. Click Add Honor above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {resume.achievements.map((ach, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col gap-3 relative">
                        <button
                          onClick={() => removeArrayItem('achievements', idx)}
                          className="absolute top-3 right-3 text-rose-500 p-1 bg-white dark:bg-slate-850 hover:bg-rose-50 rounded border border-slate-100 dark:border-slate-800 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="flex flex-col gap-1 w-[88%]">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Honor Title</label>
                          <input
                            type="text"
                            value={ach.title || ''}
                            onChange={(e) => handleArrayItemChange('achievements', idx, 'title', e.target.value)}
                            className="p-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-850 rounded-xl outline-none text-xs font-semibold"
                            placeholder="e.g. 1st Place out of 200 in Hackathon"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Description (Optional)</label>
                            <input
                              type="text"
                              value={ach.description || ''}
                              onChange={(e) => handleArrayItemChange('achievements', idx, 'description', e.target.value)}
                              className="p-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-850 rounded-xl outline-none text-xs"
                              placeholder="Describe honor context"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Date Received</label>
                            <input
                              type="text"
                              value={ach.date || ''}
                              onChange={(e) => handleArrayItemChange('achievements', idx, 'date', e.target.value)}
                              className="p-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-850 rounded-xl outline-none text-xs"
                              placeholder="e.g. Nov 2023"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Live Template Preview sticky panel */}
        <div className="bg-slate-200 dark:bg-slate-900/60 p-6 overflow-y-auto max-h-[calc(100vh-8.5rem)] flex items-start justify-center">
          
          <div className="sticky top-6 w-full max-w-[21cm] flex flex-col gap-4">
            
            {/* Template dynamic layout renderer */}
            <div 
              ref={previewRef}
              id="resume-preview-container" 
              className="w-full origin-top shadow-xl rounded-sm overflow-hidden"
            >
              <ResumeTemplateDispatcher 
                template={resume.template} 
                data={resume} 
              />
            </div>
            
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              💡 Preview fits adaptively into A4 margins. Changes saved manually via Quick Sync or Snapshots.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ResumeBuilder;
