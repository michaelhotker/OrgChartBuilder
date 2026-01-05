import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

const FILTER_TYPES = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'notEquals', label: 'Not Equals' },
];

export default function FilterPanel({ headers, filters, onFiltersChange, excelData }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize active filters from props
  useEffect(() => {
    setActiveFilters(filters || {});
  }, [filters]);

  // Get unique values for a column to show as suggestions
  const getColumnValues = (column) => {
    if (!excelData || !Array.isArray(excelData)) return [];
    const values = new Set();
    excelData.forEach(row => {
      const value = row[column];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value).trim());
      }
    });
    return Array.from(values).sort().slice(0, 20); // Limit to 20 for performance
  };

  const handleAddFilter = (column) => {
    if (!column) return;
    setActiveFilters(prev => ({
      ...prev,
      [column]: { type: 'contains', value: '' }
    }));
    updateFilters({ ...activeFilters, [column]: { type: 'contains', value: '' } });
  };

  const handleRemoveFilter = (column) => {
    const newFilters = { ...activeFilters };
    delete newFilters[column];
    setActiveFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleFilterChange = (column, field, value) => {
    const newFilters = {
      ...activeFilters,
      [column]: {
        ...(activeFilters[column] || { type: 'contains', value: '' }),
        [field]: value
      }
    };
    setActiveFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleClearAll = () => {
    setActiveFilters({});
    updateFilters({});
  };

  const updateFilters = (newFilters) => {
    // Remove empty filters
    const cleanedFilters = {};
    Object.keys(newFilters).forEach(col => {
      const filter = newFilters[col];
      if (filter && filter.value && filter.value.trim() !== '') {
        cleanedFilters[col] = filter;
      }
    });
    onFiltersChange(cleanedFilters);
  };

  const activeFilterKeys = Object.keys(activeFilters);

  return (
    <div className="filter-panel">
      <div className="filter-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="filter-panel-title">
          🔍 Filters
          {activeFilterKeys.length > 0 && (
            <span className="filter-count">({activeFilterKeys.length})</span>
          )}
        </h3>
        <button className="filter-toggle-btn">
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="filter-panel-content">
          {activeFilterKeys.length > 0 && (
            <div className="active-filters">
              {activeFilterKeys.map(column => {
                const filter = activeFilters[column];
                const suggestions = getColumnValues(column);
                
                return (
                  <div key={column} className="filter-item">
                    <div className="filter-header">
                      <span className="filter-column-name">{column}</span>
                      <button
                        className="remove-filter-btn"
                        onClick={() => handleRemoveFilter(column)}
                        title="Remove filter"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="filter-controls">
                      <select
                        className="filter-type-select"
                        value={filter.type || 'contains'}
                        onChange={(e) => handleFilterChange(column, 'type', e.target.value)}
                      >
                        {FILTER_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      
                      <div className="filter-input-wrapper">
                        <input
                          type="text"
                          className="filter-input"
                          placeholder={`Enter ${column.toLowerCase()}...`}
                          value={filter.value || ''}
                          onChange={(e) => handleFilterChange(column, 'value', e.target.value)}
                          list={`suggestions-${column}`}
                        />
                        {suggestions.length > 0 && (
                          <datalist id={`suggestions-${column}`}>
                            {suggestions.map((val, idx) => (
                              <option key={idx} value={val} />
                            ))}
                          </datalist>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button className="clear-all-btn" onClick={handleClearAll}>
                Clear All Filters
              </button>
            </div>
          )}
          
          {headers.length > 0 && (
            <div className="add-filter-section">
              <label className="add-filter-label">Add Filter:</label>
              <select
                className="column-selector"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddFilter(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Select a column...</option>
                {headers
                  .filter(col => !activeFilterKeys.includes(col))
                  .map(col => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          {activeFilterKeys.length === 0 && (
            <div className="no-filters-message">
              No filters active. Select a column above to add a filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

