import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./DoctorNavbar.css"; // design-ka asalka ah
import "./PatientNavbar.css"; // optional for shared styles

import { supabase } from "../supabaseClient";

export default function DoctorNavbar({ doctor, setDoctor }) {
  const navigate = useNavigate();

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

        {/* Navigation Links */}
        <nav>
          <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            Dashboard
          </NavLink>
          <NavLink to="/doctor/my-appointments" className={({ isActive }) => isActive ? "active" : ""}>
            My Appointments
          </NavLink>
          <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? "active" : ""}>
            Patients
          </NavLink>
          <NavLink to="/doctor/write-prescription" className={({ isActive }) => isActive ? "active" : ""}>
            Write Prescription
          </NavLink>
          <NavLink to="/doctor/medical-records" className={({ isActive }) => isActive ? "active" : ""}>
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
