import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import ColumnSelector from '../components/ColumnSelector';
import ColorBySelector from '../components/ColorBySelector';
import EmploymentTypeSelector from '../components/EmploymentTypeSelector';
import { useChartContext } from '../context/ChartContext';
import { parseExcelFile, buildOrgChart } from '../utils/excelParser';
import './SetupPage.css';

export default function SetupPage() {
  const navigate = useNavigate();
  const {
    excelData,
    setExcelData,
    headers,
    setHeaders,
    fileName,
    setFileName,
    positionColumn,
    setPositionColumn,
    managerColumn,
    setManagerColumn,
    displayColumns,
    setDisplayColumns,
    headerFields,
    setHeaderFields,
    columnConfig,
    setColumnConfig,
    colorByColumn,
    setColorByColumn,
    valueColors,
    setValueColors,
    setChartData,
    employmentTypeColumn,
    setEmploymentTypeColumn,
    fieldGroups,
    setFieldGroups,
    typeColors,
    setTypeColors,
    error,
    setError,
  } = useChartContext();

  const handleFileSelect = async (file) => {
    try {
      setError('');
      setFileName(file.name);
      const result = await parseExcelFile(file);
      setExcelData(result.data);
      setHeaders(result.headers);
      
      // Auto-select first two columns as position and manager if available
      if (result.headers.length >= 2) {
        setPositionColumn(result.headers[0]);
        setManagerColumn(result.headers[1]);
      } else if (result.headers.length >= 1) {
        setPositionColumn(result.headers[0]);
      }
      
      // Reset display columns
      setDisplayColumns([]);
      setChartData(null);
    } catch (err) {
      setError('Error parsing file: ' + err.message);
      setExcelData(null);
      setHeaders([]);
    }
  };

  const handlePositionColumnChange = (column) => {
    setPositionColumn(column);
    updateChart(column, managerColumn, displayColumns);
  };

  const handleManagerColumnChange = (column) => {
    setManagerColumn(column);
    updateChart(positionColumn, column, displayColumns);
  };

  const handleDisplayColumnToggle = (column) => {
    const newDisplayColumns = displayColumns.includes(column)
      ? displayColumns.filter(c => c !== column)
      : [...displayColumns, column];
    setDisplayColumns(newDisplayColumns);
    updateChart(positionColumn, managerColumn, newDisplayColumns);
  };

  const handleColorByColumnChange = (column) => {
    setColorByColumn(column);
  };

  const handleValueColorChange = (value, color) => {
    setValueColors(prev => ({
      ...prev,
      [value]: color
    }));
  };

  const handleEmploymentTypeColumnChange = (column) => {
    setEmploymentTypeColumn(column);
    // Clear field groups when employment type column changes
    if (!column) {
      setFieldGroups({});
    }
  };

  const handleFieldGroupsChange = (newFieldGroups) => {
    setFieldGroups(newFieldGroups);
  };

  const handleTypeColorsChange = (newTypeColors) => {
    setTypeColors(newTypeColors);
  };

  const updateChart = useCallback((posCol, mgrCol, dispCols) => {
    if (!excelData || !posCol || !mgrCol) {
      setChartData(null);
      return;
    }

    try {
      const chart = buildOrgChart(excelData, posCol, mgrCol, dispCols);
      setChartData(chart);
      setError('');
    } catch (err) {
      setError('Error building chart: ' + err.message);
      setChartData(null);
    }
  }, [excelData, setChartData, setError]);

  const handleViewChart = () => {
    if (positionColumn && managerColumn) {
      updateChart(positionColumn, managerColumn, displayColumns);
      navigate('/chart');
    } else {
      setError('Please select both Position and Manager columns');
    }
  };

  // Auto-update chart when columns are selected
  useEffect(() => {
    if (excelData && positionColumn && managerColumn) {
      updateChart(positionColumn, managerColumn, displayColumns);
    }
  }, [excelData, positionColumn, managerColumn, displayColumns, updateChart]);

  return (
    <div className="setup-page">
      <div className="setup-container">
        <header className="setup-header">
          <h1 className="setup-title">📊 Org Chart Builder</h1>
          <p className="setup-subtitle">
            Upload an Excel file and configure your organizational chart
          </p>
        </header>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <FileUpload onFileSelect={handleFileSelect} fileName={fileName} />

        {headers.length > 0 && (
          <>
            <ColumnSelector
              headers={headers}
              positionColumn={positionColumn}
              managerColumn={managerColumn}
              displayColumns={displayColumns}
              onPositionColumnChange={handlePositionColumnChange}
              onManagerColumnChange={handleManagerColumnChange}
              onDisplayColumnToggle={handleDisplayColumnToggle}
            />
            
            <EmploymentTypeSelector
              headers={headers}
              excelData={excelData}
              employmentTypeColumn={employmentTypeColumn}
              onEmploymentTypeColumnChange={handleEmploymentTypeColumnChange}
              fieldGroups={fieldGroups}
              onFieldGroupsChange={handleFieldGroupsChange}
              typeColors={typeColors}
              onTypeColorsChange={handleTypeColorsChange}
              positionColumn={positionColumn}
              managerColumn={managerColumn}
              displayColumns={displayColumns}
              enabled={true}
              sampleData={excelData && excelData[0] ? excelData[0] : {}}
            />
            
            <ColorBySelector
              headers={headers}
              excelData={excelData}
              colorByColumn={colorByColumn}
              valueColors={valueColors}
              onColorByColumnChange={handleColorByColumnChange}
              onValueColorChange={handleValueColorChange}
            />
            
            <div className="action-section">
              <button 
                className="view-chart-btn"
                onClick={handleViewChart}
                disabled={!positionColumn || !managerColumn}
              >
                View Org Chart →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

