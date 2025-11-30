import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ReceptionistNavbar.css";
import { supabase } from "../supabaseClient";

export default function ReceptionistNavbar({ receptionist, setReceptionist }) {
  const navigate = useNavigate();

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

        {/* Navigation Links */}
        <nav className="rec-nav">
          <NavLink to="/reception/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            Dashboard
          </NavLink>
          <NavLink to="/reception/patients" className={({ isActive }) => isActive ? "active" : ""}>
            Patients
          </NavLink>
          <NavLink to="/reception/appointments" className={({ isActive }) => isActive ? "active" : ""}>
            Appointments
          </NavLink>
          <NavLink to="/reception/doctors" className={({ isActive }) => isActive ? "active" : ""}>
            Doctors
          </NavLink>
          <NavLink to="/reception/reports" className={({ isActive }) => isActive ? "active" : ""}>
            Reports
          </NavLink>

          {/* User Section */}
          {receptionist ? (
            <>
              <span className="rec-welcome">Welcome {receptionist.full_name}</span>
              <button className="rec-btn logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="rec-btn login">Login</NavLink>
              <NavLink to="/signup" className="rec-btn signup">Signup</NavLink>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}
