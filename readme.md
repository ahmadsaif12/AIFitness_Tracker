<div align="center">

# 🏃 FitTrack

**Log meals. Track workouts. Hit your daily goals.**

A clean fitness tracker built with React, TypeScript, Tailwind CSS and Strapi.


</div>

---

## ✨ Features

- 🔐 **Authentication:** sign up and log in with email and password
- 🎯 **Onboarding:** set your age, weight, height, goal and daily calorie targets
- 📊 **Dashboard:** calories in vs. out, active minutes, BMI and a weekly chart
- 🍽️ **Food Log:** add meals, quick-add by meal type, delete entries
- 📸 **AI Food Snap:** upload a meal photo and get a calorie estimate from Google Gemini
- 🏋️ **Activity Log:** quick-add workouts with automatic calorie estimates
- 👤 **Profile:** edit your details, see your stats, log out
- 🌗 **Dark and light mode**, on desktop and mobile

## 🛠️ Built with

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7

**Backend:** Strapi 5 · TypeScript · SQLite

**AI:** Google Gemini (`@google/genai`)

## 🚀 Quick start

You need two terminals, one for the backend and one for the frontend.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run develop
```

Strapi runs at `http://localhost:1337`. On first run, open `http://localhost:1337/admin` and create an admin account. Then go to **Settings → Users & Permissions → Roles → Authenticated** and enable the Food Log and Activity Log actions.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_STRAPI_API_URL=http://localhost:1337
```

Open the link Vite shows in your terminal (usually `http://localhost:5173`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (frontend) |
| `npm run build` | Build for production (frontend) |
| `npm run lint` | Check the code (frontend) |
| `npm run develop` | Start Strapi with auto-reload (backend) |
| `npm run start` | Start Strapi in production mode (backend) |

> Needs Node.js 20.19+ or 22.12+.

## 🔑 Environment variables

Set these in `backend/.env`. Never commit this file.

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
JWT_SECRET=
ENCRYPTION_KEY=
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

Get a Gemini key from [Google AI Studio](https://aistudio.google.com/apikey). Keys starting with `AQ.` are the new valid format. Restart Strapi after changing `.env`.

## 🔌 API

| Method | Endpoint | What it does |
| --- | --- | --- |
| POST | `/api/auth/local/register` | Create an account |
| POST | `/api/auth/local` | Log in |
| GET, PUT | `/api/users/me`, `/api/users/:id` | Get and update profile |
| GET, POST, DELETE | `/api/food-logs` | Manage meals |
| GET, POST, DELETE | `/api/activity-logs` | Manage workouts |
| POST | `/api/image-analyze` | Analyze a food photo (form field `image`) |

## 📁 Project structure

```
backend/
├── config                         # Strapi config (database, server, admin, plugins, middlewares)
├── src
│   ├── api
│   │   ├── activity-log           # Workout content type, routes, controller, service
│   │   ├── food-log               # Meal content type, routes, controller, service
│   │   └── image-analysis
│   │       ├── controllers        # Receives the uploaded photo and returns the result
│   │       ├── routes             # POST /image-analyze
│   │       └── services
│   │           └── gemini.ts      # Sends the photo to Gemini and parses name and calories
│   └── extensions
│       └── users-permissions      # User schema with age, weight, height, goal and calorie targets
├── .env.example                   # Template for environment variables
└── package.json                   # Dependencies and npm scripts

frontend/
├── public
│   └── favicon.svg                # Browser tab icon
├── src
│   ├── assets
│   │   └── assets.ts              # Quick activities, meal options, labels and helper functions
│   ├── components
│   │   ├── ui
│   │   │   ├── Button.tsx         # Reusable button with primary, secondary and danger styles
│   │   │   ├── Card.tsx           # Rounded card container used across pages
│   │   │   ├── Input.tsx          # Labelled text and number input
│   │   │   ├── ProgressBar.tsx    # Progress bar that turns red when over the limit
│   │   │   ├── Select.tsx         # Labelled dropdown select
│   │   │   ├── Slider.tsx         # Range slider with label, unit and tooltip
│   │   │   └── Tooltip.tsx        # Small hover tooltip
│   │   ├── BottomNav.tsx          # Mobile bottom navigation bar
│   │   ├── Loading.tsx            # Full-screen loading spinner
│   │   └── Sidebar.tsx            # Desktop sidebar with links and theme toggle
│   ├── configs
│   │   └── api.ts                 # Axios instance using VITE_STRAPI_API_URL
│   ├── context
│   │   ├── AppContext.tsx         # Shared user, login, signup, logout and log data
│   │   └── ThemeContext.tsx       # Light and dark theme state
│   ├── pages
│   │   ├── ActivityLog.tsx        # Log and delete workouts, see total active time
│   │   ├── Dashboard.tsx          # Daily overview, BMI and weekly chart
│   │   ├── FoodLog.tsx            # Log and delete meals, AI Food Snap
│   │   ├── Layout.tsx             # Page shell with sidebar, bottom nav and content area
│   │   ├── Login.tsx              # Sign in and sign up page
│   │   ├── Onboarding.tsx         # Three-step profile and goal setup
│   │   └── Profile.tsx            # View and edit profile, stats and logout
│   ├── services
│   │   └── strapiApi.ts           # All calls to the Strapi backend
│   ├── types
│   │   └── index.ts               # Shared TypeScript types
│   ├── App.tsx                    # Routes and login/onboarding checks
│   ├── index.css                  # Tailwind import and shared page styles
│   └── main.tsx                   # App entry point with providers
├── index.html                     # HTML page that loads the app
├── package-lock.json              # Exact installed dependency versions
├── package.json                   # Dependencies and npm scripts
├── tsconfig.app.json              # TypeScript settings for the app code
├── tsconfig.json                  # Root TypeScript config linking the other configs
├── tsconfig.node.json             # TypeScript settings for Vite config
└── vite.config.ts                 # Vite config with React and Tailwind plugins
```

---

<div align="center">Made with 💚 for healthier days</div>