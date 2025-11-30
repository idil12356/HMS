import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./WritePrescription.css";
import bgImg from "../assets/priscrpt.jpg";

export default function Prescription({ doctor }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState("");

  // FETCH APPOINTMENTS
  const fetchAppointments = async () => {
    if (!doctor) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctor.id);

    if (!error) {
      setAppointments(data || []);
      setFiltered(data || []);
    } else {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctor]);

  // SEARCH FILTER
  useEffect(() => {
    const s = search.toLowerCase();
    const results = appointments.filter((p) => {
      const name = p.full_name?.toLowerCase() || "";
      const phone = String(p.phone || "").toLowerCase();
      const email = p.email?.toLowerCase() || "";

      return name.includes(s) || phone.includes(s) || email.includes(s);
    });
    setFiltered(results);
  }, [search, appointments]);

  // DELETE PRESCRIPTION
  const deletePrescription = async (id) => {
    const { error } = await supabase
      .from("appointments")
      .update({ doctor_notes: "", test_results: "", treatment_plan: "" })
      .eq("id", id);

    if (!error) {
      setSuccessType("delete-popup");
      setSuccessMessage("Prescription Deleted 🗑️");
      fetchAppointments();
      setTimeout(() => setSuccessMessage(""), 2500);
    }
  };

  // SAVE PRESCRIPTION
  const savePrescription = async () => {
    if (!selected) return;
    setSaving(true);

    const { error } = await supabase
      .from("appointments")
      .update({
        doctor_notes: selected.doctor_notes || "",
        test_results: selected.test_results || "",
        treatment_plan: selected.treatment_plan || "",
      })
      .eq("id", selected.id);

    setSaving(false);

    if (!error) {
      setIsEditing(false);
      fetchAppointments();
      setSuccessType("save-popup");
      setSuccessMessage("Prescription Saved ✔");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div
      className="book-appointment-page"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="prescription-container">
        <h1 className="title">Write Prescription</h1>

        {/* SUCCESS POPUP */}
        {successMessage && (
          <div className={`success-popup ${successType}`}>
            {successMessage}
          </div>
        )}

        {/* SEARCH INPUT */}
        <input
          type="text"
          className="prescription-search"
          placeholder="Search patient by name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* PATIENT LIST */}
        <div className="patient-list">
          {filtered.map((pt) => (
            <div key={pt.id} className="patient-card">
              <div>
                <p className="name">{pt.full_name}</p>
                <p className="info">{pt.phone}</p>
                <p className="info">{pt.email}</p>
              </div>

              <div className="btn-group">
                <button
                  className="add-small-btn"
                  onClick={() => {
                    setSelected({ ...pt, doctor_notes: "", test_results: "", treatment_plan: "" });
                    setIsEditing(true);
                  }}
                >
                  Add
                </button>

                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelected(pt);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deletePrescription(pt.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="no-results">No matching patients found</p>
          )}
        </div>

        {/* MODAL */}
        {selected && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-content">
                <h2 className="modal-title">Prescription Form</h2>

                <p><strong>Name:</strong> {selected.full_name}</p>
                <p><strong>Date:</strong> {selected.date}</p>
                <p><strong>Time:</strong> {selected.time}</p>

                <hr />

                {isEditing ? (
                  <>
                    <label>Doctor Notes</label>
                    <textarea
                      className="input"
                      value={selected.doctor_notes || ""}
                      onChange={(e) =>
                        setSelected({ ...selected, doctor_notes: e.target.value })
                      }
                    />

                    <label>Test Results</label>
                    <textarea
                      className="input"
                      value={selected.test_results || ""}
                      onChange={(e) =>
                        setSelected({ ...selected, test_results: e.target.value })
                      }
                    />

                    <label>Treatment Plan</label>
                    <textarea
                      className="input"
                      value={selected.treatment_plan || ""}
                      onChange={(e) =>
                        setSelected({ ...selected, treatment_plan: e.target.value })
                      }
                    />
                  </>
                ) : (
                  <div className="plain-output">
                    <h4>Doctor Notes</h4>
                    <div className="prescription-output">{selected.doctor_notes || "None"}</div>

                    <h4>Test Results</h4>
                    <div className="prescription-output">{selected.test_results || "None"}</div>

                    <h4>Treatment Plan</h4>
                    <div className="prescription-output">{selected.treatment_plan || "None"}</div>
                  </div>
                )}
              </div>

              <div className="button-row">
                {isEditing ? (
                  <button className="save-btn" onClick={savePrescription}>
                    {saving ? "Saving..." : "Save Prescription"}
                  </button>
                ) : (
                  <button className="save-btn" onClick={() => setIsEditing(true)}>
                    Edit Prescription
                  </button>
                )}

                <button
                  className="close-btn"
                  onClick={() => {
                    setSelected(null);
                    setIsEditing(true);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
