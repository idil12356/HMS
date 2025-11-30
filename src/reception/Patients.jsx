import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Patient.css";
import bgImg from "../assets/patian4.jpg";

export default function PatientsPage() {
  const [page, setPage] = useState("list");
  const [patients, setPatients] = useState([]);
  const [editPatient, setEditPatient] = useState(null);
  const [rowStatus, setRowStatus] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, patientId: null });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  



  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  });

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

 

// Validation function
const validateForm = () => {
  const newErrors = {};

  // Kaliya kuwa kale samee validation, username & password ha dhaafin
  if (!form.full_name.trim()) newErrors.full_name = "Full Name is required";
  if (!form.age.toString().trim()) newErrors.age = "Age is required";
  if (!form.gender.trim()) newErrors.gender = "Gender is required";
  if (!form.phone.trim()) newErrors.phone = "Phone is required";
  if (!form.email.trim()) newErrors.email = "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email && !emailRegex.test(form.email)) {
    newErrors.email = "Email-ka waa inuu noqdaa mid sax ah";
  }


  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  const verifyEmailExists = async (email) => {
  const res = await fetch(`https://api.mailboxlayer.com/check?access_key=YOUR_KEY&email=${email}`);
  const data = await res.json();
  return data.format_valid && data.smtp_check;
};


  

// On Save/Register button click
const handleSave = async () => {
  if (!validateForm()) return;

  const isReal = await verifyEmailExists(form.email);
  if (!isReal) return showToast("The email must be valid", "error");

  // Haddii email sax yahay, sii register/update
  page === "register" ? registerPatient() : updatePatient();

  if (page === "register") {
    await registerPatient();
  } else if (page === "edit") {
    await updatePatient();
  }
};

  


  // Fetch patients
  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setPatients(data || []);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Register patient
  const registerPatient = async () => {
    if (!form.full_name || !form.phone) return showToast("Fill all fields", "error");
    const { error } = await supabase.from("patients").insert([form]);
    if (error) showToast(error.message, "error");
    else {
      showToast("Patient Registered Successfully", "success");
      setForm({ full_name: "", age: "", gender: "", phone: "", email: "", username: "", password: "" });
      setPage("list");
      fetchPatients();
    }
  };

  // Update patient
  const updatePatient = async () => {
    if (!form.full_name || !form.phone) return showToast("Fill all fields", "error");
    const { error } = await supabase
      .from("patients")
      .update(form)
      .eq("id", editPatient.id);
    if (error) showToast(error.message, "error");
    else {
      setRowStatus(prev => ({ ...prev, [editPatient.id]: "Updated" }));
      showToast("Patient Updated Successfully", "success");
      setForm({ full_name: "", age: "", gender: "", phone: "", email: "", username: "", password: "" });
      setEditPatient(null);
      setPage("list");
      fetchPatients();
    }
  };
  

  // Delete patient
  const handleDeleteClick = (id) => setConfirmModal({ open: true, patientId: id });
  const confirmDeletePatient = async () => {
    const id = confirmModal.patientId;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) showToast(error.message, "error");
    else {
      setRowStatus(prev => ({ ...prev, [id]: "Deleted" }));
      showToast("Patient Deleted Successfully", "success");
      fetchPatients();
    }
    setConfirmModal({ open: false, patientId: null });
  };
  const cancelDelete = () => setConfirmModal({ open: false, patientId: null });

  return (
    <div className="book-appointment-page" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="patients-wrapper">
        <h1>Patients Management</h1>

        {/* Toast */}
        {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

        {/* Top Buttons */}
{/* Top Buttons */}
<div className="top-buttons">
 <button onClick={() => setShowForm(!showForm)}>
  {showForm ? "Hide Registration Form" : "Register Patient"}
</button>
</div>


        {showForm && (
          <>
            <div className="overlayy" onClick={() => setShowForm(false)}></div>
  <div className="form-card">
    <h2>{editPatient ? "Edit Patient Info" : "Register New Patient"}</h2>

    <input type="text" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
    {errors.full_name && <p className="error-text">{errors.full_name}</p>}

    <input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
    {errors.age && <p className="error-text">{errors.age}</p>}

    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
      <option value="">Gender</option>
      <option>Male</option>
      <option>Female</option>
    </select>
    {errors.gender && <p className="error-text">{errors.gender}</p>}

    <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
    {errors.phone && <p className="error-text">{errors.phone}</p>}

    <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    {errors.email && <p className="error-text">{errors.email}</p>}

    <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
    {errors.username && <p className="error-text">{errors.username}</p>}

    <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
    {errors.password && <p className="error-text">{errors.password}</p>}

    <div className="form-buttons">
      <button onClick={handleSave}>{editPatient ? "Update" : "Save"}</button>
      <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
    </div>
            </div>
            </>
)}


        {/* Patients Table */}
        {page === "list" && (
          <div className="patients-table-wrapper">
            {patients.length === 0 ? <p>No patients found</p> : (
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td>{p.full_name}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                      <td>{p.phone}</td>
                      <td>{p.email}</td>
                      <td>{p.username}</td>
                      <td>{p.password}</td>
                      <td className="action-buttons">
                        <button
                          className={rowStatus[p.id] === "Updated" ? "updated" : ""}
                          onClick={() => { if (!rowStatus[p.id]) { setEditPatient(p); setForm(p); setPage("edit"); } }}
                          disabled={rowStatus[p.id] === "Updated"}
                        >
                          {rowStatus[p.id] === "Updated" ? "Updated" : "Edit"}
                        </button>
                        <button
                          className={`delete-btn ${rowStatus[p.id] === "Deleted" ? "deleted" : ""}`}
                          onClick={() => handleDeleteClick(p.id)}
                          disabled={rowStatus[p.id] === "Deleted"}
                        >
                          {rowStatus[p.id] === "Deleted" ? "Deleted" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmModal.open && (
          <div className="modal-overlay">
            <div className="modal-card">
              <p>Are you sure you want to delete this patient?</p>
              <div className="modal-buttons">
                <button className="confirm-btn" onClick={confirmDeletePatient}>Yes, Delete</button>
                <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
