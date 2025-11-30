import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

/* ───────────────────────────────
   NAVBARS
────────────────────────────────── */
import PatientNavbar from "./components/PatientNavbar";
import AdminNavbar from "./components/AdminNavbar";
import DoctorNavbar from "./components/DoctorNavbar";
import ReceptionistNavbar from "./components/ReceptionistNavbar"; // NEW

/* ───────────────────────────────
   PATIENT PAGES
────────────────────────────────── */
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import MedicalHistory from "./pages/MedicalHistory";

/* ───────────────────────────────
   ADMIN PAGES
────────────────────────────────── */
import AdminDashboard from "./admin/Dashboard";
import ManageUsers from "./admin/ManageUsers";
import Appointments from "./admin/Appointments";

/* ───────────────────────────────
   DOCTOR PAGES
────────────────────────────────── */
import DoctorDashboard from "./doctor/Dashboard";
import DoctorMyAppointments from "./doctor/MyAppointments";
import DoctorPatients from "./doctor/Patients";
import DoctorWritePrescription from "./doctor/WritePrescription";
import DoctorMedicalRecords from "./doctor/MedicalRecords";


/* ───────────────────────────────
   RECEPTIONIST PAGES
────────────────────────────────── */
import ReceptionistDashboard from "./reception/Dashboard";
import ReceptionistPatients from "./reception/Patients";
import ReceptionistAppointments from "./reception/Appointments";
import ReceptionistDoctors from "./reception/Doctors";
import ReceptionistReports from "./reception/Reports";

import "./App.css";


/* ───────────────────────────────
   ROUTER COMPONENT
────────────────────────────────── */
function AppRoutes({ 
  patient, setPatient,
  admin, setAdmin,
  doctor, setDoctor,
  receptionist, setReceptionist
}) {
  return (
    <Routes>

      {/* PATIENT ROUTES */}
      <Route path="/" element={<Home patient={patient} />} />
      <Route path="/home" element={<Home patient={patient} />} />
      <Route path="/book-appointment" element={<BookAppointment patient={patient} />} />
      <Route path="/my-appointments" element={<MyAppointments patient={patient} />} />
      <Route path="/medical-history" element={<MedicalHistory patient={patient} />} />
 

      {/* AUTH ROUTES */}
      <Route
        path="/login"
        element={
          <Login 
            setPatient={setPatient} 
            setAdmin={setAdmin} 
            setDoctor={setDoctor} 
            setReceptionist={setReceptionist}
          />
        }
      />
      <Route path="/signup" element={<Signup />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin/dashboard" element={<AdminDashboard admin={admin} />} />
      <Route path="/admin/manage-users" element={<ManageUsers admin={admin} />} />
      <Route path="/admin/appointments" element={<Appointments admin={admin} />} />

      {/* DOCTOR ROUTES */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard doctor={doctor} />} />
      <Route path="/doctor/my-appointments" element={<DoctorMyAppointments doctor={doctor} />} />
      <Route path="/doctor/patients" element={<DoctorPatients doctor={doctor} />} />
      <Route path="/doctor/write-prescription" element={<DoctorWritePrescription doctor={doctor} />} />
      <Route path="/doctor/medical-records" element={<DoctorMedicalRecords doctor={doctor} />} />
      

      {/* RECEPTIONIST ROUTES */}
      <Route path="/reception/dashboard" element={<ReceptionistDashboard receptionist={receptionist} />} />
      <Route path="/reception/patients" element={<ReceptionistPatients receptionist={receptionist} />} />
      <Route path="/reception/appointments" element={<ReceptionistAppointments receptionist={receptionist} />} />
      <Route path="/reception/doctors" element={<ReceptionistDoctors receptionist={receptionist} />} />
      <Route path="/reception/reports" element={<ReceptionistReports receptionist={receptionist} />} />

    </Routes>
  );
}


/* ───────────────────────────────
   MAIN APP
────────────────────────────────── */
function App() {
  const [patient, setPatient] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [receptionist, setReceptionist] = useState(null); // NEW ROLE

  const location = useLocation();
  const navigate = useNavigate();

  /* SESSION CHECK */
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const email = session.user.email;

      // Check Admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .single();
      if (adminData) {
        setAdmin(adminData);
        return;
      }

      // Check Doctor
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("*")
        .eq("email", email)
        .single();
      if (doctorData) {
        setDoctor(doctorData);
        return;
      }

      // Check Receptionist
      const { data: receptionistData } = await supabase
        .from("receptionists")
        .select("*")
        .eq("email", email)
        .single();
      if (receptionistData) {
        setReceptionist(receptionistData);
        return;
      }

      // Check Patient
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("email", email)
        .single();
      if (patientData) {
        setPatient(patientData);
        return;
      }
    };

    fetchSession();
  }, []);

  /* NAVBAR SELECTOR */
  let navbar;
  if (admin) navbar = <AdminNavbar admin={admin} setAdmin={setAdmin} />;
  else if (doctor) navbar = <DoctorNavbar doctor={doctor} setDoctor={setDoctor} />;
  else if (receptionist)
    navbar = (
      <ReceptionistNavbar
        receptionist={receptionist}
        setReceptionist={setReceptionist}
      />
    );
  else navbar = <PatientNavbar patient={patient} setPatient={setPatient} />;

  return (
    <>
      {navbar}

      <main>
        <AppRoutes
          patient={patient}
          setPatient={setPatient}
          admin={admin}
          setAdmin={setAdmin}
          doctor={doctor}
          setDoctor={setDoctor}
          receptionist={receptionist}
          setReceptionist={setReceptionist}
        />
      </main>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
