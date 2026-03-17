# WaterHub - Premium Smart Hydration Tracker

WaterHub is an intelligent, high-performance water tracking application designed for health-conscious individuals. Built with **Next.js 15**, **Firebase**, and **Genkit (Gemini AI)**, it offers a seamless blend of automation and manual control to optimize your daily hydration.

## 🚀 Key Features

### 🧠 AI-Powered Hydration
- **Smart Reminders:** Leverages Google Gemini AI to analyze your wake/sleep cycle and daily activity patterns.
- **Dynamic Scheduling:** Generates an optimal 6-8 reminder schedule that spreads your goal volume without interrupting your "busy" hours.
- **Intelligent Insights:** Provides explanations for why specific times were chosen based on your goals.

### 🔔 Persistent Alarm System
- **Deep Beep Logic:** A custom procedural audio alarm that beeps at 150Hz.
- **Escalating Intensity:** The alarm pitch and speed increase over time, becoming more urgent until you log your water intake.
- **Native Notifications:** Integrated with the Web Push API to alert you even when the app is in the background or the device is locked.

### ☁️ Secure Cloud Infrastructure
- **Google Drive Backup:** Uses the `drive.file` scope to securely back up your hydration history to your personal cloud storage.
- **Auto-Sync:** Optionally backs up your data automatically every night at midnight.
- **Firebase Firestore:** Real-time data synchronization across all your devices.

### 🔐 Advanced Authentication & Security
- **Multi-Provider Auth:** Support for Google, Microsoft, Email/Password, and Guest sessions.
- **Mandatory Email Verification:** Ensures all email-based accounts are verified before granting access.
- **Data Retention Policy:** Inactive unverified or guest accounts are automatically cleaned after 30 days of inactivity to optimize performance.
- **Password Hardness:** Enforces an 8+ character limit with numbers and symbols for maximum security.

### 📊 Comprehensive Activity Tracking
- **Unified Activity Feed:** Every action—from adding 150ml of water to silencing an alarm or updating an email—is recorded and visible in real-time.
- **Interactive Progress:** Dynamic SVG progress rings and glass-filling animations provide instant visual feedback.
- **Historical Summaries:** Detailed logs and daily completion badges to track your consistency.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 19, Tailwind CSS, Shadcn UI
- **AI:** Genkit with Google Gemini Flash 1.5
- **Backend:** Firebase (Auth, Firestore, App Hosting)
- **Icons:** Lucide React
- **Audio:** Web Audio API (Procedural Oscillator)

## 🏁 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available on port 9002.

3. **Genkit Developer UI:**
   ```bash
   npm run genkit:dev
   ```

---
Developed by Aniruddha Nag.
