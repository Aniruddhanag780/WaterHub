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
- **Strict Verification:** Mandatory email verification for all password-based accounts to prevent spam and ensure data integrity.
- **Password Hardness:** Enforces high-entropy passwords (8+ characters, including numbers and symbols).
- **Data Retention Policy:** Automatic 30-day cleanup of inactive guest or unverified accounts to maintain system performance.

### 📊 Comprehensive Activity Tracking
- **Unified Activity Feed:** Every single action—from adding 150ml of water to silencing an alarm or updating an email—is recorded in a real-time notification hub.
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

---
*Developed by Aniruddha Nag*