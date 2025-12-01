import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./PatientNavbar.css"; // shared styles
import { supabase } from "../supabaseClient";

export default function AdminNavbar({ admin, setAdmin }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    navigate("/login");
  };

  return (
    <header className="admin-navbar">
      <div className="container">

        {/* Logo */}
        <div className="logo">
          <div className="icon">AD</div>
          <h1>
            Admin<span style={{ color: "#00d084" }}>Panel</span>
          </h1>
        </div>

        {/* Hamburger Button */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* Navigation Links */}
        <nav className={menuOpen ? "open" : ""}>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/manage-users"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Manage Users
          </NavLink>

          <NavLink
            to="/admin/appointments"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Appointments
          </NavLink>

          {admin ? (
            <>
              <span className="welcome-user">Welcome, {admin.username}</span>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="nav-btn login-btn"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="nav-btn signup-btn"
                onClick={() => setMenuOpen(false)}
              >
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
