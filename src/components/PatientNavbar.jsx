import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./PatientNavbar.css";
import { supabase } from "../supabaseClient";

export default function PatientNavbar({ patient, setPatient }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPatient(null);
    navigate("/login");
  };

  // function for active class
  const activeStyle = ({ isActive }) => ({
    color: isActive ? "#00d084" : "#fff", // change color if active
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

        <nav>
          <NavLink to="/Home" style={activeStyle}>
            Home
          </NavLink>
          <NavLink to="/book-appointment" style={activeStyle}>
            Book Appointment
          </NavLink>
          <NavLink to="/my-appointments" style={activeStyle}>
            My Appointments
          </NavLink>
          <NavLink to="/medical-history" style={activeStyle}>
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
              <NavLink to="/login" className="nav-btn loogin-btn">
                Login
              </NavLink>
              <NavLink to="/signup" className="nav-btn signnup-btn">
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
