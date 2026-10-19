# EduNotify - Academic Notification Portal 🎓📢

EduNotify is a modern, high-aesthetic web application designed for colleges and universities to manage, broadcast, and interact with academic notifications and notice boards. 

The application is structured into two main components:
1. **Frontend**: A highly responsive, interactive SPA (Single Page Application) built using modern CSS, HTML5 semantic layout, Google Fonts (Inter, Outfit), and modular Javascript. It features built-in simulation of real-time server push alerts, custom interactive SVG analytics charts, rich-text markdown-like editor, role-based workflows (Admin, Principal, Teacher, Student), and high-fidelity dark/light mode styles.
2. **Backend (Express + PostgreSQL)**: A structured REST API server that matches the frontend architecture for production migration, featuring authentication middleware, role validation, and full database schemas for user profiles, notice registries, attachments, read tracking, and student feedback.

---

## 📂 Project Structure

```text
C:\app\
├── index.html           # Main Single Page App (SPA) mounting shell
├── css/
│   └── styles.css       # Premium responsive design system (light/dark mode, typography, glassmorphism)
├── js/
│   ├── db.js            # local-storage mock database layer (pre-seeded with default demo data)
│   ├── auth.js          # Client-side user auth state, login/signup/recovery flows
│   ├── charts.js        # Responsive SVG-based analytics chart rendering engine (No heavy external charting libs needed!)
│   ├── components.js    # UI components builder (Sidebar navigation, notifications feed cards, stats blocks)
│   └── app.js           # Main app shell controller, real-time alert simulator, routing, and form actions
└── backend/             # Express.js REST API Server
    ├── package.json     # Node.js dependencies
    ├── database/
    │   ├── schema.sql   # PostgreSQL Database tables & indices layout
    │   └── seed.sql     # Pre-loaded administrative, academic, and notification sample entries
    └── src/
        ├── server.js    # API Entry point
        ├── routes/
        │   └── api.js   # Express routing registry for authentication, notification feed, and user management
        ├── middleware/
        │   └── auth.js  # JWT (JSON Web Token) parsing & role-based validation middleware
        └── controllers/
            └── notifications.js # Noticeboard data controllers (feed builder, feedback handlers)
```

---

## ⚡ How to Run the App in VS Code

### 1. Running the Frontend (Instantly)
Since the frontend has a mock database layer built into `localStorage`, you can run it **without any backend configuration**:
1. Open the project folder `C:\app` in **VS Code**.
2. If you have the **Live Server** extension installed in VS Code:
   - Right-click `index.html` and select **"Open with Live Server"**.
3. If you do not have Live Server:
   - Double-click `index.html` in your file explorer to open it in any modern browser.

### 🔑 Default Demo User Credentials
You can log in to the portal using any of the following accounts:

| Role | Email ID | Password | Key Features to Test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` | Inspect college-wide SVG charts, approve teacher registrations, delete/add users. |
| **Principal** | `principal@college.edu` | `principal123` | Compose global alerts, pin notices, schedule announcements for later, and upload files. |
| **Teacher** | `teacher.cse@college.edu` | `teacher123` | Publish target-filtered notices (e.g., CSE Semester 6 only) and inspect notifications feed. |
| **Student** | `student.cse@college.edu` | `student123` | Browse academic circulars, leave comments/feedback on lab submission updates, and toggle dark mode. |

---

### 2. Setting Up the Production Backend (Express + PG)
To run the Node.js API server, make sure you have [Node.js](https://nodejs.org) and [PostgreSQL](https://www.postgresql.org) installed on your system:
1. Open your terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Initialize the database by importing the schema and seed data in your PostgreSQL instance:
   ```bash
   psql -U your_postgres_user -d your_database_name -f database/schema.sql
   psql -U your_postgres_user -d your_database_name -f database/seed.sql
   ```
4. Start the development server (runs nodemon):
   ```bash
   npm run dev
   ```
5. The backend server will be listening at **`http://localhost:5000/api`**.
