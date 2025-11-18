import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import MoviesPage from "./pages/MoviesPage";
import MovieShowtimesPage from "./pages/MovieShowtimesPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./auth/AuthContext";
import "./App.css";

function NavBar() {
  const { authenticated, email, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar" style={styles.navbar}>
      <div style={styles.navLeft}>
        <Link to="/" style={styles.brand}>
          🎬 CineBook
        </Link>
        <span style={styles.baseUrlNote}>API: {window?.location?.hostname}:3001</span>
      </div>
      <div style={styles.navRight}>
        {authenticated ? (
          <>
            <span style={styles.userText}>Hello, {email}</span>
            <button
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ ...styles.btn, ...styles.btnLink }}>
              Login
            </Link>
            <Link to="/register" style={{ ...styles.btn, ...styles.btnPrimary }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container" style={styles.container}>
        <Routes>
          <Route path="/" element={<MoviesPage />} />
          <Route path="/movies/:movieId" element={<MovieShowtimesPage />} />
          <Route path="/showtimes/:showtimeId/seats" element={<SeatSelectionPage />} />
          <Route path="/bookings/:bookingId" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  navbar: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navLeft: { display: "flex", gap: 12, alignItems: "center" },
  navRight: { display: "flex", gap: 10, alignItems: "center" },
  brand: { color: "#111827", textDecoration: "none", fontWeight: 700, fontSize: 20 },
  baseUrlNote: { color: "#64748b", fontSize: 12 },
  container: { maxWidth: 1100, margin: "20px auto" },
  btn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
    cursor: "pointer",
  },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  btnSecondary: { background: "#f3f4f6", color: "#111827", borderColor: "#e5e7eb" },
  btnLink: { color: "#3b82f6" },
  userText: { color: "#111827", fontSize: 14 },
};
