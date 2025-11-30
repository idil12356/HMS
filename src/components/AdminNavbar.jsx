import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./PatientNavbar.css"; // design-ka asalka ah
import { supabase } from "../supabaseClient";

export default function AdminNavbar({ admin, setAdmin }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    navigate("/login");
  };

  return (
    <header>
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <div className="icon">AD</div>
          <h1>
            Admin<span style={{ color: "#00d084" }}>Panel</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/manage-users" className={({ isActive }) => isActive ? "active" : ""}>
            Manage Users
          </NavLink>
          <NavLink to="/admin/appointments" className={({ isActive }) => isActive ? "active" : ""}>
            Appointments
          </NavLink>

          {/* Admin Section */}
          {admin ? (
            <>
              <span className="welcome-user">Welcome, {admin.username}</span>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-btn login-btn">
                Login
              </NavLink>
              <NavLink to="/signup" className="nav-btn signup-btn">
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
