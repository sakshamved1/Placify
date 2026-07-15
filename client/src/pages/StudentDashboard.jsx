import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FileText, Briefcase, Calendar, Bell, ShieldCheck, AlertCircle, Edit, Check, ChevronRight, Phone, Mail, Award, Compass, Zap } from 'lucide-react';
import AICareerRoadmap from '../components/AICareerRoadmap';
import AIInterviewCoach from '../components/AIInterviewCoach';

const StudentDashboard = () => {
  const { user, applications, notifications, updateProfile } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, roadmap, coach
  
  // Profile edit states
  const [phone, setPhone] = useState(user.profile.phone || '');
  const [department, setDepartment] = useState(user.profile.department || '');
  const [graduationYear, setGraduationYear] = useState(user.profile.graduationYear || 2027);
  const [cgpa, setCgpa] = useState(user.profile.cgpa || 0);
  const [skillsText, setSkillsText] = useState(user.profile.skills?.join(', ') || '');

  // Deriving metrics
  const resumeUploaded = !!user.profile.resumeUrl;
  const atsScore = user.profile.atsScore || 0;
  const appliedCount = applications.length;
  const interviewCount = applications.filter(a => a.status === 'Interview').length;
  const selectedCount = applications.filter(a => a.status === 'Selected').length;
  const eligible = (user.profile.cgpa || 0) >= 6.0;

  // Profile completion percent
  let completionPercentage = 20; // 20% base for registration
  if (user.profile.phone) completionPercentage += 15;
  if (user.profile.department) completionPercentage += 15;
  if (user.profile.cgpa) completionPercentage += 15;
  if (user.profile.skills?.length > 0) completionPercentage += 15;
  if (resumeUploaded) completionPercentage += 20;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    try {
      await updateProfile({
        phone,
        department,
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
        skills: skillsArray
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 pb-20 relative">
      {/* Welcome Banner */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-[150px] bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Student Portal</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user.name}</h2>
          <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed">
            Monitor your placement credentials, view recruiters status changes, and track interview events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Profile Completeness</span>
            <span className="text-xs font-bold text-white mt-1">{completionPercentage}%</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="url(#indigoGrad)" strokeWidth="4"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - completionPercentage / 100)}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-300">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </section>

      {/* Navigation tabs */}
      <div className="flex border-b border-white/5 gap-6 mt-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-heading font-semibold text-xs transition-all relative ${
            activeTab === 'overview' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Profile Overview
          {activeTab === 'overview' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 font-heading font-semibold text-xs transition-all relative flex items-center gap-1 ${
            activeTab === 'roadmap' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> AI Career Roadmap
          {activeTab === 'roadmap' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`pb-3 font-heading font-semibold text-xs transition-all relative flex items-center gap-1 ${
            activeTab === 'coach' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> AI Interview Prep
          {activeTab === 'coach' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
        </button>
      </div>

      {/* Main Grid */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: KPI Stats (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Resume Card */}
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resume Status</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                {resumeUploaded ? (
                  <>
                    <h4 className="text-sm font-semibold text-white truncate max-w-full" title={user.profile.resumeOriginalName}>
                      {user.profile.resumeOriginalName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[9px] text-indigo-300 font-bold">ATS Score: {atsScore}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-rose-400">Missing Resume</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal font-light">Upload a resume to unlock job applications.</p>
                  </>
                )}
              </div>
              <Link to="/resume" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                {resumeUploaded ? 'Manage Resume' : 'Upload Now'} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Applied Card */}
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applied Jobs</span>
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white font-heading">{appliedCount}</span>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-light">Job applications submitted</p>
              </div>
              <Link to="/jobs" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Browse Marketplace <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Interviews / Selected */}
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interviews & Offers</span>
                <Calendar className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                {selectedCount > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-emerald-400 font-heading">Hired 🎉</span>
                    <span className="text-[10px] text-slate-400 mt-1">{selectedCount} Job Offer Received</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-3xl font-extrabold text-white font-heading">{interviewCount}</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-light">Upcoming scheduled rounds</span>
                  </div>
                )}
              </div>
              <Link to="/tracking" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Track Status <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Quick Profile Summary Card */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> Professional Credentials
              </h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition-all"
              >
                <Edit className="w-3 h-3" /> Edit Credentials
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Department</span>
                <span className="text-xs font-semibold text-slate-200">{user.profile.department || 'Not Specified'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Graduation Year</span>
                <span className="text-xs font-semibold text-slate-200">{user.profile.graduationYear || 'Not Specified'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">CGPA Score</span>
                <span className="text-xs font-semibold text-slate-200">{user.profile.cgpa ? `${user.profile.cgpa} / 10` : 'Not Specified'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Placement Status</span>
                <div className={`flex items-center gap-1 text-xs font-bold ${eligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {eligible ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {eligible ? 'Eligible' : 'Ineligible'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Key Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {user.profile.skills?.length > 0 ? (
                  user.profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-slate-300 font-semibold uppercase">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs italic">No skills listed yet. Add skills to stand out.</span>
                )}
              </div>
            </div>
          </div>

          {/* Active Job Applications List */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-4">
            <h3 className="font-heading font-bold text-white text-base pb-3 border-b border-white/5">Active Job Applications</h3>
            {applications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Briefcase className="w-8 h-8 text-slate-700" />
                <span>You haven't applied to any job listings yet.</span>
                <Link to="/jobs" className="mt-2 text-indigo-400 hover:underline font-semibold">Browse Job Openings</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {applications.map((app) => (
                  <div key={app._id} className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 text-left min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{app.job?.title || 'Unknown Position'}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{app.job?.company || 'External'} &bull; {app.job?.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        app.status === 'Selected'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : app.status === 'Interview'
                          ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                          : app.status === 'Shortlisted'
                          ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {app.status}
                      </span>
                      <span className="hidden sm:inline text-[9px] text-slate-500 font-medium">
                        Applied: {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Alerts Feed (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-4 h-full max-h-[600px] overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" /> Recent Updates
              </h3>
              {notifications.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[9px] font-bold text-indigo-400">
                  Live
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="my-auto py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <Bell className="w-6 h-6 text-slate-700" />
                  <span>No alerts found. Status updates from recruiters will appear here in real-time.</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                    notif.read ? 'bg-white/[0.01] border-white/5 opacity-60' : 'bg-indigo-500/[0.03] border-indigo-500/10'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-xs text-white">{notif.title}</span>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-light leading-normal">{notif.content}</p>
                    <span className="text-[8px] text-slate-500 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString()} &bull; {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        </div>
      )}

      {activeTab === 'roadmap' && <AICareerRoadmap />}
      {activeTab === 'coach' && <AIInterviewCoach />}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <h3 className="font-heading text-lg font-bold text-white mb-4">Edit Profile Credentials</h3>
            
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Academic Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2027"
                    className="w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CGPA Score</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="9.2"
                    className="w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Key Skills (Comma separated)</label>
                <textarea
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, Node.js, Python, SQL"
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-md shadow-indigo-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
