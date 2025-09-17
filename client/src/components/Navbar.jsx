import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to={"/"}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
            LOGO
          </h1>
        </Link>
        <div className="flex gap-6">
          <Link to={"/login"}>
            <button className="min-w-[120px] cursor-pointer text-white bg-gradient-to-r from-blue-700 to-blue-400 rounded-2xl px-4 py-2 font-semibold shadow hover:scale-105 transition-transform duration-200">
              Kullanıcı Girişi
            </button>
          </Link>
          <Link to={"/register"}>
            <button className="min-w-[120px] cursor-pointer text-white bg-gradient-to-r from-blue-700 to-blue-400 rounded-2xl px-4 py-2 font-semibold shadow hover:scale-105 transition-transform duration-200">
              Üye Ol
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
