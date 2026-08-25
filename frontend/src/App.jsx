import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import Compare from './pages/Compare';
import Insights from './pages/Insights';
import DataExplorer from './pages/DataExplorer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="predict" element={<Predictor />} />
          <Route path="compare" element={<Compare />} />
          <Route path="insights" element={<Insights />} />
          <Route path="data" element={<DataExplorer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
