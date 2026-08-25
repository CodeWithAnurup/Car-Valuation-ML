import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <Header />
        <main className="flex-1 overflow-y-auto p-6 z-0">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
