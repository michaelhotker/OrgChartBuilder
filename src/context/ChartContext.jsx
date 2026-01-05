import React, { createContext, useContext, useState } from 'react';

const ChartContext = createContext();

export const useChartContext = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChartContext must be used within ChartProvider');
  }
  return context;
};

// Column config structure: { column: string, visible: boolean, color: string | null, order: number }
export const ChartProvider = ({ children }) => {
  const [excelData, setExcelData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [positionColumn, setPositionColumn] = useState('');
  const [managerColumn, setManagerColumn] = useState('');
  const [displayColumns, setDisplayColumns] = useState([]);
  const [headerFields, setHeaderFields] = useState([]); // Fields to show above divider (value only)
  const [columnConfig, setColumnConfig] = useState({}); // { columnName: { color: '#fff', order: 0 } }
  const [colorByColumn, setColorByColumn] = useState(''); // Column to use for node coloring
  const [valueColors, setValueColors] = useState({}); // { value: '#color' } mapping
  const [chartData, setChartData] = useState(null);
  const [filters, setFilters] = useState({}); // { columnName: { type: 'equals'|'contains'|'startsWith'|'endsWith', value: string } }
  const [employmentTypeColumn, setEmploymentTypeColumn] = useState(''); // Column name that contains employment type
  const [fieldGroups, setFieldGroups] = useState({}); // { employmentType: [columnNames] } - intelligently grouped columns
  const [typeColors, setTypeColors] = useState({}); // { employmentType: '#color' } - color for each employment type
  const [error, setError] = useState('');

  return (
    <ChartContext.Provider
      value={{
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
        chartData,
        setChartData,
        filters,
        setFilters,
        employmentTypeColumn,
        setEmploymentTypeColumn,
        fieldGroups,
        setFieldGroups,
        typeColors,
        setTypeColors,
        error,
        setError,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

