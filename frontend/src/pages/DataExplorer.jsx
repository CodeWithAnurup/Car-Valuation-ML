import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Database } from 'lucide-react';

export default function DataExplorer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDataQuality()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading data quality metrics...</div>;

  if (!data) return <div className="p-8 text-center text-red-400">Failed to load data quality metrics. Is the API running?</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Database className="text-emerald-400" />
        Dataset Quality & Explorer
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Total Rows</p>
          <p className="text-2xl font-semibold text-emerald-400">{data.rows}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Total Columns</p>
          <p className="text-2xl font-semibold text-emerald-400">{data.columns}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Missing Values</p>
          <p className="text-2xl font-semibold text-emerald-400">{data.missing_values}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Duplicate Rows</p>
          <p className="text-2xl font-semibold text-emerald-400">{data.duplicates}</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-medium mb-4">Features Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.feature_stats && Object.entries(data.feature_stats).map(([name, info]) => (
            <div key={name} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h4 className="font-medium text-emerald-400 mb-2">{name}</h4>
              <div className="space-y-1 text-sm text-slate-300">
                {info.min !== undefined && (
                  <>
                    <p>Min: <span className="text-slate-400">{info.min.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                    <p>Max: <span className="text-slate-400">{info.max.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                    <p>Mean: <span className="text-slate-400">{info.mean.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
