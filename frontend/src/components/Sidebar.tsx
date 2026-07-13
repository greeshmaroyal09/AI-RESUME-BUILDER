import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { 
  LayoutDashboard, User, Briefcase, History, Settings, LogOut, Sun, Moon, Sparkles 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Profile Builder', icon: User },
    { to: '/jd', label: 'JD Workspace', icon: Briefcase },
    { to: '/history', label: 'History Archive', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen text-slate-600 dark:text-slate-400 shrink-0 transition-colors">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wide uppercase">AI Resume</h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold tracking-wider block">TAILORING PLATFORM</span>
        </div>
      </div>

      {/* Nav Link Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-2 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm transition-all"
        >
          <span className="flex items-center gap-2 font-medium">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Toggle</span>
        </button>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-700/80 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="overflow-hidden">
              <p className="text-slate-900 dark:text-white text-xs font-bold truncate leading-none mb-1">{user?.username}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 truncate leading-none">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg text-slate-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
