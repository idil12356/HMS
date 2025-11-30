// src/admin/DoctorsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./Doctors.css";
import bgImg from "../assets/doctors.jpg";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rowStatus, setRowStatus] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, userId: null });
  const [errorFields, setErrorFields] = useState([]);
  const firstInputRef = useRef(null);

  // Fetch doctors
  const fetchDoctors = async () => {
    const { data } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    setDoctors(data || []);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Validation
  const validateForm = () => {
    const requiredFields = ["full_name", "email", "password"];
    const emptyFields = requiredFields.filter((f) => !form[f]?.trim());
    setErrorFields(emptyFields);

    if (emptyFields.length && firstInputRef.current) {
      firstInputRef.current.focus();
    }
    return emptyFields.length === 0;
  };

  // Save doctor
  const saveDoctor = async () => {
    if (!validateForm()) return;

    const { error } = await supabase.from("doctors").insert([form]);
    if (error) {
      setErrorFields(["full_name", "email", "password"]);
      return;
    }

    setShowModal(false);
    setForm({});
    setErrorFields([]);
    fetchDoctors();
  };

  // Update doctor
  const updateDoctor = async () => {
    if (!validateForm()) return;

    const { error } = await supabase
      .from("doctors")
      .update(form)
      .eq("id", selectedDoctor.id);

    if (error) {
      setErrorFields(["full_name", "email", "password"]);
      return;
    }

    setShowModal(false);
    setForm({});
    setErrorFields([]);
    fetchDoctors();
  };

  // Delete doctor
  const handleDeleteDoctorClick = (id) =>
    setConfirmModal({ open: true, userId: id });

  const confirmDeleteDoctor = async () => {
    const id = confirmModal.userId;

    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) return;

    setRowStatus((prev) => ({ ...prev, [id]: "Deleted" }));
    fetchDoctors();
    setConfirmModal({ open: false, userId: null });
  };

  const cancelDelete = () =>
    setConfirmModal({ open: false, userId: null });

  // Doctor form component
  const DoctorForm = () => (
    <>
      {[
        "full_name",
        "email",
        "password",
        "specialty",
        "experience",
        "availability",
        "times",
        "bio",
        "photo",
        "rating",
      ].map((field, idx) => (
        <div className="form-group" key={field}>
          <label>{field.replace("_", " ").toUpperCase()}</label>
          <input
            type={
              field === "experience" || field === "rating"
                ? "number"
                : "text"
            }
            step={field === "rating" ? "0.1" : undefined}
            value={form[field] || ""}
            onChange={(e) =>
              setForm({
                ...form,
                [field]:
                  field === "experience" || field === "rating"
                    ? Number(e.target.value)
                    : e.target.value,
              })
            }
            disabled={modalType === "viewDoctor"}
            className={errorFields.includes(field) ? "input-error" : ""}
            ref={idx === 0 ? firstInputRef : null}
          />
        </div>
      ))}

      {(modalType === "addDoctor" || modalType === "editDoctor") &&
        errorFields.length > 0 && (
          <div className="form-error-message">
            Please fill required fields:{" "}
            {errorFields.join(", ").replace(/_/g, " ")}
          </div>
        )}
    </>
  );

  return (
    <div
      className="book-appointment-page"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="manage-wrapper">
        <h1 className="manage-title">Manage Doctors</h1>

        <div className="panel">
          <div className="panel-header">
            <h2>Doctors</h2>
            <button
              className="action add"
              onClick={() => {
                setForm({
                  full_name: "",
                  email: "",
                  password: "",
                  specialty: "",
                  experience: 0,
                  availability: "",
                  times: "",
                  bio: "",
                  photo: "",
                  rating: null,
                });
                setModalType("addDoctor");
                setShowModal(true);
                setErrorFields([]);
              }}
            >
              + Add Doctor
            </button>
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
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>
                      {d.photo ? (
                        <img src={d.photo} className="thumb" />
                      ) : (
                        <div className="thumb placeholder">
                          {d.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>

                    <td>{d.full_name}</td>
                    <td>{d.email}</td>
                    <td>{d.specialty || "-"}</td>
                    <td>{d.experience}</td>
                    <td>{d.availability || "-"}</td>

                    <td className="action-buttons">
                      <button
                        className="btn btn-view"
                        onClick={() => {
                          setForm(d);
                          setModalType("viewDoctor");
                          setShowModal(true);
                          setErrorFields([]);
                        }}
                      >
                        View
                      </button>

                      <button
                        className="btn btn-edit"
                        onClick={() => {
                          setForm(d);
                          setSelectedDoctor(d);
                          setModalType("editDoctor");
                          setShowModal(true);
                          setErrorFields([]);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className={`btn btn-delete ${
                          rowStatus[d.id] === "Deleted" ? "deleted" : ""
                        }`}
                        onClick={() => handleDeleteDoctorClick(d.id)}
                        disabled={rowStatus[d.id] === "Deleted"}
                      >
                        {rowStatus[d.id] === "Deleted"
                          ? "Deleted"
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal">
            <div className="modal-card">
              <h3>
                {modalType === "addDoctor"
                  ? "Add Doctor"
                  : modalType === "editDoctor"
                  ? "Edit Doctor"
                  : "Doctor Information"}
              </h3>

              <DoctorForm />

              <div className="modal-actions">
                <button
                  className="modal-btn close"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>

                {modalType === "addDoctor" && (
                  <button className="modal-btn save" onClick={saveDoctor}>
                    Save
                  </button>
                )}

                {modalType === "editDoctor" && (
                  <button className="modal-btn save" onClick={updateDoctor}>
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmModal.open && (
          <div className="modal-overlay">
            <div className="modal-card">
              <p>Are you sure you want to delete this doctor?</p>

              <div className="modal-buttons">
                <button className="confirm-btn" onClick={confirmDeleteDoctor}>
                  Yes, Delete
                </button>

                <button className="cancel-btn" onClick={cancelDelete}>
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
