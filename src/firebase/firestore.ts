// ============================================================
// Firestore Database Module
// ============================================================
// All Firestore read/write helpers live here.
// Import { firestoreDb, saveUserProfile, getUserProfile, updateUserData }
// from '@/firebase/firestore' anywhere in the app.
// ============================================================
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  type DocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import app from "./config";

// ─── Shared Firestore Instance ───────────────────────────────
export const firestoreDb = getFirestore(app);

// ─── Save Full User Profile (overwrite) ──────────────────────
/**
 * Called once during onboarding to create the player's document.
 * Uses a full SET (no merge) so the document is clean.
 */
export async function saveUserProfile(
  uid: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(doc(firestoreDb, "users", uid), data);
}

// ─── Partial Update (merge) ──────────────────────────────────
/**
 * Update only the provided fields of the user's document.
 * Safe to call on every interaction without overwriting the whole doc.
 */
export async function updateUserData(
  uid: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(doc(firestoreDb, "users", uid), data, { merge: true });
}

// ─── One-time Read ───────────────────────────────────────────
export async function getUserProfile(
  uid: string
): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(firestoreDb, "users", uid));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

// ─── Real-time Listener ──────────────────────────────────────
/**
 * Subscribe to real-time changes on a user's document.
 * Returns the unsubscribe function — call it in useEffect cleanup.
 *
 * Usage:
 *   useEffect(() => {
 *     const unsub = subscribeToUser(uid, (snap) => {
 *       if (snap.exists()) setProfile(snap.data());
 *     });
 *     return () => unsub();
 *   }, [uid]);
 */
export function subscribeToUser(
  uid: string,
  callback: (snap: DocumentSnapshot) => void
): Unsubscribe {
  return onSnapshot(doc(firestoreDb, "users", uid), callback);
}
