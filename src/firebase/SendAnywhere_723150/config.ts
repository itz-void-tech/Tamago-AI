// ============================================================
// Firebase App Initialization
// ============================================================
// This file initializes the Firebase app ONCE and exports
// the shared `app` instance used by auth and firestore modules.
// ============================================================
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey:            "AIzaSyDj6G_7FkFtuKqjJESHL61o2gofR5d_rIU",
  authDomain:        "virtual-pet-bd62b.firebaseapp.com",
  projectId:         "virtual-pet-bd62b",
  storageBucket:     "virtual-pet-bd62b.firebasestorage.app",
  messagingSenderId: "967283545143",
  appId:             "1:967283545143:web:0f72fb16a8be485293dbb2",
  measurementId:     "G-L85ZPBJD66",
};

// Prevent re-initializing the app on hot-reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export default app;
