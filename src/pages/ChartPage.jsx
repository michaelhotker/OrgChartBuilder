import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import OrgChart from '../components/OrgChart';
import FilterPanel from '../components/FilterPanel';
import { useChartContext } from '../context/ChartContext';
import { buildOrgChart } from '../utils/excelParser';
import './ChartPage.css';

export default function ChartPage() {
  const navigate = useNavigate();
  const { 
    chartData: originalChartData,
    excelData,
    headers,
    displayColumns, 
    headerFields, 
    columnConfig, 
    colorByColumn, 
    valueColors, 
    fileName, 
    positionColumn, 
    managerColumn,
    filters,
    setFilters,
    setChartData
  } = useChartContext();

  // Filter data based on active filters
  const applyFilters = useCallback((data, activeFilters) => {
    if (!data || !activeFilters || Object.keys(activeFilters).length === 0) {
      return data;
    }

    return data.filter(row => {
      return Object.keys(activeFilters).every(column => {
        const filter = activeFilters[column];
        if (!filter || !filter.value || filter.value.trim() === '') {
          return true;
        }

        const cellValue = row[column];
        if (cellValue === undefined || cellValue === null || cellValue === '') {
          return false;
        }

        const stringValue = String(cellValue).toLowerCase().trim();
        const filterValue = filter.value.toLowerCase().trim();

        switch (filter.type) {
          case 'equals':
            return stringValue === filterValue;
          case 'contains':
            return stringValue.includes(filterValue);
          case 'startsWith':
            return stringValue.startsWith(filterValue);
          case 'endsWith':
            return stringValue.endsWith(filterValue);
          case 'notEquals':
            return stringValue !== filterValue;
          default:
            return stringValue.includes(filterValue);
        }
      });
    });
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!excelData) return null;
    return applyFilters(excelData, filters);
  }, [excelData, filters, applyFilters]);

  // Rebuild chart when filters or data change
  const filteredChartData = useMemo(() => {
    if (!filteredData || !positionColumn || !managerColumn) {
      return null;
    }

    try {
      return buildOrgChart(filteredData, positionColumn, managerColumn, displayColumns);
    } catch (err) {
      console.error('Error building filtered chart:', err);
      return null;
    }
  }, [filteredData, positionColumn, managerColumn, displayColumns]);

  // Update chart data in context when filtered chart changes
  useEffect(() => {
    setChartData(filteredChartData);
  }, [filteredChartData, setChartData]);

  // Use filtered chart data or fallback to original
  const chartDataToDisplay = filteredChartData || originalChartData;

  if (!chartDataToDisplay) {
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

  const activeFilterCount = filters ? Object.keys(filters).length : 0;

  return (
    <div className="chart-page">
      <div className="chart-header">
        <div className="chart-header-content">
          <h1 className="chart-title">📊 Organizational Chart</h1>
          {fileName && (
            <p className="chart-subtitle">
              {fileName} • Position: {positionColumn} • Manager: {managerColumn}
              {activeFilterCount > 0 && ` • ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active`}
            </p>
          )}
        </div>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Setup
        </button>
      </div>
      <div className="chart-content-wrapper">
        {headers && headers.length > 0 && (
          <div className="filter-panel-wrapper">
            <FilterPanel
              headers={headers}
              filters={filters}
              onFiltersChange={setFilters}
              excelData={excelData}
            />
          </div>
        )}
        <div className="chart-container">
          <OrgChart 
            chartData={chartDataToDisplay} 
            displayColumns={displayColumns}
            headerFields={headerFields}
            columnConfig={columnConfig}
            colorByColumn={colorByColumn}
            valueColors={valueColors}
          />
        </div>
      </div>
    </div>
  );
}

