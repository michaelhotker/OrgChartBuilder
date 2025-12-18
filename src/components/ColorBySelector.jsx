import React, { useState, useMemo } from 'react';
import './ColorBySelector.css';

const DEFAULT_COLORS = [
  '#3182ce', // Blue
  '#38a169', // Green
  '#d69e2e', // Yellow
  '#e53e3e', // Red
  '#805ad5', // Purple
  '#dd6b20', // Orange
  '#319795', // Teal
  '#d53f8c', // Pink
  '#718096', // Gray
  '#2c5282', // Dark Blue
  '#276749', // Dark Green
  '#975a16', // Dark Yellow
];

export default function ColorBySelector({
  headers,
  excelData,
  colorByColumn,
  valueColors,
  onColorByColumnChange,
  onValueColorChange
}) {
  const [expandedPicker, setExpandedPicker] = useState(null);

  // Get unique values for the selected column
  const uniqueValues = useMemo(() => {
    if (!colorByColumn || !excelData) return [];
    
    const values = new Set();
    excelData.forEach(row => {
      const value = row[colorByColumn];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  }, [colorByColumn, excelData]);

  // Auto-assign colors to new values
  const getValueColor = (value) => {
    if (valueColors[value]) return valueColors[value];
    // Auto-assign a default color based on index
    const index = uniqueValues.indexOf(value);
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  const handleColumnChange = (column) => {
    onColorByColumnChange(column);
    // Auto-assign colors to all unique values
    if (column && excelData) {
      const values = new Set();
      excelData.forEach(row => {
        const value = row[column];
        if (value !== undefined && value !== null && value !== '') {
          values.add(String(value));
        }
      });
      const newColors = {};
      Array.from(values).sort().forEach((value, index) => {
        newColors[value] = valueColors[value] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      });
      // Update all colors at once
      Object.keys(newColors).forEach(value => {
        if (!valueColors[value]) {
          onValueColorChange(value, newColors[value]);
        }
      });
    }
  };

  return (
    <div className="color-by-selector">
      <h3 className="color-by-title">🎨 Color Nodes By Value</h3>
      <p className="color-by-hint">
        Select a column to color each card based on its value (e.g., Employment Status, Department)
      </p>

      <div className="color-by-column-select">
        <label>Color nodes by:</label>
        <select
          value={colorByColumn || ''}
          onChange={(e) => handleColumnChange(e.target.value)}
        >
          <option value="">-- No coloring --</option>
          {headers.map(header => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
      </div>

      {colorByColumn && uniqueValues.length > 0 && (
        <div className="value-colors-section">
          <h4>Assign colors to each {colorByColumn} value:</h4>
          <div className="value-colors-list">
            {uniqueValues.map(value => {
              const color = getValueColor(value);
              const isExpanded = expandedPicker === value;
              
              return (
                <div key={value} className="value-color-item">
                  <div 
                    className="value-color-preview"
                    style={{ backgroundColor: color }}
                    onClick={() => setExpandedPicker(isExpanded ? null : value)}
                  >
                    <span className="color-check">✓</span>
                  </div>
                  <span className="value-name">{value}</span>
                  
                  {isExpanded && (
                    <div className="value-color-picker">
                      <div className="preset-colors">
                        {DEFAULT_COLORS.map((presetColor) => (
                          <button
                            key={presetColor}
                            className={`preset-color-btn ${color === presetColor ? 'selected' : ''}`}
                            style={{ backgroundColor: presetColor }}
                            onClick={() => {
                              onValueColorChange(value, presetColor);
                              setExpandedPicker(null);
                            }}
                          />
                        ))}
                      </div>
                      <div className="custom-color-row">
                        <label>Custom:</label>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => onValueColorChange(value, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {colorByColumn && uniqueValues.length > 0 && (
        <div className="color-legend">
          <h4>Legend:</h4>
          <div className="legend-items">
            {uniqueValues.map(value => (
              <div key={value} className="legend-item">
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: getValueColor(value) }}
                />
                <span className="legend-label">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

