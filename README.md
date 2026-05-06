# 🌌 Employee Management System (EMS)

A futuristic, high-performance full-stack enterprise portal designed to handle corporate administration, department allocations, and leave coordination. Featuring a stunning glassmorphic design, advanced SVG interactive charts, persistent theme control, and enterprise-grade role-based security.

---

## 🚀 Key Features

### 📊 1. Real-Time Glassmorphic Dashboard & SVG Charts
* **Role-Based Perspectives:** Admins see company-wide metrics (headcount, pending requests, active team ratios). Standard employees receive a highly personalized summary (personal leave count, approval status, teammate listings).
* **Interactive Data Visualization:** Custom SVG Bar and Donut Charts representing headcount by department and leave category distribution, complete with hover animations and live tooltips.

### 📢 2. Cosmic Announcement Board
* **Company Broadcast Feed:** Real-time priority notifications displayed at the top of every dashboard.
* **Admin Publishing Console:** Dedicated management dashboard for Admins to easily compose, publish, and delete global system-wide notices.

### 📄 3. Interactive Payslip Generator
* **Rupees (₹) Format Integration:** Automatic localized Indian Rupee pricing across all financial metrics using internationalized `en-IN` formatting.
* **Dynamic Breakdown:** Full calculation of basic pay, house rent allowance (HRA), provident fund (PF) deductions, and net salary.
* **One-Click PDF/Print Exporter:** High-contrast print styling optimized for direct paper-printing or downloading as a clean PDF payslip.

### ☀️ 4. Sunrise Theme Customizer
* One-click theme switcher available globally in user Settings.
* Smooth CSS-variable driven transition between **Nebula Mode** (a glowing deep-space cosmic dark theme) and **Solar Mode** (a high-contrast, clean sunrise-amber light theme) with complete input readability and high-contrast legends.

### 📅 5. Secure Shared Leave Calendar
* **Teammate Availability Grid:** Interactive monthly calendar showing approved leave spans to help teams coordinate.
* **Smart Privacy Masking:** Standard employees see anonymous, uniform violet `"Leave"` pills (preventing the leakage of personal reasons like Sick Leave). Admins have full access with colored indicators (Red for Medical, Blue for Vacation).

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework:** React.js (Vite)
* **Styling:** Premium Glassmorphism (Vanilla HSL CSS variables, no heavy framework wrappers)
* **Icons:** React Icons (`FaUsers`, `FaCalendarCheck`, `FaBullhorn`, etc.)
* **State Management:** React Context API (persistent dark/light modes and user states inside LocalStorage)

### **Backend**
* **Framework:** Spring Boot (Java 17)
* **Security:** Spring Security & Stateless JSON Web Tokens (JWT)
* **ORM:** Spring Data JPA / Hibernate
* **REST API:** Controller-Service-Repository architecture with active validation

### **Database**
* **Database Engine:** H2 Database (local development) / PostgreSQL (production ready)

---

## 📂 Project Structure

```text
Employee-Management-System/
│
├── EMS_Backend/           # Spring Boot REST API
│   ├── src/main/java/     # Java Source Codes (Security, Controller, Service, Entity, DTO)
│   └── pom.xml            # Maven Dependencies
│
├── react-frontend/        # Vite + React Client
│   ├── src/
│   │   ├── components/    # Reusable UI Elements (Cards, Tables, Sidebar, Navbar)
│   │   ├── context/       # Global AppContext and State Handlers
│   │   ├── pages/         # Page components (Dashboard, Employees, Calendar, Settings)
│   │   └── styles/        # CSS variables, animations, and component style sheets
│   └── package.json       # Node package manager configurations
│
├── For Reference/         # Archived static legacy web files
└── README.md              # Project Documentation

⚙️ Quick Installation & Setup
1. Prerequisites
Java SDK 17 or higher
Node.js (v16.0 or higher)
Maven (configured in your IDE)
2. Running the Spring Boot Backend
Open the /EMS_Backend folder in your preferred Java IDE (IntelliJ IDEA, Eclipse, or VS Code).
Let Maven download dependencies automatically from the pom.xml.
Locate BackendApplication.java inside src/main/java/com/ems/backend/ and click Run.
The backend server will initialize on http://localhost:8080.
3. Running the React Frontend
Open a terminal inside the /react-frontend folder and run:

bash
# Install dependencies
npm install
# Launch local development server
npm run dev
Open http://localhost:5173 in your browser.

🔒 Security & Authorization
Endpoint	HTTP Method	Allowed Roles	Purpose
/api/auth/**	POST	Anonymous	Sign in and Register accounts
/api/employees/**	GET / POST / PUT	ADMIN	Manage employee profiles
/api/leaves	GET	ADMIN / EMPLOYEE	View the shared calendar
/api/leaves/approve/**	PUT	ADMIN	Approve employee requests
/api/announcements	POST / DELETE	ADMIN	Manage company notice board
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Made with 🌌 by sanjay4114
