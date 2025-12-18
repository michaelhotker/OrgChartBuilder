import React, { useState } from 'react';
import './ColumnConfigurator.css';

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

export default function ColumnConfigurator({
  displayColumns,
  columnConfig,
  onConfigChange,
  onReorder,
  sampleData = {},
  headerFields = [],
  onHeaderFieldsChange
}) {
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null); // 'header', 'detail', or 'list'
  const [dragOverZone, setDragOverZone] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  if (!displayColumns || displayColumns.length === 0) {
    return null;
  }

  // Split columns into header (above line) and detail (below line)
  const detailFields = displayColumns.filter(col => !headerFields.includes(col));

  const handleDragStart = (e, column, from) => {
    setDraggedItem(column);
    setDraggedFrom(from);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDraggedFrom(null);
    setDragOverZone(null);
    setDragOverIndex(null);
  };

  const handleDragOverZone = (e, zone, index = null) => {
    e.preventDefault();
    if (draggedItem === null) return;
    setDragOverZone(zone);
    setDragOverIndex(index);
  };

  const handleDropOnHeader = (e, dropIndex = null) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Add to header fields if not already there
    let newHeaderFields = [...headerFields];
    if (!newHeaderFields.includes(draggedItem)) {
      if (dropIndex !== null) {
        newHeaderFields.splice(dropIndex, 0, draggedItem);
      } else {
        newHeaderFields.push(draggedItem);
      }
    } else {
      // Reorder within header
      const currentIndex = newHeaderFields.indexOf(draggedItem);
      newHeaderFields.splice(currentIndex, 1);
      if (dropIndex !== null) {
        newHeaderFields.splice(dropIndex, 0, draggedItem);
      } else {
        newHeaderFields.push(draggedItem);
      }
    }

    onHeaderFieldsChange(newHeaderFields);
    
    // Update main display columns order
    const newDisplayColumns = [
      ...newHeaderFields,
      ...displayColumns.filter(col => !newHeaderFields.includes(col))
    ];
    onReorder(newDisplayColumns);

    setDraggedItem(null);
    setDraggedFrom(null);
    setDragOverZone(null);
    setDragOverIndex(null);
  };

  const handleDropOnDetail = (e, dropIndex = null) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from header fields if present
    const newHeaderFields = headerFields.filter(col => col !== draggedItem);
    onHeaderFieldsChange(newHeaderFields);

    // Reorder detail fields
    const currentDetailFields = displayColumns.filter(col => !newHeaderFields.includes(col) && col !== draggedItem);
    if (dropIndex !== null) {
      currentDetailFields.splice(dropIndex, 0, draggedItem);
    } else {
      currentDetailFields.push(draggedItem);
    }

    const newDisplayColumns = [...newHeaderFields, ...currentDetailFields];
    onReorder(newDisplayColumns);

    setDraggedItem(null);
    setDraggedFrom(null);
    setDragOverZone(null);
    setDragOverIndex(null);
  };

  const handleColorChange = (column, color) => {
    onConfigChange(column, { ...columnConfig[column], color });
    setActiveColorPicker(null);
  };

  const getColumnColor = (column) => {
    return columnConfig[column]?.color || null;
  };

  const getContrastColor = (bgColor) => {
    if (!bgColor) return '#ffffff';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1a202c' : '#ffffff';
  };

  const renderDraggableColumn = (column, index, section) => {
    const color = getColumnColor(column);
    const isColorPickerOpen = activeColorPicker === column;
    const isDragging = draggedItem === column;

    return (
      <div
        key={column}
        className={`draggable-column ${isDragging ? 'dragging' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, column, section)}
        onDragEnd={handleDragEnd}
      >
        <div className="drag-handle">⋮⋮</div>
        <span className="column-order">{displayColumns.indexOf(column) + 1}</span>
        <span className="column-name">{column}</span>
        
        <div className="column-color-section">
          <button
            className="color-preview-btn"
            style={{
              backgroundColor: color || '#e2e8f0',
              borderColor: color || '#cbd5e0'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveColorPicker(isColorPickerOpen ? null : column);
            }}
            title="Set highlight color"
          >
            {!color && <span className="no-color-icon">∅</span>}
          </button>
          
          {isColorPickerOpen && (
            <div className="color-picker-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="color-picker-grid">
                {PRESET_COLORS.map((presetColor, i) => (
                  <button
                    key={i}
                    className={`color-option ${color === presetColor ? 'selected' : ''} ${!presetColor ? 'no-color' : ''}`}
                    style={{ backgroundColor: presetColor || '#e2e8f0' }}
                    onClick={() => handleColorChange(column, presetColor)}
                    title={presetColor ? presetColor : 'No color'}
                  >
                    {!presetColor && '∅'}
                    {color === presetColor && presetColor && '✓'}
                  </button>
                ))}
              </div>
              <div className="custom-color-section">
                <label>Custom:</label>
                <input
                  type="color"
                  value={color || '#3182ce'}
                  onChange={(e) => handleColorChange(column, e.target.value)}
                  className="custom-color-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="column-configurator">
      <h3 className="configurator-title">📋 Customize Card Display</h3>
      <p className="configurator-hint">
        Drag columns to the preview card • Items above the line show value only • Items below show label + value
      </p>
      
      <div className="configurator-content">
        {/* Preview Card */}
        <div className="preview-section">
          <h4 className="preview-title">Card Preview</h4>
          <div className="preview-card">
            <div className="preview-position">Position Title</div>
            
            {/* Header section (above line) - value only */}
            <div 
              className={`preview-header-zone ${dragOverZone === 'header' && dragOverIndex === null ? 'drag-over' : ''} ${headerFields.length === 0 ? 'empty' : ''}`}
              onDragOver={(e) => handleDragOverZone(e, 'header')}
              onDrop={(e) => handleDropOnHeader(e)}
            >
              {headerFields.length === 0 ? (
                <div className="drop-hint">Drop here for value-only display</div>
              ) : (
                <>
                  {headerFields.map((col, index) => {
                    const color = getColumnColor(col);
                    const textColor = color ? getContrastColor(color) : '#ffffff';
                    const sampleValue = sampleData[col] || 'Sample Value';
                    
                    return (
                      <div
                        key={col}
                        className={`preview-header-item ${dragOverIndex === index && dragOverZone === 'header' ? 'drag-over-item' : ''}`}
                        style={color ? { backgroundColor: color, color: textColor } : {}}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDragOverZone(e, 'header', index);
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDropOnHeader(e, index);
                        }}
                      >
                        {sampleValue}
                      </div>
                    );
                  })}
                  {/* Always show an "add more" drop target when dragging */}
                  {draggedItem && !headerFields.includes(draggedItem) && (
                    <div 
                      className={`preview-header-add ${dragOverIndex === 'end' && dragOverZone === 'header' ? 'drag-over-item' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverZone('header');
                        setDragOverIndex('end');
                      }}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDropOnHeader(e);
                      }}
                    >
                      + Add here
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Divider line */}
            <div className="preview-divider"></div>

            {/* Detail section (below line) - label + value */}
            <div 
              className={`preview-detail-zone ${dragOverZone === 'detail' && dragOverIndex === null ? 'drag-over' : ''} ${detailFields.length === 0 ? 'empty' : ''}`}
              onDragOver={(e) => handleDragOverZone(e, 'detail')}
              onDrop={(e) => handleDropOnDetail(e)}
            >
              {detailFields.length === 0 ? (
                <div className="drop-hint">Drop here for label + value display</div>
              ) : (
                <>
                  {detailFields.map((col, index) => {
                    const color = getColumnColor(col);
                    const textColor = color ? getContrastColor(color) : '#ffffff';
                    const sampleValue = sampleData[col] || 'Sample Value';
                    
                    return (
                      <div
                        key={col}
                        className={`preview-detail-item ${dragOverIndex === index && dragOverZone === 'detail' ? 'drag-over-item' : ''}`}
                        style={color ? { backgroundColor: color, color: textColor } : {}}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDragOverZone(e, 'detail', index);
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDropOnDetail(e, index);
                        }}
                      >
                        <span className="preview-label" style={color ? { color: textColor, opacity: 0.85 } : {}}>
                          {col}:
                        </span>
                        <span className="preview-value" style={color ? { color: textColor } : {}}>
                          {sampleValue}
                        </span>
                      </div>
                    );
                  })}
                  {/* Always show an "add more" drop target when dragging */}
                  {draggedItem && !detailFields.includes(draggedItem) && (
                    <div 
                      className={`preview-detail-add ${dragOverIndex === 'end' && dragOverZone === 'detail' ? 'drag-over-item' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverZone('detail');
                        setDragOverIndex('end');
                      }}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDropOnDetail(e);
                      }}
                    >
                      + Add here
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Draggable Column Lists */}
        <div className="columns-section">
          {headerFields.length > 0 && (
            <>
              <h4 className="columns-title">Above Line (Value Only)</h4>
              <div className="draggable-columns header-columns">
                {headerFields.map((column, index) => renderDraggableColumn(column, index, 'header'))}
              </div>
            </>
          )}
          
          {detailFields.length > 0 && (
            <>
              <h4 className="columns-title">{headerFields.length > 0 ? 'Below Line (Label + Value)' : 'Display Columns'}</h4>
              <p className="columns-hint">Drag to the card preview to reorder or change display type</p>
              <div className="draggable-columns detail-columns">
                {detailFields.map((column, index) => renderDraggableColumn(column, index, 'detail'))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
