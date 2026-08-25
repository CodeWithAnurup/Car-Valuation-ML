import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Header() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    api.getHealth()
      .then(() => setStatus('Online'))
      .catch(() => setStatus('Offline'));
  }, []);

  return (
    <header className="h-16 glass-panel border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
      <h2 className="text-lg font-semibold text-slate-100">Car Price Predictor</h2>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${status === 'Online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-slate-300">API Status: {status}</span>
      </div>
    </header>
  );
}
