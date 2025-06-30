import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft } from 'react-icons/fa';
import "../styles/pages/AdminSettingsPage.css";

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('file');
  const [documents, setDocuments] = useState([]);

  // Mock data
  const fileReports = [
    { name: 'Example_File_Name_1.pdf', url: 'http://example.com/file1.pdf' },
    { name: 'Example_File_Name_2.pdf', url: 'http://example.com/file2.pdf' },
    { name: 'Another_Document.docx', url: 'http://example.com/another.docx' }
  ];

  const policyReports = [
    { name: 'HR_Policy_Handbook.pdf', url: 'http://example.com/hr_policy.pdf' },
    { name: 'IT_Security_Policy.docx', url: 'http://example.com/it_policy.docx' }
  ];

  useEffect(() => {
    if (reportType === 'file') {
      setDocuments(fileReports);
    } else {
      setDocuments(policyReports);
    }
  }, [reportType]);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }, () => {
      alert('Failed to copy link.');
    });
  };

  return (
    <div className="admin-settings-container">
      <Header />
      
      <main className="settings-main-content">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Admin Dashboard
          </button>
          <h1>System Settings</h1>
        </div>

        <div className="settings-content">
          <div className="documents-report-section">
            <h2>Documents Report</h2>
            <div className="report-controls">
              <label htmlFor="report-type">Select Report Type:</label>
              <select 
                id="report-type" 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="report-type-dropdown"
              >
                <option value="file">File Report</option>
                <option value="policy">Policy Report</option>
              </select>
            </div>
            <div className="documents-table-container">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.name}</td>
                        <td className="actions-cell">
                          <button className="link-button" onClick={() => window.open(doc.url, '_blank')}>Open Link</button>
                          <button className="link-button" onClick={() => handleCopyLink(doc.url)}>Copy Link</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No documents to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage; 