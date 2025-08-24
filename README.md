# 🎨 Agent Management Frontend

A modern **React + Vite** frontend for managing agents, lists, and distributions.  
This app provides a **secure, responsive, and user-friendly interface** for the backend API, with full authentication, dashboard analytics, and file upload support.

---

## ✨ Features

### 🔑 Authentication
- Login/Logout flow with JWT verification
- Session management with **token validation** on refresh
- Clear error handling (expired session, user deletion, forbidden access)

### 📊 Dashboard
- Displays agent-specific statistics
- List distribution and status tracking
- Real-time updates from backend APIs

### 🗂️ File & List Management
- Upload **CSV/Excel** files
- Distribute records to agents
- Track list items and update statuses

### 🎨 UI/UX
- Built with **TailwindCSS v4** for modern styling
- Gradient loading screens & responsive layouts
- Icons via **Lucide React**
- Smooth navigation with **React Router v7**

### 🧑‍💻 Developer Experience
- ⚡ Powered by **Vite** (blazing-fast dev & builds)
- Hot Reload enabled
- ESLint pre-configured
- Modular React component structure

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite  
- **Styling:** TailwindCSS v4  
- **Routing:** React Router v7  
- **State & API:** Axios + LocalStorage  
- **Icons:** Lucide React  
- **Linting:** ESLint  

---

## 📂 Project Structure

```
frontend/
│── public/ # Static assets
│── src/
│ ├── components/
│ │ ├── Auth/ # Login/Logout components
│ │ ├── Dashboard/ # Dashboard UI & widgets
│ │
│ ├── utils/
│ │ ├── api.js # Axios API wrapper
│ │
│ ├── App.js # Root app with auth flow
│ ├── main.jsx # Vite entry point
│
│── package.json
│── tailwind.config.js
│── vite.config.js
```


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Mukeshpandey0286/agent-management-frontend.git
cd agent-management-frontend
```
### 2️⃣ Install dependencies
```
npm install
```
### 3️⃣ Configure Environment Variables

Create a .env file in the root:
```
VITE_API_URL=http://localhost:5000/api
```

### 4️⃣ Run the app
# Development
```
npm run dev
```
# Production build
```
npm run build
```
# Preview build
```
npm run preview
```
## 🔑 Authentication Flow

User logs in → JWT token + user info stored in localStorage

On app load → frontend verifies token with backend (/auth/verify-token)

If valid → Dashboard is shown

If invalid/expired → User is logged out automatically

### 📊 Example Screens

Login Screen: Simple login with error handling

Dashboard: Displays stats, lists, and agent details

File Upload: Upload CSV/Excel and distribute records

## 🚀 Future Improvements

 Dark mode toggle 🌙

 Role-based dashboards (Admin vs Agent views)

 Drag-and-drop file uploads

 Toast notifications for better UX

 Offline mode with service workers

## 🤝 Contributing

Contributions are welcome!
If you'd like to improve this project, fork the repo and submit a PR.

✨ This frontend pairs with the Agent Management Backend
.
Together, they form a production-ready fullstack system for agent & resource management.
