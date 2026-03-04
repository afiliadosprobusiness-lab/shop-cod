import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

function normalizeEnvValue(value: string | undefined) {
  return value?.trim() || "";
}

const firebaseConfig = {
  apiKey: normalizeEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: normalizeEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: normalizeEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: normalizeEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: normalizeEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: normalizeEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
};

export function hasFirebaseConfig() {
  return Boolean(firebaseConfig.projectId);
}

export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
