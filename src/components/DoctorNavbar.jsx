import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./DoctorNavbar.css";

import { supabase } from "../supabaseClient";

export default function DoctorNavbar({ doctor, setDoctor }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDoctor(null);
    navigate("/login");
  };

  return (
    <header>
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <div className="icon">DR</div>
          <h1>
            Doctor<span style={{ color: "#00d084" }}>Panel</span>
          </h1>
        </div>

        {/* Hamburger Button */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* Navigation */}
        <nav className={menuOpen ? "open" : ""}>
          <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>

          <NavLink to="/doctor/my-appointments" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>
            My Appointments
          </NavLink>

          <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Patients
          </NavLink>

          <NavLink to="/doctor/write-prescription" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Write Prescription
          </NavLink>

          <NavLink to="/doctor/medical-records" className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Medical Records
          </NavLink>

          {doctor ? (
            <>
              <span className="welcome-user">Welcome {doctor.full_name}</span>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-btn login-btn" onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>

              <NavLink to="/signup" className="nav-btn signup-btn" onClick={() => setMenuOpen(false)}>
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
