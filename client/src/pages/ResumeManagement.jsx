import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, HelpCircle, Download, ArrowUpRight, Zap, RefreshCw, Award } from 'lucide-react';

const ResumeManagement = () => {
  const { user, uploadResume } = useApp();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const hasResume = !!user.profile?.resumeUrl;
  const atsScore = user.profile?.atsScore || 0;
  const suggestions = user.profile?.resumeSuggestions || [];
  const resumeName = user.profile?.resumeOriginalName || '';

  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { getResumeFeedback } = useApp();

  const loadAIFeedback = async () => {
    if (!hasResume) return;
    setLoadingAI(true);
    try {
      const data = await getResumeFeedback();
      setAiData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (hasResume) {
      loadAIFeedback();
    } else {
      setAiData(null);
    }
  }, [hasResume]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await uploadResume(formData);
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Determine score color classes
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 60) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const strokeDashoffset = 2 * Math.PI * 40 * (1 - atsScore / 100);

  return (
    <div className="flex-1 flex flex-col gap-6 pb-20 relative text-left">
      
      {/* Banner */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-[150px] bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Credentials</span>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">SaaS Resume Evaluator</h2>
        <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed mt-1">
          Upload your resume to calculate keyword density scores against elite recruiter search metrics and receive styling suggestions.
        </p>
      </section>

      {/* Grid: Scorer on Left (4 cols), Upload Panel on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Score & Suggestions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Circular Progress Scorer */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
            <h3 className="font-heading font-bold text-white text-sm w-full border-b border-white/5 pb-2 text-left">
              ATS Compliance Score
            </h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center mt-2">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track circle */}
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                {/* Foreground active stroke */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="transparent"
                  strokeWidth="6"
                  className={`transition-all duration-1000 ${getScoreColorClass(atsScore)}`}
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - atsScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-heading">{atsScore}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Rating</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <span className={`text-xs font-bold ${
                atsScore >= 80 ? 'text-emerald-400' : atsScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {atsScore >= 80 ? 'Excellent Match' : atsScore >= 60 ? 'Needs Improvement' : 'Insufficient Keywords'}
              </span>
              <p className="text-[10px] text-slate-500 font-light max-w-[220px]">
                {hasResume
                  ? 'Your resume is loaded and compliance matches are indexed.'
                  : 'Please upload a PDF/DOCX file to analyze your ATS score.'}
              </p>
            </div>
          </div>

          {/* Suggestions panel */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-heading font-bold text-white text-sm pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" /> Actionable Recommendations
            </h3>

            <div className="flex flex-col gap-3">
              {suggestions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 flex flex-col items-center gap-1.5">
                  <HelpCircle className="w-6 h-6 text-slate-700" />
                  <span>No active recommendations available.</span>
                </div>
              ) : (
                suggestions.map((sug, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs font-light text-slate-300 leading-normal">
                    {atsScore >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{sug}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Audit Critique Panel */}
          {loadingAI ? (
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-xs text-slate-500 font-semibold">Gemini auditing resume format...</span>
            </div>
          ) : aiData ? (
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left animate-in fade-in duration-300">
              <h3 className="font-heading font-bold text-white text-sm pb-2 border-b border-white/5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" /> Gemini AI Audit Details
              </h3>
              <div className="flex flex-col gap-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Candidate Strengths</span>
                  <div className="flex flex-col gap-1.5">
                    {aiData.strengths?.map((str, idx) => (
                      <span key={idx} className="text-slate-300 font-light leading-normal">&bull; {str}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Formatting Critique</span>
                  <p className="text-slate-300 font-light italic leading-relaxed">"{aiData.formatCritique}"</p>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        {/* Right Side: Upload Dropzone & File Metadata (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-5">
            <h3 className="font-heading font-bold text-white text-sm pb-2 border-b border-white/5">
              Manage Resume Document
            </h3>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/[0.03]'
                  : 'border-white/10 hover:border-indigo-500/55 hover:bg-white/[0.01]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UploadCloud className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white">Drag & drop your resume file here</span>
                <span className="text-[10px] text-slate-500">Supports PDF, DOCX, DOC, or TXT formats (Max 10MB)</span>
              </div>
            </div>

            {/* Selected File Details */}
            {file && (
              <div className="p-4 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/15 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-white truncate">{file.name}</span>
                    <span className="text-[9px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; Selected</span>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-semibold rounded-lg hover:opacity-90 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>Analyze <ArrowUpRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            )}

            {/* Currently Active Resume Metadata */}
            {hasResume && !file && (
              <div className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-white truncate">{resumeName}</span>
                    <span className="text-[9px] text-slate-500">Active CV &bull; Scanned Score: {atsScore}%</span>
                  </div>
                </div>
                <a
                  href={user.profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default ResumeManagement;
