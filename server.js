import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "hospital_db",
  password: "yourpassword", // bedel password-kaaga
  port: 5432,
});

// GET all doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM doctors");
    const doctors = result.rows.map(doc => ({
      id: doc.id,
      name: doc.full_name,
      specialty: doc.specialty || "General",
      experience: doc.experience || 5,
      availability: doc.availability ? doc.availability.split(",") : ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      times: doc.times || "09:00 - 17:00",
      bio: doc.bio || "Experienced doctor.",
      rating: doc.rating || null,
      photo: doc.photo || "https://randomuser.me/api/portraits/lego/1.jpg"
    }));
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Server run
app.listen(5000, () => console.log("Server running on port 5000"));
