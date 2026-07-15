import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Briefcase, FileText, CheckCircle2, XCircle, Search, Calendar, MapPin, DollarSign, Award, Layers, Users } from 'lucide-react';

const RecruiterDashboard = () => {
  const { user, jobs, applications, postJob, deleteJob, updateAppStatus } = useApp();
  
  const [activeTab, setActiveTab] = useState('applicants'); // applicants, jobs
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Form states for new job
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user.name + ' Inc.'); // Default company name to recruiter name
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [type, setType] = useState('Full Time');
  const [remote, setRemote] = useState(false);
  const [experience, setExperience] = useState('Entry Level');
  const [skillsText, setSkillsText] = useState('');
  const [reqsText, setReqsText] = useState('');
  const [loading, setLoading] = useState(false);

  // Deriving metrics for Recruiter
  const recruiterJobs = jobs.filter(j => j.postedBy?._id === user._id || j.postedBy === user._id);
  const jobIds = recruiterJobs.map(j => j._id);
  const recruiterApps = applications.filter(a => jobIds.includes(a.job?._id || a.job));

  const totalApplicants = recruiterApps.length;
  const shortlistedCount = recruiterApps.filter(a => a.status === 'Shortlisted').length;
  const interviewCount = recruiterApps.filter(a => a.status === 'Interview').length;
  const hiredCount = recruiterApps.filter(a => a.status === 'Selected').length;

  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const reqsArray = reqsText.split('\n').map(r => r.trim()).filter(r => r.length > 0);

    try {
      await postJob({
        title,
        company,
        description,
        location,
        salary,
        type,
        remote,
        experience,
        skills: skillsArray,
        requirements: reqsArray,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      });
      setShowPostModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setSalary('');
      setSkillsText('');
      setReqsText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await updateAppStatus(appId, status, `Candidate status updated to ${status}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = recruiterApps.filter(app => {
    const searchLower = searchText.toLowerCase();
    return (
      app.student?.name?.toLowerCase().includes(searchLower) ||
      app.job?.title?.toLowerCase().includes(searchLower) ||
      app.student?.profile?.skills?.some(s => s.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="flex-1 flex flex-col gap-6 pb-20 relative text-left">
      {/* Welcome Banner */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-[150px] bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex flex-col gap-1 text-left">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Recruiter Portal</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user.name}</h2>
          <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed">
            Manage your corporate listings, evaluate candidate qualifications, and schedule interviews.
          </p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="px-5 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Post a Job Opening
        </button>
      </section>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Openings</span>
          <span className="text-3xl font-extrabold text-white font-heading">{recruiterJobs.length}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applicants</span>
          <span className="text-3xl font-extrabold text-white font-heading">{totalApplicants}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shortlisted Candidates</span>
          <span className="text-3xl font-extrabold text-amber-400 font-heading">{shortlistedCount + interviewCount}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Successful Hires</span>
          <span className="text-3xl font-extrabold text-emerald-400 font-heading">{hiredCount}</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 font-heading font-semibold text-xs transition-all relative ${
            activeTab === 'applicants' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Applicants Inbox
          {activeTab === 'applicants' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 font-heading font-semibold text-xs transition-all relative ${
            activeTab === 'jobs' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          My Job Postings
          {activeTab === 'jobs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'applicants' ? (
        <div className="flex flex-col gap-4">
          {/* Search/Filters */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, role, or skill..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/20 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Table Container */}
          <div className="glass-card rounded-2xl overflow-hidden border-white/5 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/40 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Applicant details</th>
                    <th className="px-6 py-4">Applied position</th>
                    <th className="px-6 py-4">ATS compliance</th>
                    <th className="px-6 py-4">Skills overview</th>
                    <th className="px-6 py-4">Status status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        No active candidate profiles matching selection.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                              {app.student?.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{app.student?.name}</span>
                              <span className="text-[10px] text-slate-400">{app.student?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{app.job?.title}</span>
                            <span className="text-[9px] text-slate-500">Dept: {app.student?.profile?.department || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              (app.student?.profile?.atsScore || 0) >= 80
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : (app.student?.profile?.atsScore || 0) >= 60
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {app.student?.profile?.atsScore || 0}%
                            </span>
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 underline"
                              title="Download CV"
                            >
                              <FileText className="w-3.5 h-3.5" /> PDF
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {app.student?.profile?.skills?.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-slate-300">
                                {skill}
                              </span>
                            ))}
                            {(app.student?.profile?.skills?.length || 0) > 3 && (
                              <span className="text-[9px] text-slate-500">+{app.student.profile.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            app.status === 'Selected'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : app.status === 'Interview'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : app.status === 'Shortlisted'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === 'Applied' && (
                              <button
                                onClick={() => handleStatusChange(app._id, 'Shortlisted')}
                                className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold transition-all border border-indigo-500/15"
                              >
                                Shortlist
                              </button>
                            )}
                            {(app.status === 'Applied' || app.status === 'Shortlisted') && (
                              <button
                                onClick={() => handleStatusChange(app._id, 'Interview')}
                                className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[10px] font-semibold transition-all border border-purple-500/15"
                              >
                                Interview
                              </button>
                            )}
                            {app.status === 'Interview' && (
                              <button
                                onClick={() => handleStatusChange(app._id, 'Selected')}
                                className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold transition-all border border-emerald-500/15 flex items-center gap-0.5"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Select
                              </button>
                            )}
                            {app.status !== 'Selected' && (
                              <button
                                onClick={() => handleStatusChange(app._id, 'Rejected')} // Wait, we can implement Rejected or just status back
                                className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/15"
                                title="Reject Application"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* My Job Postings tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recruiterJobs.length === 0 ? (
            <div className="col-span-2 py-20 text-center text-slate-500 glass-card rounded-2xl border-white/5">
              <Briefcase className="w-8 h-8 mx-auto text-slate-700 mb-2" />
              <span>You have not posted any jobs yet.</span>
            </div>
          ) : (
            recruiterJobs.map((job) => {
              const jobAppsCount = applications.filter(a => (a.job?._id || a.job) === job._id).length;
              return (
                <div key={job._id} className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-heading font-bold text-base text-white">{job.title}</h4>
                      <button
                        onClick={() => deleteJob(job._id)}
                        className="px-2 py-1 bg-rose-500/10 border border-rose-500/15 text-[10px] font-semibold text-rose-400 rounded-lg hover:bg-rose-500/20 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{job.company}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase font-bold">Location</span>
                      <span className="text-slate-300 font-semibold truncate">{job.location}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase font-bold">Salary</span>
                      <span className="text-slate-300 font-semibold truncate">{job.salary}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase font-bold">Applicants</span>
                      <span className="text-indigo-400 font-bold">{jobAppsCount} candidates</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.skills?.map((skill, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-slate-400 uppercase">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading text-lg font-bold text-white mb-4">Post a New Job Opening</h3>
            
            <form onSubmit={handlePostJob} className="flex flex-col gap-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Stripe"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="SF, CA or Remote"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Salary Package</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. $120k - $150k"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Experience Level</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid-Senior Level">Mid-Senior Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Job Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-5 select-none text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={remote}
                    onChange={(e) => setRemote(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-slate-950/40 text-indigo-600 focus:ring-0"
                  />
                  This position is fully Remote
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Job Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the core duties, stack, and responsibilities..."
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Skills required (Comma separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, Node.js, Mongoose, REST API"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Requirements (One per line)</label>
                <textarea
                  value={reqsText}
                  onChange={(e) => setReqsText(e.target.value)}
                  placeholder="Must have 3+ years experience&#10;B.Tech in Computer Science preferred"
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruiterDashboard;
