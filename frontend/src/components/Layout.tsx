import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Calendar, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  ShieldAlert, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  } | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Interactive Roadmap', path: '/roadmap', icon: Map },
    { name: 'Weekly Study Planner', path: '/planner', icon: Calendar },
    { name: 'Resources & Projects', path: '/recommendations', icon: Sparkles },
    { name: 'Resume Readiness', path: '/resume-scanner', icon: FileText },
    { name: 'AI Mentor Chat', path: '/mentor', icon: MessageSquare },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldAlert });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-dark-card border-r border-dark-border/60 text-dark-text">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-border/40">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wider bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            CAREERPATH AI
          </h1>
          <span className="text-[10px] text-dark-muted uppercase font-semibold tracking-widest">
            Senior-Led Mentor
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10'
                  : 'hover:bg-dark-border/30 text-dark-muted hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-white' : 'text-dark-muted group-hover:text-blue-400'
              }`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-dark-border/40 bg-dark-bg/20">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{user?.name || 'Developer'}</h4>
            <p className="text-xs text-dark-muted truncate">{user?.email || 'user@careerpath.ai'}</p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-bg">
      {/* Mobile Top Bar */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-dark-card border-b border-dark-border/40 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            CAREERPATH AI
          </span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 text-dark-text hover:bg-dark-border/30 rounded-lg"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 z-50 transition-transform duration-300 transform md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
export default Layout;
