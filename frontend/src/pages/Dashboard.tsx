import { useEffect } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { useJDStore } from '../stores/jdStore';
import { useResumeStore } from '../stores/resumeStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, AlertCircle, Briefcase, Plus, FileText, ArrowRight,
  TrendingUp, Activity, Award
} from 'lucide-react';

export default function Dashboard() {
  const { completionPercentage, sectionsStatus, fetchProfile, skills, projects, certifications } = useProfileStore();
  const { jds, fetchJDs } = useJDStore();
  const { history, fetchHistory } = useResumeStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchJDs();
    fetchHistory();
  }, []);

  // Calculate missing sections
  const missingSections = Object.entries(sectionsStatus)
    .filter(([_, isComplete]) => !isComplete)
    .map(([sectionName, _]) => {
      // Reformat section name to a readable label
      return sectionName
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    });

  const avgATSScore = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.ats_score, 0) / history.length)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Platform Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Optimize your profile, map requirements, and generate high-fidelity resume deliverables.
            </p>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-950/20 w-fit"
          >
            <Sparkles className="w-4 h-4" />
            Launch AI Assistant
          </Link>
        </header>

        {/* Core Metrics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Profile Status</p>
              <h3 className="text-2xl font-black mt-2 text-white">{completionPercentage}%</h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Completeness rating</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              completionPercentage >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          
          {/* Metric 2 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Key Skills</p>
              <h3 className="text-2xl font-black mt-2 text-white">{skills.length}</h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Explicitly listed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Projects</p>
              <h3 className="text-2xl font-black mt-2 text-white">{projects.length}</h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Documented builds</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Certifications</p>
              <h3 className="text-2xl font-black mt-2 text-white">{certifications.length}</h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Verified credentials</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 5 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Workspace</p>
              <h3 className="text-2xl font-black mt-2 text-white">{jds.length} <span className="text-slate-600 text-sm font-normal">/ 3</span></h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">JDs configured</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 6 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tailoring Runs</p>
              <h3 className="text-2xl font-black mt-2 text-white">{history.length}</h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Resumes generated</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 7 */}
          <div className="bg-slate-900/40 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md col-span-2">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Average ATS Index</p>
              <h3 className="text-2xl font-black mt-2 text-white">{avgATSScore}%</h3>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Across {history.length} runs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Profile Completion details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Completion Status Panel */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                  Profile Completeness Breakdown
                </h3>
                <span className="text-xs bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold px-2 py-0.5 rounded-full">
                  10 Key Sections
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[2px]">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Incomplete profile</span>
                  <span className="text-primary-400">{completionPercentage}% Optimized</span>
                </div>
              </div>

              {/* Grid of Sections */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(sectionsStatus).map(([name, isComplete]) => {
                  const label = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return (
                    <div 
                      key={name}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        isComplete 
                          ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400' 
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      <span className="truncate mr-2">{label}</span>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gaps Prompt */}
              {missingSections.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">Incomplete Profile Alert:</span>
                    The AI Tailor requires fully populated sections to contextualize matches. Missing: <span className="font-semibold text-white">{missingSections.join(', ')}</span>. Use the profile builder to update these.
                  </div>
                </div>
              )}
            </div>

            {/* Active JDs Workspace */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  Target Job Descriptions
                </h3>
                <span className="text-xs text-slate-500 font-semibold">{jds.length} of 3 active JDs</span>
              </div>

              {jds.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-800/80 rounded-2xl text-center space-y-4 bg-slate-900/10">
                  <p className="text-slate-500 text-sm">No target roles configured yet. Load a Job Description to initiate ATS matching.</p>
                  <Link
                    to="/jd"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700/50"
                  >
                    <Plus className="w-4 h-4" /> Add target JD
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jds.map((jd) => (
                    <div 
                      key={jd.id}
                      className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-extrabold text-white truncate">{jd.role}</h4>
                          <span className="text-[10px] bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-slate-400 font-semibold truncate shrink-0 max-w-[120px]">
                            {jd.company_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-3 mt-3 leading-relaxed">
                          {jd.jd_text}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-bold">
                          {new Date(jd.created_at).toLocaleDateString()}
                        </span>
                        <Link
                          to="/jd"
                          className="text-xs text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1 hover:underline"
                        >
                          Workspace
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {jds.length < 3 && (
                    <Link
                      to="/jd"
                      className="border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-slate-900/10 text-slate-500 hover:text-indigo-400 transition-all"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-xs font-bold">Configure Target Role</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Recent History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                Tailoring Runs
              </h3>
              <Link 
                to="/history"
                className="text-xs text-slate-500 hover:text-white font-semibold transition-colors"
              >
                View all
              </Link>
            </div>

            {history.length === 0 ? (
              <div className="p-6 border border-slate-800 rounded-2xl text-center bg-slate-900/10 text-slate-500 text-xs">
                No tailor runs archived. Link a profile and JD, then trigger generation to save logs.
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 4).map((run) => (
                  <div 
                    key={run.id}
                    onClick={() => navigate('/history', { state: { openItemId: run.id } })}
                    className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-xl hover:border-slate-700/80 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-extrabold text-white truncate leading-none mb-1">{run.role}</h4>
                        <p className="text-[10px] text-slate-500 truncate leading-none">{run.company_name}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        run.ats_score >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-950/20' 
                          : run.ats_score >= 60
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-950/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {run.ats_score}% Match
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                      <span>{new Date(run.created_at).toLocaleDateString()}</span>
                      <span className="text-primary-500">Inspect Log →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
