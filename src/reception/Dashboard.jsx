import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

export default function ReceptionDashboard() {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [newPatients, setNewPatients] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  const [errorMessage, setErrorMessage] = useState(""); // For Add
  const [editErrorMessage, setEditErrorMessage] = useState(""); // For Edit

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    doctor: "",
    doctor_id: "",
    date: "",
    time: "",
    notes: "",
    specialty: "",
    status: "Pending",
  });

  const [addForm, setAddForm] = useState({ ...form });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchDashboardData();
    fetchDoctorsList();
  }, []);

  // Fetch dashboard stats
  async function fetchDashboardData() {
    const { data: todayApps } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", today);

    const { data: newPats } = await supabase
      .from("patients")
      .select("*")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: recentApps } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    setTodayAppointments(todayApps || []);
    setNewPatients(newPats?.length || 0);
    setRecentAppointments(recentApps || []);
  }

  // Fetch doctors list
  async function fetchDoctorsList() {
    const { data } = await supabase.from("doctors").select("id, full_name, specialty");
    if (data) setDoctorList(data);
  }

  // ==================== ADD APPOINTMENT ====================
  const handleAddAppointment = async () => {
    setErrorMessage(""); // clear old errors

    let doctorName = "";
    if (addForm.doctor_id) {
      const doc = doctorList.find((d) => String(d.id) === String(addForm.doctor_id));
      doctorName = doc ? doc.full_name : "";
    }

    const payload = { ...addForm, doctor: doctorName };
    const { error } = await supabase.from("appointments").insert([payload]);

    if (!error) {
      setShowAdd(false);
      setAddForm({ ...form });
      fetchDashboardData();
    } else {
      setErrorMessage("Add failed: " + error.message);
    }
  };

  // ==================== UPDATE APPOINTMENT ====================
  const handleUpdateAppointment = async () => {
    setEditErrorMessage("");

    if (!editData) return;

    const { error } = await supabase
      .from("appointments")
      .update(form)
      .eq("id", editData.id);

    if (!error) {
      setShowEdit(false);
      setEditData(null);
      fetchDashboardData();
    } else {
      setEditErrorMessage("Update failed: " + error.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Receptionist Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card blue">
          <h3>Today's Appointments</h3>
          <p>{todayAppointments.length}</p>
        </div>
        <div className="stat-card green">
          <h3>New Patients (24h)</h3>
          <p>{newPatients}</p>
        </div>
        <div className="stat-card purple">
          <h3>Recent Appointments</h3>
          <p>{recentAppointments.length}</p>
        </div>
      </div>

      {/* Add Appointment Button */}
      <button className="add-btn" onClick={() => setShowAdd(true)}>
        + Add Appointment
      </button>

      {/* Recent Appointments Table */}
      <h2 className="section-title">Recent Appointments</h2>
      <div className="table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-appointments">
                  No appointments yet
                </td>
              </tr>
            ) : (
              recentAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.full_name}</td>
                  <td>{apt.doctor}</td>
                  <td>{apt.date}</td>
                  <td>{apt.time}</td>
                  <td>
                    <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditData(apt);
                        setForm(apt);
                        setShowEdit(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- ADD APPOINTMENT MODAL ---------------- */}
      {showAdd && (
        <div className="modal">
          <div className="modal-card large">
            <h3>Add New Appointment</h3>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <label>Patient Name</label>
            <input
              type="text"
              value={addForm.full_name}
              onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
            />

            <label>Phone</label>
            <input
              type="text"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            />

            <label>Email</label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            />

            <label>Doctor</label>
            <select
              value={addForm.doctor_id}
              onChange={(e) => {
                const doc = doctorList.find((d) => String(d.id) === String(e.target.value));
                setAddForm({
                  ...addForm,
                  doctor_id: e.target.value,
                  doctor: doc?.full_name || "",
                  specialty: doc?.specialty || "",
                });
              }}
            >
              <option value="">Select doctor</option>
              {doctorList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.specialty}
                </option>
              ))}
            </select>

            <label>Specialty</label>
            <input
              type="text"
              value={addForm.specialty}
              onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
            />

            <label>Date</label>
            <input
              type="date"
              value={addForm.date}
              onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
            />

            <label>Time</label>
            <input
              type="time"
              value={addForm.time}
              onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}
            />

            <label>Notes</label>
            <textarea
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
            />

            <label>Status</label>
            <select
              value={addForm.status}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="modal-actions">
              <button className="modal-btn save" onClick={handleAddAppointment}>
                Save Appointment
              </button>
              <button className="modal-btn close" onClick={() => setShowAdd(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT APPOINTMENT MODAL ---------------- */}
      {showEdit && editData && (
        <div className="modal">
          <div className="modal-card large">
            <h3>Edit Appointment</h3>

            {editErrorMessage && <div className="error-box">{editErrorMessage}</div>}

            <label>Patient Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />

            <label>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <label>Doctor</label>
            <select
              value={form.doctor_id || ""}
              onChange={(e) => {
                const doc = doctorList.find((d) => String(d.id) === String(e.target.value));
                setForm({
                  ...form,
                  doctor_id: e.target.value,
                  doctor: doc?.full_name || "",
                  specialty: doc?.specialty || "",
                });
              }}
            >
              <option value="">Select doctor</option>
              {doctorList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.specialty}
                </option>
              ))}
            </select>

            <label>Specialty</label>
            <input
              type="text"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />

            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <label>Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />

            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="modal-actions">
              <button className="modal-btn save" onClick={handleUpdateAppointment}>
                Update
              </button>
              <button
                className="modal-btn close"
                onClick={() => {
                  setShowEdit(false);
                  setEditData(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
