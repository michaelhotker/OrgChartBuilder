import React, { useState, useEffect } from 'react';
import { getUniqueEmploymentTypes } from '../utils/employmentTypeAnalyzer';
import './EmploymentTypeSelector.css';

const PRESET_COLORS = [
  null, // No color
  '#3182ce', // Blue
  '#38a169', // Green
  '#d69e2e', // Yellow
  '#e53e3e', // Red
  '#805ad5', // Purple
  '#dd6b20', // Orange
  '#319795', // Teal
  '#d53f8c', // Pink
];

export default function EmploymentTypeSelector({
  headers,
  excelData,
  employmentTypeColumn,
  onEmploymentTypeColumnChange,
  fieldGroups = {},
  onFieldGroupsChange,
  typeColors = {},
  onTypeColorsChange,
  positionColumn = '',
  managerColumn = '',
  displayColumns = [],
  enabled = true,
  sampleData = {}
}) {
  if (!headers || headers.length === 0) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [poolSearch, setPoolSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which type's dropdown is open
  const [activeColorPicker, setActiveColorPicker] = useState(null); // Track which type's color picker is open

  // Get unique employment types when column is selected
  let uniqueTypes = [];
  try {
    if (employmentTypeColumn && excelData && excelData.length > 0) {
      uniqueTypes = getUniqueEmploymentTypes(excelData, employmentTypeColumn);
    }
  } catch (error) {
    console.error('Error getting unique employment types:', error);
    uniqueTypes = [];
  }

  // Show ALL columns for field group configuration
  const availableColumns = headers.filter(col => {
    if (!col) return false;
    return col !== employmentTypeColumn && 
           col !== positionColumn && 
           col !== managerColumn;
  });

  // Filter available columns by search
  const filteredAvailableColumns = poolSearch
    ? availableColumns.filter(col => col.toLowerCase().includes(poolSearch.toLowerCase()))
    : availableColumns;

  const handleColumnToggle = (employmentType, column) => {
    const currentColumns = fieldGroups[employmentType] || [];
    const isRemoving = currentColumns.includes(column);
    
    if (isRemoving) {
      // Removing: filter out the column but preserve order of remaining columns
      const newColumns = currentColumns.filter(col => col !== column);
      onFieldGroupsChange({
        ...fieldGroups,
        [employmentType]: newColumns
      });
    } else {
      // Adding: add to the end of the list
      const newColumns = [...currentColumns, column];
      onFieldGroupsChange({
        ...fieldGroups,
        [employmentType]: newColumns
      });
    }
  };

  const handleSelectAll = (employmentType) => {
    onFieldGroupsChange({
      ...fieldGroups,
      [employmentType]: [...availableColumns]
    });
  };

  const handleDeselectAll = (employmentType) => {
    onFieldGroupsChange({
      ...fieldGroups,
      [employmentType]: []
    });
  };

  // Drag and drop state for reordering
  const [draggedField, setDraggedField] = useState(null);
  const [draggedFromType, setDraggedFromType] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null); // 'display' or 'type'

  const handleFieldDragStart = (e, field, employmentType) => {
    setDraggedField(field);
    setDraggedFromType(employmentType);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleFieldDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedField(null);
    setDraggedFromType(null);
    setDragOverIndex(null);
    setDragOverZone(null);
  };

  const handleFieldDragOver = (e, index, zone = 'type') => {
    e.preventDefault();
    if (draggedField === null) return;
    setDragOverIndex(index);
    setDragOverZone(zone);
  };

  const handleFieldDrop = (e, employmentType, dropIndex, zone = 'type') => {
    e.preventDefault();
    if (!draggedField || draggedFromType !== employmentType) return;

    const selectedColumns = fieldGroups[employmentType] || [];
    const isDisplayColumn = displayColumns.includes(draggedField);
    const isInTypeFields = selectedColumns.includes(draggedField) && !displayColumns.includes(draggedField);
    
    // Determine target list based on zone
    if (zone === 'display' && isDisplayColumn) {
      // Reordering within display columns (this doesn't affect fieldGroups, just visual order)
      // Display columns order is managed separately, so we'll skip this for now
      // The user can reorder display columns in the main ColumnSelector
    } else if (zone === 'type') {
      // Reordering type-specific fields
      const typeSpecificFields = selectedColumns.filter(col => !displayColumns.includes(col));
      
      if (isInTypeFields) {
        // Moving within type-specific fields
        const currentIndex = typeSpecificFields.indexOf(draggedField);
        if (currentIndex === -1) return;
        
        const newTypeFields = [...typeSpecificFields];
        newTypeFields.splice(currentIndex, 1);
        // Adjust dropIndex to account for display columns
        const adjustedDropIndex = Math.max(0, dropIndex - displayColumns.length);
        newTypeFields.splice(adjustedDropIndex, 0, draggedField);
        
        // Reconstruct: displayColumns + type-specific fields
        onFieldGroupsChange({
          ...fieldGroups,
          [employmentType]: [...displayColumns, ...newTypeFields]
        });
      } else if (isDisplayColumn) {
        // Moving from display to type-specific (add to type-specific)
        const adjustedDropIndex = Math.max(0, dropIndex - displayColumns.length);
        const newTypeFields = [...typeSpecificFields];
        newTypeFields.splice(adjustedDropIndex, 0, draggedField);
        
        onFieldGroupsChange({
          ...fieldGroups,
          [employmentType]: [...displayColumns, ...newTypeFields]
        });
      }
    }

    setDraggedField(null);
    setDraggedFromType(null);
    setDragOverIndex(null);
    setDragOverZone(null);
  };

  const getSampleValue = (column) => {
    return sampleData[column] || 'Sample Value';
  };

  const handleTypeColorChange = (employmentType, color) => {
    onTypeColorsChange({
      ...typeColors,
      [employmentType]: color
    });
    setActiveColorPicker(null);
  };

  // Reset search when employment type column changes
  useEffect(() => {
    setPoolSearch('');
    setActiveDropdown(null);
  }, [employmentTypeColumn]);

  // Auto-expand if employment type column is selected and has types
  useEffect(() => {
    if (employmentTypeColumn && uniqueTypes.length > 0) {
      setIsExpanded(true);
    }
  }, [employmentTypeColumn, uniqueTypes.length]);

  if (!employmentTypeColumn || uniqueTypes.length === 0) {
    return (
      <div className="employment-type-selector-simple">
        <div className="selector-header" onClick={() => setIsExpanded(!isExpanded)}>
          <h3 className="selector-title">📋 Employment Type Configuration (Optional)</h3>
          <button className="expand-toggle" type="button">
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        {isExpanded && (
          <div className="selector-content">
            <p className="selector-hint">
              Select a column that contains employment types (e.g., Contractor, Full-time). 
              This lets you show different fields for different employment types.
            </p>
            <div className="employment-type-controls">
              <label className="employment-type-label">
                <span>Employment Type Column:</span>
                <select
                  className="employment-type-select"
                  value={employmentTypeColumn || ''}
                  onChange={(e) => onEmploymentTypeColumnChange(e.target.value)}
                  disabled={!enabled}
                >
                  <option value="">None (show all fields for everyone)</option>
                  {headers.map(header => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="employment-type-selector-simple">
      <div className="selector-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="selector-title">📋 Employment Type Configuration</h3>
        <button className="expand-toggle" type="button">
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="selector-content">
          <div className="employment-type-controls">
            <label className="employment-type-label">
              <span>Employment Type Column:</span>
              <select
                className="employment-type-select"
                value={employmentTypeColumn || ''}
                onChange={(e) => onEmploymentTypeColumnChange(e.target.value)}
                disabled={!enabled}
              >
                <option value="">None (show all fields)</option>
                {headers.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="preview-cards-grid">
            {uniqueTypes.map(type => {
              const selectedColumns = fieldGroups[type] || [];
              const typeColor = typeColors[type] || null;
              
              // Display columns appear at the top (always visible)
              // Type-specific fields appear below
              const typeSpecificFields = selectedColumns.filter(col => !displayColumns.includes(col));
              
              const unselectedColumns = availableColumns.filter(col => !selectedColumns.includes(col));
              const filteredUnselected = poolSearch
                ? unselectedColumns.filter(col => col.toLowerCase().includes(poolSearch.toLowerCase()))
                : unselectedColumns;
              
              return (
                <div key={type} className="preview-card-wrapper">
                  <div className="card-header">
                    <h4 className="card-type-name">{type}</h4>
                    <div className="card-actions">
                      {/* Color Picker */}
                      <div className="color-picker-wrapper">
                        <button
                          type="button"
                          className="color-picker-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveColorPicker(activeColorPicker === type ? null : type);
                          }}
                          title="Set color for this employment type"
                        >
                          <span 
                            className="color-preview"
                            style={{ backgroundColor: typeColor || '#e2e8f0' }}
                          />
                        </button>
                        {activeColorPicker === type && (
                          <div className="color-picker-popup" onClick={(e) => e.stopPropagation()}>
                            <div className="color-picker-grid">
                              {PRESET_COLORS.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`color-option ${typeColor === color ? 'selected' : ''}`}
                                  onClick={() => handleTypeColorChange(type, color)}
                                  style={{ backgroundColor: color || '#e2e8f0' }}
                                  title={color ? color : 'No color'}
                                >
                                  {!color && <span className="no-color-icon">∅</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="card-action-btn"
                        onClick={() => handleDeselectAll(type)}
                        disabled={typeSpecificFields.length === 0}
                        title="Clear type-specific fields"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="preview-card"
                    style={typeColor ? { backgroundColor: typeColor, borderColor: typeColor } : {}}
                  >
                    <div className="preview-position">Position Title</div>
                    <div className="preview-divider"></div>
                    
                    {/* Display Columns Section (at top) */}
                    {displayColumns.length > 0 && (
                      <div className="preview-section">
                        <div className="section-label">Chart Config Fields</div>
                        <div className="preview-details">
                          {displayColumns.map((column, index) => {
                            const isDragging = draggedField === column && draggedFromType === type;
                            const isDragOver = dragOverIndex === index && draggedFromType === type && dragOverZone === 'display';
                            const sampleValue = getSampleValue(column);
                            
                            return (
                              <div
                                key={column}
                                className={`preview-detail-item display-column ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over-item' : ''}`}
                                draggable
                                onDragStart={(e) => handleFieldDragStart(e, column, type)}
                                onDragEnd={handleFieldDragEnd}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleFieldDragOver(e, index, 'display');
                                }}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  handleFieldDrop(e, type, index, 'display');
                                }}
                              >
                                <div className="detail-item-controls">
                                  <span className="detail-order">{index + 1}</span>
                                </div>
                                <span className="auto-included-badge">Chart</span>
                                <span className="preview-label">{column}:</span>
                                <span className="preview-value">{sampleValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Type-Specific Fields Section */}
                    {typeSpecificFields.length > 0 && (
                      <div className="preview-section">
                        <div className="section-label">Type-Specific Fields</div>
                        <div className="preview-details">
                          {typeSpecificFields.map((column, index) => {
                            const isDragging = draggedField === column && draggedFromType === type;
                            const isDragOver = dragOverIndex === index && draggedFromType === type && dragOverZone === 'type';
                            const sampleValue = getSampleValue(column);
                            
                            return (
                              <div
                                key={column}
                                className={`preview-detail-item type-field ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over-item' : ''}`}
                                draggable
                                onDragStart={(e) => handleFieldDragStart(e, column, type)}
                                onDragEnd={handleFieldDragEnd}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleFieldDragOver(e, displayColumns.length + index, 'type');
                                }}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  handleFieldDrop(e, type, displayColumns.length + index, 'type');
                                }}
                              >
                                <div className="detail-item-controls">
                                  <span className="detail-order">{displayColumns.length + index + 1}</span>
                                  <button
                                    type="button"
                                    className="detail-remove-btn"
                                    onClick={() => handleColumnToggle(type, column)}
                                    title="Remove from this type"
                                  >
                                    ×
                                  </button>
                                </div>
                                <span className="preview-label">{column}:</span>
                                <span className="preview-value">{sampleValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Empty state */}
                    {displayColumns.length === 0 && typeSpecificFields.length === 0 && (
                      <div className="preview-empty">
                        Select columns in "Configure Chart" step first, then add type-specific fields below
                      </div>
                    )}
                    
                    {/* Add Field Section */}
                    {filteredUnselected.length > 0 && (
                      <div className="add-field-section">
                        <details 
                          className="add-field-details"
                          open={activeDropdown === type}
                          onToggle={(e) => {
                            setActiveDropdown(e.target.open ? type : null);
                          }}
                        >
                          <summary className="add-field-summary">
                            + Add Field{filteredUnselected.length > 1 ? 's' : ''}
                          </summary>
                          <div className="add-field-dropdown">
                            {poolSearch && (
                              <input
                                type="text"
                                className="field-search-input"
                                placeholder="Search fields..."
                                value={poolSearch}
                                onChange={(e) => setPoolSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <div className="field-options-list">
                              {filteredUnselected.map(column => {
                                const isDisplayColumn = displayColumns.includes(column);
                                return (
                                  <button
                                    key={column}
                                    type="button"
                                    className={`field-option-btn ${isDisplayColumn ? 'is-display-column' : ''}`}
                                    onClick={() => {
                                      handleColumnToggle(type, column);
                                      setPoolSearch('');
                                    }}
                                    title={isDisplayColumn ? 'This column is selected for display in the chart' : ''}
                                  >
                                    {column}
                                    {isDisplayColumn && <span className="display-indicator">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {availableColumns.length > 0 && (
            <div className="global-search-section">
              <input
                type="text"
                className="global-search-input"
                placeholder="Search all available fields..."
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
              />
            </div>
          )}

          <p className="help-text">
            💡 <strong>Tip:</strong> Drag fields to reorder, or use ↑↓ buttons. If no fields are selected, all fields will be shown.
          </p>
        </div>
      )}
    </div>
  );
}
