import React from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Calendar, MessageSquare, Tag, MapPin, ChevronRight, CheckCircle } from 'lucide-react';

const ApplicationTracking = () => {
  const { applications } = useApp();

  const columns = [
    { id: 'Applied', title: 'Submitted', colorClass: 'border-amber-500/20 bg-amber-500/[0.02]', textClass: 'text-amber-400' },
    { id: 'Shortlisted', title: 'Shortlisted', colorClass: 'border-cyan-500/20 bg-cyan-500/[0.02]', textClass: 'text-cyan-400' },
    { id: 'Interview', title: 'Interviews', colorClass: 'border-indigo-500/20 bg-indigo-500/[0.02]', textClass: 'text-indigo-400' },
    { id: 'Selected', title: 'Selected / Hired', colorClass: 'border-emerald-500/20 bg-emerald-500/[0.02]', textClass: 'text-emerald-400' },
  ];

  const getAppsForColumn = (columnId) => {
    return applications.filter((app) => app.status === columnId);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 pb-20 relative text-left">
      
      {/* Banner */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-[150px] bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Tracking Board</span>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">Hiring Lifecycle Kanban</h2>
        <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed mt-1">
          Monitor your ongoing applications. Recruiter status updates will automatically transition cards between columns in real-time.
        </p>
      </section>

      {/* Funnel Pipeline Analytics */}
      {applications.length > 0 && (
        <section className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-white/5 animate-in fade-in duration-300">
          <h3 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
            Pipeline Analytics & Funnel Conversion
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            
            <div className="flex flex-col gap-1 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total Applications</span>
              <span className="text-xl font-extrabold text-white font-heading">{applications.length} Submitted</span>
              <div className="w-full h-1 bg-indigo-500 rounded-full mt-1" />
            </div>

            <div className="flex flex-col gap-1 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Shortlisted Conversion</span>
              <span className="text-xl font-extrabold text-cyan-400 font-heading">
                {applications.length > 0 
                  ? Math.round((applications.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length / applications.length) * 100) 
                  : 0}%
              </span>
              <div className="w-full h-1 bg-cyan-400 rounded-full mt-1" style={{ width: `${applications.length > 0 ? (applications.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length / applications.length) * 100 : 0}%` }} />
            </div>

            <div className="flex flex-col gap-1 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Interview Progression</span>
              <span className="text-xl font-extrabold text-purple-400 font-heading">
                {applications.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length > 0
                  ? Math.round((applications.filter(a => ['Interview', 'Selected'].includes(a.status)).length / applications.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length) * 100)
                  : 0}%
              </span>
              <div className="w-full h-1 bg-purple-400 rounded-full mt-1" style={{ width: `${applications.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length > 0 ? (applications.filter(a => ['Interview', 'Selected'].includes(a.status)).length / applications.filter(a => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length) * 100 : 0}%` }} />
            </div>

            <div className="flex flex-col gap-1 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Offer Placement Rate</span>
              <span className="text-xl font-extrabold text-emerald-400 font-heading">
                {applications.filter(a => ['Interview', 'Selected'].includes(a.status)).length > 0
                  ? Math.round((applications.filter(a => a.status === 'Selected').length / applications.filter(a => ['Interview', 'Selected'].includes(a.status)).length) * 100)
                  : 0}%
              </span>
              <div className="w-full h-1 bg-emerald-400 rounded-full mt-1" style={{ width: `${applications.filter(a => ['Interview', 'Selected'].includes(a.status)).length > 0 ? (applications.filter(a => a.status === 'Selected').length / applications.filter(a => ['Interview', 'Selected'].includes(a.status)).length) * 100 : 0}%` }} />
            </div>

          </div>
        </section>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colApps = getAppsForColumn(col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col gap-4 min-h-[500px] transition-all duration-300 ${col.colorClass}`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`font-heading font-bold text-xs uppercase tracking-wider ${col.textClass}`}>
                  {col.title}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-1">
                {colApps.length === 0 ? (
                  <div className="py-12 text-center text-[10px] text-slate-500 font-light italic">
                    No active applications.
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app._id}
                      className="glass-card p-4 rounded-xl flex flex-col gap-3 hover:-translate-y-1 hover:border-white/10 hover:shadow-lg transition-all"
                    >
                      {/* Job Title & Company */}
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-xs font-bold text-white leading-snug truncate">
                          {app.job?.title}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-semibold truncate">
                          {app.job?.company}
                        </span>
                      </div>

                      {/* Details: Salary & Location */}
                      <div className="flex justify-between items-center text-[9px] text-slate-400 border-b border-white/5 pb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {app.job?.location}
                        </span>
                        <span className="text-emerald-400 font-bold">{app.job?.salary}</span>
                      </div>

                      {/* Recruiter Notes / Updates */}
                      {app.notes && (
                        <div className="p-2 rounded bg-slate-950/40 border border-white/5 text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic font-light">{app.notes}</p>
                        </div>
                      )}

                      {/* Footer Dates */}
                      <div className="flex justify-between items-center pt-1 text-[9px] text-slate-500 font-medium">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-slate-600" /> {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                        {col.id === 'Selected' && (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5 animate-pulse">
                            <CheckCircle className="w-3 h-3" /> Hired
                          </span>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ApplicationTracking;
