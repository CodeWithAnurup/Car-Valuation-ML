const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const api = {
  getHealth: async () => {
    const res = await fetch(`${API_URL}/health`);
    return res.json();
  },
  getModelInfo: async () => {
    const res = await fetch(`${API_URL}/model-info`);
    return res.json();
  },
  predict: async (data) => {
    const res = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.detail || 'Prediction failed');
    }
    return res.json();
  },
  getModelComparison: async () => {
    const res = await fetch(`${API_URL}/model-comparison`);
    return res.json();
  },
  getDataQuality: async () => {
    const res = await fetch(`${API_URL}/data-quality`);
    return res.json();
  },
};
