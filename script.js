/**
 * AetherTrans - Language Translator Application Logic
 * Author: Antigravity AI
 * Description: Premium frontend client integrating MyMemory API, Google Translate API, 
 *              Web Speech API (Speech-to-Text & Text-to-Speech), local storage history,
 *              and theme preferences.
 */

// --- Language List ---
const languages = {
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "it": "Italian",
  "pt": "Portuguese",
  "ja": "Japanese",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  "ru": "Russian",
  "hi": "Hindi",
  "ar": "Arabic",
  "ko": "Korean",
  "nl": "Dutch",
  "tr": "Turkish",
  "vi": "Vietnamese",
  "pl": "Polish",
  "sv": "Swedish",
  "no": "Norwegian",
  "da": "Danish",
  "fi": "Finnish",
  "th": "Thai",
  "id": "Indonesian",
  "ms": "Malay",
  "he": "Hebrew",
  "el": "Greek",
  "cs": "Czech",
  "hu": "Hungarian",
  "uk": "Ukrainian",
  "la": "Latin",
  "eo": "Esperanto"
};

// --- DOM Elements ---
const themeToggle = document.getElementById("themeToggle");
const themeIconSun = document.getElementById("themeIconSun");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const apiEngineSelect = document.getElementById("apiEngine");
const apiKeyGroup = document.getElementById("apiKeyGroup");
const apiKeyInput = document.getElementById("apiKey");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

const sourceLangSelect = document.getElementById("sourceLang");
const targetLangSelect = document.getElementById("targetLang");
const sourceTextarea = document.getElementById("sourceText");
const targetTextarea = document.getElementById("targetText");
const charCountSpan = document.getElementById("charCount");
const clearBtn = document.getElementById("clearBtn");
const voiceInputBtn = document.getElementById("voiceInputBtn");
const speakSourceBtn = document.getElementById("speakSourceBtn");
const speakTargetBtn = document.getElementById("speakTargetBtn");
const copyBtn = document.getElementById("copyBtn");
const swapLanguagesBtn = document.getElementById("swapLanguages");
const translateBtn = document.getElementById("translateBtn");

const historyListContainer = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const toastContainer = document.getElementById("toastContainer");

// --- App State ---
let config = {
  engine: "google-free",
  apiKey: "",
  theme: "dark"
};
let detectedSourceLang = ""; // Tracks auto-detected language from last API call
let speechRecognition = null;
let isRecording = false;

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
  loadConfig();
  applyTheme(config.theme);
  populateLanguages();
  loadHistory();
  setupSpeechRecognition();
  setupEventListeners();
});

// --- Settings & Configuration ---
function loadConfig() {
  const savedEngine = localStorage.getItem("aethertrans_engine");
  const savedKey = localStorage.getItem("aethertrans_apikey");
  const savedTheme = localStorage.getItem("aethertrans_theme");

  if (savedEngine) config.engine = savedEngine;
  if (savedKey) config.apiKey = savedKey;
  if (savedTheme) config.theme = savedTheme;

  // Apply configuration to elements
  apiEngineSelect.value = config.engine;
  apiKeyInput.value = config.apiKey;
  toggleApiKeyInputVisibility(config.engine);
}

function saveConfig() {
  config.engine = apiEngineSelect.value;
  config.apiKey = apiKeyInput.value.trim();
  
  localStorage.setItem("aethertrans_engine", config.engine);
  localStorage.setItem("aethertrans_apikey", config.apiKey);
  
  showToast("Configuration saved successfully!", "success");
  closeSettings();
}

function toggleApiKeyInputVisibility(engine) {
  if (engine === "google") {
    apiKeyGroup.style.display = "flex";
  } else {
    apiKeyGroup.style.display = "none";
  }
}

// --- Theme Management ---
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  config.theme = theme;
  localStorage.setItem("aethertrans_theme", theme);

  if (theme === "light") {
    // Sun icon transforms into moon indicator
    themeToggle.innerHTML = `
      <svg class="theme-icon" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  } else {
    // Moon transforms back to sun
    themeToggle.innerHTML = `
      <svg class="theme-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
}

function toggleTheme() {
  const newTheme = config.theme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

// --- Populating Dropdowns ---
function populateLanguages() {
  // Populate source dropdown
  Object.keys(languages).forEach(code => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = languages[code];
    sourceLangSelect.appendChild(option);
  });

  // Populate target dropdown
  Object.keys(languages).forEach(code => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = languages[code];
    targetLangSelect.appendChild(option);
  });

  // Set default values (e.g. English -> Spanish)
  sourceLangSelect.value = "auto";
  targetLangSelect.value = "es";
}

// --- Toast Notifications ---
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  // Icon based on type
  let icon = "";
  if (type === "success") {
    icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === "error") {
    icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Trigger browser paint to allow transition animation
  setTimeout(() => toast.classList.add("active"), 10);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove("active");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Settings Modal Actions ---
function openSettings() {
  settingsModal.classList.add("active");
}

function closeSettings() {
  settingsModal.classList.remove("active");
}

// --- Speech Recognition (Voice Typing) ---
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceInputBtn.style.display = "none"; // Hide button if not supported by browser
    console.warn("Speech recognition not supported in this browser.");
    return;
  }

  speechRecognition = new SpeechRecognition();
  speechRecognition.continuous = false;
  speechRecognition.interimResults = false;

  speechRecognition.onstart = () => {
    isRecording = true;
    voiceInputBtn.classList.add("recording");
    showToast("Listening... Speak clearly into your microphone.", "info");
  };

  speechRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Append voice content to textarea
    const currentText = sourceTextarea.value;
    sourceTextarea.value = currentText ? `${currentText} ${transcript}` : transcript;
    updateCharCount();
    showToast("Voice captured!", "success");
  };

  speechRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error === "not-allowed") {
      showToast("Microphone permission denied. Enable mic access in your browser or OS Settings.", "error");
    } else if (event.error === "service-not-allowed") {
      showToast("Speech service blocked. Enable Dictation/Mic in macOS System Settings or check your firewall.", "error");
    } else {
      showToast(`Speech recognition error: ${event.error}`, "error");
    }
    stopRecordingState();
  };

  speechRecognition.onend = () => {
    stopRecordingState();
  };
}

function stopRecordingState() {
  isRecording = false;
  voiceInputBtn.classList.remove("recording");
}

function getSpeechLocale(langCode) {
  const localeMap = {
    "en": "en-US",
    "es": "es-ES",
    "fr": "fr-FR",
    "de": "de-DE",
    "it": "it-IT",
    "pt": "pt-PT",
    "ja": "ja-JP",
    "ru": "ru-RU",
    "hi": "hi-IN",
    "ar": "ar-SA",
    "ko": "ko-KR",
    "nl": "nl-NL",
    "tr": "tr-TR",
    "vi": "vi-VN",
    "pl": "pl-PL",
    "sv": "sv-SE",
    "no": "no-NO",
    "da": "da-DK",
    "fi": "fi-FI",
    "th": "th-TH",
    "id": "id-ID",
    "ms": "ms-MY",
    "he": "he-IL",
    "el": "el-GR",
    "cs": "cs-CZ",
    "hu": "hu-HU",
    "uk": "uk-UA"
  };
  return localeMap[langCode] || langCode;
}

function toggleVoiceInput() {
  if (!speechRecognition) return;

  if (isRecording) {
    speechRecognition.stop();
  } else {
    // Select recognition language based on dropdown
    const selectedLang = sourceLangSelect.value;
    speechRecognition.lang = selectedLang === "auto" ? "en-US" : getSpeechLocale(selectedLang);
    try {
      speechRecognition.start();
    } catch (e) {
      console.error(e);
    }
  }
}

// --- Text to Speech (Playback) ---
function speakText(text, languageCode) {
  if (!text.trim()) {
    showToast("Nothing to read aloud.", "error");
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast("Text-to-speech is not supported by your browser.", "error");
    return;
  }

  // Cancel any active readouts
  window.speechSynthesis.cancel();

  // If source lang is auto, use detected language code
  let speechLang = languageCode;
  if (languageCode === "auto") {
    speechLang = detectedSourceLang || "en";
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang;

  // Attempt to select a voice matching the language exactly
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(voice => voice.lang.startsWith(speechLang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onerror = (e) => {
    console.error("Speech synthesis error:", e);
    showToast("Speech playback failed.", "error");
  };

  window.speechSynthesis.speak(utterance);
}

// --- Translate Core Engine Integration ---
async function handleTranslation() {
  const text = sourceTextarea.value.trim();
  const sourceLang = sourceLangSelect.value;
  const targetLang = targetLangSelect.value;

  if (!text) {
    showToast("Please enter some text to translate.", "error");
    targetTextarea.value = "";
    return;
  }

  // Update button UI state
  translateBtn.disabled = true;
  const originalBtnContent = translateBtn.innerHTML;
  translateBtn.innerHTML = `
    <span>Translating...</span>
    <svg class="animate-spin" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2a10 10 0 0 1 10 10"></path>
    </svg>
  `;

  // Inline dynamic animation style for loader
  if (!document.getElementById("spin-animation-style")) {
    const style = document.createElement("style");
    style.id = "spin-animation-style";
    style.innerHTML = "@keyframes spin { 100% { transform: rotate(360deg); } }";
    document.head.appendChild(style);
  }

  try {
    let resultText = "";
    if (config.engine === "google") {
      resultText = await translateWithGoogle(text, sourceLang, targetLang);
    } else if (config.engine === "mymemory") {
      resultText = await translateWithMyMemory(text, sourceLang, targetLang);
    } else {
      resultText = await translateWithGoogleFree(text, sourceLang, targetLang);
    }

    targetTextarea.value = resultText;
    
    // Save to translation history
    saveHistoryItem(text, resultText, sourceLang, targetLang);

  } catch (error) {
    console.error("Translation Error:", error);
    targetTextarea.value = "Translation failed. Check console or settings.";
    showToast(error.message || "Failed to contact translation server.", "error");
  } finally {
    // Restore button UI state
    translateBtn.disabled = false;
    translateBtn.innerHTML = originalBtnContent;
  }
}

// API engine 1: MyMemory (Free)
async function translateWithMyMemory(text, source, target) {
  // MyMemory expects auto-detection as 'auto' or 'autodetect'
  const langPairSource = source === "auto" ? "autodetect" : source;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPairSource}|${target}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory API returned server status ${response.status}`);
  }

  const data = await response.json();
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Error code from MyMemory Translation API.");
  }

  // Save detected language if available in response metadata
  if (data.responseData.detectedSourceLanguage) {
    detectedSourceLang = data.responseData.detectedSourceLanguage.toLowerCase();
  } else if (data.matches && data.matches.length > 0) {
    // Attempt fallback parsing from matches if present
    const sourceMatch = data.matches.find(m => m.source);
    if (sourceMatch) {
      detectedSourceLang = sourceMatch.source.split('-')[0].toLowerCase();
    }
  }

  return data.responseData.translatedText;
}

// API engine 2: Google Translate API (Key required)
async function translateWithGoogle(text, source, target) {
  if (!config.apiKey) {
    openSettings();
    throw new Error("Google API Key is missing. Please configure it in Settings.");
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${config.apiKey}`;
  
  const payload = {
    q: text,
    target: target
  };
  
  // Only supply source key if explicitly set (omit for autodetection)
  if (source !== "auto") {
    payload.source = source;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `Google Cloud returned server error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const translations = data.data?.translations;
  if (!translations || translations.length === 0) {
    throw new Error("No translations returned from Google API.");
  }

  const trans = translations[0];
  if (trans.detectedSourceLanguage) {
    detectedSourceLang = trans.detectedSourceLanguage.toLowerCase();
  }

  return trans.translatedText;
}

// API engine 3: Google Translate (Free Web API)
async function translateWithGoogleFree(text, source, target) {
  const sl = source === "auto" ? "auto" : source;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate Web API returned status ${response.status}`);
  }

  const data = await response.json();
  if (!data || !data[0]) {
    throw new Error("Invalid response from Google Translate Web API.");
  }

  // Compile full translation from segments
  const translatedText = data[0]
    .map(segment => segment[0])
    .filter(Boolean)
    .join("");

  // Store detected language
  if (data[2]) {
    detectedSourceLang = data[2].toLowerCase();
  }

  return translatedText;
}

// --- Swap Languages ---
function swapLanguages() {
  const sourceVal = sourceLangSelect.value;
  const targetVal = targetLangSelect.value;

  // Cannot swap 'auto' to target language
  if (sourceVal === "auto") {
    // If we have a detected source language, swap to that. Else fallback.
    if (detectedSourceLang && languages[detectedSourceLang]) {
      sourceLangSelect.value = targetVal;
      targetLangSelect.value = detectedSourceLang;
    } else {
      showToast("Cannot swap Auto-Detect into the output language.", "error");
      return;
    }
  } else {
    sourceLangSelect.value = targetVal;
    targetLangSelect.value = sourceVal;
  }

  // Swap content texts as well (smooth experience)
  const sourceText = sourceTextarea.value;
  const targetText = targetTextarea.value;

  sourceTextarea.value = targetText;
  targetTextarea.value = sourceText;

  updateCharCount();

  // If there's new source text, translate automatically
  if (sourceTextarea.value.trim()) {
    handleTranslation();
  }
}

// --- UI Interaction Helpers ---
function updateCharCount() {
  const currentLength = sourceTextarea.value.length;
  charCountSpan.textContent = `${currentLength} / 5000`;
}

function clearSourceText() {
  sourceTextarea.value = "";
  targetTextarea.value = "";
  detectedSourceLang = "";
  updateCharCount();
}

function copyToClipboard() {
  const text = targetTextarea.value.trim();
  if (!text) {
    showToast("No translated text to copy.", "error");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      showToast("Translation copied to clipboard!", "success");
    })
    .catch((err) => {
      console.error("Copy failed:", err);
      showToast("Failed to copy text.", "error");
    });
}

// --- History Storage Manager ---
function saveHistoryItem(sourceText, targetText, sourceLang, targetLang) {
  let history = JSON.parse(localStorage.getItem("aethertrans_history")) || [];
  
  // Format language labels
  const sourceLabel = sourceLang === "auto" ? "Auto" : sourceLang.toUpperCase();
  const targetLabel = targetLang.toUpperCase();

  const newItem = {
    id: Date.now(),
    sourceText,
    targetText,
    sourceLang,
    targetLang,
    label: `${sourceLabel} → ${targetLabel}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Prevent duplicates (e.g. consecutive identical translations)
  if (history.length > 0 && history[0].sourceText === sourceText && history[0].targetLang === targetLang) {
    return;
  }

  // Keep max 10 entries
  history.unshift(newItem);
  if (history.length > 10) {
    history.pop();
  }

  localStorage.setItem("aethertrans_history", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("aethertrans_history")) || [];
  
  if (history.length === 0) {
    historyListContainer.innerHTML = '<div class="no-history">No translation history yet.</div>';
    return;
  }

  historyListContainer.innerHTML = "";
  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-meta">
        <span class="history-langpair">${item.label}</span>
        <span>${item.timestamp}</span>
      </div>
      <div class="history-query">${escapeHtml(item.sourceText)}</div>
      <div class="history-result">${escapeHtml(item.targetText)}</div>
    `;

    // Click history item to restore
    div.addEventListener("click", () => {
      sourceLangSelect.value = item.sourceLang;
      targetLangSelect.value = item.targetLang;
      sourceTextarea.value = item.sourceText;
      targetTextarea.value = item.targetText;
      updateCharCount();
      showToast("Restored translation from history.", "info");
    });

    historyListContainer.appendChild(div);
  });
}

function clearHistory() {
  localStorage.removeItem("aethertrans_history");
  loadHistory();
  showToast("History cleared.", "success");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Event Listeners binding ---
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Settings Modal controls
  settingsBtn.addEventListener("click", openSettings);
  closeSettingsBtn.addEventListener("click", closeSettings);
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettings();
  });
  apiEngineSelect.addEventListener("change", (e) => {
    toggleApiKeyInputVisibility(e.target.value);
  });
  saveSettingsBtn.addEventListener("click", saveConfig);

  // Clear text
  clearBtn.addEventListener("click", clearSourceText);

  // Textarea listeners
  sourceTextarea.addEventListener("input", updateCharCount);
  
  // Enter key in text area triggers translate (Ctrl+Enter or Cmd+Enter)
  sourceTextarea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleTranslation();
    }
  });

  // Action Buttons
  translateBtn.addEventListener("click", handleTranslation);
  copyBtn.addEventListener("click", copyToClipboard);
  swapLanguagesBtn.addEventListener("click", swapLanguages);

  // Speech actions
  voiceInputBtn.addEventListener("click", toggleVoiceInput);
  speakSourceBtn.addEventListener("click", () => {
    speakText(sourceTextarea.value, sourceLangSelect.value);
  });
  speakTargetBtn.addEventListener("click", () => {
    speakText(targetTextarea.value, targetLangSelect.value);
  });

  // History action
  clearHistoryBtn.addEventListener("click", clearHistory);
}
