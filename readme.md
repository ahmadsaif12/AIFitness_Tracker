<div align="center">

# 🏃 FitTrack

**Log meals. Track workouts. Hit your daily goals.**

A clean fitness tracker built with React, TypeScript and Tailwind CSS.
No backend needed. Everything runs in your browser.

</div>

---

## ✨ Features

- 🎯 **Onboarding:** set your age, weight, height, goal and daily calorie targets
- 📊 **Dashboard:** calories in vs. out, active minutes, BMI and a weekly chart
- 🍽️ **Food Log:** add meals, quick-add by meal type, delete entries
- 📸 **AI Food Snap:** upload a meal photo and get a calorie estimate (demo)
- 🏋️ **Activity Log:** quick-add workouts with automatic calorie estimates
- 👤 **Profile:** edit your details, see your stats, log out
- 🌗 **Dark and light mode**, on desktop and mobile

## 🛠️ Built with

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7

## 🚀 Quick start

```bash
cd frontend
npm install
npm run dev
```

Open the link Vite shows in your terminal (usually `http://localhost:5173`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run lint` | Check the code |

> Needs Node.js 20.19+ or 22.12+.

## 📁 Project structure

```
frontend/
├── public
│   └── favicon.svg                # Browser tab icon
├── src
│   ├── assets
│   │   ├── assets.ts              # Dummy data, quick activities, meal options, labels and helper functions
│   │   └── mockApi.ts             # Fake backend API that saves data in localStorage
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