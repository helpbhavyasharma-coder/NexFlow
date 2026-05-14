# NexFlow

NexFlow is a realtime team todo and task-management SaaS built with React, Vite, Tailwind CSS, Framer Motion, Zustand, Express, Socket.IO, Prisma, JWT auth, and PostgreSQL.

## Features

- JWT register/login/logout with refresh-token support
- Team/workspace creation, invite codes, roles, and permissions
- Realtime Kanban task board with Socket.IO synchronization
- Unique `Start Working` flow that prevents duplicate task overlap
- Comments, typing indicators, notifications, activity timeline, online presence
- Attachments via Multer with Cloudinary/S3-ready service boundary
- Analytics dashboard powered by Recharts
- Dark/light theme with persisted preference
- Responsive glassmorphism SaaS UI
- Docker and environment-variable ready setup

## Quick Start

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Docker

```bash
cp .env.example .env
docker compose up --build
```

After containers start, run Prisma migration/seed inside the server container if needed:

```bash
docker compose exec server npm run prisma:push
docker compose exec server npm run seed
```

## Demo Users

- `bhavya@nexflow.dev` / `password123`
- `harleen@nexflow.dev` / `password123`

## Production Notes

- Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values.
- Use managed PostgreSQL with SSL.
- Put the Express app behind HTTPS reverse proxy.
- Configure object storage in `apps/server/src/services/upload.service.js`.
- Restrict `CLIENT_URL` and CORS origins.
- Run `npm run build` before deployment.
