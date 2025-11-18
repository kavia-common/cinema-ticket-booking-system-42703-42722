import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.listMovies();
        if (mounted) setMovies(data || []);
      } catch (e) {
        setErr("Failed to load movies.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading movies…</div>;
  if (err) return <div style={styles.error}>{err}</div>;

  return (
    <div>
      <h1 style={styles.h1}>Now Showing</h1>
      <div style={styles.grid}>
        {movies.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.posterWrap}>
              {m.poster_url ? (
                <img alt={m.title} src={m.poster_url} style={styles.poster} />
              ) : (
                <div style={styles.posterPlaceholder}>No Poster</div>
              )}
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.title}>{m.title}</h3>
              <p style={styles.desc}>{m.description}</p>
              <div style={styles.meta}>
                <span>{m.duration_minutes} mins</span>
                <span>•</span>
                <span>{m.rating}</span>
              </div>
              <Link to={`/movies/${m.id}`} style={{ ...styles.btn, ...styles.btnPrimary }}>
                View Showtimes
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  h1: { fontSize: 26, color: "#111827", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" },
  posterWrap: { background: "#f3f4f6", height: 180, display: "flex", alignItems: "center", justifyContent: "center" },
  poster: { width: "100%", height: "100%", objectFit: "cover" },
  posterPlaceholder: { color: "#9ca3af", fontSize: 14 },
  cardBody: { padding: 12, display: "flex", flexDirection: "column", gap: 8 },
  title: { margin: 0, color: "#111827", fontSize: 18 },
  desc: { margin: 0, color: "#6b7280", fontSize: 14, minHeight: 40 },
  meta: { display: "flex", gap: 6, alignItems: "center", color: "#64748b", fontSize: 12 },
  btn: { padding: "8px 10px", borderRadius: 8, border: "1px solid transparent", fontWeight: 600, fontSize: 14, textDecoration: "none", cursor: "pointer", display: "inline-block", textAlign: "center" },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  error: { color: "#EF4444" },
};
