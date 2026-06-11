# AetherTrans — Premium Language Translator Web Application

AetherTrans is a modern, responsive, and feature-rich language translation web application built using clean, vanilla **HTML5**, **CSS3**, and **JavaScript (ES6)**. It offers a premium glassmorphic UI, support for multiple translation APIs, speech synthesis, speech recognition, translation caching, and light/dark theme toggles.

![AetherTrans Interface Mockup](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200) *(Placeholder visual representation)*

---

## 🚀 Key Features

*   **Dual Translation Engines:**
    *   **MyMemory API (Default):** Zero setup required. Free to translate up to 1,000 words per day out of the box.
    *   **Google Cloud Translation API (Optional):** Integration for high-accuracy commercial translation via personal Google Cloud console keys.
*   **Language Auto-Detection:** Automatically identifies the source input language and translates it to your desired target language.
*   **Speech-to-Text (Voice Typing):** Dictate your text using your microphone directly into the app (powered by the Web Speech API).
*   **Text-to-Speech (Audio Playback):** Listen to the correct pronunciation of both your input and output text in natural sounding voices.
*   **Smart Layout Swap:** Seamlessly reverse translation directions (Source $\leftrightarrow$ Target) with active content adjustment.
*   **Instant Copy to Clipboard:** One-click copy with visual tooltip status indicators.
*   **Local History Tracking:** Keeps logs of your last 10 translations in local cache for quick re-use.
*   **Premium Theme System:** Transitions smoothly between standard high-contrast Light Mode and custom Deep Purple Dark Mode.

---

## 📂 File Structure

The project has been organized into modular, clean source files:

```bash
language translation tool/
│
├── index.html   # Main layout structure & semantic elements
├── style.css    # Typography, colors, layouts, and animations
├── script.js    # API fetching, speech synthesis/recognition, & events
└── README.md    # Guide documentation (this file)
```

---

## 💻 Getting Started (Running Locally)

Since the app uses vanilla HTML, CSS, and JS, **no build systems or command-line dependencies are required**. You can run it locally in seconds:

### Option A: The Direct Method (Quickest)
1.  Navigate to your workspace directory: `/Users/surendra/language translation tool`.
2.  Double-click `index.html` to open it directly in any modern web browser (Chrome, Safari, Firefox, Edge).

### Option B: Local Server Method (Recommended for Web Speech API)
Certain features (like Speech Recognition and microphone permissions) require a secure context (`http://localhost` or `https://`). We recommend launching a simple local development server:

#### Using Python
If you have Python installed, run this command in your terminal:
```bash
python3 -m http.server 8000
```
Then open your browser and navigate to: [http://localhost:8000](http://localhost:8000).

#### Using Node.js
If you have Node.js installed, you can use the `serve` package:
```bash
npx serve
```
Then open your browser and navigate to the port specified in the console output.

---

## 🔑 API Key Configuration Guide

AetherTrans works immediately using the default free translation engine. To configure and activate the Google Cloud Translation API:

1.  Open the application in your browser.
2.  Click the **Settings Gear Icon** in the top right corner.
3.  Change the **Translation Engine** dropdown to **Google Cloud Translation API (Requires Key)**.
4.  Paste your Google Cloud API key in the field.
    *   *To get a key:* Go to the [Google Cloud Console](https://console.cloud.google.com/), create a project, enable the **Cloud Translation API**, and generate an API key under **APIs & Services > Credentials**.
5.  Click **Save Settings**.
6.  The key is securely stored in your browser's private `localStorage` and will not be sent to any server other than the official Google Translate endpoint.
