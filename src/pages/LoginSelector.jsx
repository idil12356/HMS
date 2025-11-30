import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSelector() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-xl font-bold mb-4">Select Login Type</h2>
      <button
        className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
        onClick={() => navigate("/login")}
      >
        Patient Login
      </button>
      <button
        className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
        onClick={() => navigate("/admin/login")}
      >
        Admin Login
      </button>
    </div>
  );
}
