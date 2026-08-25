import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calculator, AlertTriangle, Info } from 'lucide-react';

export default function Predictor() {
  const [formData, setFormData] = useState({
    year: 2015,
    km_driven: 50000,
    fuel: 'Petrol',
    transmission: 'Manual',
    seller_type: 'Individual',
    owner: 'First Owner',
    brand: 'Maruti',
    name: 'Maruti Swift'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    api.getModelInfo()
      .then(setModelInfo)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'km_driven'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predict(formData);
      setResult(res);
    } catch (err) {
      setError('Prediction failed. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const getOptions = (featureName, fallback) => {
    if (modelInfo && modelInfo.options && modelInfo.options[featureName]) {
      return modelInfo.options[featureName];
    }
    return fallback;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calculator className="text-emerald-400" />
        Car Price Predictor
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                >
                  {getOptions('brand', ['Maruti', 'Hyundai', 'Honda', 'Toyota']).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">KM Driven</label>
                <input
                  type="number"
                  name="km_driven"
                  value={formData.km_driven}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Fuel Type</label>
                <select
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                >
                  {getOptions('fuel', ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric']).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                >
                  {getOptions('transmission', ['Manual', 'Automatic']).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Seller Type</label>
                <select
                  name="seller_type"
                  value={formData.seller_type}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                >
                  {getOptions('seller_type', ['Individual', 'Dealer', 'Trustmark Dealer']).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Owner</label>
                <select
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                >
                  {getOptions('owner', ['First Owner', 'Second Owner', 'Third Owner', 'Fourth & Above Owner', 'Test Drive Car']).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? 'Calculating...' : 'Predict Valuation'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center min-h-[300px]">
          {result ? (
            <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
              <p className="text-slate-400">Estimated Value</p>
              <h2 className="text-4xl font-bold text-emerald-400">
                {result.predicted_price_formatted}
              </h2>
              
              {result.ood_warnings && result.ood_warnings.length > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-left">
                  <div className="flex items-center gap-2 text-amber-400 mb-1 font-medium text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Out of Distribution Warning
                  </div>
                  <ul className="text-xs text-amber-200/80 list-disc list-inside">
                    {result.ood_warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-700">
                Model version: {result.version || 'unknown'}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 flex flex-col items-center gap-2">
              <Info className="h-8 w-8 opacity-50" />
              <p>Enter car details to see the predicted price.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
