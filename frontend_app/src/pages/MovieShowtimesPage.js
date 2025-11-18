import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useParams } from "react-router-dom";

export default function MovieShowtimesPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [m, s] = await Promise.all([api.getMovie(movieId), api.listShowtimes(movieId)]);
        if (mounted) {
          setMovie(m);
          setShowtimes(s || []);
        }
      } catch (e) {
        setErr("Failed to load movie or showtimes.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [movieId]);

  if (loading) return <div>Loading…</div>;
  if (err) return <div style={styles.error}>{err}</div>;
  if (!movie) return <div>Movie not found.</div>;

  return (
    <div>
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <h1 style={styles.h1}>{movie.title}</h1>
          <p style={styles.desc}>{movie.description}</p>
          <div style={styles.meta}>
            <span>{movie.duration_minutes} mins</span>
            <span>•</span>
            <span>{movie.rating}</span>
          </div>
        </div>
        <div style={styles.posterWrap}>
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} style={styles.poster} />
          ) : (
            <div style={styles.posterPlaceholder}>No Poster</div>
          )}
        </div>
      </div>
      <h2 style={styles.h2}>Showtimes</h2>
      <div style={styles.list}>
        {showtimes.map((st) => (
          <div key={st.id} style={styles.showtimeCard}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ color: "#111827", fontWeight: 600 }}>
                {new Date(st.start_time).toLocaleString()}
              </div>
              <div style={{ color: "#64748b" }}>
                Auditorium: {st.auditorium} • Price: ${(st.price_cents / 100).toFixed(2)}
              </div>
            </div>
            <Link to={`/showtimes/${st.id}/seats`} style={{ ...styles.btn, ...styles.btnPrimary }}>
              Select Seats
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", gap: 16, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
  h1: { fontSize: 24, color: "#111827", margin: 0, marginBottom: 8 },
  h2: { fontSize: 18, color: "#111827", marginTop: 20 },
  desc: { color: "#6b7280", margin: 0, marginBottom: 8 },
  meta: { color: "#64748b", display: "flex", gap: 6, alignItems: "center", fontSize: 14 },
  posterWrap: { width: 180, height: 220, background: "#f3f4f6", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
  poster: { width: "100%", height: "100%", objectFit: "cover" },
  posterPlaceholder: { color: "#9ca3af", fontSize: 14 },
  list: { display: "flex", flexDirection: "column", gap: 12, marginTop: 8 },
  showtimeCard: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 },
  btn: { padding: "8px 10px", borderRadius: 8, border: "1px solid transparent", fontWeight: 600, fontSize: 14, textDecoration: "none", cursor: "pointer" },
  btnPrimary: { background: "#06b6d4", color: "#fff" },
  error: { color: "#EF4444" },
};
