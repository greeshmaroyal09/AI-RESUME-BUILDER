import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, ArrowLeft, Loader2, Target,
  CheckCircle2, AlertCircle, ChevronRight, Briefcase
} from 'lucide-react';

export default function AnalyzeResumePage() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !role.trim()) {
      setError("Please enter a target role and select a resume file.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('role', role);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/api/resume/analyze-upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');
      if (data.status === 'success') {
        setResult(data.data);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper for Circular Progress
  const CircularProgress = ({ value, label, colorClass }: { value: number, label: string, colorClass: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-800"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={colorClass}
            strokeWidth="3"
            strokeDasharray={`${value}, 100`}
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-xl font-black text-white">{value}%</span>
      </div>
      <span className="text-xs text-slate-400 font-bold mt-3 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">Analyze Existing Resume</h1>
            <p className="text-sm text-slate-500 mt-1">Upload a PDF/DOCX to get instant ATS feedback against a target role.</p>
          </div>
        </div>

        {!result ? (
          /* Input State */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1: Select JD */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-white">1. Select Target Role</h2>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g. AI Engineer, Software Developer..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            {/* Step 2: Upload Resume */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-white">2. Upload Resume</h2>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
                  file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30 bg-slate-900/20'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                />
                <Upload className={`w-8 h-8 mb-3 ${file ? 'text-emerald-400' : 'text-slate-500'}`} />
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-400">{file.name}</p>
                    <p className="text-xs text-emerald-600 mt-1">Ready to analyze</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-slate-300">Click to upload PDF or DOCX</p>
                    <p className="text-xs text-slate-500 mt-1">Max 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button & Errors */}
            <div className="col-span-full flex flex-col items-center mt-4">
              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || !role.trim()}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary-950/20 transition-all text-lg w-full md:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning Resume...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Result State */
          <div className="space-y-6">
            
            {/* Top Score Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
              <div className="flex items-center gap-8 mb-6 md:mb-0">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={result.ats_score >= 80 ? "text-emerald-500" : result.ats_score >= 60 ? "text-amber-500" : "text-rose-500"}
                      strokeWidth="3.5"
                      strokeDasharray={`${result.ats_score}, 100`}
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{result.ats_score}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">ATS Match Score</h2>
                  <p className="text-slate-400 mt-2 max-w-sm">
                    {result.ats_score >= 80 
                      ? "Excellent! Your resume is highly optimized for this role." 
                      : result.ats_score >= 60
                      ? "Good, but could be better. Addressing missing skills will boost your score."
                      : "Low match. Substantial tailoring is required to pass ATS filters."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setResult(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold border border-slate-600 transition-colors"
              >
                Analyze Another
              </button>
            </div>

            {/* Sub Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center">
                <CircularProgress 
                  value={result.resume_quality} 
                  label="Resume Quality" 
                  colorClass={result.resume_quality >= 80 ? "text-emerald-500" : "text-amber-500"} 
                />
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center">
                <CircularProgress 
                  value={result.keyword_optimization || result.ats_score} 
                  label="Keyword Optimization" 
                  colorClass={(result.keyword_optimization || result.ats_score) >= 80 ? "text-emerald-500" : "text-amber-500"} 
                />
              </div>
            </div>

            {/* Missing Skills & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Missing Skills Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-white">Missing Skills</h3>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matching_skills?.length > 0 ? (
                      result.matching_skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None detected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills?.length > 0 ? (
                      result.missing_skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-lg">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-primary-400 mb-6">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-white">Actionable Suggestions</h3>
                </div>
                
                <ul className="space-y-4">
                  {result.improvement_suggestions?.map((suggestion: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <ChevronRight className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
