import React from 'react';
import { useNavigate } from 'react-router-dom';
import OrgChart from '../components/OrgChart';
import { useChartContext } from '../context/ChartContext';
import './ChartPage.css';

export default function ChartPage() {
  const navigate = useNavigate();
  const { chartData, displayColumns, headerFields, columnConfig, colorByColumn, valueColors, fileName, positionColumn, managerColumn } = useChartContext();

  if (!chartData) {
    return (
      <div className="chart-page">
        <div className="chart-container">
          <div className="no-chart-message">
            <h2>No chart data available</h2>
            <p>Please go back to the setup page to configure your org chart.</p>
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-page">
      <div className="chart-header">
        <div className="chart-header-content">
          <h1 className="chart-title">📊 Organizational Chart</h1>
          {fileName && (
            <p className="chart-subtitle">
              {fileName} • Position: {positionColumn} • Manager: {managerColumn}
            </p>
          )}
        </div>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Setup
        </button>
      </div>
      <div className="chart-container">
        <OrgChart 
          chartData={chartData} 
          displayColumns={displayColumns}
          headerFields={headerFields}
          columnConfig={columnConfig}
          colorByColumn={colorByColumn}
          valueColors={valueColors}
        />
      </div>
    </div>
  );
}

