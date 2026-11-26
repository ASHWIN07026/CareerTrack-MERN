# CareerTrack-MERN – Job Application Tracking System

A full-stack job application tracker built with the MERN stack (MongoDB, Express.js, React, Node.js). CareerTrack keeps every application, interview and offer in one responsive dashboard, and its statistics are computed live from MongoDB.

![Desktop dashboard](docs/screenshots/desktop-dashboard.png)

## Features

**Dashboard**
- Live statistics from MongoDB: total applications plus Saved, Applied, Interview, Offer, Selected and Rejected counts
- Click any statistic card to filter the list by that status
- Upcoming interviews panel with relative dates ("Tomorrow", "In 3 days")

**Application management (full CRUD)**
- Add, view, edit and delete job applications
- Company, job title, status, location, work mode, employment type, salary, job posting URL
- Application date and interview date/time tracking
- Free-form notes for each application
- Delete confirmation dialog and success/error notifications

**Search, filter and sort**
- Case-insensitive search across company and job title (debounced)
- Status filter
- Sort by newest, oldest, application date, interview date or company

**User experience**
- Mobile-first responsive layout for Android phones, tablets and desktops (bottom-sheet dialogs on phones)
- Loading skeletons, spinners, error states with retry, and empty states
- Client-side and server-side form validation with field-level messages
- Keyboard and screen-reader friendly (labelled controls, focus management, `Esc` closes dialogs)

## MERN stack

| Layer | Technology |
| --- | --- |
| Database | MongoDB Atlas, Mongoose 8 |
| Backend | Node.js 20+, Express 5, express-validator, Helmet, CORS, Morgan |
| Frontend | React 19, Vite, JavaScript, HTML5, CSS3 |
| Testing | Node test runner, Supertest, mongodb-memory-server |
| Tooling | npm, oxlint, GitHub Actions |

## Architecture

```
┌──────────────────────┐   fetch /api/*   ┌───────────────────────────┐   Mongoose   ┌────────────────┐
│ React + Vite (SPA)   │ ───────────────▶ │ Express REST API          │ ───────────▶ │ MongoDB Atlas  │
│ components / hooks   │ ◀─────────────── │ routes → validation →     │ ◀─────────── │ applications   │
│ services/api.js      │       JSON       │ controllers → models      │              │ collection     │
└──────────────────────┘                  └───────────────────────────┘              └────────────────┘
```

- **Development:** Vite runs on port 5173 and proxies `/api` to the Express server on port 5000.
- **Production:** `npm run build` builds the React app into `frontend/dist`, and the Express server serves both the API and the built frontend from one origin.
- Dashboard statistics come from a MongoDB aggregation (`GET /api/applications/stats`). Nothing is hardcoded.

## Folder structure

```
CareerTrack-MERN/
├── backend/
│   ├── config/db.js                  # MongoDB connection
│   ├── controllers/applicationController.js
│   ├── middleware/
│   │   ├── errorHandler.js           # 404 + centralized error handling
│   │   └── validate.js               # express-validator rules
│   ├── models/Application.js         # Mongoose schema
│   ├── routes/applicationRoutes.js
│   ├── tests/applications.test.js    # API tests (in-memory MongoDB)
│   ├── app.js                        # Express app (middleware, routes, static frontend)
│   ├── server.js                     # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/               # Header, StatsGrid, Toolbar, ApplicationCard, ApplicationForm, Modal, ...
│   │   ├── hooks/                    # useApplications, useDebounce
│   │   ├── pages/DashboardPage.jsx
│   │   ├── services/api.js           # API client
│   │   ├── utils/                    # constants, formatting, validation
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tests/validation.test.js
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
├── docs/screenshots/
├── .github/workflows/ci.yml          # Tests, lint and build on every push/PR
├── render.yaml                       # One-click Render deployment
├── package.json                      # Root helper scripts
├── LICENSE
└── README.md
```

## Installation

### Prerequisites
- Node.js 20 or newer and npm
- A MongoDB Atlas cluster (the free tier works) or a local MongoDB server

### 1. Clone the repository
```bash
git clone https://github.com/ASHWIN07026/CareerTrack-MERN.git
cd CareerTrack-MERN
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # then set MONGODB_URI in .env
npm run dev               # http://localhost:5000
```

### 3. Frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### 4. Tests, lint and production build
```bash
npm test                  # from the repository root: backend + frontend tests
npm run lint
npm run build             # installs dependencies and builds the frontend
npm start                 # serves API + built frontend on PORT (default 5000)
```

### MongoDB Atlas setup
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with a strong password.
3. Under **Network Access**, allow your IP address (or `0.0.0.0/0` for cloud hosting).
4. Click **Connect → Drivers** and copy the `mongodb+srv://...` connection string.
5. Paste it into `backend/.env` as `MONGODB_URI`, and add a database name such as `/careertrack` before the `?`.

## Environment variables

Backend (`backend/.env`):

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/careertrack` |
| `PORT` | No | API port (default `5000`) | `5000` |
| `CLIENT_ORIGIN` | No | Comma-separated origins allowed by CORS (default `http://localhost:5173`) | `https://myapp.vercel.app` |
| `NODE_ENV` | No | `development` or `production` | `production` |

Frontend (`frontend/.env`, optional):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of a separately hosted API. Leave empty when the backend serves the frontend or when using the Vite dev proxy. |

`.env` files are listed in `.gitignore`. Never commit real credentials.

## API documentation

Base URL: `/api`. Every response is JSON, shaped as `{ "success": true, "data": ... }` on success or `{ "success": false, "message": "...", "errors": [{ "field", "message" }] }` on error.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Server and database status |
| GET | `/api/applications` | List applications. Query: `search`, `status`, `sort` (`newest`, `oldest`, `applicationDate`, `interviewDate`, `company`) |
| GET | `/api/applications/stats` | Totals, per-status counts and upcoming interviews |
| GET | `/api/applications/:id` | Get one application |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/:id` | Update an application (partial updates allowed) |
| DELETE | `/api/applications/:id` | Delete an application |

### Application fields

| Field | Type | Rules |
| --- | --- | --- |
| `company` | string | Required, max 120 characters |
| `jobTitle` | string | Required, max 120 characters |
| `status` | string | `Saved` (default), `Applied`, `Interview`, `Offer`, `Selected`, `Rejected` |
| `location` | string | Max 120 characters |
| `workMode` | string | `On-site`, `Remote`, `Hybrid` or empty |
| `employmentType` | string | `Full-time`, `Part-time`, `Internship`, `Contract`, `Freelance`, `Temporary` or empty |
| `salary` | string | Max 60 characters (free text, e.g. `₹8 LPA`) |
| `jobUrl` | string | Must start with `http://` or `https://` |
| `applicationDate` | ISO date | Optional. Send `""` or `null` to clear it |
| `interviewDate` | ISO date-time | Optional. Send `""` or `null` to clear it |
| `notes` | string | Max 2000 characters |

### Examples
```bash
# Create
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"company":"Google","jobTitle":"Software Engineer","status":"Applied","applicationDate":"2026-11-20"}'

# Search and filter
curl "http://localhost:5000/api/applications?search=google&status=Applied&sort=newest"

# Statistics
curl http://localhost:5000/api/applications/stats
```

Example stats response:
```json
{
  "success": true,
  "data": {
    "total": 6,
    "byStatus": { "Saved": 1, "Applied": 1, "Interview": 1, "Offer": 1, "Selected": 1, "Rejected": 1 },
    "upcomingInterviewCount": 1,
    "upcomingInterviews": [{ "_id": "...", "company": "Google", "jobTitle": "Software Engineer", "interviewDate": "2026-11-29T08:09:40.520Z", "status": "Interview" }]
  }
}
```

Status codes: `200` OK, `201` Created, `400` validation error, `404` not found, `413` payload too large, `500` server error.

## Deployment

### Render (single service, recommended)
1. Push this repository to GitHub (already done).
2. In [Render](https://render.com), choose **New → Blueprint** and select this repository. Render reads `render.yaml`.
3. When prompted, set `MONGODB_URI` to your Atlas connection string.
4. In Atlas **Network Access**, allow `0.0.0.0/0` so Render can connect.
5. Open the generated `https://<service>.onrender.com` URL. The API and the dashboard share this origin.

Manual setup works too: Build command `npm run build`, Start command `npm start`, Health check `/api/health`.

### Separate frontend (Vercel or Netlify)
Deploy `frontend/` with the build command `npm run build` and the output directory `dist`, and set `VITE_API_URL` to your backend URL. On the backend, set `CLIENT_ORIGIN` to the frontend URL.

## Security
- Credentials live only in environment variables, and `.env` files are git-ignored.
- Input is validated on both the server (express-validator and Mongoose) and the client.
- Only whitelisted fields are saved, so unknown fields are dropped.
- Helmet security headers, a restricted CORS origin list and a 100 KB JSON body limit.
- Regex special characters in search terms are escaped.
- Server error details are logged on the server and never sent to clients.

## Screenshots

| Desktop | Mobile (Android) |
| --- | --- |
| ![Desktop dashboard](docs/screenshots/desktop-dashboard.png) | ![Mobile dashboard](docs/screenshots/mobile-dashboard.png) |
| ![Add application form](docs/screenshots/desktop-add-form.png) | ![Mobile add form](docs/screenshots/mobile-add-form.png) |
| ![Application details](docs/screenshots/desktop-details.png) | ![Mobile details](docs/screenshots/mobile-details.png) |

## Future improvements
- User authentication with per-user application data
- Interview reminders and email notifications
- Resume and cover-letter management per application
- Job portal integration (import from LinkedIn and Naukri)
- Analytics charts (applications over time, conversion rates)
- Pagination for large application lists
- CSV export and import

## Author

**Ashwin S**
GitHub: [ASHWIN07026](https://github.com/ASHWIN07026)

## License

Released under the [MIT License](LICENSE).
