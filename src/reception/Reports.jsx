import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import bgImg from "../assets/priscrpt.jpg";

/* ----------------- Doctors Working Today Component ----------------- */
function DoctorsToday({ date }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchDoctorsToday();
  }, [date]);

  async function fetchDoctorsToday() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("doctor")
        .eq("date", date);

      if (error) throw error;

      const uniq = [...new Set((data || []).map((d) => d.doctor))];
      setList(uniq);
    } catch (err) {
      console.error("DoctorsToday:", err.message);
      setList([]);
    }
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
      {list.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No doctors working today.</p>
      ) : (
        list.map((d) => (
          <li key={d} style={{ padding: "6px 0", fontWeight: 700 }}>
            {d}
          </li>
        ))
      )}
    </ul>
  );
}

/* ----------------- Main Reports Page ----------------- */
export default function ReceptionistReports() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyCount, setDailyCount] = useState(0);
  const [last7, setLast7] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    generateForDate(date);
    fetchLast7Days();
  }, []);

  async function generateForDate(targetDate) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, full_name, phone, email, doctor, specialty, date, time, status, created_at"
        )
        .eq("date", targetDate)
        .order("time", { ascending: true });

      if (error) throw error;

      setRows(data || []);
      setDailyCount((data || []).length);
    } catch (err) {
      console.error("generateForDate:", err.message);
      setRows([]);
      setDailyCount(0);
    }
  }

  async function fetchLast7Days() {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);

      const startISO = start.toISOString().slice(0, 10);
      const endISO = end.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("appointments")
        .select("date")
        .gte("date", startISO)
        .lte("date", endISO)
        .order("date", { ascending: true });

      if (error) throw error;

      const map = {};
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        map[key] = 0;
      }

      (data || []).forEach((r) => {
        const key = (r.date || "").toString().slice(0, 10);
        if (map[key] === undefined) map[key] = 0;
        map[key] += 1;
      });

      const list = Object.keys(map)
        .sort()
        .map((k) => ({ date: k, total: map[k] }));

      setLast7(list);
    } catch (err) {
      console.error("fetchLast7Days:", err.message);
      setLast7([]);
    }
  }

  function escapeCSV(value) {
    if (!value) return "";
    const s = value.toString();
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function downloadCSV() {
    const headers = [
      "Patient",
      "Phone",
      "Email",
      "Doctor",
      "Specialty",
      "Date",
      "Time",
      "Status",
      "CreatedAt",
    ];
    const csvRows = [headers.join(",")];

    rows.forEach((r) => {
      const line = [
        escapeCSV(r.full_name),
        escapeCSV(r.phone),
        escapeCSV(r.email),
        escapeCSV(r.doctor),
        escapeCSV(r.specialty),
        escapeCSV(r.date),
        escapeCSV(r.time),
        escapeCSV(r.status),
        escapeCSV(new Date(r.created_at).toLocaleString()),
      ].join(",");
      csvRows.push(line);
    });

    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
        <div
          className="book-appointment-page"
          style={{ backgroundImage: `url(${bgImg})` }}
        >
    <div className="appointments-wrapper">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 className="appointments-title">Reception — Reports</h1>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="btn-add"
            onClick={() => generateForDate(date)}
            style={{ padding: "6px 10px" }}
          >
            Generate
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
        }}
      >
        {/* LEFT MAIN COLUMN */}
        <div>
          {/* Summary */}
          <div
            style={{
              background: "var(--card)",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
            }}
          >
            <h3>Summary — {date}</h3>
            <p style={{ margin: 8 }}>
              Total appointments: <strong>{dailyCount}</strong>
            </p>

            <button
              className="modal-btn save"
              onClick={downloadCSV}
              disabled={rows.length === 0}
            >
              Export CSV
            </button>
          </div>

          {/* Appointments List */}
          <div
            style={{
              background: "var(--card)",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
            }}
          >
            <h3>Appointments ({rows.length})</h3>

            {rows.length === 0 ? (
              <p className="muted">No appointments for this date.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <th style={{ padding: 8 }}>Patient</th>
                    <th>Time</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: 8 }}>
                        <div style={{ fontWeight: 700 }}>{r.full_name}</div>
                        <div
                          style={{
                            color: "var(--muted)",
                            fontSize: 13,
                          }}
                        >
                          {r.phone}
                        </div>
                      </td>
                      <td>{r.time}</td>
                      <td>{r.doctor}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            (r.status || "Pending").toLowerCase()
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside>
          {/* Doctors Working Today */}
          <div
            style={{
              background: "var(--card)",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
              marginBottom: 16,
            }}
          >
            <h4>Doctors Working Today</h4>
            <DoctorsToday date={date} />
          </div>

          {/* Last 7 Days */}
          <div
            style={{
              background: "var(--card)",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
            }}
          >
            <h4>Last 7 Days</h4>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
              {last7.map((d) => (
                <li
                  key={d.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>{d.date}</div>
                  <div style={{ fontWeight: 800 }}>{d.total}</div>
                </li>
              ))}
            </ul>

            <button
              className="modal-btn save"
              onClick={fetchLast7Days}
              style={{ marginTop: 12 }}
            >
              Refresh
            </button>
          </div>
        </aside>
      </div>
      </div>
      </div>
  );
}
