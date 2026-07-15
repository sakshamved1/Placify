import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Map, ChevronRight, Award, Compass, RefreshCw, CheckSquare, Square, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

const AICareerRoadmap = () => {
  const { user, generateRoadmap, showToast } = useApp();
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [completedSkills, setCompletedSkills] = useState({});
  const [completedMilestones, setCompletedMilestones] = useState({});

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setLoading(true);
    setRoadmap(null);
    setCompletedSkills({});
    setCompletedMilestones({});

    try {
      const data = await generateRoadmap(targetRole);
      setRoadmap(data);
      showToast('Career Roadmap Ready', `Tailored timeline generated to help you become a ${targetRole}.`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (milestoneIdx, skillIdx, skillName) => {
    const key = `${milestoneIdx}-${skillIdx}`;
    const nextVal = !completedSkills[key];
    setCompletedSkills(prev => ({ ...prev, [key]: nextVal }));
    
    if (nextVal) {
      showToast('Skill Acquired', `Marked "${skillName}" as complete!`, 'success');
    }
  };

  const toggleMilestone = (milestoneIdx, milestoneName) => {
    const nextVal = !completedMilestones[milestoneIdx];
    setCompletedMilestones(prev => ({ ...prev, [milestoneIdx]: nextVal }));
    
    if (nextVal) {
      showToast('Milestone Completed', `Congratulations! Checked off "${milestoneName}"`, 'success');
    }
  };

  // Calculate overall learning progression percent
  const getProgressionPercentage = () => {
    if (!roadmap) return 0;
    const totalMilestones = roadmap.milestones.length;
    const completed = Object.values(completedMilestones).filter(v => v).length;
    return Math.round((completed / totalMilestones) * 100);
  };

  return (
    <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-brand-accent/5 rounded-full blur-[50px] pointer-events-none" />
      
      <div className="border-b border-white/5 pb-3">
        <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-400" /> AI Career Roadmap Generator
        </h3>
        <p className="text-[11px] text-slate-400 mt-1 font-light">
          Generate an interactive milestone roadmap customized to bridge your current skills into your target placements role.
        </p>
      </div>

      {/* Target input Form */}
      <form onSubmit={handleGenerateRoadmap} className="flex gap-3 items-end">
        <div className="flex-1 flex flex-col gap-1.5 w-full text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Target Professional Role</label>
          <input
            type="text"
            required
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Full Stack Developer, DevOps Engineer, Data Scientist"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !targetRole.trim()}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4.5 h-4.5 animate-spin" />
          ) : (
            'Generate Roadmap'
          )}
        </button>
      </form>

      {/* Roadmap visualization */}
      {roadmap && (
        <div className="flex flex-col gap-5 mt-2 animate-in fade-in duration-300">
          
          {/* Progression header */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/30 border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 capitalize">{roadmap.role} Learning Path</span>
              <span className="font-bold text-emerald-400">{getProgressionPercentage()}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-300"
                style={{ width: `${getProgressionPercentage()}%` }}
              />
            </div>
          </div>

          {/* Timeline Milestones list */}
          <div className="flex flex-col gap-6 relative pl-6 border-l border-white/10 ml-2 py-2">
            {roadmap.milestones.map((milestone, mIdx) => {
              const isMilestoneCompleted = !!completedMilestones[mIdx];
              return (
                <div key={mIdx} className="relative text-left flex flex-col gap-3">
                  
                  {/* Timeline Dot */}
                  <button
                    onClick={() => toggleMilestone(mIdx, milestone.name)}
                    className={`absolute -left-9 top-1 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isMilestoneCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-white/15 hover:border-indigo-500 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isMilestoneCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold font-mono">{mIdx + 1}</span>
                    )}
                  </button>

                  {/* Header Details */}
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1.5 pr-2">
                    <h4 className={`font-heading font-bold text-sm transition-all ${
                      isMilestoneCompleted ? 'text-slate-400 line-through' : 'text-white'
                    }`}>
                      {milestone.name}
                    </h4>
                    <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3 text-slate-500" /> {milestone.duration}
                    </span>
                  </div>

                  {/* Sub-Card */}
                  <div className={`p-4 rounded-xl border transition-all flex flex-col gap-3.5 ${
                    isMilestoneCompleted
                      ? 'bg-white/[0.01] border-white/5 opacity-60'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}>
                    
                    {/* Skills Checklist */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Skills</span>
                      <div className="flex flex-wrap gap-2">
                        {milestone.skills.map((skill, sIdx) => {
                          const isSkillChecked = !!completedSkills[`${mIdx}-${sIdx}`];
                          return (
                            <button
                              key={sIdx}
                              onClick={() => toggleSkill(mIdx, sIdx, skill)}
                              className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                                isSkillChecked
                                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                  : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/15'
                              }`}
                            >
                              {isSkillChecked ? <CheckCircle className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Learning Resources</span>
                      <div className="flex flex-col gap-1 pt-0.5">
                        {milestone.resources.map((res, rIdx) => (
                          <div key={rIdx} className="text-[10px] text-slate-300 font-light flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-indigo-400" />
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Empty State */}
      {!roadmap && !loading && (
        <div className="py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <Map className="w-8 h-8 text-slate-700" />
          <span className="text-xs text-slate-500">
            Current skills in your profile ({user.profile?.skills?.length || 0} indexed) will be analyzed to construct milestone objectives.
          </span>
        </div>
      )}

    </div>
  );
};

export default AICareerRoadmap;
