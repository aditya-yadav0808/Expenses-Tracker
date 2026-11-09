# MoneyWise – Money Manager (React frontend)

Responsive fintech dashboard with a **User panel** and an **Admin panel**.
Built with React 18 + Vite, React Router 6, Tailwind CSS 3, Recharts, React Hook Form, Axios and Lucide icons.
Data persists in a JSON file (`server/db.json`); the code is structured so a Spring Boot + PostgreSQL backend can replace it later.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

## Login accounts

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@moneywise.com   | Admin@123 |
| User  | user@moneywise.com    | User@123  |

Change these passwords from **Profile → Change password** after first login.

## Where data is saved

All accounts, transactions, budgets, goals and settings are saved in **`server/db.json`** (written by the dev/preview server in `server/dbPlugin.js`).
Passwords are stored as salted hashes. Every account created through **Register** appears in **Admin → Users** and stays there permanently.

To share the project with someone, send the whole folder **including `server/db.json`** (without `node_modules`). When they run `npm install && npm run dev` they see all the same accounts and data.
Delete `server/db.json` to start fresh; it is recreated with only the two accounts above.

> The data server only runs with `npm run dev` or `npm run preview`. A static host (Netlify, GitHub Pages) cannot save data; use a real backend for that.

## Structure

```
src/
  components/{common,charts,forms,layout}
  layouts/        UserLayout, AdminLayout, AuthLayout
  pages/{auth,user,admin}
  context/        AuthContext, AppDataContext (central data + actions), ThemeContext
  hooks/          useUserData, useFormat, useNotifications, usePagination
  services/       api.js (Axios), resources.js (REST modules), storageService.js, seedData.js
server/           dbPlugin.js (file store endpoints), db.json (your saved data)
  utils/          calculations.js (all financial maths), currency, dateUtils, csv, validators
  routes/         ProtectedRoute (role-aware), PublicOnly, RootRedirect
```

## Business rules implemented

- Totals, net cash flow, savings rate, budget usage, reports and notifications are **derived** from transactions (`utils/calculations.js`), never hardcoded.
- Budgets warn at 80% and alert when spending exceeds the limit.
- Recurring schedules are plans, not transactions. Recording a due occurrence creates a transaction tagged with `(recurringId, dueDate)`, which makes duplicate generation impossible.
- Deleting a category in use requires choosing a replacement; records are reassigned first. Admins can only deactivate global categories, which preserves history.
- Admins have read-only access to user transactions. User status, role, global category and settings changes write audit entries.

## Moving to Spring Boot

1. Set `VITE_API_BASE_URL` (see `.env.example`).
2. Implement the endpoints used in `src/services/resources.js` (models are documented at the top of that file).
3. Replace the bodies of the actions in `AppDataContext` and `AuthContext` with calls to those services.
4. Enforce authentication and roles on the server with Spring Security. Never rely on client-side role checks.
