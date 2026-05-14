# NexFlow Deployment: Railway Backend + Hostinger Frontend

This guide is for deploying the complete GitHub repo to Railway for the Node.js backend and uploading the frontend `dist` folder to Hostinger.

## Architecture

- Backend API + Socket.IO: Railway
- PostgreSQL: Railway PostgreSQL plugin
- Frontend static site: Hostinger public_html
- File uploads: local uploads for demo; use Cloudinary/S3 for production persistence

## 1. Push Full Project to GitHub

It is okay to push the complete monorepo to GitHub. Railway will run only the backend using `railway.json`, and Hostinger will use only the built frontend `dist` folder.

```bash
git init
git add .
git commit -m "Deploy NexFlow"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Do not commit `.env`.

## 2. Create Railway Project

1. Open Railway.
2. Create New Project.
3. Select Deploy from GitHub repo.
4. Choose your NexFlow repository.
5. Railway will detect `railway.json` from the root.

The root repo can stay as-is. `railway.json` uses:

```text
Build: npm install && npm run db:generate && npm run build -w apps/server
Start: npm start -w apps/server
```

## 3. Add PostgreSQL on Railway

1. In Railway project, click New.
2. Add PostgreSQL.
3. Railway will provide a `DATABASE_URL` variable.
4. Make sure the backend service can access that variable.

## 4. Railway Backend Environment Variables

Add these variables in the Railway backend service:

```env
DATABASE_URL=Railway PostgreSQL DATABASE_URL
JWT_ACCESS_SECRET=use-a-long-random-secret
JWT_REFRESH_SECRET=use-another-long-random-secret
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

Railway automatically provides `PORT`, so you do not need `SERVER_PORT` in production.

## 5. Push Prisma Schema to Railway Database

After Railway PostgreSQL is connected, open Railway backend service shell or run locally with the Railway database URL in `.env`:

```bash
npm run db:push
npm run db:seed
```

If you run from local PC, set `.env` `DATABASE_URL` to the Railway PostgreSQL URL temporarily.

## 6. Get Railway Backend Public URL

Railway will provide a backend domain like:

```text
https://nexflow-production.up.railway.app
```

Test health endpoint:

```text
https://nexflow-production.up.railway.app/health
```

Expected response:

```json
{"status":"ok","name":"NexFlow API"}
```

## 7. Build Frontend for Hostinger

Use the included template:

```text
apps/client/production.env.example
```

Then create this real local build file:

```text
apps/client/.env.production
```

Add your Railway backend URL:

```env
VITE_API_URL=https://nexflow-production.up.railway.app/api
VITE_SOCKET_URL=https://nexflow-production.up.railway.app
```

Then build:

```bash
npm run build -w apps/client
```

Your Hostinger upload folder is:

```text
apps/client/dist
```

Upload all files inside `dist` to Hostinger `public_html`.

## 8. Hostinger SPA Routing Setup

For React Router refresh support, create this file inside Hostinger `public_html`:

```text
.htaccess
```

Content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 9. Update Railway CLIENT_URL

After Hostinger domain is live, update Railway backend variable:

```env
CLIENT_URL=https://yourdomain.com
```

Redeploy backend after changing it.

## Important Notes

- Rendered frontend `dist` contains the backend URL at build time. If your Railway URL changes, rebuild frontend and re-upload `dist`.
- Railway free/trial limits may apply.
- For production file uploads, replace local Multer storage with Cloudinary/S3 because Railway filesystem is not permanent.
- Do not upload `.env` to GitHub or Hostinger.
