import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Team', path: '/admin', icon: Users });
  }

  return (
    <div className="w-72 h-screen bg-slate-950/50 backdrop-blur-3xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-10 mb-4">
        <div className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">
            Nexus
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-gradient-to-r from-brand-primary/20 to-transparent text-white border border-brand-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight">{item.name}</span>
            {/* Active Indicator Dot */}
            <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.8)] opacity-0 group-[.active]:opacity-100 transition-opacity`} />
          </NavLink>
        ))}
      </nav>

      <div className="p-8 mt-auto">
        <div className="glass rounded-2xl p-4 mb-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-[10px] text-brand-accent font-black border border-brand-accent/30">
                    {user?.name?.[0]}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">{user?.role}</p>
                </div>
            </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-4 px-5 py-4 w-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
