// Dashboard.jsx – Full Admin Dashboard (No Loading)
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

export default function Dashboard() {
  const [patients, setPatients] = useState(0);
  const [doctors, setDoctors] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    doctor_id: "",
    doctor: "",
    specialty: "",
    date: "",
    time: "",
    notes: "",
    status: "Pending",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch totals
  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("*");
    if (data) setPatients(data.length);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase.from("doctors").select("*");
    if (data) setDoctors(data.length);
  };

  const fetchDoctorsList = async () => {
    const { data } = await supabase.from("doctors").select("*");
    if (data) setDoctorList(data);
  };

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAppointments(data);
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchDoctorsList();
    fetchAppointments();
  }, []);

  // Add Appointment
  const handleAddAppointment = async () => {
    if (!form.full_name || !form.doctor_id || !form.date || !form.time) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const { error } = await supabase.from("appointments").insert([form]);
    if (!error) {
      setShowAdd(false);
      setForm({
        full_name: "",
        phone: "",
        email: "",
        doctor_id: "",
        doctor: "",
        specialty: "",
        date: "",
        time: "",
        notes: "",
        status: "Pending",
      });
      setErrorMessage("");
      fetchAppointments();
    }
  };

  // Update Appointment
  const handleUpdateAppointment = async () => {
    const { error } = await supabase
      .from("appointments")
      .update(form)
      .eq("id", editData.id);
    if (!error) {
      setShowEdit(false);
      fetchAppointments();
    }
  };

  // Delete Appointment
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("appointments").delete().eq("id", deleteId);
    if (!error) {
      fetchAppointments();
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Welcome, Admin</h1>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card blue"><h3>Total Patients</h3><p>{patients}</p></div>
        <div className="stat-card green"><h3>Total Doctors</h3><p>{doctors}</p></div>
        <div className="stat-card purple"><h3>Total Appointments</h3><p>{appointments.length}</p></div>
      </div>

      {/* Add Appointment Button */}
      <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add Appointment</button>

      {/* Appointments Table */}
      <h2 className="section-title">All Appointments</h2>
      <div className="table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Specialty</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="6" className="no-appointments">No appointments</td></tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.full_name}</td>
                  <td>{apt.specialty}</td>
                  <td>{apt.date}</td>
                  <td>{apt.time}</td>
                  <td><span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                  <td>
                    <button className="edit-btn" onClick={() => { setEditData(apt); setForm(apt); setShowEdit(true); }}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(apt.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal">
          <div className="modal-card large">
            <h3>Add New Appointment</h3>
            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <label>Patient Name</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />

            <label>Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <label>Doctor</label>
            <select
              value={form.doctor_id}
              onChange={(e) => {
                const doc = doctorList.find((d) => String(d.id) === String(e.target.value));
                setForm({ ...form, doctor_id: e.target.value, doctor: doc?.full_name || "", specialty: doc?.specialty || "" });
              }}
            >
              <option value="">Select doctor</option>
              {doctorList.map((d) => <option key={d.id} value={d.id}>{d.full_name} — {d.specialty}</option>)}
            </select>

            <label>Specialty</label>
            <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />

            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

            <label>Time</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />

            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="modal-actions">
              <button className="modal-btn save" onClick={handleAddAppointment}>Save Appointment</button>
              <button className="modal-btn close" onClick={() => setShowAdd(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal">
          <div className="modal-card large">
            <h3>Edit Appointment</h3>

            <label>Patient Name</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />

            <label>Doctor</label>
            <select value={form.doctor_id} onChange={(e) => {
              const doc = doctorList.find((d) => String(d.id) === String(e.target.value));
              setForm({ ...form, doctor_id: e.target.value, doctor: doc?.full_name || "", specialty: doc?.specialty || "" });
            }}>
              <option value="">Select doctor</option>
              {doctorList.map((d) => <option key={d.id} value={d.id}>{d.full_name} — {d.specialty}</option>)}
            </select>

            <label>Specialty</label>
            <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />

            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

            <label>Time</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />

            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="modal-actions">
              <button className="modal-btn save" onClick={handleUpdateAppointment}>Update</button>
              <button className="modal-btn close" onClick={() => setShowEdit(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="modal">
          <div className="modal-card">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this appointment?</p>
            <div className="modal-actions">
              <button className="modal-btn save" onClick={confirmDelete}>Yes, Delete</button>
              <button className="modal-btn close" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
