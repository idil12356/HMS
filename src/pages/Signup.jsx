import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("patients").insert([
        {
          full_name: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
        },
      ]);

      if (error) setMessage(error.message);
      else {
        setMessage("Account created successfully!");
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          age: "",
          gender: "",
        });
      }
    } catch (err) {
      setMessage("Something went wrong: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="signup-bg">
      <form className="signup-box" onSubmit={handleSubmit}>
        <h1 className="signup-title">H M S</h1>
        <p className="signup-subtitle">Create your account</p>

        <input type="text" name="fullName" placeholder="Full Name"
          value={formData.fullName} onChange={handleChange} required />

        <input type="text" name="username" placeholder="Username"
          value={formData.username} onChange={handleChange} required />

        <input type="email" name="email" placeholder="Email Address"
          value={formData.email} onChange={handleChange} required />

        <input type="text" name="phone" placeholder="Phone Number"
          value={formData.phone} onChange={handleChange} required />

        <input type="number" name="age" placeholder="Age"
          value={formData.age} onChange={handleChange} required />

        <select name="gender" value={formData.gender}
          onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input type="password" name="password" placeholder="Password"
          value={formData.password} onChange={handleChange} required />

        <button type="submit" className="signup-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        {message && <p className="signup-message">{message}</p>}
      </form>
    </div>
  );
}
