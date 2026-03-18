# 💧 WaterHub - Intelligent Smart Hydration Tracker

WaterHub is a premium, high-performance hydration tracking application designed to optimize your health through artificial intelligence. Built with **Next.js 15**, **Firebase**, and **Google Gemini (Genkit)**, it provides a seamless blend of automated scheduling and persistent accountability.

## 🚀 Core Features

### 🧠 AI-Optimized Hydration
- **Smart Scheduling:** Uses Google Gemini AI to analyze your wake/sleep cycle and daily activity patterns to generate a non-disruptive hydration schedule.
- **Contextual Insights:** Provides intelligent explanations for why specific reminder times were chosen based on your goals.
- **Dynamic Adjustments:** Automatically spreads your target volume across 6-8 reminders, specifically avoiding your "Busy" hours.

### 🔔 Persistent Alarm System
- **Deep Beep Logic:** A custom procedural audio alarm (150Hz sine wave) that bypasses standard notification fatigue.
- **Escalating Intensity:** The alarm's pitch and frequency increase over time, becoming more urgent until you log your water intake.
- **System-Level Alerts:** Integrated with the Web Push API to provide background notifications and background-to-foreground navigation.

### ☁️ Secure Cloud Infrastructure
- **Google Drive Backup:** Securely backs up your hydration history to your personal Google Drive using the restricted `drive.file` scope.
- **Auto-Sync:** Optional automatic midnight backups to ensure your data is always safe.
- **Real-Time Sync:** Powered by Firebase Firestore for instantaneous updates across all your devices.

### 🔐 Enterprise-Grade Security
- **Multi-Provider Auth:** Support for Google, Microsoft, Email/Password, and Guest sessions.
- **Strict Verification:** Mandatory email verification for all password-based accounts.
- **Password Hardness:** Enforces high-entropy passwords (8+ characters, including numbers and symbols).
- **Data Retention Policy:** Automatic 30-day cleanup of inactive guest or unverified accounts to maintain system hygiene.

### 📊 Comprehensive Activity Tracking
- **Unified Activity Feed:** Every action—from adding 150ml of water to silencing an alarm or updating an email—is recorded in a real-time notification hub.
- **Visual Progress:** Elegant SVG progress rings and glass-filling animations provide instant feedback on your daily goal.
- **Streak Tracker:** Motivational tracking of consecutive days meeting your hydration targets.

## 🛠️ Technical Stack
- **Framework:** Next.js 15 (App Router, Server Actions)
- **Frontend:** React 19, Tailwind CSS, Shadcn UI (Radix Primitives)
- **AI Engine:** Genkit with Google Gemini 2.5 Flash
- **Backend/Auth:** Firebase (Auth, Firestore, App Hosting)
- **Audio Engine:** Web Audio API (Procedural Oscillator)
- **Icons:** Lucide React

## 🏁 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Ensure your `.env` file contains the necessary Firebase and Google AI API keys.

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:9002`.

4. **AI Developer UI:**
   ```bash
   npm run genkit:dev
   ```

## 📤 How to Save to GitHub (New Repository)

If you have deleted your previous repository and want to start fresh with a new one, follow these steps:

1. **Create a new Repository on GitHub:**
   Go to [github.com/new](https://github.com/new). Name it `waterhub` (or your choice) and click **Create repository**.

2. **Reset and Push your code:**
   Open your terminal in the project folder and run:
   ```bash
   # 1. Delete the old git history (starts fresh)
   rm -rf .git

   # 2. Initialize a new git repository
   git init

   # 3. Add all files
   git add .

   # 4. Commit your changes
   git commit -m "Initial commit: WaterHub Smart Hydration Tracker"

   # 5. Rename branch to main
   git branch -M main

   # 6. Add the NEW remote repository (Replace YOUR_USERNAME and YOUR_REPO_NAME)
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

   # 7. Force push to the new empty repository
   git push -u origin main
   ```

---
**Developed by Aniruddha Nag**