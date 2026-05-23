import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Calendar, FileText, Layout, Milestone, Loader2, AlertCircle, Sparkles, Brain } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom toast notification states
  const [toast, setToast] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getAllResumes();
      if (data.success) {
        setResumes(data.resumes);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve your resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateResume = async () => {
    try {
      setError(null);
      const defaultData = {
        title: 'My Professional Resume',
        template: 'modern',
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          website: '',
          github: '',
          linkedin: '',
          address: '',
          summary: ''
        },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: [],
        achievements: []
      };

      const data = await resumeService.createResume(defaultData);
      if (data.success) {
        triggerToast('New resume generated successfully!');
        navigate(`/builder/${data.resume._id}`);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Could not generate resume. Please retry.', 'error');
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click edit path
    
    if (!window.confirm('Are you absolutely sure you want to delete this resume? This action is permanent.')) {
      return;
    }

    try {
      const data = await resumeService.deleteResume(id);
      if (data.success) {
        setResumes(resumes.filter((r) => r._id !== id));
        triggerToast('Resume removed successfully.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Could not delete resume.', 'error');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-sm font-semibold transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
            : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* User Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 dark:from-slate-900 dark:to-slate-850 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          <div>
            <div className="inline-flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-3">
              <Sparkles size={12} className="text-amber-400" />
              <span>Resume Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Professional'}!
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Select or generate a resume template and kickstart your professional journey.
            </p>
          </div>
          
          <button
            onClick={handleCreateResume}
            className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl shadow-md transition-all text-sm shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Resume</span>
          </button>
        </div>

        {/* Resumes Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
            <FileText size={18} className="text-indigo-550" />
            <span>My Active Resumes</span>
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={36} className="animate-spin text-indigo-600" />
              <p className="text-sm font-semibold text-slate-500">Retrieving resume collection...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2.5 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
              <AlertCircle size={20} />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-5 text-indigo-600 dark:text-indigo-400">
                <FileText size={28} />
              </div>
              <h3 className="text-lg font-bold">No resumes drafted yet</h3>
              <p className="text-slate-550 dark:text-slate-400 text-sm mt-2 max-w-sm">
                Get started by creating your very first professional resume snapshot. You can download and edit it anytime.
              </p>
              <button
                onClick={handleCreateResume}
                className="mt-6 flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Create First Resume</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  onClick={() => navigate(`/builder/${resume._id}`)}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-850 hover:border-indigo-400 dark:hover:border-indigo-800 hover:-translate-y-1 transition-all duration-200 shadow-sm flex flex-col justify-between gap-6 cursor-pointer group"
                >
                  <div>
                    {/* Top strip */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {resume.title}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Layout size={14} className="text-slate-400" />
                        <span className="capitalize font-semibold">{resume.template} Template</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Milestone size={14} className="text-slate-400" />
                        <span className="font-semibold">Version {resume.versionNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Calendar size={13} />
                      <span>{formatDate(resume.updatedAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ats-analyzer?resumeId=${resume._id}`);
                        }}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-pink-50 dark:bg-slate-850 dark:hover:bg-pink-950/20 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                        title="Run ATS Scan Audit"
                      >
                        <Brain size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/builder/${resume._id}`);
                        }}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Edit Resume"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteResume(resume._id, e)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-950/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete Resume"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
