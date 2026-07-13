import { useState } from 'react';
import { useResumeStore } from '../stores/resumeStore';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Activity, ShieldAlert, Award, Copy, Check, Printer, 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Compass, Download, Sparkles, ExternalLink
} from 'lucide-react';
import { downloadFile } from '../api';

export default function ResumeResults() {
  const { currentResume, currentAnalysis, isLoading } = useResumeStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'resume' | 'analysis' | 'recommendations'>('resume');
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Executing ATS Tailoring & Context-Rephrasing...</p>
      </div>
    );
  }

  if (!currentResume || !currentAnalysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4">
        <AlertCircle className="w-12 h-12 text-slate-700" />
        <p className="text-sm font-semibold text-slate-400">No active tailoring run loaded.</p>
        <button
          onClick={() => navigate('/jd')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
        >
          Go to JD Workspace
        </button>
      </div>
    );
  }

  const resume = currentResume.resume_json;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(resume, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!currentResume) return;
    setExportError(null);
    try {
      const filename = `${currentResume.company_name}_${currentResume.role}_Resume.pdf`.replace(/\s+/g, '_');
      await downloadFile(`/resume/export/${currentResume.id}/pdf`, filename);
    } catch (err) {
      setExportError('PDF export failed. Try again or use Print instead.');
    }
  };

  const handleDownloadDOCX = async () => {
    if (!currentResume) return;
    setExportError(null);
    try {
      const filename = `${currentResume.company_name}_${currentResume.role}_Resume.docx`.replace(/\s+/g, '_');
      await downloadFile(`/resume/export/${currentResume.id}/docx`, filename);
    } catch (err) {
      setExportError('DOCX export failed. Try again.');
    }
  };

  const handlePrint = () => {
    // Print the resume section container only
    const printContents = document.getElementById('printable-resume')?.innerHTML;

    if (printContents) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Tailored Resume - ${currentResume.role}</title>
              <style>
                body {
                  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  color: #333;
                  padding: 40px;
                  font-size: 11pt;
                  line-height: 1.5;
                }
                h1 { font-size: 20pt; margin-bottom: 5px; font-weight: bold; text-align: center; }
                h2 { font-size: 12pt; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-top: 20px; font-weight: bold; text-transform: uppercase; color: #444; }
                h3 { font-size: 11pt; margin-top: 10px; margin-bottom: 3px; font-weight: bold; }
                p { margin: 0 0 8px 0; }
                ul { margin: 0 0 10px 0; padding-left: 20px; }
                li { margin-bottom: 4px; }
                .header-links { text-align: center; font-size: 9pt; color: #666; margin-bottom: 20px; }
                .section-header { display: flex; justify-content: space-between; }
                .date-location { text-align: right; font-style: italic; color: #555; }
              </style>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `);
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back navigation and header info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jd')}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                {currentResume.role}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tailored for {currentResume.company_name} on {new Date(currentResume.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">ATS INDEX</span>
              <span className={`text-xl font-black ${
                currentAnalysis.match_percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {currentAnalysis.match_percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-850 gap-2">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all ${
              activeTab === 'resume'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tailored Resume
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all ${
              activeTab === 'analysis'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              ATS Keyword Scan
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all ${
              activeTab === 'recommendations'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Career Coach Action Plan
            </span>
          </button>
        </div>

        {/* TAB 1: RESUME RENDER */}
        {activeTab === 'resume' && (
          <div className="space-y-4">
            
            {/* Options bar */}
            <div className="flex justify-end gap-2 flex-wrap">
              {exportError && (
                <span className="text-[10px] text-rose-400 font-semibold self-center">{exportError}</span>
              )}
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied JSON!' : 'Copy JSON'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Resume
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                Download PDF
              </button>
              <button
                onClick={handleDownloadDOCX}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Download DOCX
              </button>
            </div>

            {/* Resume Sheet (Clean white background simulating paper) */}
            <div 
              id="printable-resume" 
              className="bg-white text-slate-900 rounded-2xl shadow-xl p-12 border border-slate-200 min-h-[900px] overflow-hidden select-text text-[13px] leading-relaxed"
            >
              <div className="max-w-[700px] mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="text-center space-y-1.5 pb-4 border-b border-slate-200">
                  <h1 className="text-2xl font-bold tracking-tight uppercase">
                    {(resume.personal_info?.first_name || 'Candidate')} {(resume.personal_info?.last_name || '')}
                  </h1>
                  <div className="text-[11px] text-slate-500 font-medium space-x-2">
                    {resume.personal_info?.email && <span>{resume.personal_info.email}</span>}
                    {resume.personal_info?.phone && <span>• {resume.personal_info.phone}</span>}
                    {resume.personal_info?.location && <span>• {resume.personal_info.location}</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 space-x-3 mt-1.5 font-bold uppercase tracking-wider">
                    {resume.personal_info?.linkedin && (
                      <a href={resume.personal_info.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-0.5">
                        LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {resume.personal_info?.github && (
                      <a href={resume.personal_info.github} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-0.5">
                        GitHub <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {resume.personal_info?.website && (
                      <a href={resume.personal_info.website} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-0.5">
                        Portfolio <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {resume.summary && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Summary</h2>
                    <p className="text-slate-600 text-justify text-[12px]">{resume.summary}</p>
                  </div>
                )}

                {/* Education */}
                {resume.education?.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Education</h2>
                    {resume.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-[12px]">
                        <div>
                          <h3 className="font-bold text-slate-800">{edu.institution}</h3>
                          <p className="text-slate-500">{edu.degree} in {edu.field_of_study}</p>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <p className="font-bold">{edu.start_date} - {edu.end_date || 'Present'}</p>
                          {edu.gpa && <p className="font-semibold text-slate-600">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills & Tech Stack */}
                {((resume.skills?.length > 0) || (resume.technologies?.length > 0)) && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Skills & Tech Stack</h2>
                    <div className="text-[12px] space-y-1.5">
                      {resume.skills?.length > 0 && (
                        <p><span className="font-bold text-slate-800">Core Skills:</span> {resume.skills.map((s: any) => typeof s === 'object' ? s.name : s).join(', ')}</p>
                      )}
                      {resume.technologies?.length > 0 && (
                        <p><span className="font-bold text-slate-800">Technologies:</span> {resume.technologies.map((t: any) => typeof t === 'object' ? t.name : t).join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience / Internships */}
                {resume.internships?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Internship Experience</h2>
                    {resume.internships.map((intern: any, idx: number) => (
                      <div key={idx} className="space-y-1.5 text-[12px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800">{intern.role}</h3>
                            <p className="text-[11px] text-slate-500 font-semibold">{intern.company} {intern.location && `• ${intern.location}`}</p>
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold shrink-0">{intern.start_date} - {intern.end_date || 'Present'}</span>
                        </div>
                        <p className="text-slate-600 text-justify whitespace-pre-line leading-relaxed">{intern.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {resume.projects?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Projects</h2>
                    {resume.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="space-y-1.5 text-[12px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                              {proj.title}
                              {proj.url && (
                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {proj.role && <span className="font-normal text-slate-500">({proj.role})</span>}
                            </h3>
                            {proj.technologies && <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wide">Stack: {proj.technologies}</p>}
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold shrink-0">{proj.start_date} - {proj.end_date || 'Complete'}</span>
                        </div>
                        <p className="text-slate-600 text-justify whitespace-pre-line leading-relaxed">{proj.description}</p>
                        {proj.outcome && <p className="text-[11px] text-slate-500 italic">📌 Outcome: {proj.outcome}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {resume.certifications?.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Certifications</h2>
                    <ul className="list-disc pl-5 text-[12px] text-slate-600 space-y-1">
                      {resume.certifications.map((cert: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-bold text-slate-800">{cert.name}</span> — {cert.issuer} {cert.issue_date && `(${cert.issue_date})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Leadership & Extracurriculars */}
                {((resume.leadership?.length > 0) || (resume.positions_of_responsibility?.length > 0)) && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold uppercase border-b border-slate-200 pb-1 tracking-wider text-slate-700">Leadership & Responsibility</h2>
                    {resume.leadership?.map((lead: any, idx: number) => (
                      <div key={idx} className="text-[12px]">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800">{lead.role} — {lead.organization}</h3>
                          <span className="text-[11px] text-slate-500 font-bold">{lead.start_date} - {lead.end_date || 'Present'}</span>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line mt-1">{lead.description}</p>
                      </div>
                    ))}
                    {resume.positions_of_responsibility?.map((pos: any, idx: number) => (
                      <div key={idx} className="text-[12px]">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800">{pos.role} — {pos.organization}</h3>
                          <span className="text-[11px] text-slate-500 font-bold">{pos.start_date} - {pos.end_date || 'Present'}</span>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line mt-1">{pos.description}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATS KEYWORD SCAN */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score Wheel */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">ATS Score Index</span>
              
              <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center mt-6 relative">
                <span className={`text-3xl font-black ${
                  currentAnalysis.match_percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {currentAnalysis.match_percentage}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-6 leading-relaxed px-4">
                Score based on matching keyword parameters and educational criteria matching the target JD.
              </p>
            </div>

            {/* Gaps / Matching skills */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Skills matched vs missing */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary-400" />
                  Skills Matching Ledger
                </h3>

                {/* Matching Pills */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                    Matching Skills ({currentAnalysis.matching_skills.length})
                  </label>
                  {currentAnalysis.matching_skills.length === 0 ? (
                    <span className="text-xs text-slate-600 italic block">No exact keyword matches found.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {currentAnalysis.matching_skills.map((skill) => (
                        <span 
                          key={skill}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-950/20 text-xs font-bold rounded-lg"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Pills */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                    Missing Required Skills ({currentAnalysis.missing_skills.length})
                  </label>
                  {currentAnalysis.missing_skills.length === 0 ? (
                    <span className="text-xs text-emerald-500 italic block">No missing skills detected! Complete coverage.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {currentAnalysis.missing_skills.map((skill) => (
                        <span 
                          key={skill}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-950/40 text-slate-500 border border-slate-800 text-xs font-bold rounded-lg"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths & Gaps lists */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-800 pb-2">
                    Profile Highlights
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs font-medium text-slate-300">
                    {currentAnalysis.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-800 pb-2">
                    Critical Gaps / Weaknesses
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs font-medium text-slate-400">
                    {(currentAnalysis.weaknesses || currentAnalysis.gaps || []).map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing Experience & Certs Grid */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-800 pb-2">
                    Experience Gaps
                  </h4>
                  {(!currentAnalysis.missing_experience || currentAnalysis.missing_experience.length === 0) ? (
                    <span className="text-xs text-emerald-500 italic block mt-3">Experience requirements satisfied!</span>
                  ) : (
                    <ul className="mt-3 space-y-2 text-xs font-medium text-slate-400">
                      {currentAnalysis.missing_experience.map((exp, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          {exp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-800 pb-2">
                    Credential Gaps
                  </h4>
                  {(!currentAnalysis.missing_certifications || currentAnalysis.missing_certifications.length === 0) ? (
                    <span className="text-xs text-emerald-500 italic block mt-3">Certification requirements satisfied!</span>
                  ) : (
                    <ul className="mt-3 space-y-2 text-xs font-medium text-slate-400">
                      {currentAnalysis.missing_certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Action Recommendations */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary-400" />
                Career Coach Action Plan
              </h3>
              
              <p className="text-slate-400 text-xs leading-relaxed">
                Based on the comparison between your loaded profile and the JD target requirements, complete these actions to maximize candidacy:
              </p>

              <div className="space-y-4">
                {currentAnalysis.recommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start gap-4"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="text-xs font-medium leading-relaxed text-slate-200">
                      {rec}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Roadmap */}
            {currentAnalysis.improvement_roadmap && currentAnalysis.improvement_roadmap.length > 0 && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Self-Paced Improvement Roadmap
                </h3>
                <div className="relative border-l border-slate-800 ml-4 space-y-6">
                  {currentAnalysis.improvement_roadmap.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      {/* Node point */}
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-medium leading-relaxed text-slate-300 whitespace-pre-line">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
