import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { atsService, resumeService } from '../services/api';
import { 
  Sparkles, FileText, Upload, Brain, CheckCircle2, AlertTriangle, 
  RefreshCw, Copy, BookOpen, Layers, Award, ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react';

const AtsAnalyzer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryResumeId = searchParams.get('resumeId') || '';

  // Data Loading & Selection States
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(queryResumeId);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploadMode, setUploadMode] = useState(queryResumeId ? 'database' : 'file'); // 'file' or 'database'
  
  // API Response States
  const [loading, setLoading] = useState(false);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  // Copilot Rewriter States
  const [originalBullet, setOriginalBullet] = useState('');
  const [rewriteContext, setRewriteContext] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const [rewrittenBullets, setRewrittenBullets] = useState([]);

  // Fetch list of resumes for the database selector dropdown
  useEffect(() => {
    const loadResumes = async () => {
      try {
        setResumesLoading(true);
        const data = await resumeService.getAllResumes();
        if (data.success) {
          setResumes(data.resumes);
          // If no query parameter but we have resumes, pre-select the first one
          if (!selectedResumeId && data.resumes.length > 0) {
            setSelectedResumeId(data.resumes[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching resumes:', err);
      } finally {
        setResumesLoading(false);
      }
    };
    loadResumes();
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        triggerToast('Only PDF files are supported for parsing!', 'error');
        return;
      }
      setSelectedFile(file);
      triggerToast('PDF resume loaded successfully!');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        triggerToast('Only PDF files are supported for parsing!', 'error');
        return;
      }
      setSelectedFile(file);
      triggerToast('PDF resume loaded successfully!');
    }
  };

  // Submits the resume scan to the backend
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      triggerToast('Please provide a target Job Description first.', 'error');
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      triggerToast('Please drop or upload your Resume PDF file.', 'error');
      return;
    }

    if (uploadMode === 'database' && !selectedResumeId) {
      triggerToast('Please select a saved resume to analyze.', 'error');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append('jobDescription', jobDescription);

      if (uploadMode === 'file') {
        formData.append('resume', selectedFile);
      } else {
        formData.append('resumeId', selectedResumeId);
      }

      const response = await atsService.analyze(formData);
      if (response.success) {
        setResult(response);
        triggerToast('ATS scan audit completed successfully!');
        // Pre-fill rewrite context with the first missing skill if available
        if (response.missingSkills && response.missingSkills.length > 0) {
          setRewriteContext(response.missingSkills[0]);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'ATS analysis query failed. Check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Rewrites selected text using local fallback / Gemini AI
  const handleRewrite = async () => {
    if (!originalBullet.trim()) {
      triggerToast('Please type or paste a project bullet point to rewrite.', 'error');
      return;
    }

    try {
      setRewriting(true);
      setRewrittenBullets([]);
      const response = await atsService.aiRewrite(originalBullet, rewriteContext || 'General Experience');
      if (response.success) {
        setRewrittenBullets(response.rewrites);
        triggerToast(response.isAiConfigured ? 'AI Rewrites generated!' : 'Offline rewrites loaded!');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to rewrite bullet point.', 'error');
    } finally {
      setRewriting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    triggerToast('Copied to clipboard successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-sm font-semibold transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-450' 
            : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header Branding */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/30 dark:from-indigo-950/40 dark:via-indigo-950/70 dark:to-slate-950 p-8 sm:p-10 rounded-3xl text-slate-800 dark:text-white border border-indigo-100/50 dark:border-slate-800/40 shadow-sm dark:shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-2xl" />
          
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-white/10 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide w-fit border border-indigo-100/30 dark:border-white/5 backdrop-blur-md text-indigo-650 dark:text-pink-300">
            <Brain size={13} className="animate-pulse text-indigo-650 dark:text-pink-400" />
            <span>AI Resume Intelligence & ATS Auditor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:via-indigo-100 dark:to-indigo-200 bg-clip-text text-transparent">
            ATS Compatibility Analyzer
          </h1>
          <p className="text-slate-600 dark:text-indigo-200 text-sm sm:text-base mt-1 leading-relaxed font-medium">
            Audit your resume compatibility against real-world Applicant Tracking Systems. Highlight critical skill gaps, keyword stuffing flags, and leverage Google Gemini AI to polish your profile.
          </p>
        </div>

        {/* Input Control Space (Grid side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Upload controls */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileText size={16} className="text-indigo-500" />
                <span>1. Select Resume Source</span>
              </h2>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-extrabold border border-slate-200/20">
                <button
                  onClick={() => setUploadMode('database')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    uploadMode === 'database' ? 'bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  My Drafts
                </button>
                <button
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    uploadMode === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  PDF Upload
                </button>
              </div>
            </div>

            {uploadMode === 'database' ? (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Drafted Resume
                </label>
                {resumesLoading ? (
                  <div className="py-2.5 text-center text-xs text-slate-400">Loading your resumes...</div>
                ) : resumes.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl text-center text-xs text-slate-550 border">
                    No active resume drafts found. Start building a resume, or toggle to **PDF Upload**!
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 text-sm font-semibold transition-colors"
                  >
                    {resumes.map(r => (
                      <option key={r._id} value={r._id}>{r.title} (V{r.versionNumber})</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl text-center transition-all hover:bg-slate-100/50"
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-4 shadow-inner">
                  <Upload size={22} />
                </div>
                
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'Drag & Drop Resume PDF'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed mb-4">
                  {selectedFile 
                    ? `Size: ${(selectedFile.size / 1024).toFixed(1)} KB. Ready for audit scan!`
                    : 'Extract text contents and evaluate compliance parameters in seconds.'
                  }
                </p>

                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5">
                  <span>Browse PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}

            {/* Quick reminder card */}
            <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/30 rounded-2xl flex gap-3 text-xs">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-indigo-900 dark:text-indigo-400">Under the Hood NLP</p>
                <p className="text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                  Our system filters stop words, maps technical abbreviations (like k8s to Kubernetes), and checks section compliance completely locally before calling AI elements.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Job description input */}
          <div className="lg:col-span-7 flex flex-col gap-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm justify-between">
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                <BookOpen size={16} className="text-indigo-500" />
                <span>2. Target Job Description</span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Paste the requirements or description from the hiring board (e.g. LinkedIn, Indeed) to analyze overlap.
              </p>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description details here... (e.g., We are looking for a Senior Full Stack Engineer specializing in React, Node.js, and MongoDB with experience building AWS cloud pipelines...)"
              className="flex-grow min-h-[160px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 text-sm leading-relaxed transition-all resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 text-white font-extrabold rounded-2xl shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Auditing Resume Metrics...</span>
                </>
              ) : (
                <>
                  <Brain size={16} />
                  <span>Run Comprehensive ATS Scan Audit</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RESULTS PANEL: Renders when scan completes */}
        {result && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* Score Ring Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              
              {/* Radial ATS Score */}
              <div className="md:border-r border-slate-100 dark:border-slate-850/80 flex flex-col items-center justify-center p-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`transition-all duration-1000 ${
                        result.atsScore >= 75 
                          ? 'text-emerald-500' 
                          : result.atsScore >= 45 
                            ? 'text-amber-500' 
                            : 'text-rose-500'
                      }`}
                      strokeDasharray={`${result.atsScore}, 100`}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                      {result.atsScore}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block -mt-1">/ 100</span>
                  </div>
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mt-4 text-center">
                  Overall ATS Audit Score
                </h3>
                <span className={`mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  result.strengthLevel === 'Strong' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
                    : result.strengthLevel === 'Average' 
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450' 
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                }`}>
                  {result.strengthLevel} Strength
                </span>
              </div>

              {/* Job Match Gauge */}
              <div className="md:border-r border-slate-100 dark:border-slate-850/80 flex flex-col items-center justify-center p-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2" className="dark:stroke-slate-800" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      stroke="#6366f1" strokeWidth="2.2" 
                      strokeDasharray={`${result.jobMatchPercentage}, 100`} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-xl font-extrabold text-indigo-650 dark:text-indigo-400">
                    {result.jobMatchPercentage}%
                  </div>
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mt-4 text-center">
                  Job Match Strength
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                  {result.matchedSkills.length} of {result.matchedSkills.length + result.missingSkills.length} required skills found
                </p>
              </div>

              {/* Readability Indicator */}
              <div className="md:border-r border-slate-100 dark:border-slate-850/80 flex flex-col items-center justify-center p-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2" className="dark:stroke-slate-800" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      stroke="#ec4899" strokeWidth="2.2" 
                      strokeDasharray={`${result.readabilityScore}, 100`} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-xl font-extrabold text-pink-500">
                    {result.readabilityScore}%
                  </div>
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mt-4 text-center">
                  Readability Score
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                  {result.readabilityScore >= 60 ? 'Professional & Clear' : 'Bulky/Needs Conciseness'}
                </p>
              </div>

              {/* Profile Completeness */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2" className="dark:stroke-slate-800" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      stroke="#10b981" strokeWidth="2.2" 
                      strokeDasharray={`${result.completenessScore}, 100`} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-xl font-extrabold text-emerald-500">
                    {result.completenessScore}%
                  </div>
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mt-4 text-center">
                  Completeness Audit
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                  {result.completenessScore === 100 ? 'Fully Detailed Profile' : 'Missing Contact/Sections'}
                </p>
              </div>

            </div>

            {/* Side-by-side Technical Match and Section Validations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (8 units): Technical keyword match lists */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Skills Compare Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
                  <h2 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Layers size={16} className="text-indigo-500" />
                    <span>Matched vs. Missing Job Skills</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched skills */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Matched Skills ({result.matchedSkills.length})</span>
                      </h3>
                      
                      {result.matchedSkills.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No direct matches found. Add job keywords!</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedSkills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-900/40 rounded-lg text-xs font-bold capitalize flex items-center gap-1"
                            >
                              <CheckCircle2 size={11} />
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Missing skills */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Missing Technologies ({result.missingSkills.length})</span>
                      </h3>
                      
                      {result.missingSkills.length === 0 ? (
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <ShieldCheck size={13} />
                          <span>100% matched! Excellent coverage.</span>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingSkills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/50 dark:border-rose-900/40 rounded-lg text-xs font-bold capitalize flex items-center gap-1"
                            >
                              <AlertTriangle size={11} />
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI LinkedIn Summary card */}
                <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/30 dark:from-indigo-950/60 dark:via-indigo-950/80 dark:to-slate-950 text-slate-800 dark:text-white p-6 rounded-3xl border border-indigo-100/40 dark:border-slate-800/40 shadow-sm dark:shadow-xl flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-white/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-center border-b border-indigo-100/40 dark:border-white/10 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <h2 className="font-extrabold flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-650 dark:text-white">
                        <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
                        <span>LinkedIn Profile Summary Optimizer</span>
                      </h2>
                      <p className="text-[9px] text-slate-500 dark:text-indigo-250 leading-normal max-w-md">
                        <strong>Purpose:</strong> Generates a search-engine-optimized (SEO) profile summary tailored to your parsed credentials and skills, ready to copy into your LinkedIn "About" section to boost discoverability by recruiters.
                      </p>
                    </div>
                    {result.linkedinSummary && (
                      <button
                        onClick={() => copyToClipboard(result.linkedinSummary)}
                        className="p-2 rounded-lg bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-650 dark:text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copy Summary"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-indigo-150 leading-relaxed italic pr-2 font-medium">
                    "{result.linkedinSummary}"
                  </p>

                  <div className="mt-2.5 pt-2.5 border-t border-indigo-100/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    <span className="text-slate-500 dark:text-indigo-200">
                      Engine Status: <strong className="text-indigo-600 dark:text-white uppercase tracking-wider">{result.isAiConfigured ? '✨ Google Gemini AI Mode' : '⚙️ Local NLP Rule Mode'}</strong>
                    </span>
                    {!result.isAiConfigured && (
                      <span className="text-indigo-500/80 dark:text-indigo-300 italic">
                        Tip: Set GEMINI_API_KEY in your server's .env for customized AI models.
                      </span>
                    )}
                  </div>
                </div>

                {/* Skill Gap Roadmap card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <h2 className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <BookOpen size={16} className="text-indigo-500" />
                        <span>Skill Gap Learning Roadmap</span>
                      </h2>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Highly targeted technical progression plans mapped for your specific missing capabilities.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                    {result.skillGapAnalysis && result.skillGapAnalysis.length > 0 ? (
                      result.skillGapAnalysis.map((gap, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl hover:scale-[1.01] hover:border-indigo-500/30 hover:shadow-sm transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-850 dark:text-slate-200 capitalize tracking-tight text-xs bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg border border-indigo-100/40 dark:border-indigo-900/30">
                              Focus: {gap.skill}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-2 pt-1">
                            {gap.suggestions.map((rec, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-350">
                                <span className="p-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                                  <ShieldCheck size={10} />
                                </span>
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-6 text-xs text-slate-400 italic">
                        No skill gaps identified! You possess all required technical skills for this job description.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column (4 units): Suggestions Feed, Section Audit, Keyword Density */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Section Validation checklist */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <h2 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Award size={14} className="text-indigo-500" />
                    <span>Section Presence Audit</span>
                  </h2>

                  <div className="flex flex-col gap-2">
                    {result.sectionValidation && result.sectionValidation.checks && Object.keys(result.sectionValidation.checks).map((section) => (
                      <div 
                        key={section} 
                        className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                          result.sectionValidation.checks[section]
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/60 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100/60 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        <span className="capitalize">{section} Section</span>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider">
                          {result.sectionValidation.checks[section] ? 'Present' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keyword Density Widget */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <h2 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Layers size={14} className="text-indigo-500" />
                    <span>Keyword Frequency check</span>
                  </h2>

                  <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {result.keywordDensity && result.keywordDensity.slice(0, 7).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-medium border-b border-slate-100/40 dark:border-slate-800/40 pb-2">
                        <span className="capitalize text-slate-700 dark:text-slate-350">{item.keyword}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px] font-semibold">{item.count} occurrences</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            item.status === 'Overused' 
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                              : item.status === 'Low'
                                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



              </div>

            </div>

            {/* Suggestions Feed (Detailed improvement list) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
              <h2 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Brain size={16} className="text-indigo-500" />
                <span>Resume Improvement Suggestions Feed</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.suggestions && result.suggestions.map((sug, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                      sug.urgency === 'High' 
                        ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30' 
                        : sug.urgency === 'Medium'
                          ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30'
                          : 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      sug.urgency === 'High' 
                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-450' 
                        : sug.urgency === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-450'
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {sug.urgency === 'High' ? <AlertTriangle size={15} /> : <Sparkles size={15} />}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-250">
                        <span>{sug.category}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          sug.urgency === 'High' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50' 
                            : sug.urgency === 'Medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50'
                              : 'bg-indigo-100 text-indigo-750 dark:bg-indigo-950/50'
                        }`}>
                          {sug.urgency} Urgency
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                        {sug.message.replace(/\*\*/g, '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AtsAnalyzer;
