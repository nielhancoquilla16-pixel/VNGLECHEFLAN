# VNGLECHEFLAN

A React + Vite + PWA web application for dessert shop management.

## Features

- ⚡ Fast development with Vite
- 🎨 Tailwind CSS for styling
- 📱 Progressive Web App (PWA) support
- 🛒 Shopping cart functionality
- 📊 Admin dashboard
- 🌐 Offline support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/hanielcoquillajr16-spec/VNGLECHEFLAN-dep.git
cd VNGLECHEFLAN-dep

# Switch into the frontend folder
cd frontend

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory (inside `frontend/`).

### Preview Production Build

```bash
npm run preview
```

## Backend (Supabase)

This repo is organized into two folders:

- `frontend/` contains the React/Vite app
- `backend/` contains a minimal Node.js + Express API that connects to Supabase

To run the backend:

```bash
cd backend
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_KEY
npm install
npm run dev
```

Then visit `http://localhost:4000/api/health` to verify it is running.

## Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions whenever you push to the `main` branch.

Live site: https://hanielcoquillajr16-spec.github.io/VNGLECHEFLAN-dep/

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Root app component
│   ├── styles/              # CSS files
│   └── main.jsx             # Entry point
├── public/                 # Static assets
├── scripts/                # Build scripts
├── package.json            # Frontend dependencies & scripts
└── vite.config.ts          # Vite config

backend/                   # (backend code lives here)
```

## License

MIT
koki