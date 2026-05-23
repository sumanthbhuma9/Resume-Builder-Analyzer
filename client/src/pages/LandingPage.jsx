import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Eye, Download, History, Sparkles, ChevronRight, Check } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Live, Instant Preview",
      description: "Watch your resume shape up right before your eyes as you type, ensuring everything looks absolutely perfect."
    },
    {
      icon: <Download className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      title: "Polished PDF Exports",
      description: "Download elegant, print-ready PDFs that sail smoothly through automated screening filters with zero formatting issues."
    },
    {
      icon: <History className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: "Risk-Free Draft History",
      description: "Save multiple checkpoints of your progress as you experiment, allowing you to go back in time with absolute peace of mind."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      title: "Curated Designer Layouts",
      description: "Swap seamlessly between sleek modern, authoritative corporate, and minimal styles in one single click."
    }
  ];

  const templates = [
    {
      name: "Modern Template",
      theme: "Sleek & Creative",
      desc: "Designed for tech teams, startups, and creative thinkers who want to make a bold first impression with vibrant color accents and a modern sidebar.",
      bgColor: "from-indigo-500 to-purple-600",
      accent: "Modern"
    },
    {
      name: "Professional Template",
      theme: "Classic & Authoritative",
      desc: "Tailored for established fields like finance, consulting, and law. Clean, traditional layouts that project structured hierarchy and elegance.",
      bgColor: "from-slate-700 to-slate-900",
      accent: "Executive"
    },
    {
      name: "Minimal Template",
      theme: "Clean & Simple",
      desc: "Crafted for designers, engineers, and minimalists who love breathing room and simplicity. Let your accomplishments speak for themselves.",
      bgColor: "from-emerald-500 to-teal-600",
      accent: "Minimalist"
    },
    {
      name: "Creative Template",
      theme: "Bold & Artistic",
      desc: "Perfect for artists, designers, and marketers who want an expressive side-split layout. Uses dynamic visual sections to command attention and highlight talents.",
      bgColor: "from-pink-500 to-rose-600",
      accent: "Creative"
    },
    {
      name: "Executive Template",
      theme: "Elite & Authoritative",
      desc: "Sophisticated navy-gold border design for CEOs, managers, and executives. Exudes corporate status, clean legacy serif structures, and high-caliber corporate leadership.",
      bgColor: "from-amber-600 to-indigo-950",
      accent: "Corporate"
    },
    {
      name: "Elegant Template",
      theme: "Refined & Polished",
      desc: "Tailored for researchers, academics, and medical practitioners. Features a clean, centered layout, elegant serif typography, and balanced spacing.",
      bgColor: "from-teal-600 to-indigo-800",
      accent: "Academic"
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Glowing Feature Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 mb-6 animate-pulse">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">100% Free Interactive Builder</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Create a Resume That Tells <br/>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Your True Career Story.
            </span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Skip the stressful formatting headaches. Pick a beautiful, recruiter-approved layout that represents your unique journey, watch changes happen live, and download a polished PDF instantly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Create My Resume Now</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Designed to Showcase the Very Best of You
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              We've built all the tools you need to tell your story beautifully and confidently, so recruiters can see exactly what makes you the perfect fit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group/card bg-white dark:bg-slate-900/65 backdrop-blur-md p-7 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-none transition-all duration-300 relative overflow-hidden"
              >
                {/* Glowing ambient background hint */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-full blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-855 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800/60 mb-5 group-hover/card:scale-110 group-hover/card:bg-indigo-50 dark:group-hover/card:bg-indigo-950/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Templates Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Choose a Style That Matches Your Vibe
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Change your mind anytime. Swap templates in one single click, and watch your information beautifully rearrange itself without losing a single word.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {templates.map((tmpl, index) => (
              <div 
                key={index} 
                className="group/tmpl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-850 overflow-hidden shadow-md hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Simulated Template Thumbnail Header */}
                <div className={`h-48 bg-gradient-to-br ${tmpl.bgColor} p-6 flex flex-col justify-between text-white relative overflow-hidden`}>
                  {/* Subtle decorative glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover/tmpl:scale-125 transition-transform duration-500" />
                  
                  <span className="self-end px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] uppercase font-bold tracking-widest z-10">
                    {tmpl.accent}
                  </span>
                  
                  <div className="flex gap-2 items-center z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <FileText size={20} className="text-white group-hover/tmpl:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight">{tmpl.name}</h4>
                      <p className="text-xs text-white/80">{tmpl.theme}</p>
                    </div>
                  </div>
                </div>

                <div className="p-7 flex-grow flex flex-col justify-between gap-6 dark:bg-slate-900/50">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tmpl.desc}
                  </p>
                  
                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/70">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className="font-medium">ATS-Friendly Font Rendering</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className="font-medium">Single-Page Adaptive Layout</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-tr from-indigo-50 via-slate-50 to-indigo-100/30 dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-white py-20 border-t border-indigo-100/40 dark:border-slate-800/40 relative overflow-hidden text-center transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 dark:from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-850 dark:text-white">
            Ready to Write Your Next Chapter?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-indigo-250 max-w-xl mx-auto font-medium">
            Join thousands of successful job-seekers who have stood out, gained confidence, and landed interviews at top companies. Your perfect resume starts right here.
          </p>
          <div className="mt-8">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Build My Resume - It's Free</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default LandingPage;
