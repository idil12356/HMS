import React, { useState, useEffect } from "react";
import "./BookAppointment.css";
import { supabase } from "../supabaseClient";
import bgImg from "../assets/book1.jpg";
import { useNavigate } from "react-router-dom";

const BookAppointment = ({ patient }) => {
  const navigate = useNavigate();

  // Haddii uusan login ahayn → login page u dir
  useEffect(() => {
    if (!patient) {
      navigate("/login");
    }
  }, [patient]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialty: "",
    doctor: "",
    date: "",
    time: "",
    notes: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [confirmation, setConfirmation] = useState(false);

  // Fetch doctors based on specialty
  const fetchDoctors = async () => {
    try {
      let q = supabase.from("doctors").select("*");
      if (formData.specialty) q = q.eq("specialty", formData.specialty);

      const { data, error } = await q;
      if (error) throw error;

      setDoctors(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [formData.specialty]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "specialty" ? { doctor: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Hubi required fields
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.specialty ||
      !formData.doctor ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Kaydi appointment adoon isticmaalin patient_id
    const { error } = await supabase.from("appointments").insert([
      {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        specialty: formData.specialty,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        notes: formData.notes || null,
        status: "Pending", // default status
      },
    ]);

    if (error) {
      alert(`Failed to book appointment: ${error.message}`);
      return;
    }

    setConfirmation(true);

    // Clear form
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      specialty: "",
      doctor: "",
      date: "",
      time: "",
      notes: "",
    });
  };

  return (
    <div
      className="book-appointment-page"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="appointment-container">
        <h2>Book Appointment</h2>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Optional"
          />

          <label>Specialty</label>
          <select
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
          >
            <option value="">Select Specialty</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <label>Doctor</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.full_name}>
                {d.full_name} — {d.specialty}
              </option>
            ))}
          </select>

          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />

          <label>Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />

          <label>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional" />

          <input type="submit" value="Book Now" />
        </form>

        {confirmation && (
          <p className="confirmation-message">
            Your appointment request has been received.
          </p>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
