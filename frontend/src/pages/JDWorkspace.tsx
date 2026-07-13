import { useState, useEffect } from 'react';
import { useJDStore, type JobDescription } from '../stores/jdStore';
import { useResumeStore } from '../stores/resumeStore';
import { useProfileStore } from '../stores/profileStore';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Plus, Edit3, Trash2, Calendar, AlertCircle, RefreshCw, Briefcase
} from 'lucide-react';

export default function JDWorkspace() {
  const { jds, isLoading, error: jdError, fetchJDs, createJD, updateJD, deleteJD, clearError } = useJDStore();
  const { generateResume, isLoading: isGenerating } = useResumeStore();
  const { completionPercentage, fetchProfile } = useProfileStore();
  
  const navigate = useNavigate();

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  // Confirmation modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  // Profile incomplete warning
  const [showProfileWarning, setShowProfileWarning] = useState(false);

  useEffect(() => {
    fetchJDs();
    fetchProfile();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCompanyName('');
    setRole('');
    setJdText('');
    setFormError(null);
    setShowForm(false);
    clearError();
  };

  const startEdit = (jd: JobDescription) => {
    setEditingId(jd.id);
    setCompanyName(jd.company_name);
    setRole(jd.role);
    setJdText(jd.jd_text);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const data = {
      company_name: companyName.trim(),
      role: role.trim(),
      jd_text: jdText.trim()
    };

    // Fix 5: Duplicate prevention — block same company+role
    if (editingId === null) {
      const duplicate = jds.find(
        (j) =>
          j.company_name.toLowerCase() === data.company_name.toLowerCase() &&
          j.role.toLowerCase() === data.role.toLowerCase()
      );
      if (duplicate) {
        setFormError(`A JD for "${data.role}" at "${data.company_name}" already exists. Edit that entry instead.`);
        return;
      }
    }

    try {
      if (editingId !== null) {
        await updateJD(editingId, data);
      } else {
        await createJD(data);
      }
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save Job Description');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      await deleteJD(confirmDeleteId);
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete JD');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleGenerate = async (jdId: number) => {
    if (completionPercentage === 0) {
      setShowProfileWarning(true);
      return;
    }
    
    try {
      await generateResume(jdId);
      navigate('/results');
    } catch (err: any) {
      setFormError(err.message || 'Resume generation failed. Please check your profile data.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Delete Confirmation Modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm">Delete Job Description</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">This will permanently remove this target role. Any resumes generated from it will remain in History.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Incomplete Warning Modal */}
        {showProfileWarning && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm">Profile Incomplete</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">Please fill out your Personal Info in the Profile Builder before generating a resume.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowProfileWarning(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">Dismiss</button>
                <button onClick={() => { setShowProfileWarning(false); navigate('/profile'); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all">Go to Profile</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Target JD Workspace</h1>
            <p className="text-slate-500 text-xs mt-1">
              Add specific roles and full Job Descriptions (max 3) to execute ATS tailoring.
            </p>
          </div>

          {!showForm && jds.length < 3 && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Configure Target Role
            </button>
          )}
        </header>

        {/* Errors */}
        {(formError || jdError) && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{formError || jdError}</div>
          </div>
        )}

        {/* JD Configuration Form */}
        {showForm && (
          <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wide">
              {editingId !== null ? 'Modify Job Description' : 'Add Target Job Description'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Company Name</label>
                  <input
                    type="text" required placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Target Role / Title</label>
                  <input
                    type="text" required placeholder="e.g. SWE Intern"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Full Job Description Text</label>
                <textarea
                  rows={8} required placeholder="Paste the complete JD, responsibilities, and requirements here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {isLoading ? 'Saving...' : 'Save Config'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* JD cards list */}
        {jds.length === 0 ? (
          <div className="p-12 border border-dashed border-slate-800/80 rounded-2xl text-center space-y-4 bg-slate-900/10">
            <Briefcase className="w-12 h-12 text-slate-700 mx-auto" />
            <div>
              <p className="text-sm text-slate-400 font-bold">No active JDs configured</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Configure target job descriptions to let the AI platform scan keywords and automatically tailor your resume.
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Add Target JD
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jds.map((jd) => (
              <div 
                key={jd.id}
                className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-tight">{jd.role}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">{jd.company_name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(jd)}
                        className="p-1.5 hover:bg-slate-800 hover:text-white text-slate-500 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(jd.id)}
                        className="p-1.5 hover:bg-slate-800 hover:text-rose-400 text-slate-500 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-6">
                    {jd.jd_text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-700" />
                    {new Date(jd.created_at).toLocaleDateString()}
                  </span>
                  
                  <button
                    onClick={() => handleGenerate(jd.id)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Tailor Resume
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
