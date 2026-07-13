import { useEffect, useState } from 'react';
import { useResumeStore } from '../stores/resumeStore';
import { useLocation } from 'react-router-dom';
import { FileText, ArrowRight, X, Download, Trash2 } from 'lucide-react';
import { downloadFile } from '../api';

export default function HistoryPage() {
  const { history, fetchHistory, fetchResumeDetails, deleteResumeHistory, currentResume, isLoading } = useResumeStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sessionTab, setSessionTab] = useState<'resume' | 'jd' | 'ats'>('resume');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle opening directly from navigation state (e.g. Dashboard clicking recent logs)
  useEffect(() => {
    const state = location.state as { openItemId?: number } | null;
    if (state?.openItemId) {
      handleOpenItem(state.openItemId);
    }
  }, [location]);

  const handleDownloadPDF = async () => {
    if (!currentResume) return;
    try {
      const filename = `${currentResume.company_name}_${currentResume.role}_Resume.pdf`.replace(/\s+/g, '_');
      await downloadFile(`/resume/export/${currentResume.id}/pdf`, filename);
    } catch (err) {
      alert("Failed to export PDF resume.");
    }
  };

  const handleDownloadDOCX = async () => {
    if (!currentResume) return;
    try {
      const filename = `${currentResume.company_name}_${currentResume.role}_Resume.docx`.replace(/\s+/g, '_');
      await downloadFile(`/resume/export/${currentResume.id}/docx`, filename);
    } catch (err) {
      alert("Failed to export DOCX resume.");
    }
  };

  const handleOpenItem = async (id: number) => {
    setSelectedId(id);
    try {
      await fetchResumeDetails(id);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch record details');
    }
  };

  const handleClose = () => {
    setSelectedId(null);
  };

  const handleDeleteHistory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      await deleteResumeHistory(confirmDeleteId);
      if (selectedId === confirmDeleteId) setSelectedId(null);
    } catch (_) {}
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Delete Confirmation Modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm">Delete Resume Record</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">This will permanently delete this tailoring session. This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <header className="pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">History Archive</h1>
          <p className="text-slate-500 text-xs mt-1">
            Access previous resume tailoring sessions, view match performance, and download generated data.
          </p>
        </header>

        {/* History Grid/List */}
        {history.length === 0 ? (
          <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center space-y-4 bg-slate-900/10">
            <FileText className="w-12 h-12 text-slate-700 mx-auto" />
            <div>
              <p className="text-sm text-slate-400 font-bold">No runs archived</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Trigger resume tailoring using the target workspace page to archive records.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/10 border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-slate-850">
              {history.map((run) => (
                <div 
                  key={run.id}
                  onClick={() => handleOpenItem(run.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4" onClick={() => handleOpenItem(run.id)}>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-tight">{run.role}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{run.company_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end" onClick={() => handleOpenItem(run.id)}>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Date Run</span>
                      <span className="text-xs font-semibold text-slate-400">{new Date(run.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">ATS Match</span>
                      <span className={`text-xs font-extrabold ${
                        run.ats_score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>{run.ats_score}%</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-700 hidden sm:block" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(run.id, e)}
                    title="Delete record"
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-600 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* DETAIL OVERLAY MODAL */}
      {selectedId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-tight">Tailoring Session Log</h3>
                {currentResume && (
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {currentResume.role} @ {currentResume.company_name} — {new Date(currentResume.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg text-slate-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading || !currentResume ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold">Retrieving session records...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Modal Tab Selector */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
                    <button
                      onClick={() => setSessionTab('resume')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        sessionTab === 'resume' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      Tailored Resume JSON
                    </button>
                    <button
                      onClick={() => setSessionTab('jd')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        sessionTab === 'jd' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      Original Job Description
                    </button>
                    <button
                      onClick={() => setSessionTab('ats')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        sessionTab === 'ats' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      ATS report & Action Plan
                    </button>
                  </div>

                  {sessionTab === 'resume' && (
                    <div className="space-y-2 animate-in fade-in duration-150">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Generated Resume Details</h4>
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 max-h-[50vh] overflow-y-auto font-mono text-[10px] text-slate-400 select-all whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(currentResume.resume_json, null, 2)}
                      </div>
                    </div>
                  )}

                  {sessionTab === 'jd' && (
                    <div className="space-y-2 animate-in fade-in duration-150">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Original Job Description</h4>
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 max-h-[50vh] overflow-y-auto leading-relaxed text-xs text-slate-300">
                        {currentResume.jd ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                              <div>
                                <h5 className="font-extrabold text-white text-sm">{currentResume.jd.role}</h5>
                                <span className="text-slate-500 text-[10px]">{currentResume.jd.company_name}</span>
                              </div>
                              <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(currentResume.jd.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{currentResume.jd.jd_text}</p>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">Original Job Description text was removed or is not available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {sessionTab === 'ats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-white uppercase">ATS Match Rating</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Based on profile-JD parameters</p>
                          </div>
                          <span className={`text-2xl font-black ${
                            currentResume.ats_score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>{currentResume.ats_score}%</span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Matching Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {currentResume.ats_analysis_json.matching_skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-950/20 text-[10px] font-bold rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Missing Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {currentResume.ats_analysis_json.missing_skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-slate-850 text-slate-400 border border-slate-800 text-[10px] font-bold rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Action Plan Recommendations</h4>
                          <ul className="space-y-2">
                            {currentResume.ats_analysis_json.recommendations.map((rec, i) => (
                              <li key={i} className="text-[11px] font-medium leading-relaxed text-slate-300 flex items-start gap-2">
                                <span className="text-primary-500 shrink-0">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {currentResume.ats_analysis_json.improvement_roadmap && currentResume.ats_analysis_json.improvement_roadmap.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Self-Paced Improvement Roadmap</h4>
                            <div className="relative border-l border-slate-850 ml-2 space-y-4">
                              {currentResume.ats_analysis_json.improvement_roadmap.map((step, idx) => (
                                <div key={idx} className="relative pl-5">
                                  <span className="absolute -left-[8px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[7px] font-black text-white">
                                    {idx + 1}
                                  </span>
                                  <p className="text-[11px] font-medium leading-relaxed text-slate-400 whitespace-pre-line">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex justify-end gap-2">
              {currentResume && (
                <>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-950/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleDownloadDOCX}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-sky-950/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download DOCX
                  </button>
                </>
              )}
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700/50"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
