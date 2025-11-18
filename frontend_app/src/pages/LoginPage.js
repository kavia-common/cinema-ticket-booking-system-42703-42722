import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("Signing in…");
    try {
      await login(email, password);
      navigate("/");
    } catch (e1) {
      setMsg("Invalid credentials.");
    }
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Login</h1>
      <form onSubmit={onSubmit} style={styles.form}>
        <label style={styles.label}>
          Email
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={styles.label}>
          Password
          <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} type="submit">Login</button>
      </form>
      <div style={styles.alt}>
        Don’t have an account? <Link to="/register">Register</Link>
      </div>
      {msg && <div style={styles.msg}>{msg}</div>}
    </div>
  );
}

const styles = {
  wrap: {},
  h1: { fontSize: 24, color: "#111827" },
  form: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 },
  label: { display: "flex", flexDirection: "column", gap: 6, color: "#111827", fontWeight: 600 },
  input: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14 },
  btn: { padding: "10px 12px", borderRadius: 8, border: "1px solid transparent", fontWeight: 700, fontSize: 14, textDecoration: "none", cursor: "pointer", width: "fit-content" },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  alt: { marginTop: 8, color: "#64748b" },
  msg: { marginTop: 8, color: "#64748b" },
};
