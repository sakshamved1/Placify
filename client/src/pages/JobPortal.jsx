import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Briefcase, DollarSign, Calendar, SlidersHorizontal, AlertCircle, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';

const JobPortal = () => {
  const { user, jobs, applications, applyJob } = useApp();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [remote, setRemote] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notes, setNotes] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [matchResults, setMatchResults] = useState({});
  const { getJobMatchScore } = useApp();

  const handleCheckMatch = async (jobId) => {
    setMatchResults(prev => ({
      ...prev,
      [jobId]: { loading: true, data: null }
    }));

    try {
      const data = await getJobMatchScore(jobId);
      setMatchResults(prev => ({
        ...prev,
        [jobId]: { loading: false, data }
      }));
    } catch (err) {
      console.error(err);
      setMatchResults(prev => {
        const updated = { ...prev };
        delete updated[jobId];
        return updated;
      });
    }
  };

  // Filters application
  const filteredJobs = jobs.filter(job => {
    const searchLower = search.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.skills.some(s => s.toLowerCase().includes(searchLower));

    const matchesLocation = location === '' || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = jobType === '' || job.type === jobType;
    const matchesRemote = !remote || job.remote === true;

    return matchesSearch && matchesLocation && matchesType && matchesRemote;
  });

  const handleOpenApply = (job) => {
    if (user.role !== 'student') return;
    setSelectedJob(job);
    setNotes('');
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyJob(selectedJob._id, notes);
      setShowApplyModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getApplicationStatus = (jobId) => {
    const app = applications.find(a => (a.job?._id || a.job) === jobId);
    return app ? app.status : null;
  };

  const hasResume = !!user.profile?.resumeUrl;

  return (
    <div className="flex-1 flex flex-col gap-6 pb-20 relative text-left">
      
      {/* Banner */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-[150px] bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Marketplace</span>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">Explore Placement Openings</h2>
        <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed mt-1">
          Apply to premier engineering openings. Filter by parameters, review core technical requirements, and submit applications.
        </p>
      </section>

      {/* Main Search Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Sticky filters (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col gap-5 sticky top-24">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <h3 className="font-heading font-bold text-white text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Filter Criteria
            </h3>
            <button
              onClick={() => {
                setSearch('');
                setLocation('');
                setJobType('');
                setRemote(false);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold"
            >
              Reset Filters
            </button>
          </div>

          {/* Search Keywords */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Search Keyword</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, company, or skill..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or Country..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Job Type Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Employment Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Remote Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={remote}
              onChange={(e) => setRemote(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-slate-950/40 text-indigo-600 focus:ring-0 focus:ring-offset-0"
            />
            Show Remote Positions only
          </label>
        </div>

        {/* Right Side: Job list (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Warning banner if student has no resume */}
          {user.role === 'student' && !hasResume && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-amber-300">Resume Upload Required</span>
                <p className="text-[10px] text-slate-400 leading-normal mt-1">
                  You must upload your resume in the <Link to="/resume" className="text-amber-300 font-bold hover:underline">Resume Management</Link> section to activate the job application triggers.
                </p>
              </div>
            </div>
          )}

          {/* Job listings */}
          {filteredJobs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 glass-card rounded-2xl border-white/5 flex flex-col items-center gap-2">
              <Briefcase className="w-8 h-8 text-slate-700" />
              <span>No placement offers match your filter criteria.</span>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const appStatus = getApplicationStatus(job._id);
              return (
                <div key={job._id} className="glass-card p-6 rounded-2xl flex flex-col gap-4 mt-20">
                  
                  {/* Top line details */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      {/* Logo Mock */}
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-heading font-extrabold text-white text-lg">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <h4 className="font-heading font-bold text-base text-white">{job.title}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{job.company}</span>
                      </div>
                    </div>

                    {/* Salary Package / Type */}
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-extrabold text-emerald-400">{job.salary}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">{job.type}</span>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p 
                    className="text-xs text-slate-400 font-light leading-relaxed text-left line-clamp-3 overflow-hidden max-h-16"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                    
                    {/* Location / Remote badges */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" /> {job.location}
                      </span>
                      {job.remote && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase">
                          Remote
                        </span>
                      )}
                      {job.externalUrl && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase">
                          External
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-600" /> {job.experience}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-slate-300 font-semibold uppercase">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* AI Fit Results Panel */}
                  {matchResults[job._id]?.data && (
                    <div className="p-4 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/10 text-xs flex flex-col gap-3 text-left animate-in slide-in-from-top-1 duration-200">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="font-bold text-slate-300">Gemini AI Compatibility Analysis</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          matchResults[job._id].data.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {matchResults[job._id].data.matchScore}% Match
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Fit Strengths</span>
                          <div className="flex flex-col gap-1">
                            {matchResults[job._id].data.strengths?.map((str, idx) => (
                              <p key={idx} className="text-slate-300 font-light leading-normal">&bull; {str}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Required Skill Gaps</span>
                          <div className="flex flex-col gap-1">
                            {matchResults[job._id].data.gaps?.map((gap, idx) => (
                              <p key={idx} className="text-slate-300 font-light leading-normal">&bull; {gap}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 italic">
                        <span className="font-bold text-slate-300 not-italic block mb-0.5">Resume Tailoring Tips:</span>
                        "{matchResults[job._id].data.advice}"
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-1">
                    {user.role === 'student' && !appStatus && (
                      <button
                        onClick={() => handleCheckMatch(job._id)}
                        disabled={matchResults[job._id]?.loading}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {matchResults[job._id]?.loading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>✨ Analyze AI Fit</>
                        )}
                      </button>
                    )}
                    {user.role === 'student' && (
                      appStatus ? (
                        <button
                          disabled
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> Applied ({appStatus})
                        </button>
                      ) : job.externalUrl ? (
                        <a
                          href={job.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all flex items-center gap-1 text-center"
                        >
                          Apply Now ↗
                        </a>
                      ) : (
                        <button
                          onClick={() => handleOpenApply(job)}
                          disabled={!hasResume}
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          Apply for position
                        </button>
                      )
                    )}
                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
            <h3 className="font-heading text-lg font-bold text-white mb-2">Apply for Position</h3>
            <p className="text-xs text-slate-400 font-light mb-4">
              Apply to <span className="font-bold text-indigo-400">{selectedJob?.company}</span> as a <span className="font-bold text-indigo-400">{selectedJob?.title}</span>. Your uploaded resume ({user.profile?.resumeOriginalName}) will be sent to the recruiter.
            </p>

            <form onSubmit={handleApply} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cover Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Introduce yourself, highlight key projects, or state availability..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobPortal;
