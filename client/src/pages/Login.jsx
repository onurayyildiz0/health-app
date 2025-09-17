import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(JSON.stringify(form, null, 2));
  };

  return (
    <div className=" h-screen flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Giriş Yap
        </h2>
        <input
          className="w-full border px-3 py-2 rounded mb-4"
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded mb-6"
          type="password"
          name="password"
          placeholder="Şifre"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          type="submit"
        >
          Giriş Yap
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link
            to="/register"
            className="text-blue-700 hover:underline font-semibold"
          >
            Üye Ol
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
