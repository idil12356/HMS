import React, { useState, useEffect } from "react";
import "./BookAppointment.css";
import { supabase } from "../supabaseClient";
import bgImg from "../assets/book1.jpg";

const BookAppointment = () => {
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

  // FETCH DOCTORS (ALL OR BY SPECIALTY)
  const fetchDoctors = async () => {
    try {
      let query = supabase.from("doctors").select("*");
      if (formData.specialty) {
        query = query.eq("specialty", formData.specialty);
      }
      const { data, error } = await query;
      if (error) throw error;

      setDoctors(data || []);
      console.log("Doctors fetched:", data);
    } catch (err) {
      console.error("Error fetching doctors:", err.message);
    }
  };

  // Fetch doctors whenever specialty changes
  useEffect(() => {
    fetchDoctors();
  }, [formData.specialty]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "specialty" ? { doctor: "" } : {}), // reset doctor if specialty changes
    }));

    if (name === "specialty") setDoctors([]); // clear old doctors
  };

  // SUBMIT APPOINTMENT
const handleSubmit = async (e) => {
  e.preventDefault();

  // Required check for everything except notes
  if (!formData.fullName || !formData.phone || !formData.specialty || !formData.doctor || !formData.date || !formData.time) {
    alert("Please fill in all required fields.");
    return;
  }

  // notes is optional
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
    },
  ]);

  if (error) {
    alert(`Failed to book appointment: ${error.message}`);
    return;
  }

  setConfirmation(true);

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

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
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
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <label>Select Doctor</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.full_name}>
                {doc.full_name} — {doc.specialty}
              </option>
            ))}
          </select>

          <label>Appointment Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label>Appointment Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />

          <label>Additional Notes</label>
<textarea
  name="notes"
  value={formData.notes}
  onChange={handleChange}
  placeholder="Optional"
/>

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
