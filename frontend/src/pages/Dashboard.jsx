import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Activity, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [modelInfo, setModelInfo] = useState(null);
  const [quality, setQuality] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getModelInfo().catch(() => null),
      api.getDataQuality().catch(() => null),
    ]).then(([info, qual]) => {
      if (info) setModelInfo(info);
      if (qual) setQuality(qual);
    });
  }, []);

  // Mock data for price distribution if we don't have real endpoint
  const distributionData = [
    { range: '0-2L', count: 45 },
    { range: '2-4L', count: 120 },
    { range: '4-6L', count: 85 },
    { range: '6-8L', count: 50 },
    { range: '8-10L', count: 30 },
    { range: '10L+', count: 15 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-700 flex items-start gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Active Model</p>
            <p className="text-lg font-semibold text-white">{modelInfo?.display_name || modelInfo?.model_name || 'Loading...'}</p>
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-slate-700 flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Samples</p>
            <p className="text-lg font-semibold">{quality?.rows || modelInfo?.training_rows || 'N/A'}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700 flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Features</p>
            <p className="text-lg font-semibold">{modelInfo?.features?.length || 0}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700 flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Data Issues</p>
            <p className="text-lg font-semibold">{quality?.missing_values || 0} missing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-medium mb-4">Price Distribution (Mock)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-medium mb-4">Model Information</h3>
          {modelInfo ? (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Algorithm</span>
                <span className="font-medium">{modelInfo.display_name || modelInfo.model_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Version</span>
                <span className="font-medium">{modelInfo.version}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Training Samples</span>
                <span className="font-medium">{modelInfo.training_rows || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-2">Used Features</span>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.features?.map(f => (
                    <span key={f} className="px-2 py-1 text-xs bg-slate-800 rounded border border-slate-600">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Loading model info...</p>
          )}
        </div>
      </div>
    </div>
  );
}
