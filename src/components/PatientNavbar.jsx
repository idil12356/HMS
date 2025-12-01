import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./PatientNavbar.css";
import { supabase } from "../supabaseClient";

export default function PatientNavbar({ patient, setPatient }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPatient(null);
    navigate("/login");
  };

  const activeStyle = ({ isActive }) => ({
    color: isActive ? "#00d084" : "#fff",
    textDecoration: isActive ? "underline" : "none",
  });

  return (
    <header>
      <div className="container">
        <div className="logo">
          <div className="icon">PT</div>
          <h1>
            Patient<span style={{ color: "#00d084" }}>Care</span>
          </h1>
        </div>

        {/* Hamburger Button */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        <nav className={menuOpen ? "open" : ""}>
          <NavLink to="/Home" style={activeStyle} onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/book-appointment" style={activeStyle} onClick={() => setMenuOpen(false)}>
            Book Appointment
          </NavLink>
          <NavLink to="/my-appointments" style={activeStyle} onClick={() => setMenuOpen(false)}>
            My Appointments
          </NavLink>
          <NavLink to="/medical-history" style={activeStyle} onClick={() => setMenuOpen(false)}>
            Medical History
          </NavLink>

          {patient ? (
            <>
              <span className="welcome-user">Welcome, {patient.username}</span>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-btn loogin-btn" onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/signup" className="nav-btn signnup-btn" onClick={() => setMenuOpen(false)}>
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
