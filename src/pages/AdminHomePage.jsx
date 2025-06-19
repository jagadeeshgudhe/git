import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { Link } from "react-router-dom";
import "../styles/pages/HomePage.css";

const AdminHomePage = () => {
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("adminDocuments");
    if (stored) {
      const docs = JSON.parse(stored);
      setRecentDocs(docs.slice(0, 3));
    }
  }, []);

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="welcome-section">
          <h1 style={{ color: '#A91E22' }}>WELCOME ADMIN</h1>
          <p className="subtitle">Manage HR Policies and Records</p>
        </div>
        <div className="admin-buttons" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <Link to="/user" className="nav-link">Home</Link>
          <Link to="/export" className="nav-link">Help</Link>
          <Link to="/admin/records" className="nav-link">Records</Link>
        </div>
        <div style={{ marginTop: 32, background: '#f8f8f8', padding: 20, borderRadius: 8, maxWidth: 500 }}>
          <h3>Recent Documents</h3>
          {recentDocs.length === 0 ? (
            <p>No documents uploaded yet. <Link to="/admin/records">Upload now</Link></p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {recentDocs.map((doc, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>{doc.name}</li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/records">Go to Records ({recentDocs.length} total)</Link>
          </div>
        </div>
      </main>
      <VirtualAssistanceButton />
    </div>
  );
};

export default AdminHomePage; 