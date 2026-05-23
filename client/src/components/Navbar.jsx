import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, FileText, User as UserIcon, Menu, X, Brain } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/10 dark:shadow-none group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-[10px] bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Resume page sheet outline */}
                    <path d="M6 3h7.5L18 7.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Sheet corner folded */}
                    <path d="M13.5 3v4.5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Text lines */}
                    <path d="M7 8h4M7 12h5M7 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Glowing success badge/check circle */}
                    <circle cx="16.5" cy="15.5" r="3.5" fill="#10b981" stroke="#10b981" strokeWidth="0.5" className="animate-pulse" />
                    <path d="M15 15.5l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors duration-200">
                Resume Builder & Analyzer
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  to="/ats-analyzer"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <Brain size={14} className="text-indigo-500 animate-pulse" strokeWidth={2.5} />
                  <span>ATS Audit Hub</span>
                </Link>

                {/* User Info Badge & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-850 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-205 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    title="View Profile Info"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                      <UserIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {user.name}
                    </span>
                  </button>

                  {profileOpen && (
                    <>
                      {/* Click overlay to close */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />

                      {/* Premium Dropdown Card */}
                      <div className="absolute right-0 mt-2.5 w-[330px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none z-50 overflow-hidden transform origin-top-right transition-all duration-200 ease-out animate-scale-in">
                        {/* Gradient header */}
                        <div className="h-16 bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 flex items-center justify-end px-4">
                          <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active Profile
                          </span>
                        </div>

                        {/* Profile Info */}
                        <div className="px-6 pb-6 pt-0 relative">
                          {/* Avatar floating up */}
                          <div className="absolute -top-7 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/10 dark:shadow-none">
                            <div className="w-full h-full rounded-[14px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          </div>

                          {/* Name & Email */}
                          <div className="pt-3.5 pl-[64px] min-h-[50px] flex flex-col justify-center">
                            <h4 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight tracking-tight">
                              {user.name}
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {user.email || 'user@example.com'}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800/40 dark:via-slate-800 dark:to-slate-800/40 my-4" />

                          {/* "About Me" section */}
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-550 dark:text-indigo-400">
                              About Me
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                              Hello! I'm {user.name}. I am using this intelligent Resume Builder & Analyzer to construct and optimize my professional portfolio.
                            </p>
                          </div>

                          {/* Footer details or stats */}
                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                            <span>Member since 2026</span>
                            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 px-2.5 py-0.5 rounded-full font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors animate-fade-in"
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== '/signup' && (
                  <Link
                    to="/signup"
                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4.5 py-2 rounded-xl shadow-sm shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 transition-all animate-fade-in"
                  >
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 flex flex-col gap-3 shadow-lg">
          {user ? (
            <>
              <div className="font-semibold text-slate-500 text-xs px-2 uppercase tracking-wider">
                Logged in as {user.name}
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/ats-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-605 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Brain size={14} className="text-indigo-500" />
                <span>ATS Audit Hub</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-sm font-medium text-rose-600 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left w-full cursor-pointer"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {location.pathname !== '/login' && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50"
                >
                  Login
                </Link>
              )}
              {location.pathname !== '/signup' && (
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-white bg-indigo-600 p-2.5 rounded-xl"
                >
                  Get Started
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;