import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft, FaCog } from 'react-icons/fa';
import "../styles/pages/AdminSettingsPage.css";

const AdminSettingsPage = () => {
  const navigate = useNavigate();

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
          <div className="coming-soon">
            <FaCog className="coming-soon-icon" />
            <h2>Settings Page Coming Soon</h2>
            <p>This section will allow administrators to configure system-wide settings, manage security, and customize the application's appearance.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage; 