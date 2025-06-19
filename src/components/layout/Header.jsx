import React from "react";
import {
  LogOut,
  Upload,
  Home as HomeIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/layout/Header.css";

const Header = () => {
  const navigate = useNavigate();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("loggedInUser"));
  } catch (e) {}

  return (
    <header className="header gradient-header">
      <div className="header-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/CGI_logo.svg/2560px-CGI_logo.svg.png"
          alt="CGI Logo"
          className="logo"
        />
        {user && user.firstName && (
          <span style={{ marginLeft: 16, fontWeight: 500, color: '#fff', fontSize: 16 }}>
            Hello, {user.firstName}!
          </span>
        )}
        <nav className="nav-links">
          <Link to="/user" className="nav-link">
            <HomeIcon size={16} /> Home
          </Link>
          <Link to="/export" className="nav-link">
            <Upload size={16} /> Help
          </Link>
          {user && user.role === "admin" && (
            <Link to="/admin/records" className="nav-link">
              Records
            </Link>
          )}
        </nav>
      </div>

      <button className="logout-button" onClick={() => {
        localStorage.removeItem("loggedInUser");
        navigate("/");
      }}>
        <LogOut size={18} style={{ marginRight: "6px" }} />
        Logout
      </button>
    </header>
  );
};

export default Header;
