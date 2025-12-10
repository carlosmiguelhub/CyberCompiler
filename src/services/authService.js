// src/services/authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Create a Firestore user document if it doesn't exist.
 * Works for both Google and email/password users.
 */
async function ensureUserDocument(user, additionalData = {}) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const providerInfo = user.providerData?.[0];

    const userData = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || additionalData.displayName || "",
      photoURL: user.photoURL || null,
      providerId: providerInfo?.providerId || "password",
      createdAt: serverTimestamp(),
      ...additionalData,
    };

    await setDoc(userRef, userData);
  }
}

/**
 * Login with email/password
 */
export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Make sure Firestore user doc exists (for old accounts, etc.)
  await ensureUserDocument(user);

  return user;
}

/**
 * Register with email/password and create Firestore user document
 */
export async function registerWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Update Firebase Auth profile with display name
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Create Firestore user doc
  await ensureUserDocument(user, { displayName });

  return user;
}

/**
 * Sign in or register with Google and create Firestore user document
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Create Firestore user doc if missing
  await ensureUserDocument(user);

  return user;
}
