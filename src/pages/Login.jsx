import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Login.css"; // design-ka hore ayaan isticmaaleynaa
import { useNavigate } from "react-router-dom";

export default function Login({ setPatient, setAdmin, setDoctor, setReceptionist }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      /* 1️⃣ PATIENT */
      let { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("email", email)
        .single();

      if (patientData && patientData.password === password) {
        setPatient(patientData);
        navigate("/");
        return;
      }

      /* 2️⃣ ADMIN */
      let { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .single();

      if (adminData && adminData.password === password) {
        setAdmin(adminData);
        navigate("/admin/dashboard");
        return;
      }

      /* 3️⃣ DOCTOR */
      let { data: doctorData } = await supabase
        .from("doctors")
        .select("*")
        .eq("email", email)
        .single();

      if (doctorData && doctorData.password === password) {
        setDoctor(doctorData);
        navigate("/doctor/dashboard");
        return;
      }

      /* 4️⃣ RECEPTIONIST */
      let { data: receptionistData } = await supabase
        .from("receptionists")
        .select("*")
        .eq("email", email)
        .single();

      if (receptionistData && receptionistData.password === password) {
        setReceptionist(receptionistData);
        navigate("/reception/dashboard");
        return;
      }

      setError("Invalid email or password!");
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>

      <div className="login-box">
        <h2 className="logo-text">H M S</h2>

        <p className="desc">
          Enter your email address and password to access your account.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="login-btn" type="submit">
            Log In
          </button>
        </form>

        <a className="forgot" href="#">
          Forgot your password?
        </a>
      </div>
    </div>
  );
}
