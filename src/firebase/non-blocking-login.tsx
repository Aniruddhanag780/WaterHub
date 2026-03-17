
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  updateEmail,
} from 'firebase/auth';

/** 
 * Initiate anonymous sign-in. 
 */
export function initiateAnonymousSignIn(authInstance: Auth) {
  return signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up. 
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/**
 * Sends a verification email to the current user.
 */
export function initiateEmailVerification(user: User) {
  return sendEmailVerification(user);
}

/** 
 * Initiate email/password sign-in. 
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/**
 * Sends a verification link to update the user's email.
 */
export function initiateEmailUpdate(user: User, newEmail: string) {
  return updateEmail(user, newEmail);
}

/**
 * Initiate password reset email.
 */
export function initiatePasswordReset(authInstance: Auth, email: string) {
  return sendPasswordResetEmail(authInstance, email);
}

/** 
 * Initiate Google sign-in via popup.
 */
export function initiateGoogleSignIn(authInstance: Auth) {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}

/** 
 * Initiate Microsoft sign-in via popup.
 */
export function initiateMicrosoftSignIn(authInstance: Auth) {
  const provider = new OAuthProvider('microsoft.com');
  return signInWithPopup(authInstance, provider);
}

/** 
 * Connects the current application session to Google Drive by requesting the drive.file scope.
 */
export async function connectGoogleDrive(authInstance: Auth): Promise<string | null> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  
  if (!authInstance.currentUser) {
    throw new Error("You must be signed in to connect a backup service.");
  }

  try {
    const result = await signInWithPopup(authInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return credential?.accessToken || null;
  } catch (error: any) {
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Google services are not enabled in your Firebase Console.");
    }
    throw error;
  }
}
