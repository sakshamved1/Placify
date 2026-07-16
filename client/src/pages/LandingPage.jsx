import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity, BarChart, Send, Briefcase, FileText, X } from 'lucide-react';

const LandingPage = () => {
  const [showTour, setShowTour] = useState(false);
  const [tourTab, setTourTab] = useState('student');

  const stats = [
    { label: 'Students Placed', value: '450+', sub: 'Last academic year' },
    { label: 'Hiring Partners', value: '120+', sub: 'Global corporations' },
    { label: 'Highest Package', value: '54 LPA', sub: 'From top tech giant' },
    { label: 'Average Package', value: '14.2 LPA', sub: 'Computer engineering' },
    { label: 'Placement Rate', value: '98.6%', sub: 'Highest in region' },
  ];

  const features = [
    {
      icon: FileText,
      title: 'ATS Resume Scoring',
      desc: 'Drag and drop your resume to receive an instantaneous compliance score and actionable improvement recommendations.',
    },
    {
      icon: Activity,
      title: 'Kanban Application Pipeline',
      desc: 'Track and visualize job application progression from submission, shortlisting, to selected status on an interactive Kanban board.',
    },
    {
      icon: Zap,
      title: 'Real-Time Alert Feed',
      desc: 'Get instant WebSockets-based updates the millisecond a recruiter schedules an interview or marks you as selected.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Dashboards',
      desc: 'Secure enterprise grade controls and analytics tailor-made for Students, Recruiters, and system Administrators.',
    },
  ];

  const companies = ['Stripe', 'Vercel', 'Figma', 'Linear', 'Notion', 'Raycast', 'Google', 'Airbnb'];

  return (
    <div className="flex-1 flex flex-col pt-12">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center flex flex-col items-center">
        {/* Glow Accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Feature Announcement Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          Introducing Placify 2.0
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Next-generation <span className="gradient-text">placement platform</span> for elite talent
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
          The ultimate platform for universities and recruiters. Build, parse, track, and secure dream engineering jobs with real-time websocket coordination.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/login?register=true"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
          >
            Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => setShowTour(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Interactive Dashboard Mockup Preview */}
        <div className="mt-20 w-full max-w-5xl mx-auto glass-panel border-white/10 rounded-2xl p-2 shadow-2xl relative animate-float">
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-white/5 shadow-inner aspect-[16/10] relative flex flex-col p-4">
            
            {/* Mock Dashboard Layout */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest">PLACIFY DASHBOARD PREVIEW</span>
              <div className="w-16 h-2 rounded bg-slate-800" />
            </div>

            <div className="flex-1 grid grid-cols-12 gap-4 pt-4 text-left">
              {/* Left Mock Sidebar */}
              <div className="col-span-3 border-r border-white/5 pr-4 flex flex-col gap-3">
                <div className="h-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg w-full" />
                <div className="h-4 bg-slate-800/40 rounded-lg w-4/5" />
                <div className="h-4 bg-slate-800/40 rounded-lg w-5/6" />
                <div className="h-4 bg-slate-800/40 rounded-lg w-2/3" />
                <div className="mt-auto h-8 bg-slate-800/20 rounded-lg w-full" />
              </div>

              {/* Right Mock Main Grid */}
              <div className="col-span-9 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">RESUME UPLOAD</span>
                    <span className="text-sm font-semibold text-emerald-400">92% Compliance</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">APPLICATIONS</span>
                    <span className="text-sm font-semibold text-indigo-400">12 Submitted</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">INTERVIEWS</span>
                    <span className="text-sm font-semibold text-purple-400">2 Pending</span>
                  </div>
                </div>

                {/* Mock Chart Area */}
                <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">Weekly Application Velocity</span>
                    <span className="text-[10px] text-emerald-400">+14% vs last week</span>
                  </div>
                  <div className="h-32 flex items-end gap-3 pt-4 pb-2 justify-between">
                    {[35, 60, 45, 90, 75, 110, 85, 120, 100, 140].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-brand-primary to-brand-accent rounded-t" style={{ height: `${(height / 140) * 100}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners section */}
      <section className="border-y border-white/5 bg-slate-950/20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Trusted by recruiters from industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 hover:opacity-60 transition-opacity">
            {companies.map((company, index) => (
              <span key={index} className="font-heading font-extrabold text-lg sm:text-xl text-slate-300">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">Proven records of campus placements</h2>
          <p className="text-slate-400 mt-3 font-light">We bridge the gap between academic brilliance and global professional careers.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold gradient-text leading-tight">{stat.value}</span>
              <span className="text-xs font-semibold text-slate-200 mt-2">{stat.label}</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">Built for high speed placement tracking</h2>
          <p className="text-slate-400 mt-3 font-light">Everything you need to streamline, track, and score your campus placement attempts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-white">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-slate-950/10 rounded-3xl border border-white/5 my-10 relative">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <span className="font-heading text-5xl text-indigo-500/30">“</span>
          <p className="text-lg sm:text-xl text-slate-300 italic font-light leading-relaxed">
            Placify completely changed how we run our annual drive. The drag and drop resume ATS scoring helped our graduates optimize their cvs, and the WebSocket push notifications kept our applicants responsive. We placed 98% of our computer department in record time!
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
              DM
            </div>
            <div className="text-left">
              <h5 className="text-sm font-semibold text-white">Dr. Manoj Rawat</h5>
              <span className="text-[10px] text-slate-500 font-medium">Head of Placement Cell, DIT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative max-w-7xl mx-auto px-4 py-24 text-center flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-primary/10 rounded-full blur-[90px] pointer-events-none" />
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Ready to land your dream role?</h2>
        <p className="mt-4 text-slate-400 font-light max-w-lg leading-relaxed text-sm">
          Register with your student portal credentials or login as an administrator to set up database configurations.
        </p>
        <Link
          to="/login?register=true"
          className="mt-8 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
        >
          Register Now <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-white tracking-tight">Placify</span>
            <span>&copy; {new Date().getFullYear()} Placify Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">API Documentation</a>
          </div>
        </div>
      </footer>

      {/* Platform Walkthrough Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left flex flex-col gap-6">
            
            {/* Glow Accent */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => setShowTour(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Tour
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">Explore Placify Core Features</h3>
              <p className="text-xs text-slate-400 font-light mt-1">
                Learn how Placify streamlines placements for students, recruiters, and admins.
              </p>
            </div>

            {/* Tab Links */}
            <div className="flex gap-2 border-b border-white/5 pb-3 overflow-x-auto">
              {[
                { id: 'student', label: 'Student Experience', icon: FileText },
                { id: 'recruiter', label: 'Recruiter Dashboard', icon: Briefcase },
                { id: 'admin', label: 'Admin Analytics', icon: BarChart },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSelected = tourTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTourTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-h-[220px]">
              {tourTab === 'student' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                    <div className="p-3 h-fit rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-sm text-white">Google Gemini AI Match Analysis</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Compare your resume and skill vectors directly against real-time Indian IT listings. Instantly see fit metrics, gap analysis, and recommendations.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                    <div className="p-3 h-fit rounded-xl bg-emerald-500/10 text-emerald-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-sm text-white">Instant ATS Resume Checker</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Upload your PDF resume to receive an automated score check based on keywords, structure alignments, and technical skills matches.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tourTab === 'recruiter' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                    <div className="p-3 h-fit rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-sm text-white">WebSockets Application Tracking Kanban</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Manage candidates visually by dragging cards between statuses. Recruiter updates and custom panel notes are broadcast instantly to student views.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                    <div className="p-3 h-fit rounded-xl bg-purple-500/10 text-purple-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-sm text-white">Indian IT Jobs Feed Integration</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Create manual student job placements or sync external positions natively from Adzuna APIs with Lakhs Per Annum (LPA) mapping systems.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tourTab === 'admin' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                    <div className="p-3 h-fit rounded-xl bg-indigo-500/10 text-indigo-400">
                      <BarChart className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-sm text-white">Unified System Placement Metrics</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Track correlation indices between student CGPA grades and offer success rates, average salary packages, and active enrollment ratios across departments.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                    <div className="p-3 h-fit rounded-xl bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-sm text-white">Administrative Portal Settings</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Control student configurations, supervise recruiter verification statuses, and monitor server configurations centrally.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setShowTour(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                Close Tour
              </button>
              <Link
                to="/login?register=true"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                Register & Start <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
