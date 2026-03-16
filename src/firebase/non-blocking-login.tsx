'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

/** 
 * Initiate anonymous sign-in. 
 * Returns the promise so the caller can catch specific configuration errors.
 */
export function initiateAnonymousSignIn(authInstance: Auth) {
  return signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up. 
 * Returns the promise so the caller can catch specific configuration errors.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate email/password sign-in. 
 * Returns the promise so the caller can catch specific configuration errors.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Connects to Google Drive by requesting the drive.file scope.
 * Returns a promise that resolves with the access token.
 */
export async function signInWithGoogleForDrive(authInstance: Auth): Promise<string | null> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  
  try {
    const result = await signInWithPopup(authInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return credential?.accessToken || null;
  } catch (error: any) {
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Google Sign-In is not enabled in your Firebase Console. Please enable it in the Authentication > Sign-in method section.");
    }
    throw error;
  }
}
