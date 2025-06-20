import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaUpload, FaEye, FaEdit, FaTrash, FaArrowLeft, FaFileAlt, FaDownload } from 'react-icons/fa';
import "../styles/pages/AdminRecordsPage.css";

const AdminRecordsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [previewDocument, setPreviewDocument] = useState(null);

  useEffect(() => {
    // Load documents from localStorage
    const storedDocuments = JSON.parse(localStorage.getItem('hrDocuments')) || [];
    setDocuments(storedDocuments);
  }, []);

  const saveDocuments = (newDocuments) => {
    setDocuments(newDocuments);
    localStorage.setItem('hrDocuments', JSON.stringify(newDocuments));
  };

  const handleDelete = (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      saveDocuments(updatedDocuments);
    }
  };

  const handlePreview = (document) => {
    setPreviewDocument(document);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-records-container">
      <Header />
      
      <main className="records-main-content">
        <div className="records-header">
          <button className="back-button" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Admin Dashboard
          </button>
          <h1>Records Management</h1>
          <button 
            className="upload-button"
            onClick={() => navigate('/admin/records/upload')}
          >
            <FaUpload /> Upload HR Policy File
          </button>
        </div>

        <div className="records-content">
          {documents.length === 0 ? (
            <div className="empty-state">
              <FaFileAlt className="empty-icon" />
              <h3>No documents uploaded yet</h3>
              <p>Start by uploading your first HR policy document</p>
              <button 
                className="upload-button"
                onClick={() => navigate('/admin/records/upload')}
              >
                <FaUpload /> Upload First Document
              </button>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((document) => (
                <div key={document.id} className="document-card">
                  <div className="document-header">
                    <div className="document-icon">
                      <FaFileAlt />
                    </div>
                    <div className="document-info">
                      <h3>{document.name}</h3>
                      <p className="document-category">{document.category}</p>
                      {document.fileSize && (
                        <p className="document-meta">
                          {formatFileSize(document.fileSize)} • {formatDate(document.uploadDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="document-actions">
                    <button 
                      className="action-button preview"
                      onClick={() => handlePreview(document)}
                      title="Preview"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-button edit"
                      disabled // For now, disable edit on new document type
                      title="Edit Disabled"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDelete(document.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="modal-overlay">
          <div className="modal preview-modal">
            <div className="modal-header">
              <h2>{previewDocument.name}</h2>
              <button 
                className="close-button"
                onClick={() => setPreviewDocument(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="preview-info">
                <p><strong>Category:</strong> {previewDocument.category}</p>
                {previewDocument.fileName && <p><strong>File:</strong> {previewDocument.fileName}</p>}
                {previewDocument.fileSize && <p><strong>Size:</strong> {formatFileSize(previewDocument.fileSize)}</p>}
                {previewDocument.uploadDate && <p><strong>Uploaded:</strong> {formatDate(previewDocument.uploadDate)}</p>}
                {previewDocument.url && <p><strong>URL:</strong> <a href={previewDocument.url} target="_blank" rel="noopener noreferrer">{previewDocument.url}</a></p>}
                {previewDocument.description && <p><strong>Description:</strong> {previewDocument.description}</p>}
              </div>
              <div className="preview-content">
                <div className="document-preview">
                  <FaFileAlt className="preview-icon" />
                  <p>Document preview would be displayed here</p>
                  <p>In a real application, this would show the actual document content</p>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="download-button"
                onClick={() => alert("Download functionality would be implemented here")}
              >
                <FaDownload /> Download
              </button>
              <button 
                className="close-button"
                onClick={() => setPreviewDocument(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecordsPage; 