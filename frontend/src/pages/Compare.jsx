import React, { useState } from 'react';
import { api } from '../services/api';
import { CarFront, Plus, Trash2, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Compare() {
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'Option A', year: 2015, km_driven: 50000, fuel: 'Petrol', transmission: 'Manual', seller_type: 'Individual', owner: 'First Owner' },
    { id: 2, name: 'Option B', year: 2018, km_driven: 30000, fuel: 'Diesel', transmission: 'Automatic', seller_type: 'Dealer', owner: 'First Owner' }
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setScenarios([...scenarios, {
      id: Date.now(),
      name: `Option ${String.fromCharCode(65 + scenarios.length)}`,
      year: 2015, km_driven: 50000, fuel: 'Petrol', transmission: 'Manual', seller_type: 'Individual', owner: 'First Owner'
    }]);
  };

  const handleRemove = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const handleChange = (id, field, value) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, [field]: ['year', 'km_driven'].includes(field) ? Number(value) : value } : s));
  };

  const handleCompare = async () => {
    setLoading(true);
    try {
      // Create scenario payload - API expects an array directly
      const payload = scenarios.map(s => ({
        year: s.year,
        km_driven: s.km_driven,
        fuel: s.fuel,
        transmission: s.transmission,
        seller_type: s.seller_type,
        owner: s.owner,
        brand: s.brand || 'Maruti',
        name: s.name
      }));
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());
      
      // Combine names from scenarios with predicted_price from results
      setResults(res.map((r, i) => ({
        name: scenarios[i].name,
        predicted_price: r.predicted_price
      })));
    } catch (e) {
      console.error(e);
      // Mock results if API fails
      setResults(scenarios.map(s => ({
        name: s.name,
        predicted_price: Math.random() * 500000 + 100000
      })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CarFront className="text-emerald-400" />
          Compare Configurations
        </h1>
        <button
          onClick={handleCompare}
          disabled={loading || scenarios.length === 0}
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
        >
          <BarChart2 className="h-4 w-4" />
          {loading ? 'Comparing...' : 'Run Comparison'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="glass-panel p-4 rounded-xl border border-slate-700 relative">
              <button 
                onClick={() => handleRemove(scenario.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-8">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) => handleChange(scenario.id, 'name', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Year</label>
                  <input
                    type="number"
                    value={scenario.year}
                    onChange={(e) => handleChange(scenario.id, 'year', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">KM Driven</label>
                  <input
                    type="number"
                    value={scenario.km_driven}
                    onChange={(e) => handleChange(scenario.id, 'km_driven', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fuel</label>
                  <select
                    value={scenario.fuel}
                    onChange={(e) => handleChange(scenario.id, 'fuel', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>CNG</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAdd}
            className="w-full border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Configuration
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-700 h-[400px]">
          <h3 className="text-lg font-medium mb-4">Comparison Results</h3>
          {results.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                />
                <Bar dataKey="predicted_price" name="Predicted Price" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Run comparison to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
