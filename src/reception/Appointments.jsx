// src/admin/Appointments.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Appointments.css";
import bgImg from "../assets/apointmen.jpg";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({});



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

  const [addForm, setAddForm] = useState({
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

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  // Fetch doctors
  const fetchDoctors = async () => {
    const { data } = await supabase
      .from("doctors")
      .select("id, full_name, specialty, photo")
      .order("full_name", { ascending: true });

    setDoctors(data || []);
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    const { data } = await supabase
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

    setAppointments(data || []);
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  // VIEW
  const handleView = (apt) => {
    setSelected(apt);
    setShowView(true);
  };

  // OPEN EDIT
  const handleOpenEdit = (apt) => {
    setSelected(apt);
    setForm({
      full_name: apt.full_name,
      phone: apt.phone,
      email: apt.email,
      doctor_id: apt.doctor_id,
      doctor: apt.doctor || apt?.doctor_info?.[0]?.full_name || "",
      specialty: apt.specialty,
      date: apt.date,
      time: apt.time,
      notes: apt.notes,
      status: apt.status,
    });
    setShowEdit(true);
  };

  // ADD NEW APPOINTMENT
const handleAddAppointment = async () => {
  if (adding) return;

  let newErrors = {};

  // VALIDATION
  if (!addForm.full_name.trim()) newErrors.full_name = "Full name is required.";
  if (!addForm.phone.trim()) newErrors.phone = "Phone number is required.";
  if (!addForm.email.trim()) newErrors.email = "Email is required.";
  if (!addForm.date.trim()) newErrors.date = "Date is required.";
  if (!addForm.time.trim()) newErrors.time = "Time is required.";

  // Haddii uu jiro wax error ah → ha shaqeyn
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Haddii ok → clear errors
  setErrors({});

  setAdding(true);

  let doctorName = "";
  if (addForm.doctor_id) {
    const doc = doctors.find((d) => String(d.id) === String(addForm.doctor_id));
    doctorName = doc ? doc.full_name : "";
  }

  const payload = { ...addForm, doctor: doctorName };

  const { error } = await supabase.from("appointments").insert([payload]);

  setAdding(false);

  if (error) {
    console.error("Failed to save:", error.message);
    return;
  }

  // Success
  setShowAdd(false);
  setAddForm({
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

  fetchAppointments();
};





  // SAVE EDIT
  const handleSaveEdit = async () => {
    if (!selected) return;

    let docName = form.doctor;
    if (form.doctor_id) {
      const doc = doctors.find((d) => String(d.id) === String(form.doctor_id));
      docName = doc?.full_name || "";
    }

    await supabase
      .from("appointments")
      .update({ ...form, doctor: docName })
      .eq("id", selected.id);

    setShowEdit(false);
    setSelected(null);
    fetchAppointments();
  };

  // ASSIGN DOCTOR
  const handleAssignDoctor = async (apt, doctorId) => {
    const doc = doctors.find((d) => String(d.id) === String(doctorId));
    const doctorName = doc ? doc.full_name : "";

    await supabase
      .from("appointments")
      .update({ doctor_id: doctorId, doctor: doctorName })
      .eq("id", apt.id);

    fetchAppointments();
  };

  // CHANGE STATUS
  const handleChangeStatus = async (apt, status) => {
    await supabase.from("appointments").update({ status }).eq("id", apt.id);
    fetchAppointments();
  };

  // DELETE APPOINTMENT
  const confirmDeleteAppointment = async () => {
    if (!confirmModal.id) return;

    await supabase.from("appointments").delete().eq("id", confirmModal.id);
    setConfirmModal({ open: false, id: null });
    fetchAppointments();
  };

  return (
    <div
      className="appointments-page"
      style={{
        backgroundImage: `url(${bgImg})`,
      }}
    >
      <div className="appointments-wrapper">

        {/* HEADER */}
        <div className="appointments-header">
          <h1 className="appointments-title">Appointments</h1>
          <button className="btn-add" onClick={() => setShowAdd(true)}>
            + Add Appointment
          </button>
        </div>
        

        {/* TABLE */}
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
                const doctorObj = a.doctor_info?.[0] || a.doctor_info;
                const doctorName = doctorObj?.full_name || a.doctor || "-";

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
                        <div className="doctor-thumb">
                          {String(doctorName).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="doctor-name">{doctorName}</div>
                      </div>
                    </td>

                    <td>{a.specialty}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>

                    <td>
                      <span className={`status-badge ${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>

                    <td>
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString()
                        : "-"}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-view" onClick={() => handleView(a)}>View</button>
                        <button className="btn btn-edit" onClick={() => handleOpenEdit(a)}>Edit</button>

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

                        <button
                          className="btn btn-delete"
                          onClick={() => setConfirmModal({ open: true, id: a.id })}
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

        {/* ======================= MODALS BELOW ======================= */}

        {/* ADD MODAL */}
{showAdd && (
  <div className="modal">
    <div className="modal-card large">
      <h3>Add New Appointment</h3>

      {/* Full Name */}
      <label>Patient Name</label>
      <input
        type="text"
        value={addForm.full_name}
        onChange={(e) =>
          setAddForm({ ...addForm, full_name: e.target.value })
        }
      />
      {errors.full_name && <p className="error-text">{errors.full_name}</p>}

      {/* Phone */}
      <label>Phone</label>
      <input
        type="text"
        value={addForm.phone}
        onChange={(e) =>
          setAddForm({ ...addForm, phone: e.target.value })
        }
      />
      {errors.phone && <p className="error-text">{errors.phone}</p>}

      {/* Email */}
      <label>Email</label>
      <input
        type="email"
        value={addForm.email}
        onChange={(e) =>
          setAddForm({ ...addForm, email: e.target.value })
        }
      />
      {errors.email && <p className="error-text">{errors.email}</p>}

      {/* Doctor */}
      <label>Doctor</label>
      <select
        value={addForm.doctor_id}
        onChange={(e) => {
          const doc = doctors.find(
            (d) => String(d.id) === String(e.target.value)
          );
          setAddForm({
            ...addForm,
            doctor_id: e.target.value,
            doctor: doc?.full_name || "",
            specialty: doc?.specialty || "",
          });
        }}
      >
        <option value="">Select doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.full_name} — {d.specialty}
          </option>
        ))}
      </select>
      {errors.doctor_id && <p className="error-text">{errors.doctor_id}</p>}

      {/* Specialty */}
      <label>Specialty</label>
      <input
        type="text"
        value={addForm.specialty}
        onChange={(e) =>
          setAddForm({ ...addForm, specialty: e.target.value })
        }
      />
      {errors.specialty && <p className="error-text">{errors.specialty}</p>}

      {/* Date */}
      <label>Date</label>
      <input
        type="date"
        value={addForm.date}
        onChange={(e) =>
          setAddForm({ ...addForm, date: e.target.value })
        }
      />
      {errors.date && <p className="error-text">{errors.date}</p>}

      {/* Time */}
      <label>Time</label>
      <input
        type="time"
        value={addForm.time}
        onChange={(e) =>
          setAddForm({ ...addForm, time: e.target.value })
        }
      />
      {errors.time && <p className="error-text">{errors.time}</p>}

      {/* Notes */}
      <label>Notes</label>
      <textarea
        value={addForm.notes}
        onChange={(e) =>
          setAddForm({ ...addForm, notes: e.target.value })
        }
      />
      {errors.notes && <p className="error-text">{errors.notes}</p>}

      {/* Status */}
      <label>Status</label>
      <select
        value={addForm.status}
        onChange={(e) =>
          setAddForm({ ...addForm, status: e.target.value })
        }
      >
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Buttons */}
      <div className="modal-actions">
        <button
          className="modal-btn save"
          onClick={handleAddAppointment}
          disabled={adding}
        >
          {adding ? "Saving..." : "Add Appointment"}
        </button>

        <button
          className="modal-btn close"
          onClick={() => setShowAdd(false)}
        >
          Close
        </button>
      </div>
    </div>
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
                  <div>
                    {selected.doctor || selected.doctor_info?.[0]?.full_name}
                  </div>
                  <div>{selected.specialty}</div>
                </div>

                <div>
                  <strong>Date & Time</strong>
                  <div>
                    {selected.date} — {selected.time}
                  </div>
                </div>

                <div>
                  <strong>Notes</strong>
                  <div>{selected.notes || "-"}</div>
                </div>

                <div>
                  <strong>Status</strong>
                  <div>{selected.status}</div>
                </div>

                <div>
                  <strong>Created</strong>
                  <div>
                    {selected.created_at
                      ? new Date(selected.created_at).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="modal-btn close"
                  onClick={() => {
                    setShowView(false);
                    setSelected(null);
                  }}
                >
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
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />

              <label>Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <label>Doctor</label>
              <select
                value={form.doctor_id || ""}
                onChange={(e) => {
                  const doc = doctors.find(
                    (d) => String(d.id) === String(e.target.value)
                  );
                  setForm({
                    ...form,
                    doctor_id: e.target.value,
                    doctor: doc ? doc.full_name : "",
                  });
                }}
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} — {d.specialty}
                  </option>
                ))}
              </select>

              <label>Specialty</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
              />

              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <label>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
              />

              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />

              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="modal-actions">
                <button className="modal-btn save" onClick={handleSaveEdit}>
                  Save changes
                </button>
                <button
                  className="modal-btn close"
                  onClick={() => {
                    setShowEdit(false);
                    setSelected(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {confirmModal.open && (
          <div className="modal">
            <div className="modal-card">
              <p>Are you sure you want to delete this appointment?</p>

              <div className="modal-actions">
                <button
                  className="modal-btn save"
                  onClick={confirmDeleteAppointment}
                >
                  Yes, Delete
                </button>
                <button
                  className="modal-btn close"
                  onClick={() =>
                    setConfirmModal({ open: false, id: null })
                  }
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
