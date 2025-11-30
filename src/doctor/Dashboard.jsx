// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

export default function Dashboard({ doctor }) {
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchAppointments = async () => {
    if (!doctor) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor", doctor.full_name);

    if (!error) {
      setAppointments(data);
      setTodayAppointments(data.filter((apt) => apt.date === today));
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctor]);

  // Cancel Modal
  const openCancelModal = (id) => {
    setSelectedId(id);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    setShowCancelModal(false);

    const { error } = await supabase
      .from("appointments")
      .update({ status: "Cancelled" })
      .eq("id", selectedId);

    if (!error) {
      setAppointments((prev) => prev.filter((apt) => apt.id !== selectedId));
      setTodayAppointments((prev) =>
        prev.filter((apt) => apt.id !== selectedId)
      );
    }
  };

  // View modal
  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Welcome, Dr. {doctor.full_name}</h1>

      {/* Quick Stats */}
      <div className="cards-container">
        <div className="card blue">
          <h2>Today’s Appointments</h2>
          <p>{todayAppointments.length}</p>
        </div>

        <div className="card green">
          <h2>Total Appointments</h2>
          <p>{appointments.length}</p>
        </div>

        <div className="card purple">
          <h2>Unique Patients</h2>
          <p>{new Set(appointments.map((a) => a.full_name)).size}</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <h2 className="section-title">Today’s Appointments</h2>

      {todayAppointments.length === 0 ? (
        <p>No appointments today.</p>
      ) : (
        <div className="today-appointments">
          {todayAppointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div>
                <p className="patient-name">{apt.full_name}</p>
                <p className="appointment-time">{apt.time}</p>
                <p className="appointment-status">
                  Status: {apt.status || "Pending"}
                </p>
              </div>

              <div className="buttons-group">
                {apt.status !== "Cancelled" && (
                  <button
                    className="btn cancel-btn"
                    onClick={() => openCancelModal(apt.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Appointments Table */}
      <h2 className="section-title">All Appointments</h2>

      <div className="dashboard-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Phone</th>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td>{apt.id}</td>
                <td>{apt.full_name}</td>
                <td>{apt.phone}</td>
                <td>{apt.doctor}</td>
                <td>{apt.specialty}</td>
                <td>{apt.date}</td>
                <td>{apt.time}</td>
                <td>
                  <span
                    className={`status ${
                      apt.status === "Confirmed"
                        ? "status-confirmed"
                        : apt.status === "Cancelled"
                        ? "status-cancelled"
                        : "status-pending"
                    }`}
                  >
                    {apt.status || "Pending"}
                  </span>
                </td>
                <td>
                  <div className="buttons-group">
                    <button
                      className="btn view-btn"
                      onClick={() => handleView(apt)}
                    >
                      View
                    </button>

                    {apt.status !== "Cancelled" && (
                      <button
                        className="btn cancel-btn"
                        onClick={() => openCancelModal(apt.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Appointment Details</h2>
            <p><strong>Patient:</strong> {selectedAppointment.full_name}</p>
            <p><strong>Phone:</strong> {selectedAppointment.phone}</p>
            <p><strong>Email:</strong> {selectedAppointment.email}</p>
            <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
            <p><strong>Specialty:</strong> {selectedAppointment.specialty}</p>
            <p><strong>Date:</strong> {selectedAppointment.date}</p>
            <p><strong>Time:</strong> {selectedAppointment.time}</p>
            <p><strong>Status:</strong> {selectedAppointment.status}</p>
            <button className="modal-close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* CUSTOM CANCEL MODAL */}
      {showCancelModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Are you sure?</h3>
            <p>Do you want to cancel this appointment?</p>
            <div className="modal-actions">
              <button className="confirmm-btn" onClick={handleCancel}> Yes </button>
              <button className="closes-btn" onClick={() => setShowCancelModal(false)}> No </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
