# Cinema Ticket Booking Frontend

A lightweight React app for browsing movies, selecting showtimes, holding seats, and creating bookings with a mock payment flow. It targets the backend FastAPI service on port 3001 by default.

## Run

- Install deps: `npm install`
- Start: `npm start` (http://localhost:3000)

By default the API base URL is:
- `http://<host>:3001`, where `<host>` is the browser hostname

Override via env:
- `REACT_APP_API_BASE_URL=https://your-backend.example.com`

## Pages

- `/` — Movies listing (`GET /movies`)
- `/movies/:movieId` — Movie detail + showtimes (`GET /movies/:id`, `GET /movies/:id/showtimes`)
- `/showtimes/:showtimeId/seats` — Seat map with hold/release and Pay & Book
  - `GET /showtimes/:id` `GET /showtimes/:id/seats`
  - `POST /showtimes/:id/hold` `DELETE /holds/:hold_id`
  - `POST /payments/intent` `POST /payments/confirm`
  - `POST /bookings` (then redirect to booking page)
- `/bookings/:bookingId` — Booking confirmation (`GET /bookings/:id`)
- `/login` — Mock login (`POST /auth/login`)
- `/register` — Mock registration (`POST /users` then login)

## Theming

Light theme accents:
- Primary: `#3b82f6`
- Success/secondary accent: `#06b6d4`
The theme toggle is available bottom-right.

## Notes

- Auth is mock and stored in localStorage (token/email) for demonstration only.
- Payment is a mocked flow using the backend’s payment intent/confirm endpoints.
