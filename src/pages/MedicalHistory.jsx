import React, { useEffect, useState } from "react";
import "./MedicalHistory.css";
import { supabase } from "../supabaseClient";
import bgImg from "../assets/patianth.jpg";

const MedicalHistory = ({ patient }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (patient?.email) {
      fetchHistory();
    }
  }, [patient]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("email", patient.email)
        .order("date", { ascending: false });

      if (!error) setRecords(data || []);
    } catch (err) {
      console.error("Error fetching medical history:", err.message);
    }
  };

  return (
    <div
      className="book-appointment-page"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="history-container">
        <h2 className="history-title">My Medical Records</h2>

        {records.length === 0 ? (
          <p className="no-records">No records found.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date</th>
                <th>Status</th>
                <th>Your Notes</th>
                <th>Doctor Notes</th>
                <th>Test Results</th>
                <th>Treatment Plan</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.doctor || "Not assigned"}</td>
                  <td>{record.specialty || "-"}</td>
                  <td>
                    {new Date(record.date).toLocaleDateString()}
                    <br />
                    <small>{record.time}</small>
                  </td>
                  <td
                    className={`status ${
                      record.status?.toLowerCase() === "approved"
                        ? "approved"
                        : record.status?.toLowerCase() === "completed"
                        ? "completed"
                        : "pending"
                    }`}
                  >
                    {record.status || "Pending"}
                  </td>
                  <td>{record.notes || "No notes"}</td>
                  <td>{record.doctor_notes || "No doctor notes"}</td>
                  <td>{record.test_results || "No test results"}</td>
                  <td>{record.treatment_plan || "No treatment"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
