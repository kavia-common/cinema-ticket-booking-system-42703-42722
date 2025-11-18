//
// Simple API client for the Cinema Ticket Booking frontend
// Uses fetch with JSON, handles auth token from localStorage, and points to backend_api on port 3001.
//
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof window !== "undefined" && window.location && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

// Helper to get auth token
function getToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

async function http(method, path, body, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    // try to get the error content
    let errPayload = null;
    try {
      errPayload = await res.json();
    } catch {
      // ignore
    }
    const error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    error.payload = errPayload;
    throw error;
  }
  // No content
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// PUBLIC_INTERFACE
export const api = {
  /** Movies */
  // PUBLIC_INTERFACE
  async listMovies() {
    /** Returns array of Movie objects */
    return http("GET", "/movies");
  },
  // PUBLIC_INTERFACE
  async getMovie(movieId) {
    /** Returns a single Movie by ID */
    return http("GET", `/movies/${encodeURIComponent(movieId)}`);
  },

  /** Showtimes */
  // PUBLIC_INTERFACE
  async listShowtimes(movieId) {
    /** Returns array of Showtime for a given movie */
    return http("GET", `/movies/${encodeURIComponent(movieId)}/showtimes`);
  },
  // PUBLIC_INTERFACE
  async getShowtime(showtimeId) {
    /** Returns a single Showtime by ID */
    return http("GET", `/showtimes/${encodeURIComponent(showtimeId)}`);
  },

  /** Seats */
  // PUBLIC_INTERFACE
  async getSeats(showtimeId) {
    /** Returns array of SeatAvailability for a showtime */
    return http("GET", `/showtimes/${encodeURIComponent(showtimeId)}/seats`);
    },
  // PUBLIC_INTERFACE
  async createHold(showtimeId, seats, userId = null) {
    /** Creates a hold; returns HoldResponse */
    return http("POST", `/showtimes/${encodeURIComponent(showtimeId)}/hold`, {
      seats,
      user_id: userId,
    });
  },
  // PUBLIC_INTERFACE
  async releaseHold(holdId) {
    /** Cancels hold; returns null (204) */
    return http("DELETE", `/holds/${encodeURIComponent(holdId)}`);
  },

  /** Booking */
  // PUBLIC_INTERFACE
  async createBooking(holdId, paymentIntentId = null) {
    /** Creates a booking from hold; returns Booking */
    return http("POST", `/bookings`, {
      hold_id: holdId,
      payment_intent_id: paymentIntentId,
    });
  },
  // PUBLIC_INTERFACE
  async getBooking(bookingId) {
    /** Returns a booking by ID */
    return http("GET", `/bookings/${encodeURIComponent(bookingId)}`);
  },

  /** Users & Auth */
  // PUBLIC_INTERFACE
  async register(email, password, name = null) {
    /** Registers a user; returns User */
    return http("POST", `/users`, { email, password, name });
  },
  // PUBLIC_INTERFACE
  async login(email, password) {
    /** Logs in; returns {access_token, token_type} */
    return http("POST", `/auth/login`, { email, password });
  },

  /** Payments (mock) */
  // PUBLIC_INTERFACE
  async createPaymentIntent(amount_cents, currency = "usd", metadata = {}) {
    /** Creates mock payment intent; returns PaymentIntentResponse */
    return http("POST", `/payments/intent`, {
      amount_cents,
      currency,
      metadata,
    });
  },
  // PUBLIC_INTERFACE
  async confirmPayment(payment_intent_id) {
    /** Confirms mock payment; returns PaymentConfirmResponse */
    return http("POST", `/payments/confirm`, { payment_intent_id });
  },

  // PUBLIC_INTERFACE
  getBaseUrl() {
    /** Returns the configured API base URL */
    return API_BASE;
  },
};
