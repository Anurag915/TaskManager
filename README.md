# Ethara AI - Team Task Management System

A professional, full-stack Team Task Management application built with a modern tech stack. Features a sleek dark-themed UI with glassmorphism, robust role-based access control, and comprehensive task analytics.

## 🚀 Key Features

- **Advanced Authentication:** Secure JWT-based authentication with password hashing using Bcrypt.
- **Project Management:** Create projects, manage team members, and track project-specific progress.
- **Strict RBAC (Role-Based Access Control):**
  - **Admins:** Can manage members, create/delete tasks, and reassign tasks.
  - **Members:** Can only view and update the status of tasks specifically assigned to them.
- **Intelligent Task Tracking:** Real-time status updates, priority levels, and automatic overdue task detection.
- **Safety First:** Forced task reassignment prevents "orphaned" tasks when removing team members.
- **Analytics Dashboard:** Visual breakdown of total tasks, status progress bars, overdue alerts, and per-user workload distribution.
- **Modern UI:** Built with Next.js 15, Tailwind CSS, and glassmorphism design principles for a premium experience.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Axios, Lucide React.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose).
- **Security:** JWT (JSON Web Tokens), Bcryptjs, CORS.

---

## ⚙️ Project Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Ethara-AI
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` folder (see `.env.example` below).
- Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
- Create a `.env.local` file in the `frontend` folder (see `.env.example` below).
- Start the frontend server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 📄 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment Steps

### Backend (e.g., Render, Heroku, DigitalOcean)
1. Set up a MongoDB cluster (MongoDB Atlas).
2. Connect your repository and set the root directory to `backend`.
3. Configure environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`).
4. Set the start command to `npm start`.

### Frontend (e.g., Vercel, Netlify)
1. Connect your repository and set the root directory to `frontend`.
2. Configure the `NEXT_PUBLIC_API_URL` environment variable to point to your deployed backend URL.
3. Vercel will automatically detect the Next.js project and deploy it.

---

## 📁 Folder Structure

```text
Ethara-AI/
├── backend/            # Express Server
│   ├── config/         # DB Connection
│   ├── controllers/    # API Logic
│   ├── middleware/     # Auth & RBAC
│   ├── models/         # Mongoose Schemas
│   └── routes/         # API Endpoints
└── frontend/           # Next.js Application
    ├── public/         # Static Assets
    └── src/
        ├── app/        # Pages & Layouts
        ├── components/ # UI Components
        ├── context/    # Global State (Auth)
        └── lib/        # API Configuration (Axios)
```

---

## 🤝 Contributing
Feel free to fork this project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)
