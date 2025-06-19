import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import "../styles/pages/HomePage.css";
import { FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaDownload } from 'react-icons/fa';

const STORAGE_KEY = "adminDocuments";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getFileIcon(type) {
  if (type.includes('pdf')) return <FaFilePdf style={{ color: '#ba2222' }} />;
  if (type.includes('word')) return <FaFileWord style={{ color: '#1e3a8a' }} />;
  if (type.includes('excel')) return <FaFileExcel style={{ color: '#228B22' }} />;
  if (type.startsWith('image')) return <FaFileImage style={{ color: '#eab308' }} />;
  if (type.startsWith('text')) return <FaFileAlt style={{ color: '#4b5563' }} />;
  return <FaFileAlt style={{ color: '#64748b' }} />;
}

function formatSize(base64) {
  if (!base64) return '';
  const size = Math.round((base64.length * 3) / 4 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0));
  if (size > 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
  if (size > 1024) return (size / 1024).toFixed(1) + ' KB';
  return size + ' B';
}

const AdminRecordsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const base64 = await fileToBase64(selectedFile);
      setDocuments([
        { name: selectedFile.name, type: selectedFile.type, base64 },
        ...documents,
      ]);
      setSelectedFile(null);
    }
  };

  const handleDelete = (index) => {
    const updated = [...documents];
    updated.splice(index, 1);
    setDocuments(updated);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditName(documents[index].name);
  };

  const handleEditSave = () => {
    const updated = [...documents];
    updated[editIndex].name = editName;
    setDocuments(updated);
    setEditIndex(null);
    setEditName("");
  };

  const handlePreview = async (idx) => {
    setPreviewIndex(idx);
    setLoadingPreview(true);
    setPreviewContent("");
    const doc = documents[idx];
    if (doc.type.startsWith("text")) {
      // decode base64
      try {
        const base64 = doc.base64.split(",")[1];
        const text = atob(base64);
        setPreviewContent(text);
      } catch {
        setPreviewContent("(Unable to decode text file)");
      }
    } else {
      setPreviewContent("");
    }
    setLoadingPreview(false);
  };

  const handleDownload = (doc) => {
    const a = document.createElement("a");
    a.href = doc.base64;
    a.download = doc.name;
    a.click();
  };

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div style={{ width: "100%" }}>
          <h2>Admin Records - HR Policy Documents</h2>
          <div style={{ margin: "1rem 0" }}>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: 8 }}>
              Upload
            </button>
          </div>
          <div>
            {documents.length === 0 && <p>No documents uploaded yet.</p>}
            {documents.map((doc, idx) => (
              <div key={idx} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10, borderRadius: 6, background: editIndex === idx ? '#f9f9f9' : '#fff', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 12, fontSize: 22 }}>{getFileIcon(doc.type)}</span>
                <div style={{ flex: 1 }}>
                  {editIndex === idx ? (
                    <>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ marginRight: 8 }}
                      />
                      <button onClick={handleEditSave}>Save</button>
                      <button onClick={() => setEditIndex(null)} style={{ marginLeft: 6 }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <strong>{doc.name}</strong>
                      <span style={{ marginLeft: 8, color: '#64748b', fontSize: 13 }}>{formatSize(doc.base64)}</span>
                      <button onClick={() => handlePreview(idx)} style={{ marginLeft: 12 }}>Preview</button>
                      <button onClick={() => handleEdit(idx)} style={{ marginLeft: 6 }}>Edit</button>
                      <button onClick={() => handleDelete(idx)} style={{ marginLeft: 6, color: 'red' }}>Delete</button>
                      <button onClick={() => handleDownload(doc)} style={{ marginLeft: 6 }} title="Download">
                        <FaDownload />
                      </button>
                    </>
                  )}
                  {previewIndex === idx && (
                    <div style={{ marginTop: 10, background: '#f4f4f4', padding: 10, borderRadius: 4 }}>
                      <em>Preview: {doc.name}</em>
                      <button onClick={() => setPreviewIndex(null)} style={{ marginLeft: 8 }}>Close</button>
                      {loadingPreview ? (
                        <div>Loading...</div>
                      ) : doc.type.startsWith("text") ? (
                        <pre style={{ marginTop: 8, maxHeight: 200, overflow: 'auto', background: '#fff', padding: 8 }}>{previewContent}</pre>
                      ) : doc.type.startsWith("image") ? (
                        <img src={doc.base64} alt={doc.name} style={{ maxWidth: 300, maxHeight: 200, marginTop: 8, borderRadius: 4 }} />
                      ) : doc.type.includes('pdf') ? (
                        <a href={doc.base64} target="_blank" rel="noopener noreferrer">Open PDF</a>
                      ) : (
                        <div style={{ marginTop: 8, color: '#ba2222' }}>(Preview not available for this file type)</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRecordsPage; 