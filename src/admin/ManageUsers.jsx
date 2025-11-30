// src/admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./ManageUsers.css";
import bgImg from "../assets/user.jpg";

export default function ManageUsers() {
  const [tab, setTab] = useState("patients");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rowStatus, setRowStatus] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, userId: null, type: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch data
  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
    setPatients(data || []);
  };
  const fetchDoctors = async () => {
    const { data } = await supabase.from("doctors").select("*").order("created_at", { ascending: false });
    setDoctors(data || []);
  };
  useEffect(() => { fetchPatients(); fetchDoctors(); }, []);

  // Validation helper
  const isPatientFormValid = () => {
    const required = ["username", "full_name", "email", "password"];
    return required.every(field => form[field] && form[field].toString().trim() !== "");
  };
  const isDoctorFormValid = () => {
    const required = ["full_name", "email", "password", "specialty"];
    return required.every(field => form[field] && form[field].toString().trim() !== "");
  };

  // PATIENT CRUD
  const savePatient = async () => {
    if (!isPatientFormValid()) { setErrorMessage("Please fill in all required fields."); return; }
    await supabase.from("patients").insert([form]);
    setShowModal(false); setErrorMessage(""); fetchPatients();
  };
  const updatePatient = async () => {
    if (!isPatientFormValid()) { setErrorMessage("Please fill in all required fields."); return; }
    await supabase.from("patients").update(form).eq("id", selectedPatient.id);
    setShowModal(false); setErrorMessage(""); fetchPatients();
  };
  const handleDeletePatientClick = (id) => { setConfirmModal({ open: true, userId: id, type: "patient" }); };
  const confirmDeletePatient = async () => {
    const id = confirmModal.userId;
    await supabase.from("patients").delete().eq("id", id);
    setRowStatus(prev => ({ ...prev, [id]: "Deleted" }));
    fetchPatients(); setConfirmModal({ open: false, userId: null, type: "" });
  };

  // DOCTOR CRUD
  const saveDoctor = async () => {
    if (!isDoctorFormValid()) { setErrorMessage("Please fill in all required fields."); return; }
    await supabase.from("doctors").insert([form]);
    setShowModal(false); setErrorMessage(""); fetchDoctors();
  };
  const updateDoctor = async () => {
    if (!isDoctorFormValid()) { setErrorMessage("Please fill in all required fields."); return; }
    await supabase.from("doctors").update(form).eq("id", selectedDoctor.id);
    setShowModal(false); setErrorMessage(""); fetchDoctors();
  };
  const handleDeleteDoctorClick = (id) => { setConfirmModal({ open: true, userId: id, type: "doctor" }); };
  const confirmDeleteDoctor = async () => {
    const id = confirmModal.userId;
    await supabase.from("doctors").delete().eq("id", id);
    setRowStatus(prev => ({ ...prev, [id]: "Deleted" }));
    fetchDoctors(); setConfirmModal({ open: false, userId: null, type: "" });
  };
  const cancelDelete = () => { setConfirmModal({ open: false, userId: null, type: "" }); };

  // MODAL FORM COMPONENTS
  const PatientForm = () => (
    <>
      {["username", "full_name", "email", "password", "age", "gender", "phone"].map(field => (
        <div className="form-group" key={field}>
          <label>{field.replace("_", " ").toUpperCase()}</label>
          <input
            disabled={modalType === "viewPatient"}
            type={field === "age" ? "number" : "text"}
            value={form[field] || ""}
            onChange={e => setForm({ ...form, [field]: field === "age" ? Number(e.target.value) : e.target.value })}
          />
        </div>
      ))}
    </>
  );
  const DoctorForm = () => (
    <>
      {["full_name", "email", "password", "specialty", "experience", "availability", "times", "bio", "photo", "rating"].map(field => (
        <div className="form-group" key={field}>
          <label>{field.replace("_", " ").toUpperCase()}</label>
          <input
            disabled={modalType === "viewDoctor"}
            type={field === "experience" || field === "rating" ? "number" : "text"}
            step={field === "rating" ? "0.1" : undefined}
            value={form[field] || ""}
            onChange={e => setForm({
              ...form,
              [field]: field === "experience" || field === "rating" ? Number(e.target.value) : e.target.value
            })}
          />
        </div>
      ))}
    </>
  );

  return (
    <div className="book-appointment-page" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="manage-wrapper">
        <h1 className="manage-title">Manage Users</h1>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${tab === "patients" ? "active" : ""}`} onClick={() => setTab("patients")}>Patients</button>
          <button className={`tab ${tab === "doctors" ? "active" : ""}`} onClick={() => setTab("doctors")}>Doctors</button>
        </div>

        {/* PATIENTS TABLE */}
        {tab === "patients" && (
          <div className="panel">
            <div className="panel-header">
              <h2>Patients</h2>
              <button className="action add" onClick={() => { setForm({ username: "", full_name: "", email: "", password: "", age: "", gender: "", phone: "" }); setModalType("addPatient"); setErrorMessage(""); setShowModal(true); }}>+ Add Patient</button>
            </div>
            <div className="table-wrap">
              <table className="mg-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.full_name}</td>
                      <td>{p.email}</td>
                      <td>{p.password}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                      <td>{p.phone}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="action-buttons">
                        <button className="btn btn-view" onClick={() => { setForm(p); setModalType("viewPatient"); setShowModal(true); }}>View</button>
                        <button className="btn btn-edit" onClick={() => { setForm(p); setSelectedPatient(p); setModalType("editPatient"); setShowModal(true); }}>Edit</button>
                        <button className={`btn btn-delete ${rowStatus[p.id] === "Deleted" ? "deleted" : ""}`} onClick={() => handleDeletePatientClick(p.id)} disabled={rowStatus[p.id] === "Deleted"}>{rowStatus[p.id] === "Deleted" ? "Deleted" : "Delete"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCTORS TABLE */}
        {tab === "doctors" && (
          <div className="panel">
            <div className="panel-header">
              <h2>Doctors</h2>
              <button className="action add" onClick={() => { setForm({ full_name: "", email: "", password: "", specialty: "", experience: 0, availability: "", times: "", bio: "", photo: "", rating: null }); setModalType("addDoctor"); setErrorMessage(""); setShowModal(true); }}>+ Add Doctor</button>
            </div>
            <div className="table-wrap">
              <table className="mg-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialty</th>
                    <th>Experience</th>
                    <th>Availability</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d.id}>
                      <td>{d.photo ? <img src={d.photo} className="thumb" /> : <div className="thumb placeholder">{d.full_name?.slice(0, 2).toUpperCase()}</div>}</td>
                      <td>{d.full_name}</td>
                      <td>{d.email}</td>
                      <td>{d.specialty || "-"}</td>
                      <td>{d.experience}</td>
                      <td>{d.availability || "-"}</td>
                      <td className="action-buttons">
                        <button className="btn btn-view" onClick={() => { setForm(d); setModalType("viewDoctor"); setShowModal(true); }}>View</button>
                        <button className="btn btn-edit" onClick={() => { setForm(d); setSelectedDoctor(d); setModalType("editDoctor"); setShowModal(true); }}>Edit</button>
                        <button className={`btn btn-delete ${rowStatus[d.id] === "Deleted" ? "deleted" : ""}`} onClick={() => handleDeleteDoctorClick(d.id)} disabled={rowStatus[d.id] === "Deleted"}>{rowStatus[d.id] === "Deleted" ? "Deleted" : "Delete"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="modal">
            <div className="modal-card">
              <h3>
                {modalType === "addPatient" && "Add Patient"}
                {modalType === "editPatient" && "Edit Patient"}
                {modalType === "viewPatient" && "Patient Information"}
                {modalType === "addDoctor" && "Add Doctor"}
                {modalType === "editDoctor" && "Edit Doctor"}
                {modalType === "viewDoctor" && "Doctor Information"}
              </h3>
              {errorMessage && <div className="error-box">{errorMessage}</div>}
              {modalType.includes("Patient") && <PatientForm />}
              {modalType.includes("Doctor") && <DoctorForm />}
              <div className="modal-actions">
                <button className="modal-btn close" onClick={() => setShowModal(false)}>Close</button>
                {modalType === "addPatient" && <button className="modal-btn save" onClick={savePatient}>Save</button>}
                {modalType === "editPatient" && <button className="modal-btn save" onClick={updatePatient}>Update</button>}
                {modalType === "addDoctor" && <button className="modal-btn save" onClick={saveDoctor}>Save</button>}
                {modalType === "editDoctor" && <button className="modal-btn save" onClick={updateDoctor}>Update</button>}
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {confirmModal.open && (
          <div className="modal-overlay">
            <div className="modal-card">
              <p>Are you sure you want to delete this {confirmModal.type}?</p>
              <div className="modal-buttons">
                <button className="confirm-btn" onClick={confirmModal.type === "doctor" ? confirmDeleteDoctor : confirmDeletePatient}>Yes, Delete</button>
                <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
