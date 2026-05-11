# Team Task Manager

A professional, full-stack task management application built with React, Tailwind CSS, Node.js, Express, and PostgreSQL.

## Features
- **JWT Authentication**: Secure login and registration.
- **Role-Based Access Control (RBAC)**: 
  - **Admins**: Can create projects and tasks, assign tasks, and delete projects.
  - **Members**: Can view assigned projects and update task statuses.
- **Premium UI**: Modern dark-themed design with glassmorphism effects and smooth transitions.
- **Task Board**: Organized task management by status (Todo, In Progress, Done).

## Tech Stack
- **Frontend**: React, Tailwind CSS v4, Lucide Icons, Framer Motion, Axios.
- **Backend**: Node.js, Express, PostgreSQL, JWT, Bcrypt.

## Getting Started

### Prerequisites
- Node.js installed.
- PostgreSQL database running locally or on the cloud.

### Environment Setup
1. Create a `.env` file in the `server` directory (one has been created for you with defaults).
2. Ensure your PostgreSQL connection string in `DATABASE_URL` is correct.

### Running the Application
1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   This will start both the backend (on port 5000) and the frontend (on port 5173).

## Project Structure
- `/server`: Express backend.
- `/client`: React frontend.
- `package.json`: Root configuration for running both parts concurrently.
