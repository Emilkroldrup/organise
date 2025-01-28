# Organiser App

## 🛠 Project Overview

An all-in-one **organiser application** with task management, calendar integration, notes, focus timers, and collaboration features.

### **Tech Stack**

- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend:** Rust (Axum/Actix)
- **Database:** MongoDB
- **Real-time & Offline:** WebAssembly (Wasm) + WebSockets
- **Authentication:** JWT / OAuth

---

## 📌 Roadmap

### **Base Structure & Setup**

- [ ] **GitHub Repo & Initial Setup**  
  - Init repo & add `.gitignore`
  - Create `README.md` (this file!)
  - Define folder structure for frontend & backend

- [ ] **Frontend Setup (Next.js + Tailwind)**  
  - Init Next.js
  - Install Tailwind & configure global styles
  - Create base layout & routing system

- [ ] **Backend Setup (Rust + API + Database)**  
  - Init Rust backend (Actix/Axum)
  - Setup database (PostgreSQL or SQLite)
  - Implement API route structure

---

### **Frontend Features**

- [ ] **Task Management (To-Do App)**  
  - UI for task list
  - Add, edit, delete tasks
  - Task prioritization (Low, Medium, High)
  - Drag-and-drop for task reordering

- [ ] **Calendar & Scheduling**  
  - UI for calendar
  - Create, edit, delete events
  - Color-coded events
  - Integration with external calendars (Google, Outlook)

- [ ] **Additional UI Components**  
  - Focus Timer (Pomodoro) UI
  - Goal & habit tracking section
  - Notes section with Markdown support

---

### **Backend Features**

- [ ] **Task Management API**  
  - Create task model & schema
  - CRUD API for tasks
  - Task prioritization logic
  - Task sorting & organization

- [ ] **Calendar API**  
  - Create event model & schema
  - CRUD API for calendar events
  - External calendar sync (Google, Outlook)

- [ ] **Collaboration & User Management**  
  - Real-time sync with WebSockets
  - Shared tasks & calendar permissions
  - User roles (Admin, Member, Viewer)

---

### **WebAssembly Integrations (Performance Optimizations & Offline)**

- [ ] Optimize real-time sync with Wasm
- [ ] Use Wasm for offline data storage & sync
- [ ] Markdown parsing in-browser with Wasm

---

### **Future Enhancements**

- [ ] Gamification (Achievements, streaks, rewards)
- [ ] Push Notifications & Reminders
- [ ] Data export (CSV, Excel)
- [ ] Mobile App Companion (React Native?)
- [ ] API Documentation & Testing

---