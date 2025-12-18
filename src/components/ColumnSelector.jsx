import React from 'react';
import './ColumnSelector.css';

export default function ColumnSelector({
  headers,
  positionColumn,
  managerColumn,
  displayColumns,
  onPositionColumnChange,
  onManagerColumnChange,
  onDisplayColumnToggle
}) {
  if (!headers || headers.length === 0) {
    return null;
  }

  return (
    <div className="column-selector">
      <h2 className="selector-title">Configure Chart</h2>
      
      <div className="selector-section">
        <label className="selector-label">
          Position Column (Unique Identifier)
        </label>
        <select
          className="selector-select"
          value={positionColumn || ''}
          onChange={(e) => onPositionColumnChange(e.target.value)}
        >
          <option value="">Select column...</option>
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>

      <div className="selector-section">
        <label className="selector-label">
          Manager Column
        </label>
        <select
          className="selector-select"
          value={managerColumn || ''}
          onChange={(e) => onManagerColumnChange(e.target.value)}
        >
          <option value="">Select column...</option>
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>

      <div className="selector-section">
        <label className="selector-label">
          Display Columns (Select multiple)
        </label>
        <div className="checkbox-group">
          {headers.map((header) => (
            <label key={header} className="checkbox-label">
              <input
                type="checkbox"
                checked={displayColumns.includes(header)}
                onChange={() => onDisplayColumnToggle(header)}
              />
              <span>{header}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

