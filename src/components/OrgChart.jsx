import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { getColumnsForEmploymentType } from '../utils/employmentTypeAnalyzer';
import './OrgChart.css';

export default function OrgChart({ chartData, displayColumns, headerFields = [], columnConfig = {}, colorByColumn = '', valueColors = {}, employmentTypeColumn = '', fieldGroups = {}, typeColors = {} }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const chartWrapperRef = useRef(null);

  // Initialize: expand all nodes by default
  useEffect(() => {
    if (chartData) {
      const allNodeIds = new Set();
      const collectNodeIds = (node) => {
        allNodeIds.add(node.id);
        if (node.children) {
          node.children.forEach(collectNodeIds);
        }
      };
      collectNodeIds(chartData);
      setExpandedNodes(allNodeIds);
    }
  }, [chartData]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseMove = useCallback((e) => {
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && 
        !e.target.closest('.node-content') && 
        !e.target.closest('.chart-controls') &&
        !e.target.closest('.expand-indicator')) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  }, [pan]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  if (!chartData) {
    return (
      <div className="org-chart-container">
        <div className="no-data-message">
          Please upload an Excel file and configure the columns to view the org chart.
        </div>
      </div>
    );
  }

  const renderNodeContent = (node, level = 0) => {
    const isRoot = node.id === 'root';
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    // Helper to get contrasting text color
    const getContrastColor = (bgColor) => {
      if (!bgColor) return null;
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#1a202c' : '#ffffff';
    };

    // Get node color based on employment type or colorByColumn value
    const getNodeColor = () => {
      // First check if there's a type-specific color
      if (employmentTypeColumn && typeColors && Object.keys(typeColors).length > 0) {
        const employmentType = node.data && node.data[employmentTypeColumn] 
          ? String(node.data[employmentTypeColumn]).trim() 
          : '';
        if (employmentType && typeColors[employmentType]) {
          return typeColors[employmentType];
        }
      }
      // Fall back to colorByColumn
      if (!colorByColumn || !node.data) return null;
      const value = node.data[colorByColumn];
      if (value === undefined || value === null || value === '') return null;
      return valueColors[String(value)] || null;
    };

    const nodeColor = getNodeColor();
    const nodeTextColor = nodeColor ? getContrastColor(nodeColor) : null;
    
    // Custom styles when node has a value-based color
    const nodeStyle = nodeColor ? {
      backgroundColor: nodeColor,
      borderColor: nodeColor
    } : {};

    const textStyle = nodeTextColor ? { color: nodeTextColor } : {};
    
    // Filter columns based on employment type if enabled
    // fieldGroups[type] contains type-specific fields only
    // We need to combine displayColumns + type-specific fields, preserving order
    let relevantColumns = displayColumns;
    if (employmentTypeColumn && fieldGroups && Object.keys(fieldGroups).length > 0) {
      const employmentType = node.data && node.data[employmentTypeColumn] 
        ? String(node.data[employmentTypeColumn]).trim() 
        : '';
      const typeSpecificFields = getColumnsForEmploymentType(fieldGroups, employmentType);
      
      // Combine displayColumns (at top) + type-specific fields (below)
      // This matches the preview card structure
      if (typeSpecificFields.length > 0) {
        // Filter type-specific fields to only those not in displayColumns
        const additionalFields = typeSpecificFields.filter(col => !displayColumns.includes(col));
        // Combine: displayColumns first, then type-specific fields
        relevantColumns = [...displayColumns, ...additionalFields];
        
        // Add employment type column at the beginning if it's in displayColumns
        if (displayColumns.includes(employmentTypeColumn) && relevantColumns[0] !== employmentTypeColumn) {
          relevantColumns = [employmentTypeColumn, ...relevantColumns.filter(col => col !== employmentTypeColumn)];
        }
      }
      // If no type-specific fields, show all displayColumns (default behavior)
    }
    
    // Split columns into header (above line) and detail (below line)
    const headerCols = relevantColumns.filter(col => headerFields.includes(col));
    const detailCols = relevantColumns.filter(col => !headerFields.includes(col));
    
    return (
      <div 
        className={`node-content level-${Math.min(level, 3)} ${isRoot ? 'root-node' : ''} ${hasChildren ? 'has-children' : ''} ${nodeColor ? 'custom-color' : ''}`}
        style={nodeStyle}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) {
            toggleNode(node.id);
          }
        }}
      >
        {/* Position/Title is always shown */}
        <div className="node-position" style={textStyle}>{node.position}</div>
        
        {/* Header fields (above line) - value only, no labels */}
        {headerCols.length > 0 && (
          <div className="node-header-fields">
            {headerCols.map((col) => {
              const value = node.data[col];
              if (value === undefined || value === null || value === '') return null;
              
              const config = columnConfig[col] || {};
              const hasItemColor = config.color;
              const itemTextColor = hasItemColor ? getContrastColor(config.color) : nodeTextColor;
              
              return (
                <div 
                  key={col} 
                  className={`node-header-item ${hasItemColor ? 'has-color' : ''}`}
                  style={hasItemColor ? {
                    backgroundColor: config.color,
                    color: itemTextColor,
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    marginBottom: '0.25rem'
                  } : textStyle}
                >
                  {String(value)}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Detail fields (below line) - with labels */}
        {detailCols.length > 0 && (
          <div className="node-details">
            {detailCols.map((col) => {
              const value = node.data[col];
              if (value === undefined || value === null || value === '') return null;
              
              const config = columnConfig[col] || {};
              const hasItemColor = config.color;
              const itemTextColor = hasItemColor ? getContrastColor(config.color) : nodeTextColor;
              
              return (
                <div 
                  key={col} 
                  className={`node-detail-item ${hasItemColor ? 'has-color' : ''}`}
                  style={hasItemColor ? {
                    backgroundColor: config.color,
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    marginBottom: '0.35rem'
                  } : {}}
                >
                  <span 
                    className="detail-label"
                    style={hasItemColor ? { color: itemTextColor, opacity: 0.85 } : textStyle}
                  >
                    {col}
                  </span>
                  <span 
                    className="detail-value"
                    style={hasItemColor ? { color: itemTextColor } : textStyle}
                  >
                    {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        {hasChildren && (
          <div className="expand-indicator">
            {isExpanded ? '−' : '+'}
          </div>
        )}
      </div>
    );
  };

  // Render child nodes using TreeNode
  const renderChildren = (children, level) => {
    return children.map((child) => {
      const hasGrandChildren = child.children && child.children.length > 0;
      const isChildExpanded = expandedNodes.has(child.id);
      const childContent = renderNodeContent(child, level);

      if (!hasGrandChildren || !isChildExpanded) {
        return <TreeNode key={child.id} label={childContent} />;
      }

      return (
        <TreeNode key={child.id} label={childContent}>
          {renderChildren(child.children, level + 1)}
        </TreeNode>
      );
    });
  };

  // Root Tree with children as TreeNodes
  const renderTree = (rootNode) => {
    const hasChildren = rootNode.children && rootNode.children.length > 0;
    const isExpanded = expandedNodes.has(rootNode.id);
    const rootContent = renderNodeContent(rootNode, 0);

    return (
      <Tree
        label={rootContent}
        lineWidth="2px"
        lineColor="#4a5568"
        lineBorderRadius="0px"
      >
        {hasChildren && isExpanded && renderChildren(rootNode.children, 1)}
      </Tree>
    );
  };

  return (
    <div className="org-chart-container">
      <div className="chart-controls">
        <button className="control-btn" onClick={handleZoomIn} title="Zoom In">
          <span>+</span>
        </button>
        <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">
          <span>−</span>
        </button>
        <button className="control-btn" onClick={handleResetView} title="Reset View">
          <span>⌂</span>
        </button>
        <div className="zoom-level">{Math.round(zoom * 100)}%</div>
      </div>
      <div 
        className="org-chart-wrapper"
        ref={chartWrapperRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'top center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {renderTree(chartData)}
      </div>
    </div>
  );
}

