import { useThemeStore } from '../stores/themeStore';
import { 
  Sun, Moon, Network, Layers 
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">System Settings</h1>
          <p className="text-slate-500 text-xs mt-1">
            Configure display parameters, inspect platform metadata, and review agentic architecture.
          </p>
        </header>

        {/* Configuration sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Theme card */}
          <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Appearance Config</h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              The platform uses a dark-first design system. Toggle applies contrast preference across all UI surfaces.
            </p>

            <button
              onClick={toggleTheme}
              className={`flex items-center justify-between w-full px-4 py-2.5 border rounded-xl text-xs font-semibold text-white transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950/40 hover:bg-slate-800 border-slate-800'
                  : 'bg-slate-100/10 hover:bg-slate-200/10 border-slate-600'
              }`}
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-primary-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
              <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">Toggle</span>
            </button>
          </div>

          {/* Engine specifications */}
          <div className="md:col-span-2 bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Network className="w-4 h-4 text-primary-400" />
              Platform Specifications & V1 Integrations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">API Node Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px] break-all">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  {import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Database Model</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  SQLAlchemy (SQLite V1)
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">AI Middleware Layer</span>
                <span className="text-white font-semibold">
                  Google Gemini SDK (1.5 Flash fallback)
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Platform Version</span>
                <span className="text-slate-400 font-semibold">
                  v1.5.0 — Stability Release
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* IIT Roorkee Architecture explanation */}
        <section className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">IIT Roorkee Agentic Core Design</h3>
              <p className="text-[10px] text-slate-500 font-medium">CrewAI compatible structural layouts</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The platform's database tables, service layers, and schema validations are natively engineered to support multi-agent orchestrations.
            When hooking this V1 application to a CrewAI agent collective, the platform routes represent:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
              <span className="text-[9px] bg-primary-500/10 text-primary-400 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                Resume Writer Agent
              </span>
              <h4 className="text-xs font-bold text-white mt-2">Tailoring & Bullet Rephraser</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                Reads the user's base profiles and converts bullet lists to active-verb deliverables matching the JD keyword map.
              </p>
            </div>

            <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                ATS Reviewer Agent
              </span>
              <h4 className="text-xs font-bold text-white mt-2">Score Analysis & Indexing</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                Calculates exact match metrics, maps missing requirements, and outputs the comparison matrices.
              </p>
            </div>

            <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                Career Coach Agent
              </span>
              <h4 className="text-xs font-bold text-white mt-2">Personalized Recommendations</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                Synthesizes the missing keywords to generate step-by-step skill action plans for learning and certifications.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
