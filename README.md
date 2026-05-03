# Team Task Manager (Full-Stack Backend)

## 🚀 Features
- JWT Authentication (Signup/Login)
- Role-Based Access (Admin / Member)
- Project Management (Create & Assign Members)
- Task Management (Assign, Update Status)
- Dashboard (Total, Pending, Completed, Overdue Tasks)

## 🛠 Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

## 📦 API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Projects
- POST /api/projects (Admin only)
- GET /api/projects

### Tasks
- POST /api/tasks
- GET /api/tasks
- PUT /api/tasks/:id
- GET /api/tasks/dashboard

## 🌐 Live URL
(Add your Railway link here)

## ⚙️ Setup

```bash
git clone <repo>
cd backend
npm install
npm run dev
