import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, ChevronRight, CheckCircle, RefreshCw, Send, Zap, Award, BookOpen } from 'lucide-react';

const AIInterviewCoach = () => {
  const { applications, getInterviewPrep, showToast } = useApp();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [showIntent, setShowIntent] = useState(false);

  const activeApplications = applications.filter(a => a.status === 'Interview' || a.status === 'Applied' || a.status === 'Shortlisted');

  const handleGenerateQuestions = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setQuestions([]);
    setActiveIndex(0);
    setAnswers({});
    setShowHint(false);
    setShowIntent(false);

    try {
      const data = await getInterviewPrep(selectedJobId);
      setQuestions(data.questions || []);
      showToast('Interview Questions Generated', 'AI has tailored questions based on your profile & job requirements.', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (index) => {
    if (!answers[index] || answers[index].trim() === '') {
      showToast('Input Required', 'Please draft a mock answer before submitting.', 'info');
      return;
    }
    showToast('Mock Response Saved', 'Answer drafted. Optimize your delivery based on the hints.', 'success');
  };

  return (
    <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-brand-primary/5 rounded-full blur-[50px] pointer-events-none" />
      
      <div className="border-b border-white/5 pb-3">
        <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" /> AI Interview Coaching
        </h3>
        <p className="text-[11px] text-slate-400 mt-1 font-light">
          Get 5 tailored practice questions generated dynamically by Gemini based on your resume matching corporate job profiles.
        </p>
      </div>

      {/* Selection Control */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 flex flex-col gap-1.5 w-full">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Position</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="">-- Choose Position --</option>
            {activeApplications.map((app) => {
              const titleStr = app.job?.title || 'Unknown Position';
              const companyStr = app.job?.company || 'Corporate Partner';
              return (
                <option key={app._id} value={app.job?._id || app.job || app._id}>
                  {titleStr} at {companyStr}
                </option>
              );
            })}
          </select>
        </div>
        <button
          onClick={handleGenerateQuestions}
          disabled={loading || !selectedJobId}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4.5 h-4.5 animate-spin" />
          ) : (
            'Generate Questions'
          )}
        </button>
      </div>

      {/* Question Carousel */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-4 mt-2 animate-in fade-in duration-300">
          
          {/* Timeline Indicators */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl text-xs">
            <span className="font-semibold text-indigo-400">Question {activeIndex + 1} of 5</span>
            <div className="flex gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    setShowHint(false);
                    setShowIntent(false);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeIndex
                      ? 'bg-indigo-400 scale-110'
                      : idx < activeIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Question Display */}
          <div className="p-5 rounded-2xl bg-indigo-500/[0.02] border border-indigo-500/10 flex flex-col gap-4">
            <h4 className="font-heading font-extrabold text-sm sm:text-base text-white leading-relaxed">
              {questions[activeIndex].question}
            </h4>

            {/* Hint toggles */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowIntent(!showIntent)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                  showIntent
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/15'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Why they ask this
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                  showHint
                    ? 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/15'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Prep Tips
              </button>
            </div>

            {/* Hint Panels */}
            {showIntent && (
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/10 text-[10px] text-purple-300 leading-normal animate-in slide-in-from-top-1 duration-200">
                <span className="font-bold uppercase tracking-wider block mb-1">Recruiter Intent</span>
                {questions[activeIndex].intent}
              </div>
            )}

            {showHint && (
              <div className="p-3.5 rounded-xl bg-pink-950/20 border border-pink-500/10 text-[10px] text-pink-300 leading-normal animate-in slide-in-from-top-1 duration-200">
                <span className="font-bold uppercase tracking-wider block mb-1">Structured Response Guideline</span>
                {questions[activeIndex].hint}
              </div>
            )}

            {/* Answer drafting text area */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Draft practice response</label>
              <textarea
                value={answers[activeIndex] || ''}
                onChange={(e) => setAnswers({ ...answers, [activeIndex]: e.target.value })}
                placeholder="Draft your bullet points or STAR answers here..."
                rows="3"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <button
                  onClick={() => {
                    if (activeIndex > 0) {
                      setActiveIndex(activeIndex - 1);
                      setShowHint(false);
                      setShowIntent(false);
                    }
                  }}
                  disabled={activeIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-[10px] font-bold text-slate-400 disabled:opacity-30"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnswerSubmit(activeIndex)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    Save Draft <Send className="w-3 h-3" />
                  </button>
                  {activeIndex < 4 ? (
                    <button
                      onClick={() => {
                        setActiveIndex(activeIndex + 1);
                        setShowHint(false);
                        setShowIntent(false);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-[10px] font-bold"
                    >
                      Next Question
                    </button>
                  ) : (
                    <div className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Prep Complete
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {questions.length === 0 && !loading && (
        <div className="py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <BookOpen className="w-8 h-8 text-slate-700" />
          <span className="text-xs text-slate-500">
            {activeApplications.length === 0
              ? 'Please apply to a job position first to initiate interview preparation coaching.'
              : 'Select a target job from the dropdown above and generate practice questions.'}
          </span>
        </div>
      )}

    </div>
  );
};

export default AIInterviewCoach;
