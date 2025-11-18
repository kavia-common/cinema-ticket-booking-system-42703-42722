import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

function Seat({ id, status, selected, onToggle }) {
  const disabled = status === "booked" || status === "held";
  const bg =
    status === "booked"
      ? "#e5e7eb"
      : status === "held"
      ? "#fde68a"
      : selected
      ? "#3b82f6"
      : "#f9fafb";
  const color = selected ? "#fff" : "#111827";
  return (
    <button
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled}
      title={`${id} - ${status}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        border: "1px solid #e5e7eb",
        background: bg,
        color,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {id}
    </button>
  );
}

export default function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const { email, authenticated } = useAuth();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [hold, setHold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [st, s] = await Promise.all([api.getShowtime(showtimeId), api.getSeats(showtimeId)]);
        if (mounted) {
          setShowtime(st);
          setSeats(s || []);
        }
      } catch (e) {
        setErr("Failed to load showtime or seats.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showtimeId]);

  const seatGrid = useMemo(() => {
    // Convert seat IDs like A1..A10 to rows
    const rows = {};
    seats.forEach((s) => {
      const match = s.seat_id.match(/^([A-Z]+)(\d+)$/);
      if (!match) return;
      const row = match[1];
      rows[row] = rows[row] || [];
      rows[row].push(s);
    });
    // sort columns by number
    Object.keys(rows).forEach((r) =>
      rows[r].sort((a, b) => {
        const ca = parseInt(a.seat_id.replace(/[^\d]/g, ""), 10);
        const cb = parseInt(b.seat_id.replace(/[^\d]/g, ""), 10);
        return ca - cb;
      })
    );
    return rows;
  }, [seats]);

  const toggleSeat = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const refreshSeats = async () => {
    const s = await api.getSeats(showtimeId);
    setSeats(s || []);
  };

  const createHold = async () => {
    if (selected.length === 0) {
      setActionMsg("Select at least one seat.");
      return;
    }
    try {
      setActionMsg("Creating hold…");
      const res = await api.createHold(showtimeId, selected, authenticated ? email : null);
      setHold(res);
      setActionMsg(`Hold created. Expires in ~${res.expires_in_seconds}s`);
      await refreshSeats();
    } catch (e) {
      setActionMsg("Failed to create hold. Seats might be taken.");
    }
  };

  const releaseHold = async () => {
    if (!hold) return;
    try {
      setActionMsg("Releasing hold…");
      await api.releaseHold(hold.id);
      setHold(null);
      await refreshSeats();
      setActionMsg("Hold released.");
    } catch (e) {
      setActionMsg("Failed to release hold.");
    }
  };

  const proceedToPayment = async () => {
    if (!hold) {
      setActionMsg("You need an active hold before payment.");
      return;
    }
    try {
      setActionMsg("Creating payment intent…");
      const intent = await api.createPaymentIntent((showtime.price_cents || 0) * hold.seats.length, "usd", {
        showtime_id: showtime.id,
        seats: hold.seats.join(","),
      });
      // Mock payment confirmation immediately
      setActionMsg("Confirming payment…");
      const confirmed = await api.confirmPayment(intent.client_secret);
      if (confirmed.status !== "succeeded") {
        setActionMsg("Payment not successful.");
        return;
      }
      setActionMsg("Creating booking…");
      const booking = await api.createBooking(hold.id, intent.client_secret);
      // Navigate to booking page
      navigate(`/bookings/${booking.id}`, { state: { booking } });
    } catch (e) {
      setActionMsg("Payment/booking failed.");
    }
  };

  if (loading) return <div>Loading…</div>;
  if (err) return <div style={styles.error}>{err}</div>;
  if (!showtime) return <div>Showtime not found.</div>;

  return (
    <div>
      <div style={styles.header}>
        <div style={{ color: "#111827", fontWeight: 700 }}>
          {new Date(showtime.start_time).toLocaleString()}
        </div>
        <div style={{ color: "#64748b" }}>
          Auditorium: {showtime.auditorium} • Price per seat: $
          {(showtime.price_cents / 100).toFixed(2)}
        </div>
      </div>

      <div style={styles.screen}>SCREEN</div>

      <div style={styles.grid}>
        {Object.keys(seatGrid)
          .sort()
          .map((row) => (
            <div key={row} style={styles.row}>
              <div style={styles.rowLabel}>{row}</div>
              <div style={styles.rowSeats}>
                {seatGrid[row].map((s) => (
                  <Seat
                    key={s.seat_id}
                    id={s.seat_id}
                    status={s.status}
                    selected={selected.includes(s.seat_id)}
                    onToggle={toggleSeat}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      <div style={styles.actions}>
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={refreshSeats}>
          Refresh
        </button>
        {!hold ? (
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={createHold}>
            Hold {selected.length} seat(s)
          </button>
        ) : (
          <>
            <button style={{ ...styles.btn, ...styles.btnWarn }} onClick={releaseHold}>
              Release Hold
            </button>
            <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={proceedToPayment}>
              Pay & Book
            </button>
          </>
        )}
      </div>
      {hold && (
        <div style={styles.holdInfo}>
          <div>Hold ID: {hold.id}</div>
          <div>Seats: {hold.seats.join(", ")}</div>
          <div>TTL: ~{hold.expires_in_seconds}s</div>
        </div>
      )}
      {actionMsg && <div style={styles.msg}>{actionMsg}</div>}
    </div>
  );
}

const styles = {
  header: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12 },
  screen: {
    textAlign: "center",
    margin: "18px auto",
    padding: "8px 0",
    width: "60%",
    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
    color: "#fff",
    borderRadius: 6,
    fontWeight: 700,
  },
  grid: { display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 },
  row: { display: "flex", alignItems: "center", gap: 8 },
  rowLabel: { width: 24, color: "#64748b", fontSize: 12, textAlign: "right" },
  rowSeats: { display: "flex", gap: 6, flexWrap: "wrap" },
  actions: { marginTop: 16, display: "flex", gap: 10 },
  btn: { padding: "10px 12px", borderRadius: 8, border: "1px solid transparent", fontWeight: 700, fontSize: 14, textDecoration: "none", cursor: "pointer" },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  btnSecondary: { background: "#f3f4f6", color: "#111827", borderColor: "#e5e7eb" },
  btnWarn: { background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" },
  btnSuccess: { background: "#06b6d4", color: "#fff" },
  holdInfo: { marginTop: 12, padding: 12, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, color: "#0c4a6e" },
  msg: { marginTop: 10, color: "#64748b" },
  error: { color: "#EF4444" },
};
