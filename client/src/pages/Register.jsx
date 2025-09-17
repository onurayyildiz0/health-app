import React, { useState } from "react";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(JSON.stringify(form, null, 2));
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Kayıt Ol</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            type="text"
            name="name"
            placeholder="Ad Soyad"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border px-3 py-2 rounded"
            type="email"
            name="email"
            placeholder="E-posta"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border px-3 py-2 rounded"
            type="password"
            name="password"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            required
          />
          <select
            className="w-full border px-3 py-2 rounded"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="patient">Hasta</option>
            <option value="doctor">Doktor</option>
          </select>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            type="submit"
          >
            Kayıt Ol
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
