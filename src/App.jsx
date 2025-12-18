import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChartProvider } from './context/ChartContext';
import SetupPage from './pages/SetupPage';
import ChartPage from './pages/ChartPage';
import './App.css';

function App() {
  return (
    <ChartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/chart" element={<ChartPage />} />
        </Routes>
      </Router>
    </ChartProvider>
  );
}

export default App;

