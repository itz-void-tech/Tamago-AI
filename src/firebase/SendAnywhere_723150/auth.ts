// ============================================================
// Firebase Authentication Module
// ============================================================
// All Google Sign-In logic lives here.
// Import { auth, loginWithGoogle, logout, onUserChange }
// from '@/firebase/auth' anywhere in the app.
// ============================================================
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import app from "./config";

// ─── Shared Auth Instance ────────────────────────────────────
export const auth = getAuth(app);

// ─── Google Provider ─────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

// ─── Sign In ─────────────────────────────────────────────────
/**
 * Attempt popup sign-in first. If the browser blocks the popup,
 * automatically fall back to a full-page redirect.
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    if (
      err.code === "auth/popup-blocked" ||
      err.code === "auth/popup-closed-by-user"
    ) {
      // Redirect flow — page navigates away, result handled in handleRedirect()
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    if (err.code === "auth/cancelled-popup-request") {
      return null; // User opened popup twice — silently ignore
    }
    console.error("[Firebase Auth] Sign-in error:", err);
    throw err;
  }
}

// ─── Handle Redirect Result ───────────────────────────────────
/**
 * Call this once on app mount to capture the user returned
 * after signInWithRedirect() sends the browser back from Google.
 * Returns the User if a redirect just completed, otherwise null.
 */
export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch {
    return null;
  }
}

// ─── Sign Out ─────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ─── Auth State Observer ──────────────────────────────────────
/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function — call it in useEffect cleanup.
 *
 * Usage:
 *   useEffect(() => {
 *     const unsub = onUserChange((user) => setUser(user));
 *     return () => unsub();
 *   }, []);
 */
export function onUserChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── Re-export User type for convenience ─────────────────────
export type { User };
