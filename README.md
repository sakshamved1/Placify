# Placify — AI-Powered Student Placement & Job Aggregator Portal

Placify is a production-ready, full-stack placement portal that streamlines student job searches, recruiter listings, and campus administration through real-time communication, cloud resume parsing, and advanced generative AI alignment checks.

---

## 🏗️ System Architecture & Tech Stack

Placify is designed as a decoupled client-server architecture:

```
                  ┌───────────────────────────────┐
                  │      React SPA (Vite)         │
                  │   Tailwind CSS / Lucide Icons │
                  └───────────────┬───────────────┘
                                  │ HTTPS / WebSocket (Socket.io-client)
                                  ▼
                  ┌───────────────────────────────┐
                  │      Node / Express API       │
                  │   JWT Auth & Mongoose Models  │
                  └──────┬────────┬────────┬──────┘
                         │        │        │
      ┌──────────────────┘        │        └──────────────────┐
      ▼                           ▼                           ▼
┌───────────┐               ┌───────────┐               ┌───────────┐
│  MongoDB  │               │ Gemini AI │               │Cloudinary │
│  Cluster  │               │   v2.5    │               │  Storage  │
└───────────┘               └───────────┘               └───────────┘
```

### Frontend (Client)
* **Framework**: React 18+ powered by Vite (optimized production bundler)
* **Styling**: Vanilla CSS custom themes & Tailwind CSS grid systems
* **State & Routing**: React Router DOM, React hooks, and context-based state wrappers
* **Icons & UI**: Lucide React for iconography & high-density layout cards

### Backend (Server)
* **Runtime**: Node.js & Express.js REST API
* **Database**: MongoDB Atlas via Mongoose ODM
* **Authentication**: JSON Web Tokens (JWT) inside HTTP authorization headers
* **Real-time Engine**: Socket.io for recruiter-to-student updates on the application board
* **AI Engine**: Google Gen AI SDK utilizing the `gemini-2.5-flash` model
* **Media Pipelines**: Multer memory storage & Cloudinary SDK for secure PDF resume hosting

---

## ⚡ Core Platform Capabilities

### 1. Live Adzuna Indian IT Jobs Fetcher (w/ Dynamic Normalization)
* Fetches computer science and IT positions in India (`in` country code) directly from the Adzuna API.
* Normalizes salary parameters to Lakhs Per Annum (LPA) formats.
* Automatically falls back to 12 pre-seeded, high-quality local placements (Flipkart, Paytm, Swiggy, Zomato, Zoho, etc.) if credentials are not configured or rate-limited.
* Automatically distinguishes external listings and redirects applicants directly to Adzuna referral apply pages (`Apply on Adzuna ↗`), bypassing local resume requirements.

### 2. Gemini AI Candidate-to-Job Scorer
* Implements direct semantic comparison between the student's listed skills and the parsed job requirements.
* Returns a compatibility score (0-100), detailed fit strengths, required skill gap highlights, and resume tailoring suggestions.

### 3. Real-Time Application Tracking Board
* Interactive Kanban layout tracking progression stages: `Applied`, `Shortlisted`, `Interview`, and `Selected`.
* Utilizes WebSocket channels to broadcast recruiter stage updates, note edits, and placement announcements instantly.

---

## 🚀 Setup & Installation Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local server or Atlas cloud cluster connection string)
* [Cloudinary Account](https://cloudinary.com/) (For resume uploads)
* [Google Gemini API Key](https://aistudio.google.com/)
* [Adzuna Developer Account](https://developer.adzuna.com/) (For live Indian IT job aggregation)

---

### Step 1: Clone and Restore Dependencies

Extract/clone the project and restore packages for both the client and server:

```bash
# Install server packages
cd server
npm install

# Install client packages
cd ../client
npm install
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `/server` directory and add the following keys:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.dbfpigm.mongodb.net/Placify?retryWrites=true&w=majority
JWT_SECRET=your_jwt_signature_secret_key

# Google Gemini AI Config
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Config (Required for resume uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Adzuna API Config (For Indian IT Jobs aggregation)
# If left blank, database will fallback to seeding high quality mock IT jobs (Flipkart, Zoho, Paytm, etc.)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

---

### Step 3: Run the Servers Locally

Placify runs concurrently in local development mode:

```bash
# Start backend server (listening on port 5000)
cd server
npm start

# Start frontend Vite server (listening on port 5173)
cd ../client
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 👤 Seeding & Test Credentials

The database automatically seeds on startup if the tables are empty or if job counts fall below 50. Use the following default accounts to test:

| User Role | Email Address | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `student@placify.com` | `password123` | Upload resume, search jobs, analyze AI fit, track applications |
| **Recruiter** | `recruiter@placify.com` | `password123` | Create listings, manage candidate stages, add assessment notes |
| **Admin** | `admin@placify.com` | `password123` | View central system analytics and portal aggregates |

---

## 🛠️ Developer Verification & Build Commands

Before pushing changes to staging, run the following compilation scripts to check for bundler warnings or static typing issues:

```bash
# Build Client Production Bundle
cd client
npm run build
```
This compiles the code into static files in `/client/dist` and verifies that no syntax warnings or import mismatches exist.

---

## 📂 Codebase Directory Layout

```
Placify/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Shared UI Components (Navbar, ProtectedRoute)
│   │   ├── pages/              # Portal Pages (JobPortal, ApplicationTracking, StudentDashboard)
│   │   ├── App.jsx             # React Core Routing Mapping
│   │   ├── main.jsx            # DOM Renderer Boot
│   │   └── index.css           # Styling Tokens & Theme overrides
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express.js API Backend
│   ├── models/                 # Mongoose Database Models (User, Job, Application)
│   ├── routes/                 # Express Endpoint Router (Auth, Jobs, Applications)
│   ├── server.js               # Application Entrance (Boot listener & WebSocket handler)
│   └── package.json
│
└── README.md                   # System Documentation
```

---

## 🔍 Troubleshooting

### 1. EADDRINUSE: port already in use (5000 / 5173)
If you encounter a port overlap, clear active processes on those specific ports using PowerShell (Windows):
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
```

### 2. Missing Resume Uploads Fallback
If Cloudinary credentials are not defined in the `.env` file, the server automatically prints a warning console line and falls back to saving uploaded resume PDFs locally to a `/uploads` folder, keeping functionality offline-ready.
