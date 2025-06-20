import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft, FaUsers, FaUserPlus, FaUserEdit, FaUserTimes } from 'react-icons/fa';
import "../styles/pages/AdminUsersPage.css";

const AdminUsersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-users-container">
      <Header />
      
      <main className="users-main-content">
        <div className="users-header">
          <button className="back-button" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Admin Dashboard
          </button>
          <h1>User Management</h1>
          <button className="add-user-button">
            <FaUserPlus /> Add User
          </button>
        </div>

        <div className="users-content">
          <div className="coming-soon">
            <FaUsers className="coming-soon-icon" />
            <h2>User Management Coming Soon</h2>
            <p>This feature will allow administrators to manage user accounts, permissions, and access levels.</p>
            <div className="feature-list">
              <div className="feature-item">
                <FaUserPlus />
                <span>Add new users</span>
              </div>
              <div className="feature-item">
                <FaUserEdit />
                <span>Edit user profiles</span>
              </div>
              <div className="feature-item">
                <FaUserTimes />
                <span>Deactivate accounts</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage; 