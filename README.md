# EduSmart — School Dashboard

React + Vite implementation of the supplied EduSmart school dashboard reference.

## Run

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
npm run preview
```

## Backend endpoint location

Put your backend base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The API client is centralized in:

`src/services/api.js`

Example:

```js
import { api } from './api'

const students = await api.get('/students')
```

Authentication is centralized in:

- `src/services/authService.js`
- `src/contexts/AuthContext.jsx`

Replace the mock login inside `authService.js` with your real login endpoint. The rest of the UI can keep calling `authService.login(...)` and `api.get/post/...`.

## Roles

Mock accounts are included for development:

- `admin@edusmart.test` / `admin123` → Administrator
- `teacher@edusmart.test` / `teacher123` → Guru
- `student@edusmart.test` / `student123` → Siswa

Role navigation is defined in:

`src/config/navigation.js`

Change permissions there when your backend roles are finalized.

## Project structure

```text
src/
├── components/
│   ├── layout/
│   └── ui/
├── config/
├── contexts/
├── data/
├── pages/
├── services/
└── styles/
```

The project deliberately avoids putting the entire application in one `page.jsx`. Pages, reusable components, mock data, authentication, API calls, and styling are separated so it is easier to connect to a real backend later.
