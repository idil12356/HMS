import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./MedicalRecords.css";
import bgImg from "../assets/patianth.jpg";

export default function MedicalRecords({ doctor }) {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");

  // FETCH APPOINTMENTS AS PATIENTS
  const fetchPatients = async () => {
    if (!doctor) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctor.id);

    if (!error) {
      setPatients(data || []);
      setFiltered(data || []);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctor]);

  // SEARCH FILTER
  useEffect(() => {
    const res = patients.filter((p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [search, patients]);

  // OPEN MODAL
  const openRecord = (pt) => {
    setSelected(pt);
    setIsEditing(true);
  };

  // SAVE MEDICAL RECORD
  const saveRecord = async () => {
    if (!selected) return;
    setSaving(true);

    const { error } = await supabase
      .from("appointments")
      .update({
        test_results: selected.test_results || "",
        diagnosis: selected.diagnosis || "",
        treatment_notes: selected.treatment_notes || "",
      })
      .eq("id", selected.id);

    setSaving(false);

    if (error) {
      alert("Error saving record");
    } else {
      setIsEditing(false);
      fetchPatients();

      setSuccessMessage("Medical Record Updated ✔");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
     <div
        className="book-appointment-page"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
    <div className="records-container">
      <h1 className="records-title">Medical Records</h1>

      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name, phone, email..."
        className="records-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {successMessage && (
        <div className="record-toast">
          <div className="record-toast-icon">✔</div>
          <span>{successMessage}</span>
        </div>
      )}

      {/* PATIENT LIST */}
      <div className="record-list">
        {filtered.map((pt) => (
          <div key={pt.id} className="record-card">
            <div>
              <p className="record-name">{pt.full_name}</p>
              <p className="record-info">{pt.phone}</p>
              <p className="record-info">{pt.email}</p>
            </div>

            <button onClick={() => openRecord(pt)} className="record-btn">
              View / Update
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="records-modal-overlay">
          <div className="records-modal-box">
            <h2 className="records-modal-title">Medical Record</h2>

            <p><strong>Name:</strong> {selected.full_name}</p>
            <p><strong>Date:</strong> {selected.date}</p>
            <p><strong>Time:</strong> {selected.time}</p>

            <hr style={{ margin: "15px 0" }} />

            {isEditing ? (
              <>
                <label>Diagnosis</label>
                <textarea
                  className="records-input"
                  placeholder="Diagnosis: None"
                  value={selected.diagnosis || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, diagnosis: e.target.value })
                  }
                />

                <label>Test Results</label>
                <textarea
                  className="records-input"
                  placeholder="Test Results: None"
                  value={selected.test_results || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, test_results: e.target.value })
                  }
                />

                <label>Treatment Notes</label>
                <textarea
                  className="records-input"
                  placeholder="Treatment Notes: None"
                  value={selected.treatment_notes || ""}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      treatment_notes: e.target.value,
                    })
                  }
                />
              </>
            ) : (
              <div>
                <h4>Diagnosis</h4>
                <div className="records-output">
                  {selected.diagnosis || "None"}
                </div>

                <h4>Test Results</h4>
                <div className="records-output">
                  {selected.test_results || "None"}
                </div>

                <h4>Treatment Notes</h4>
                <div className="records-output">
                  {selected.treatment_notes || "None"}
                </div>
              </div>
            )}

            {/* BUTTON ROW */}
            <div className="records-button-row">
              {isEditing ? (
                <button className="records-save-btn" onClick={saveRecord}>
                  {saving ? "Saving..." : "Save Record"}
                </button>
              ) : (
                <button
                  className="records-save-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Record
                </button>
              )}

              <button
                className="records-close-btn"
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
