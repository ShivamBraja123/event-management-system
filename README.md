# EventManager

A full-stack event management platform for discovering, organizing, registering for, and managing events. The application provides separate experiences for **Customers, Organizers, and Administrators**, with event discovery, registrations, digital tickets, reviews, participant management, check-ins, moderation, and real-time updates.

## ✨ Features

### 👤 Customer

* Browse approved events
* Search, filter, and paginate events
* View detailed event information
* Register for events
* View registration history
* Access branded digital tickets
* Generate QR-code tickets
* Download tickets as PDF
* Review completed events
* Rate events

### 🎤 Organizer

* Create and manage events
* Manage registered participants
* View participant information
* Perform participant check-ins
* Export attendance data as CSV
* Send real-time event announcements
* Monitor event activity

### 🛡️ Administrator

* Review pending events
* Approve or reject events
* Manage users
* Block users when required
* Monitor platform activity
* Access administrative dashboards and statistics

## 🚀 Highlights

* Role-based authentication and authorization
* JWT-based authentication
* Real-time communication using Socket.IO
* QR-code based digital tickets
* PDF ticket generation
* Event reviews and ratings
* Participant check-in system
* CSV attendance export
* Event moderation workflow
* Responsive interface
* Dark-mode support
* Lazy-loaded event images
* Local fallback for unavailable event posters
* Seeded dataset containing **1,500 generated events**

## 🛠️ Technology Stack

### Frontend

* React 19
* Vite
* React Router
* Axios
* Tailwind CSS
* Socket.IO Client

### Backend

* Node.js
* Express 5
* Mongoose
* JWT
* Multer
* Nodemailer
* Socket.IO

### Database

* MongoDB

### Ticket Generation

* QRCode
* html2canvas
* jsPDF

## 📁 Project Structure

```text
Event-management-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── ...
│
├── .gitignore
└── README.md
```

## ⚙️ Local Setup

### Prerequisites

Make sure the following are installed:

* Node.js 18 or newer
* MongoDB running locally or a reachable MongoDB instance
* Git

### 1. Clone the repository

```bash
git clone https://github.com/ShivamBraja123/event-management-system.git
cd event-management-system
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

Create a local environment file:

```text
backend/.env
```

**Never commit this file to GitHub.**

Example configuration:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/eventmanager
JWT_SECRET=replace-with-a-long-local-secret
CLIENT_ORIGIN=http://localhost:5173
```

`MONGODB_URI` is also supported for compatibility.

Optional SMTP configuration is available in:

```text
backend/.env.example
```

SMTP configuration is required only if email notifications are being used.

## ▶️ Running the Application

### Start the backend

Open a terminal:

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:5050
```

### Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## 🔑 Demo Accounts

The seed provides development-only demo accounts:

| Role      | Email                                                 | Password |
| --------- | ----------------------------------------------------- | -------- |
| Customer  | [customer@example.com](mailto:customer@example.com)   | password |
| Organizer | [organizer@example.com](mailto:organizer@example.com) | password |
| Admin     | [admin@example.com](mailto:admin@example.com)         | password |

> **Note:** These credentials are intended for local development and demonstration only. Change them before using the application outside a local development environment.

## 🔌 API

The backend provides the following major API modules:

| Endpoint             | Purpose                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `/api/auth`          | Authentication and user accounts                                 |
| `/api/events`        | Event discovery and management                                   |
| `/api/registrations` | Registrations, tickets, participants, check-ins, and CSV exports |
| `/api/reviews`       | Event reviews and ratings                                        |
| `/api/admin`         | Event moderation and user management                             |
| `/api/stats`         | Recommendations and dashboard statistics                         |
| `/api/health`        | Backend health check                                             |

Authentication uses JWT bearer tokens.

## 🌱 Database Seeding

To populate the application with the generated dataset:

```bash
cd backend
npm run seed
```

The seed process is designed to be safely rerunnable.

It refreshes generated records associated with the internal seed configuration while preserving existing application data and the three demo accounts.

### Generated Dataset

The current dataset contains:

* **1,500 generated events**
* **100 events per supported category**
* Realistic organizer activity
* Customer activity
* Event registrations
* QR ticket data
* Event reviews
* Category-specific event posters

Generated event posters use public Unsplash image URLs.

The frontend loads event images lazily and uses:

```text
frontend/public/placeholder.svg
```

as a client-side fallback when an image cannot be loaded.

## 🔄 Application Flow

```text
Customer
   │
   ├── Browse Events
   ├── Search / Filter
   ├── Register
   ├── Receive Digital Ticket
   ├── QR Code Check-in
   └── Review Event
            │
            ▼
       Event Platform
            │
     ┌──────┴──────┐
     ▼             ▼
 Organizer       Admin
     │             │
     ├── Manage    ├── Review Events
     │   Events    ├── Approve / Reject
     ├── View      └── Manage Users
     │   Participants
     ├── Check-in
     └── Export CSV
```

## 🔒 Security

The project includes:

* JWT authentication
* Role-based authorization
* Password hashing
* Environment-based secrets
* Protected API routes
* `.env` exclusion through `.gitignore`
* Dependency and build-output exclusions
* No real credentials committed to the repository

## 🧪 Validation & Limitations

### Requirements

* MongoDB must be available before starting the backend.
* SMTP configuration is required for email notifications.

### Current limitations

* Email notifications depend on external SMTP configuration.
* Public event images depend on the availability of the remote image service.
* The project is configured primarily for local development and demonstration.
* It is not currently presented as a production-hosted service.

## 📌 Project Status

**Status: Completed**

The repository contains the complete EventManager application, including the frontend, backend, database models, authentication, event management, registrations, ticket generation, reviews, administration, real-time features, and generated event dataset.

## 📄 License

This project is licensed under the **MIT License**.

## 👨‍💻 Author

**Shivam Bhudhiraja**

GitHub: [ShivamBraja123](https://github.com/ShivamBraja123)
