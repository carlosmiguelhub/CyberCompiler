// src/services/userService.js
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";

/**
 * Fetch user profile document from Firestore (users/{uid})
 */
export async function fetchUserProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Optional: create a minimal document if missing
    const newDoc = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || null,
      role: "user",
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, newDoc);
    return newDoc;
  }

  return snap.data();
}

/**
 * Update profile info in Firestore (+ optionally Firebase Auth)
 * data: { displayName?: string, role?: string }
 */
export async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, "users", user.uid);
  const updates = { ...data };

  // Also update Firebase Auth profile displayName if changed
  if (data.displayName && data.displayName !== user.displayName) {
    await updateProfile(user, {
      displayName: data.displayName,
    });
  }

  await updateDoc(ref, updates);
}

/**
 * Trigger password reset email (for email/password accounts)
 */
export async function sendPasswordReset() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  if (!user.email) {
    throw new Error("No email associated with this account.");
  }

  await sendPasswordResetEmail(auth, user.email);
}
