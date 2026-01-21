import React, { useState } from "react";
import mockAuth from "../api/mockAuth";
import bg1 from "../assets/bg1.png";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email is required");
    if (!password) return setError("Password is required");
    setLoading(true);
    try {
      const user = await mockAuth(email, password);
      if (remember) {
        try { localStorage.setItem("demo_user", JSON.stringify(user)); } catch {};
      }
      onLogin(user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundImage: `url(${bg1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <form className="w-full max-w-md bg-white rounded-xl shadow-lg p-6" onSubmit={submit} aria-label="Login form">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Sign in to BioIntelX</h2>
        {error && (
          <div className="text-red-600 mb-3" role="alert">{error}</div>
        )}

        <label className="block mb-2">
          <span className="text-sm text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </label>

        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a href="#" className="text-sm text-green-600 hover:underline">Forgot?</a>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-xs text-gray-500 mt-4">This is a demo login for the presentation — no data is sent to a server.</p>
      </form>
    </div>
  );
}
