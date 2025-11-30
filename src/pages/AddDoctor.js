import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddDoctor() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    specialty: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("doctors")
      .insert([form]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Doctor successfully added!");
      setForm({ full_name: "", email: "", password: "", specialty: "" });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "30px auto", textAlign: "center" }}>
      <h2>Add Doctor</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="full_name" placeholder="Full Name" onChange={handleChange} value={form.full_name} required />
        <input name="email" placeholder="Email" onChange={handleChange} value={form.email} required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} value={form.password} required />
        <input name="specialty" placeholder="Specialty" onChange={handleChange} value={form.specialty} />
        <button type="submit">Add Doctor</button>
      </form>
    </div>
  );
}
