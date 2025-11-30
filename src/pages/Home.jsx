import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import drfatima from "../assets/drfatima.jpg";
import drmohamed from "../assets/drmohamed.jpg";
import drahmed from "../assets/drahmed.jpg";


function Home() {
  return (
    <div className="home-page">

      {/* Hero / Banner Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Health is Our Mission</h1>
          <p>Providing compassionate care for every patient, every day.</p>
          <Link to="/book-appointment" className="hero-btn">
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">General Checkup</div>
          <div className="service-card">Emergency Services</div>
          <div className="service-card">Surgery</div>
          <div className="service-card">Maternity Care</div>
        </div>
      </section>

      {/* Doctors Section */}
   <section className="doctors-section">
  <h2>Our Doctors</h2>
  <div className="doctors-grid">
    <div className="doctor-card">
      <img src={drfatima} alt="Dr Fatima Ysuf" />
      <h4>Dr. Fatima Yusuf</h4>
      <p>Cardiologist</p>
    </div>
    <div className="doctor-card">
      <img src={drmohamed} alt="Dr Mohamed Ali" />
      <h4>Dr. Mohamed Ali</h4>
      <p>Pediatrician</p>
    </div>
    <div className="doctor-card">
      <img src={drahmed} alt="Dr Ahmed Ali" />
      <h4>Dr. Ahmed Ali</h4>
      <p>Cardiologist</p>
    </div>
  </div>
</section>


      {/* About Section */}
      <section className="about-section">
        <h2>About Us</h2>
        <p>
          PatientCare Hospital was established to deliver top-quality healthcare
          with modern technology and a caring touch. Our mission is to make
          healthcare accessible and trustworthy for everyone.
        </p>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Patients Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <p>"Excellent care and professional staff!"</p>
            <span>- Ahmed M.</span>
          </div>
          <div className="testimonial">
            <p>"They treated me like family. Highly recommended!"</p>
            <span>- Aisha A.</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p><strong>Address:</strong> Mogadishu, Somalia</p>
        <p><strong>Phone:</strong> +252 61 2345678</p>
        <p><strong>Email:</strong> info@patientcare.so</p>
        <div className="social-icons">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 PatientCare | All Rights Reserved</p>
        <div className="footer-links">
          <a href="#">About</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms</a>
        </div>
      </footer>

    </div>
  );
}

export default Home;
