# WaterHub - Master App Specification

## Core Identity
**Name:** WaterHub
**Purpose:** A premium, intelligent water tracking application that uses AI to optimize hydration schedules based on user routines.
**Target Audience:** Health-conscious individuals and busy professionals.

## Technical Stack
- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 19, Tailwind CSS
- **UI Components:** Shadcn UI (Radix Primitives)
- **Icons:** Lucide React
- **AI Integration:** Genkit with Google Gemini (flash-1.5)
- **State Management:** React Context API with LocalStorage persistence

## Design Language
- **Theme:** "Midnight Oceanic" - Vibrant Aqua Blue (`#00E5FF`) accents set against a "Slightly Dark" Navy Blue (`#06080E`) background.
- **Visual Style:** 
  - Glassmorphism (semi-transparent backgrounds with backdrop blur).
  - High contrast typography for readability in low-light/dark mode.
  - Heavy use of rounded corners (`radius: 1.25rem`).
  - Fluid animations for progress bars and "filling" effects.
  - Mobile-first approach with a persistent bottom navigation bar.

## Feature Requirements

### 1. Dashboard (Home)
- **Water Progress Ring:** A large, elegant SVG circle showing percentage completion with a gradient stroke.
- **Glass Visual:** A 2D-style water glass that fills up dynamically with animated waves.
- **Next Reminder Card:** A prominent glassmorphic card showing the AI-scheduled time for the next drink.
- **Quick Logs:** Large buttons for common presets (150ml, 250ml, 500ml) plus a custom "Add" input.
- **Streak Tracker:** An energetic flame icon showing the number of consecutive days the goal was met.

### 2. History & Insights
- **Daily Summaries:** A list or grid showing past dates, total volume, and a "Goal Achieved" badge.
- **Log Management:** A detailed list of today's logs with timestamps and the ability to delete entries.

### 3. AI Smart Reminders (Genkit)
- **Flow Definition:** `intelligentHydrationReminders`.
- **Input:** Wake-up time, Sleep time, Daily Activity Pattern (text), and Hydration Goal.
- **Logic:** The AI should spread 6-8 reminders throughout the user's waking hours, specifically avoiding times of high activity or sleep.
- **Persistence:** Suggested times are saved to LocalStorage and displayed in the UI.

### 4. Settings & Profile
- **Goal Setting:** Ability to update the daily target in ML.
- **Routine Input:** Fields to update wake/sleep and daily activity for the AI to process.
- **Profile Card:** A sleek user overview for personalization.

## Data Schema
- **WaterLog:** `{ id: string, amount: number, timestamp: number }`
- **History:** `Record<string, number>` (Date string to total volume)
- **Reminders:** `string[]` (HH:MM AM/PM format)
