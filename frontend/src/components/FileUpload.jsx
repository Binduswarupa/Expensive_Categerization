import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, Info } from 'lucide-react';

const FileUpload = ({ onUpload, loading }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert("Please upload a CSV file.");
      }
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const triggerUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="upload-wrapper fade-in">
      <div 
        className={`upload-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current.click()}
      >
        <div className="upload-icon-pulse">
          {selectedFile ? (
            <CheckCircle size={56} color="var(--primary)" />
          ) : (
            <Upload size={56} color="var(--primary)" />
          )}
        </div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          {selectedFile ? 'File Ready!' : 'Upload Your Transactions'}
        </h2>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '350px', margin: '0 auto 1.5rem' }}>
          {selectedFile 
            ? `Selected: ${selectedFile.name}` 
            : 'Drag and drop your bank CSV here, or click to browse your files.'}
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="upload-button"
            onClick={(e) => {
              e.stopPropagation();
              selectedFile ? triggerUpload() : fileInputRef.current.click();
            }}
            disabled={loading}
            style={{ minWidth: '220px' }}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" style={{ marginRight: '0.5rem', display: 'inline' }} size={20} />
                Processing AI...
              </>
            ) : (
              selectedFile ? 'Process with AI' : 'Select CSV File'
            )}
          </button>

          {selectedFile && !loading && (
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              Cancel and choose another
            </button>
          )}
        </div>
      </div>

      <div className="upload-footer-info">
        <div className="info-item">
          <Info size={14} />
          <span>Need a template? <a href="/sample_expenses.csv" download style={{ color: 'var(--primary)', fontWeight: 600 }}>Download Sample CSV</a></span>
        </div>
        <div className="info-item">
          <FileText size={14} />
          <span>Required columns: Date, Description, Amount</span>
        </div>
      </div>

      <style jsx>{`
        .upload-wrapper {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .upload-drop-zone {
          border: 2px dashed var(--glass-border);
          border-radius: 2rem;
          padding: 4rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
        }
        .upload-drop-zone:hover {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }
        .drag-active {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.1);
          transform: scale(1.02);
        }
        .file-selected {
          border-style: solid;
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
          cursor: default;
        }
        .upload-icon-pulse {
          margin-bottom: 2rem;
          display: inline-block;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .upload-footer-info {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;

