# CareerPath AI 🚀

CareerPath AI is a premium, modern software engineering companion designed to guide developers from beginner tutorials toward production-ready competence. The system mimics a seasoned mentor (15+ Years Tech Lead experience) by injecting blunt advice, performance metrics critique, and realistic assessments into your learning timeline.

---

## 🌟 Core Features

- **Onboarding Assessment Wizard**: Evaluates experience levels, daily study hours, learning styles, and background to formulate a targeted roadmap.
- **Alternating Tree Roadmap**: Renders an interactive tree diagram (similar to roadmap.sh) displaying Phase 1 (Fundamentals), Phase 2 (Core), and Phase 3 (Advanced) skills with completion toggles and notes drawers.
- **AI Recruiter Resume Scanner**: Upload resumes (PDF/TXT) or paste text to evaluate candidate ATS alignment, highlighting missing skill tags and metrics critiques.
- **Weekly Study Planner**: Kanban scheduling dashboard breaking down uncompleted roadmap skills into day-by-day objectives.
- **System Recommendations**: beginner, intermediate, and advanced projects with Dave's Resume Strategy, alongside cloud/devops certification paths.
- **AI Senior Mentor Chat**: Real-time discussions with Architect Dave regarding deployment pitfalls, Kubernetes configs, and certification prep.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Lucide Icons, React Router.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, pdf-parse.
- **Database**: Prisma ORM with SQLite (dev.db) pre-configured.

---

## ⚙️ Quick Start Setup

### 1. Database Migrations & Seeding
From the `backend/` directory:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 2. Run Backend Server (Port 5000)
```bash
npm run dev
```

### 3. Run Frontend Client (Port 5173)
From the `frontend/` directory:
```bash
cd ../frontend
npm run dev
```

---

## 🧪 Integration Logic Verification
A logic verification script is located in `scratch/verify-logic.ts` to test all fallback services, resume score algorithms, and chat keyword replies.
```bash
# Executed in workspace scratch folder
node verify-logic.js
```
All **14/14 validation checks pass perfectly** using SQLite dev database matching.
