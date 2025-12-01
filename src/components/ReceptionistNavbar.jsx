import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ReceptionistNavbar.css";
import { supabase } from "../supabaseClient";

export default function ReceptionistNavbar({ receptionist, setReceptionist }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setReceptionist(null);
    navigate("/login");
  };

  return (
    <header className="rec-header">
      <div className="rec-container">

        {/* Logo */}
        <div className="rec-logo">
          <div className="rec-icon">RC</div>
          <h1>
            Reception<span style={{ color: "#00d084" }}>Panel</span>
          </h1>
        </div>

        {/* Hamburger Button */}
        <div className="rec-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* Navigation */}
        <nav className={menuOpen ? "rec-nav open" : "rec-nav"}>
          <NavLink
            to="/reception/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/reception/patients"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Patients
          </NavLink>

          <NavLink
            to="/reception/appointments"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Appointments
          </NavLink>

          <NavLink
            to="/reception/doctors"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Doctors
          </NavLink>

          <NavLink
            to="/reception/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Reports
          </NavLink>

          {receptionist ? (
            <>
              <span className="rec-welcome">Welcome {receptionist.full_name}</span>
              <button className="rec-btn logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rec-btn login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="rec-btn signup"
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
