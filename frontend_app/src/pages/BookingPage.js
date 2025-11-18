import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useLocation, useParams } from "react-router-dom";

export default function BookingPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!booking) {
      (async () => {
        try {
          const b = await api.getBooking(bookingId);
          if (mounted) setBooking(b);
        } catch (e) {
          setErr("Failed to load booking.");
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }
    return () => { mounted = false; };
  }, [booking, bookingId]);

  if (loading) return <div>Loading booking…</div>;
  if (err) return <div style={{ color: "#EF4444" }}>{err}</div>;
  if (!booking) return <div>Booking not found.</div>;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Booking Confirmed</h1>
      <div style={styles.card}>
        <div><strong>Booking ID:</strong> {booking.id}</div>
        <div><strong>Movie ID:</strong> {booking.movie_id}</div>
        <div><strong>Showtime ID:</strong> {booking.showtime_id}</div>
        <div><strong>Seats:</strong> {booking.seats.join(", ")}</div>
        <div><strong>Status:</strong> {booking.status}</div>
        <div><strong>Amount:</strong> ${(booking.amount_cents / 100).toFixed(2)}</div>
        <div><strong>Created:</strong> {new Date(booking.created_at * 1000).toLocaleString()}</div>
      </div>
      <p style={styles.note}>An email receipt would be sent in a real system. Enjoy the show!</p>
    </div>
  );
}

const styles = {
  wrap: {},
  h1: { fontSize: 24, color: "#111827" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 6 },
  note: { marginTop: 12, color: "#64748b" },
};
