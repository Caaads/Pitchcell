# Pitchcell — AI Startup Opportunity Engine

Pitchcell transforms raw thoughts, messy ideas, and keyword combinations into structured startup opportunity reports. Powered by Google Gemini AI and backed by Firebase.

---

## What It Does

Type anything — `"AI + campus + fitness"`, `"people forget assignments"`, or `"food waste solution"` — and Pitchcell generates a full co-founder-style analysis including:

- Problem statement & proposed solution
- Target users & core features
- Monetization models
- Feasibility score (1–10) & execution difficulty
- Growth opportunities & risks
- AI Skeptic Mode — brutal honest critique from a simulated co-founder

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini (`@google/genai`) |
| Auth | Firebase Authentication (Google + Email) |
| Database | Cloud Firestore |
| Server | Express + tsx (Node) |
| Animations | Motion (Framer Motion) |
| PDF Export | jsPDF |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase project](https://console.firebase.google.com/) with Authentication and Firestore enabled
- A [Gemini API key](https://aistudio.google.com/apikey)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
```

### 3. Configure Firebase

Update `firebase-applet-config.json` with your Firebase project credentials:

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "your-sender-id",
  "measurementId": ""
}
```

### 4. Enable Google Sign-In (if using Google Auth)

In the [Firebase Console](https://console.firebase.google.com/):
1. Go to **Authentication → Sign-in method** and enable **Google**
2. Go to **Authentication → Settings → Authorized domains** and add `localhost`

### 5. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | TypeScript type check |

---

## Features

- **Opportunity Creator** — Input raw thoughts and generate a full startup analysis
- **Voice Dictation** — Speak your ideas using the Web Speech API (Chrome/Edge/Safari)
- **Saved Opportunities** — Bookmark analyses for later reference
- **Generation History** — Browse and filter all past analyses
- **Category Filtering** — Filter results by auto-detected tags
- **Edit Mode** — Refine titles, problem statements, and solutions post-generation
- **Free / Premium Tiers** — Free tier is limited to 5 analyses/day; Premium is unlimited
- **Playground Mode** — Falls back to localStorage if Firebase is unavailable

---

## Project Structure

```
src/
├── components/
│   ├── AuthPage.tsx        # Login / signup screen
│   ├── Dashboard.tsx       # Main app workspace
│   ├── LandingPage.tsx     # Public landing page
│   ├── LogCarousel.tsx     # Scrollable history list
│   └── OpportunityCard.tsx # Individual result card
├── App.tsx                 # Root component & routing
├── firebase.ts             # Firebase initialization
├── firebaseContext.tsx     # Auth context & user state
├── opportunityService.ts   # Firestore + AI service calls
└── types.ts                # TypeScript interfaces
```

---
