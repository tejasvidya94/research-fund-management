# Research Fund Management System (CURAJ Research Portal)

A comprehensive web application designed to streamline the management of research funds, projects, and resource allotment. This system facilitates the workflow between Professors, Heads of Departments (HOD), Deans, R&D Department, Finance Department, and the Vice Chancellor.

## Features

- **Role-Based Access Control:** Secure login with specific dashboards for:
  - **Professors:** Manage research projects and submit resource allotment requests.
  - **Approvers (HOD, Dean, R&D, Fund Dept, VC):** Review and approve/reject proposals and requests.
- **Project Management:** Create, track, and manage research projects.
- **Resource Allotment:** Submit and track status of resource allotment requests.
- **Dashboard Analytics:** Visual statistics and charts for project status and funding.
- **Responsive Design:** Modern UI built with Tailwind CSS.

## Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (powered by [Vite](https://vitejs.dev/))
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
- **Charts:** [Recharts](https://recharts.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (via `sqlite` and `sqlite3`)
- **Authentication:** JWT (JSON Web Tokens) with `bcrypt` for password hashing.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

Clone the repository and navigate to the project directory.

#### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your variables (defaults are usually fine for local development):
```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here
```

Start the backend server:

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```
The server will start on `http://localhost:5000`.

#### 2. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```
The application will usually run on `http://localhost:5173`.

## Usage

1. **Start both servers** (Backend on port 5000, Frontend on port 5173).
2. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
3. **Sign Up:** On the landing page, use the "Sign Up" form to create a new account. You can select your designation (Professor, HOD, Dean, etc.) which will determine your access rights and dashboard view.
4. **Login:** Once registered, use the "Sign In" form to access the portal.

## Project Structure

```
├── backend/                # Express server and database
│   ├── routes/             # API routes (Auth, etc.)
│   ├── database.js         # SQLite connection and initialization
│   ├── server.js           # Entry point
│   └── ...
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page components (Dashboard, etc.)
│   │   ├── utils/          # Helper functions and storage
│   │   └── App.jsx         # Main application component with routing
│   └── ...
└── ...
```

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the ISC License.
