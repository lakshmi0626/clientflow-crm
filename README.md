# ClientFlow CRM — IT & Software Company Edition

A React + Vite frontend and Java Spring Boot REST API CRM starter, configured for a clean company workspace.

## Included
- Dashboard metrics calculated from API/database records
- Lead create/list/search/filter, status updates, edit API, and delete
- Customer create/list/search, update API, and delete
- Follow-up task create/list
- Required field/email validation and readable API errors
- Duplicate email protection for leads and customers
- Persistent file-backed H2 database (records remain after backend restart)
- PostgreSQL profile example for deployment planning
- No unrelated demo people are inserted automatically

> Production readiness note: this is a local/client-demo-ready starter, not a fully secured production deployment. Before handling real customer data, add authentication and role-based authorization, HTTPS, backups, audit logs, secret management, monitoring, privacy/compliance review, and deployment hardening. The default local H2 database is not intended for multi-user production use.

## Requirements
- Java 17 or newer (the project's Maven configuration targets Java 17)
- Node.js 20+ and npm
- Maven installed (the included `mvnw.cmd` delegates to the installed Maven command)

## Windows setup
1. Extract the ZIP to a folder such as `C:\Projects\clientflow_crm`.
2. Open PowerShell in the extracted `backend` folder.
3. Run `mvn spring-boot:run` (or `..\backend\mvnw.cmd spring-boot:run` if the Maven command is available).
4. Keep the backend terminal open. It should start on `http://localhost:8080`.
5. Open a second PowerShell terminal in the `frontend` folder.
6. Run `npm install` once, then `npm run dev`.
7. Open the Vite URL shown, usually `http://localhost:5173`.

## Database persistence
By default, H2 stores data in `backend/data/clientflow.mv.db`. The `backend/data` directory is created as the app writes to it. Back up this file while the backend is stopped. Do not commit the database file to source control.

H2 console (local development only): `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/clientflow;AUTO_SERVER=TRUE`
- Username: `sa`
- Password: leave blank

## Useful API endpoints
- `GET /api/dashboard`
- `GET, POST /api/leads`
- `PUT, DELETE /api/leads/{id}`
- `PATCH /api/leads/{id}/status`
- `GET, POST /api/customers`
- `PUT, DELETE /api/customers/{id}`
- `GET, POST /api/tasks`

Frontend API base defaults to `http://localhost:8080/api`. Override with `VITE_API_BASE_URL` if needed.

## PostgreSQL profile
The `postgres` profile is a configuration example. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` securely before running it. Never commit production credentials.

## Basic manual verification
1. Start backend and frontend using the steps above.
2. Add a lead with a unique valid email; verify it appears under Leads.
3. Change its stage; verify dashboard stage totals change.
4. Add a customer with a unique valid email; verify it appears under Customers.
5. Try the same email again; expect a helpful duplicate-email message.
6. Stop and restart backend; verify records remain.
7. Delete a test record and verify it disappears.

## Important
Do not use real personal/customer data until access control, security, backup, and privacy requirements have been reviewed and implemented.
