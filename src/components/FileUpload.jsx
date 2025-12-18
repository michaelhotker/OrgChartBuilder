import React, { useRef } from 'react';
import './FileUpload.css';

export default function FileUpload({ onFileSelect, fileName }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="file-upload-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
        <div className="upload-icon">📊</div>
        <p className="upload-text">
          {fileName ? fileName : 'Click or drag Excel file here'}
        </p>
        <p className="upload-hint">Supports .xlsx and .xls files</p>
      </div>
    </div>
  );
}

