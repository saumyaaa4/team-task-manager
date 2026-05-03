<div align="center">
  
# ⚡ Team Task Manager

**A production-ready, full-stack task management platform**  
built with security, scalability, and team collaboration in mind.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)

[🚀 Live Demo](#-live-demo) • [📖 API Docs](#-api-endpoints) • [⚙️ Setup](#️-local-setup) • [🤝 Contributing](#-contributing)

---

</div>

## 🧠 What is this?

> A **RESTful backend API** that powers a collaborative task management system — think Jira or Trello, but built from scratch with Node.js. Designed for teams, driven by roles, secured by JWT.

This project demonstrates:
- **Real-world authentication** with hashed passwords & signed tokens
- **Role-based access control** — not every user is equal
- **Relational data modeling** in a NoSQL environment using Mongoose
- **Clean REST API design** with proper HTTP semantics
- **Production deployment** on Railway with environment-based config

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🔐 **JWT Auth** | Stateless authentication with signup, login & token validation |
| 👥 **Role System** | Admins can create projects & assign members; Members can update tasks |
| 📁 **Project Management** | Create projects, assign team members, track ownership |
| ✅ **Task Engine** | Create, assign, update, and filter tasks by status |
| 📊 **Dashboard API** | Real-time counts — total, pending, completed & overdue tasks |
| 🌐 **REST Architecture** | Predictable, documented endpoints following REST conventions |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────┐
│              TECH STACK                     │
├──────────────┬──────────────────────────────┤
│  Runtime     │  Node.js 18.x               │
│  Framework   │  Express.js 4.x             │
│  Database    │  MongoDB + Mongoose ORM      │
│  Auth        │  JWT (jsonwebtoken + bcrypt) │
│  Deployment  │  Railway                     │
│  Env Config  │  dotenv                      │
└──────────────┴──────────────────────────────┘
```

---

## 🌐 Live Demo

🔗 **Base URL:** `https://your-app.up.railway.app`  
*(Deploy and update this link)*

Try the API instantly with curl:
```bash
# Register a new user
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123","role":"admin"}'
```

---

## 📦 API Endpoints

### 🔑 Authentication
```
POST   /api/auth/register     → Create a new account
POST   /api/auth/login        → Login & receive JWT token
```

### 📁 Projects  *(JWT required)*
```
POST   /api/projects          → Create a project        [Admin only]
GET    /api/projects          → List all projects
```

### ✅ Tasks  *(JWT required)*
```
POST   /api/tasks             → Create a task
GET    /api/tasks             → List all tasks
PUT    /api/tasks/:id         → Update task status
GET    /api/tasks/dashboard   → Get dashboard summary
```

> 🔒 All routes except `/auth` require `Authorization: Bearer <token>` header.

---

## ⚙️ Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/saumyaaa4/team-task-manager.git
cd team-task-manager/backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, PORT

# 4. Start dev server
npm run dev
```

### 🔐 Environment Variables
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskdb
JWT_SECRET=your_super_secret_key
PORT=5000
```

---

## 🗂️ Project Structure

```
backend/
├── controllers/       # Route logic
├── middleware/        # Auth & role guards
├── models/            # Mongoose schemas (User, Project, Task)
├── routes/            # API route definitions
├── index.js           # App entry point
└── .env               # Environment config (not committed)
```

---

## 🔒 Security Highlights

- ✅ Passwords hashed with **bcrypt** before storage
- ✅ JWT tokens signed with secret — never stored in DB
- ✅ Role middleware prevents privilege escalation
- ✅ Environment variables for all sensitive config
- ✅ Input validation on all endpoints

---

## 🚀 Deployment

This app is deployed on **Railway** with the following setup:

- Root Directory: `backend`
- Start Command: `node index.js`
- Environment variables configured via Railway dashboard

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/cool-thing`)
3. Commit your changes (`git commit -m 'Add cool thing'`)
4. Push and open a PR

---

<div align="center">

**Built with 💙 by [Saumya](https://github.com/saumyaaa4)**

*If this project helped you, drop a ⭐ — it means a lot!*

</div>
