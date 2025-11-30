import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Patients.css";
import bgImg from "../assets/patian4.jpg";

export default function Patients({ doctor }) {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPatients = async () => {
    if (!doctor) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("id, full_name, phone, email, date, time, notes, doctor_notes, test_results, treatment_plan")
      .eq("doctor_id", doctor.id);

    if (!error) {
      setPatients(data || []);
      setFiltered(data || []);
    } else {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctor]);

  // SEARCH FILTER
  useEffect(() => {
    const s = search.toLowerCase();

    const results = patients.filter((p) => {
      const name = p.full_name?.toLowerCase() || "";
      const phone = String(p.phone || "").toLowerCase();
      const email = p.email?.toLowerCase() || "";

      return (
        name.includes(s) ||
        phone.includes(s) ||
        email.includes(s)
      );
    });

    setFiltered(results);
  }, [search, patients]);

  return (
    <div
      className="book-appointment-page"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Patients</h1>

        {/* SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search patient by name, phone, email..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LIST */}
        <div className="space-y-4 mt-4">
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center">No patients found.</p>
          )}

          {filtered.map((pt) => (
            <div
              key={pt.id}
              className="p-4 bg-white shadow rounded flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">{pt.full_name}</p>
                <p className="text-sm text-gray-600">{pt.phone}</p>
                <p className="text-sm text-gray-600">{pt.email}</p>
              </div>

              <button
                onClick={() => setSelectedPatient(pt)}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                View History
              </button>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Medical History</h2>

              <p><strong>Name:</strong> {selectedPatient.full_name}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Date Seen:</strong> {selectedPatient.date}</p>
              <p><strong>Time Seen:</strong> {selectedPatient.time}</p>
              <p><strong>Visit Notes:</strong> {selectedPatient.notes || "No notes"}</p>
              <p><strong>Doctor Notes:</strong> {selectedPatient.doctor_notes || "None"}</p>
              <p><strong>Test Results:</strong> {selectedPatient.test_results || "None"}</p>
              <p><strong>Treatment Plan:</strong> {selectedPatient.treatment_plan || "None"}</p>

              <button
                onClick={() => setSelectedPatient(null)}
                className="mt-4 w-full py-2 bg-gray-300 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
