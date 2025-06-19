import React from "react";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { FaFileAlt } from 'react-icons/fa';
import "../styles/pages/HomePage.css";

const HomePage = () => {
  const policies = [
    "Leave Management Rule",
    "Captive Allowance",
    "Dress Code and Personal Hygiene",
    "Non Standard Working Hours Management Rule",
    "Notice Period and Recovery Management Rule",
    "Disciplinary Actions",
    "Travel Policy",
    "Work From Home Policy",
    "Compensation Policy",
    "Performance Management"
  ];

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="welcome-section" style={{ background: '#f0f6ff', padding: 24, borderRadius: 10, marginBottom: 24 }}>
          <h1 style={{ color: '#1e3a8a' }}>Welcome to CGI HR Portal</h1>
          <p className="subtitle">Your HR Assistant - Here to Help</p>
        </div>
        <div className="policy-grid">
          {policies.map((policy, index) => (
            <div key={index} className="policy-card">
              <span className="policy-icon">
                <FaFileAlt />
              </span>
              <h3>{policy}</h3>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, background: '#f8f8f8', padding: 20, borderRadius: 8, maxWidth: 500 }}>
          <h3>Need Help?</h3>
          <p>Click the button below to chat with our HR Virtual Assistant for instant support.</p>
          <VirtualAssistanceButton />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
