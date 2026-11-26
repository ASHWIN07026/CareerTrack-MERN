CareerTrack-MERN – Job Application Tracking System

A full-stack Job Application Tracking System built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). CareerTrack helps users organize job applications, monitor recruitment progress, manage interviews, and track career opportunities through a centralized dashboard.

Features

Dashboard

- Total job applications
- Saved applications
- Applied applications
- Upcoming interviews
- Offers and selected applications
- Rejected applications
- Dynamic statistics from MongoDB

Job Application Management

- Add new job applications
- View application details
- Edit existing applications
- Delete applications
- Store company and job information

Application Tracking

Track applications using these statuses:

- Saved
- Applied
- Interview
- Offer
- Selected
- Rejected

Job Details

- Company name
- Job title
- Location
- Employment type
- Salary information
- Application date
- Job application URL
- Interview date
- Application status
- Personal notes

Search and Filtering

- Search by company name
- Search by job title
- Filter by application status
- Sort applications by date

User Interface

- Responsive dashboard
- Mobile-friendly design
- Application status indicators
- Form validation
- Loading indicators
- Error and success messages
- Empty-state handling

Technology Stack

Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3

Backend

- Node.js
- Express.js
- REST API

Database

- MongoDB Atlas
- Mongoose

Development Tools

- Git
- GitHub
- npm

Project Structure

CareerTrack-MERN/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md

Installation and Setup

Prerequisites

- Node.js and npm
- MongoDB Atlas account
- Git

1. Clone the repository

git clone https://github.com/ASHWIN07026/CareerTrack-MERN.git
cd CareerTrack-MERN

2. Backend setup

cd backend
npm install

Create a ".env" file:

PORT=5000
MONGODB_URI=your_mongodb_connection_string

Start the backend:

npm run dev

3. Frontend setup

Open another terminal:

cd frontend
npm install
npm run dev

Use the development URL displayed by Vite.

REST API Endpoints

Method| Endpoint| Description
GET| /api/applications| Get all applications
GET| /api/applications/:id| Get one application
POST| /api/applications| Create application
PUT| /api/applications/:id| Update application
DELETE| /api/applications/:id| Delete application

Dashboard statistics should be calculated using actual database records.

Security

- Store database credentials in environment variables.
- Never commit ".env" files.
- Ignore "node_modules".
- Validate incoming API requests.
- Handle server errors securely.

Future Improvements

- User authentication
- Interview reminders
- Email notifications
- Resume management
- Job portal integration
- Application analytics
- Deployment with a public URL

Author

Ashwin S

GitHub: https://github.com/ASHWIN07026

License

This project is intended to be released under the MIT License.