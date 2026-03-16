# VNGLECHEFLAN

A React + Vite + PWA web application with Supabase backend integration.

## Features

- ⚡ Fast development with Vite
- 🎨 Tailwind CSS for styling
- 📱 Progressive Web App (PWA) support
- 🔐 Supabase authentication and database
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

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
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

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions whenever you push to the `main` branch.

Live site: https://hanielcoquillajr16-spec.github.io/VNGLECHEFLAN-dep/

## Project Structure

```
src/
├── app/
│   ├── components/       # React components
│   ├── context/         # React context providers
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   └── App.jsx          # Root app component
├── styles/              # CSS files
└── main.jsx             # Entry point

public/                 # Static assets
supabase/              # Supabase configuration
scripts/               # Build scripts
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## License

MIT
