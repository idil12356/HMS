import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Appointments.css";
import bgImg from "../assets/apointmen.jpg";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // modal state
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // NEW: delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // selected item
  const [selected, setSelected] = useState(null);

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

  // Fetch doctors
  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("id, full_name, specialty, photo")
      .order("full_name", { ascending: true });
    if (error) {
      console.error("fetchDoctors:", error);
      return;
    }
    setDoctors(data || []);
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        full_name,
        phone,
        email,
        doctor,
        doctor_id,
        specialty,
        date,
        time,
        notes,
        status,
        created_at,
        doctor_info:doctor_id ( id, full_name, specialty, photo )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchAppointments:", error);
      return;
    }
    setAppointments(data || []);
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const handleView = (apt) => {
    setSelected(apt);
    setShowView(true);
  };

  const handleOpenEdit = (apt) => {
    setSelected(apt);
    setForm({
      full_name: apt.full_name || "",
      phone: apt.phone || "",
      email: apt.email || "",
      doctor_id: apt.doctor_id || "",
      doctor: apt.doctor || apt.doctor_info?.[0]?.full_name || "",
      specialty: apt.specialty || "",
      date: apt.date || "",
      time: apt.time || "",
      notes: apt.notes || "",
      status: apt.status || "Pending",
    });
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    let doctorName = form.doctor;
    if (form.doctor_id) {
      const doc = doctors.find((d) => d.id === form.doctor_id);
      if (doc) doctorName = doc.full_name;
    }

    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      doctor: doctorName,
      doctor_id: form.doctor_id || null,
      specialty: form.specialty,
      date: form.date,
      time: form.time,
      notes: form.notes,
      status: form.status,
    };

    const { error } = await supabase
      .from("appointments")
      .update(payload)
      .eq("id", selected.id);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    setShowEdit(false);
    setSelected(null);
    fetchAppointments();
  };

  const handleChangeStatus = async (appointment, newStatus) => {
    await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointment.id);

    fetchAppointments();
  };

  const handleAssignDoctor = async (appointment, doctorId) => {
    const doc = doctors.find((d) => d.id === doctorId);
    const payload = {
      doctor_id: doctorId,
      doctor: doc ? doc.full_name : null,
    };

    await supabase
      .from("appointments")
      .update(payload)
      .eq("id", appointment.id);

    fetchAppointments();
  };

  return (
    <div className="book-appointment-page" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="appointments-wrapper">
        <h1 className="appointments-title">Appointments</h1>

        {appointments.length === 0 ? (
          <p className="muted">No appointments found.</p>
        ) : (
          <div className="table-wrap">
            <table className="apt-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((a) => {
                  const doc = a.doctor_info?.[0] || a.doctor_info || null;
                  const doctorName = doc?.full_name || a.doctor || "-";
                  const doctorPhoto = doc?.photo || null;
                  const status = (a.status || "Pending").toLowerCase();

                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="patient-cell">
                          <div className="patient-name">{a.full_name}</div>
                          <div className="patient-phone">{a.phone}</div>
                        </div>
                      </td>

                      <td>
                        <div className="doctor-cell">
                          {doctorPhoto ? (
                            <img src={doctorPhoto} alt="" className="doctor-thumb" />
                          ) : (
                            <div className="doctor-thumb placeholder">
                              {doctorName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="doctor-name">{doctorName}</div>
                        </div>
                      </td>

                      <td>{a.specialty}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>

                      <td>
                        <span className={`status-badge ${status}`}>
                          {a.status}
                        </span>
                      </td>

                      <td>{new Date(a.created_at).toLocaleString()}</td>

                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-view" onClick={() => handleView(a)}>
                            View
                          </button>

                          <button className="btn btn-edit" onClick={() => handleOpenEdit(a)}>
                            Edit
                          </button>

                          <select
                            value={a.doctor_id || ""}
                            onChange={(e) => handleAssignDoctor(a, e.target.value)}
                            className="doctor-select"
                          >
                            <option value="">Assign doctor</option>
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.full_name} — {d.specialty}
                              </option>
                            ))}
                          </select>

                          <select
                            value={a.status}
                            onChange={(e) => handleChangeStatus(a, e.target.value)}
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                          </select>

                          {/* NEW Delete Modal Trigger */}
                          <button
                            className="btn btn-delete"
                            onClick={() => {
                              setDeleteId(a.id);
                              setShowDelete(true);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW MODAL */}
        {showView && selected && (
          <div className="modal">
            <div className="modal-card">
              <h3>Appointment Details</h3>

              <div className="view-grid">
                <div>
                  <strong>Patient</strong>
                  <div>{selected.full_name}</div>
                  <div>{selected.phone}</div>
                  <div>{selected.email}</div>
                </div>

                <div>
                  <strong>Doctor</strong>
                  <div>{selected.doctor || selected.doctor_info?.[0]?.full_name}</div>
                  <div>{selected.specialty}</div>
                </div>

                <div>
                  <strong>Date & Time</strong>
                  <div>{selected.date} — {selected.time}</div>
                </div>

                <div>
                  <strong>Notes</strong>
                  <div className="notes">{selected.notes || "-"}</div>
                </div>

                <div>
                  <strong>Status</strong>
                  <div>{selected.status}</div>
                </div>

                <div>
                  <strong>Created</strong>
                  <div>{new Date(selected.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="modal-btn close" onClick={() => { setShowView(false); setSelected(null); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEdit && (
          <div className="modal">
            <div className="modal-card large">
              <h3>Edit Appointment</h3>

              <label>Patient Full name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />

              <label>Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

              <label>Doctor</label>
              <select value={form.doctor_id || ""} onChange={(e) => {
                const doc = doctors.find(d => d.id === e.target.value);
                setForm({ ...form, doctor_id: e.target.value, doctor: doc ? doc.full_name : "" });
              }}>
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} — {d.specialty}
                  </option>
                ))}
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
                <button className="modal-btn save" onClick={handleSaveEdit}>Save changes</button>
                <button className="modal-btn close" onClick={() => { setShowEdit(false); setSelected(null); }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 DELETE CONFIRMATION MODAL 🔥 */}
        {showDelete && (
          <div className="modal">
            <div className="modal-card small center">
              <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                Confirm Delete?
              </h3>

              <p style={{ textAlign: "center", color: "#444", marginBottom: "20px" }}>
                Are you sure you want to delete this appointment?
              </p>

              <div className="modal-actions" style={{ justifyContent: "center" }}>
                <button
                  className="modal-btn save"
                  style={{ background: "#d9534f" }}
                  onClick={async () => {
                    const { error } = await supabase
                      .from("appointments")
                      .delete()
                      .eq("id", deleteId);

                    if (error) alert("Delete failed: " + error.message);

                    setShowDelete(false);
                    setDeleteId(null);
                    fetchAppointments();
                  }}
                >
                  Yes, Delete
                </button>

                <button
                  className="modal-btn close"
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
