# kopiteh

## Getting Started

First, compose the backend container:
```bash
cd backend
docker compose up --build
```
The result should be visible at localhost:4000/

To seed the database with mock values,
in another terminal:
```bash
cd backend
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```
The result should be visible at localhost:4000/stalls

Next, run the development server:

```bash
cd frontend
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.