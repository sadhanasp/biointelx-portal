import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo1.png";

export default function Navbar() {
  const loc = useLocation();
  const nav = [
    { to: "/", label: "Home" },
    { to: "/portal", label: "Microbe Portal" },
    { to: "/upload", label: "Upload" },
    { to: "/viz", label: "Visualization" },
  ];

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="BioIntelX" className="h-11 w-30 object-contain" />
        </div>

        <nav className="flex items-center space-x-4">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-2 rounded-md text-sm ${
                loc.pathname === n.to ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
