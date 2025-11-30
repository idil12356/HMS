import React, { useEffect, useState } from "react";
import "./MyAppointments.css";
import { supabase } from "../supabaseClient";

const MyAppointments = ({ patient }) => {
  const [appointments, setAppointments] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [editData, setEditData] = useState({
    doctor: "",
    specialty: "",
    date: "",
    time: "",
  });

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("email", patient?.email);
        if (!error) setAppointments(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (patient) fetchAppointments();
  }, [patient]);

  // Open cancel modal
  const openCancelModal = (appt) => {
    setSelectedAppt(appt);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedAppt(null);
  };

  const handleCancel = async (id) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "Cancelled" })
      .eq("id", id);

    if (!error) {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, status: "Cancelled" } : appt
        )
      );
      closeCancelModal();
    }
  };

  // Open edit modal
  const openEditModal = (appt) => {
    setSelectedAppt(appt);
    setEditData({
      doctor: appt.doctor,
      specialty: appt.specialty,
      date: appt.date,
      time: appt.time,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedAppt(null);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    const { error } = await supabase
      .from("appointments")
      .update(editData)
      .eq("id", selectedAppt.id);

    if (!error) {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppt.id ? { ...appt, ...editData } : appt
        )
      );
      closeEditModal();
    }
  };

  return (
    <div className="appointments-container">
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.id}</td>
                <td>{appt.doctor}</td>
                <td>{appt.specialty}</td>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td className={`status ${appt.status?.toLowerCase()}`}>
                  {appt.status || "Pending"}
                </td>
                
                <td>
                  <button className="edit-btn" onClick={() => openEditModal(appt)}>Edit</button>
                  {appt.status !== "Cancelled" && (
                    <button className="cancel-btn" onClick={() => openCancelModal(appt)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Cancel</h3>
            <p>
              Ma hubtaa inaad joojinayso ballanta Dr. {selectedAppt.doctor} ee {selectedAppt.date}?
            </p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={() => handleCancel(selectedAppt.id)}>Yes</button>
              <button className="cancel-btn" onClick={closeCancelModal}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAppt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Appointment</h3>
            <div className="edit-form">
              <label>Doctor</label>
              <input name="doctor" value={editData.doctor} onChange={handleEditChange} />
              <label>Specialty</label>
              <input name="specialty" value={editData.specialty} onChange={handleEditChange} />
              <label>Date</label>
              <input type="date" name="date" value={editData.date} onChange={handleEditChange} />
              <label>Time</label>
              <input type="time" name="time" value={editData.time} onChange={handleEditChange} />
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleEditSubmit}>Save</button>
              <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
