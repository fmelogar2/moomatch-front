import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { environment } from '../../environments/environment';

/**
 * Firebase Authentication handles Email/Password, Google, and Microsoft natively — no custom
 * OAuth2 client code needed for any of the three. See docs/moomatch-HLD.md #Security.
 */
export const firebaseApp = initializeApp(environment.firebase);
export const firebaseAuth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();

// Microsoft accepts both personal and work/school (Azure AD organizational) accounts —
// not restricted to organizational accounts only (see AUTH-2).
export const microsoftProvider = new OAuthProvider('microsoft.com');
