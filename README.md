
# HydroTrack - Smart Hydration Tracker

This is a premium, intelligent water tracking application built with Next.js 15, Firebase, and Genkit.

## reCAPTCHA Setup (CRITICAL)
To resolve the "Invalid Domain" error, you **MUST** add the following domains to your **reCAPTCHA v3 Admin Console** (Settings > Domains):

1.  `localhost` (Required for development)
2.  `studio-1198494154-b6e32.firebaseapp.com`
3.  `studio-1198494154-b6e32.web.app`

**Note:** Ensure you are using a **reCAPTCHA v3 (Score-based)** key type. A v2 (Checkbox) key will not work with this implementation.

## Getting Started
To run the development server:
```bash
npm run dev
```

The app will be available on port 9002.
