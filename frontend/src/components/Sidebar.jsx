import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Calculator, CarFront, LineChart, Database } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/predict', label: 'Predictor', icon: Calculator },
  { path: '/compare', label: 'Compare Cars', icon: CarFront },
  { path: '/insights', label: 'Model Insights', icon: LineChart },
  { path: '/data', label: 'Data Explorer', icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="w-64 glass-panel border-r border-slate-700 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
          <CarFront className="h-6 w-6" />
          AutoValuer Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1">AI-Powered Car Valuation</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        v1.0.0 &copy; 2026
      </div>
    </aside>
  );
}
