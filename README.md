# EventManager

EventManager is a full-stack event management platform for discovering,
organizing, registering for, and reviewing events.

## Features

- Browse, search, filter, and paginate approved events
- Customer registration and registration history
- Branded tickets with QR codes and PDF download
- Customer reviews and event ratings
- Organizer event creation and management
- Organizer participant lists, live check-in support, and CSV export
- Admin event moderation and user blocking
- Role-based customer, organizer, and admin dashboards
- Socket.IO announcements and check-in updates
- Responsive UI with dark-mode support
- Public event posters with a local fallback for missing images

## Roles

- **Customer**: discover events, register, view tickets, download PDFs, and
  review completed events.
- **Organizer**: create events, manage participants, export attendance CSVs,
  and perform check-ins.
- **Admin**: review pending events, approve or reject events, and manage users.

## Technology stack

- **Frontend**: React 19, Vite, React Router, Axios, Tailwind CSS,
  Socket.IO Client
- **Backend**: Node.js, Express 5, Mongoose, JWT, Multer, Nodemailer,
  Socket.IO
- **Database**: MongoDB
- **Tickets**: QRCode, html2canvas, and jsPDF

## Project structure

```text
backend/    Express API, models, controllers, routes, uploads, and Socket.IO
frontend/   React/Vite application
```

## Local setup

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally or a reachable MongoDB connection string

### Install

```bash
git clone https://github.com/AnshulTikariha/Event-management-system.git
cd Event-management-system

cd backend
npm install

cd ../frontend
npm install
```

### Environment variables

Create `backend/.env` locally. Never commit it.

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/eventmanager
JWT_SECRET=replace-with-a-long-local-secret
CLIENT_ORIGIN=http://localhost:5173
```

`MONGODB_URI` is also accepted for compatibility. Optional SMTP variables are
available in [`backend/.env.example`](./backend/.env.example) for registration
email notifications.

### Run the application

In one terminal:

```bash
cd backend
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at
`http://localhost:5050`.

## Demo accounts

These are intentionally safe local demo credentials created by the seed:

- Customer: `customer@example.com` / `password`
- Organizer: `organizer@example.com` / `password`
- Admin: `admin@example.com` / `password`

Change demo credentials before using the application outside local
development.

## API

The backend exposes:

- `/api/auth` for signup and login
- `/api/events` for event browsing and management
- `/api/registrations` for registration, tickets, participants, check-ins, and
  CSV export
- `/api/reviews` for event reviews
- `/api/admin` for moderation and user management
- `/api/stats` for recommendations and dashboard statistics
- `/api/health` for a health check

JWT authentication is sent as a bearer token by the frontend.

## Database seeding

```bash
cd backend
npm run seed
```

The seed is safe to rerun. It refreshes only generated `@seed.event` accounts
and events marked with the internal `seed-2026` tag, preserving other
application data and the three demo accounts. The current dataset contains
1,500 generated events, 100 in each supported category, realistic organizer
and customer activity, registrations with QR data, and reviews.

Generated event posters use category-oriented public Unsplash URLs. Event cards
load images lazily and use `frontend/public/placeholder.svg` only as a
client-side fallback.

## Validation and limitations

- MongoDB must be available before starting the backend.
- Email notifications require valid SMTP configuration; registration itself
  does not depend on email delivery.
- Public Unsplash image availability depends on the remote service and network.
- The application is configured for local development and is not claimed as a
  deployed production service.

## License

MIT
