# Contributions

| Name | GitHub | Role | Contribution |
|------|--------|------|-------------|
| Zhomart | @zhomart77m | Full-stack Developer | Project architecture, backend API (Express, SQLite, JWT, bcrypt), all REST endpoints, filtering/sorting logic, Jest + Supertest test suite, React frontend, routing, CSS design system, Kanban board with drag-and-drop, Dashboard with stats, dark mode |

## Work breakdown

### Backend
- Designed SQLite schema (`users`, `tasks` tables with FK constraint)
- Implemented JWT authentication: register, login, `/me` endpoint
- Built task CRUD API with search, status/priority/date-range filters, 6 sort modes
- Wrote 20 automated tests (auth flows, task isolation, CRUD, auth guards)
- Used Node.js 24 built-in `node:sqlite` — no native compilation needed

### Frontend
- React 19 + Vite 6, plain CSS (no UI libraries)
- Pages: `/login`, `/register`, `/tasks`, `/tasks/new`, `/tasks/:id/edit`, `/board`, `/dashboard`
- Drag-and-drop Kanban board (HTML5 Drag API)
- Dashboard with task statistics and completion progress bar
- Dark mode toggle (persisted in localStorage)
- Responsive layout, system font stack, deliberate 3-color palette
