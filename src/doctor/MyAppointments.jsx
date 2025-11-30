import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./MyAppointments.css";
import bgImg from "../assets/apointmen.jpg";

export default function MyAppointments({ doctor }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedApt, setSelectedApt] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const fetchAppointments = async () => {
    if (!doctor) return;

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        full_name,
        phone,
        email,
        date,
        time,
        notes,
        status,
        specialty,
        doctor
      `)
      .eq("doctor", doctor.full_name);

    if (!error) {
      setAppointments(data || []);
    } else {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctor]);

  // Update status (Completed)
  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );

      if (selectedApt?.id === id) {
        setSelectedApt({ ...selectedApt, status });
      }
    }
  };

  // Reschedule
  const rescheduleAppointment = async () => {
    if (!selectedApt) return;

    const { date, time } = rescheduleData;

    const { error } = await supabase
      .from("appointments")
      .update({ date, time, status: "Rescheduled" })
      .eq("id", selectedApt.id);

    if (!error) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedApt.id ? { ...a, date, time, status: "Rescheduled" } : a
        )
      );

      setSelectedApt({
        ...selectedApt,
        date,
        time,
        status: "Rescheduled",
      });
    }
  };

  return (
    <div
      className="book-appointment-page"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

        {/* LIST OF APPOINTMENTS */}
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 bg-white shadow rounded flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">{apt.full_name}</p>
                <p className="text-sm text-gray-600">
                  {apt.date} - {apt.time}
                </p>
                <p className="text-sm">
                  Status: <span className="font-semibold">{apt.status}</span>
                </p>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => setSelectedApt(apt)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  View
                </button>

                {apt.status !== "Completed" && (
                  <button
                    onClick={() => updateStatus(apt.id, "Completed")}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* VIEW MODAL */}
        {selectedApt && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">

              <h2 className="text-xl font-bold mb-4">Patient Details</h2>

              <p><strong>Name:</strong> {selectedApt.full_name}</p>
              <p><strong>Phone:</strong> {selectedApt.phone}</p>
              <p><strong>Email:</strong> {selectedApt.email}</p>
              <p><strong>Date:</strong> {selectedApt.date}</p>
              <p><strong>Time:</strong> {selectedApt.time}</p>
              <p><strong>Status:</strong> {selectedApt.status}</p>
              <p><strong>Notes:</strong> {selectedApt.notes || "None"}</p>

              {/* RESCHEDULE */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Reschedule</h3>

                <input
                  type="date"
                  className="border p-2 rounded w-full mb-2"
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, date: e.target.value })
                  }
                />

                <input
                  type="time"
                  className="border p-2 rounded w-full mb-2"
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, time: e.target.value })
                  }
                />

                <button
                  onClick={rescheduleAppointment}
                  className="w-full py-2 bg-purple-600 text-white rounded"
                >
                  Save Reschedule
                </button>
              </div>

              <button
                onClick={() => setSelectedApt(null)}
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
