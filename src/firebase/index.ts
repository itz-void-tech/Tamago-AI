// ============================================================
// Firebase Barrel Export
// ============================================================
// Import everything you need from a single path:
//   import { auth, loginWithGoogle, firestoreDb } from '@/firebase'
// ============================================================
export { auth, loginWithGoogle, handleRedirectResult, logout, onUserChange } from './auth';
export type { User } from './auth';
export { firestoreDb, saveUserProfile, updateUserData, getUserProfile, subscribeToUser } from './firestore';
export { default as firebaseApp } from './config';
