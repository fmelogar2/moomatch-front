import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { firebaseAuth, googleProvider, microsoftProvider } from './firebase';

export type UserRole = 'FARM_ADMIN' | 'BREEDER_TECHNICIAN';

/**
 * Distinguishes "you're a verified identity with no invitation yet" (the only case with its own
 * user-facing copy) from every other provisioning failure, which previously all collapsed into
 * the same misleading "no pending invitation" message — including network/CORS failures that
 * never reached the backend at all.
 */
export type ProvisionErrorReason = 'no-invitation' | 'network-or-cors' | 'server-error';

export interface ProvisionError {
  reason: ProvisionErrorReason;
  status: number;
  message: string;
}

export interface MoomatchUserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  herdAccess: string[];
  lastLoginAt: string | null;
}

/**
 * Wraps Firebase Authentication (AUTH-1/AUTH-2) and, once a Firebase session exists, provisions
 * the corresponding MooMatch UserAccount via backoffice-service (auto-provision on first SSO
 * login — see docs/moomatch-HLD.md AUTH-2).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebaseUserSignal = signal<User | null>(null);
  private readonly profileSignal = signal<MoomatchUserProfile | null>(null);
  private readonly loadingSignal = signal(true);
  private readonly provisionErrorSignal = signal<ProvisionError | null>(null);

  readonly firebaseUser = this.firebaseUserSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly provisionError = this.provisionErrorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.firebaseUserSignal() !== null && this.profileSignal() !== null);

  /**
   * Shared in-flight provisioning promise. onAuthStateChanged fires asynchronously and
   * independently of the signIn* calls below — callers that need the profile right after signing
   * in (see login.ts) must await ensureProvisioned() directly rather than reading the `profile`
   * signal immediately after a signIn* promise resolves, which loses the race more often than not.
   */
  private provisionInFlight: Promise<MoomatchUserProfile | null> | null = null;

  constructor(private readonly http: HttpClient) {
    onAuthStateChanged(firebaseAuth, async (user) => {
      this.firebaseUserSignal.set(user);
      if (user) {
        await this.ensureProvisioned();
      } else {
        this.profileSignal.set(null);
      }
      this.loadingSignal.set(false);
    });
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async signInWithGoogle(): Promise<void> {
    await signInWithPopup(firebaseAuth, googleProvider);
  }

  async signInWithMicrosoft(): Promise<void> {
    await signInWithPopup(firebaseAuth, microsoftProvider);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(firebaseAuth, email);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(firebaseAuth);
  }

  async getIdToken(): Promise<string | null> {
    const user = this.firebaseUserSignal();
    return user ? user.getIdToken() : null;
  }

  /** Public + awaitable: call this directly after a signIn* call resolves (see login.ts). */
  async ensureProvisioned(): Promise<MoomatchUserProfile | null> {
    if (!this.provisionInFlight) {
      this.provisionInFlight = this.provision().finally(() => {
        this.provisionInFlight = null;
      });
    }
    return this.provisionInFlight;
  }

  private async provision(): Promise<MoomatchUserProfile | null> {
    this.provisionErrorSignal.set(null);
    try {
      const profile = await firstValueFrom(
        this.http.post<MoomatchUserProfile>(`${environment.apiBaseUrl}/backoffice/users/provision`, {}),
      );
      this.profileSignal.set(profile);
      return profile;
    } catch (err) {
      this.profileSignal.set(null);
      this.provisionErrorSignal.set(this.classifyProvisionError(err));
      return null;
    }
  }

  private classifyProvisionError(err: unknown): ProvisionError {
    if (err instanceof HttpErrorResponse) {
      // status 0 means the request never got an HTTP response at all — almost always a CORS
      // block or the API Gateway/backend not running, NOT "no invitation" (that's a real 404
      // from backoffice-service). Angular's HttpClient can't tell CORS apart from "server down";
      // both surface as status 0.
      if (err.status === 0) {
        return { reason: 'network-or-cors', status: 0, message: err.message };
      }
      if (err.status === 404) {
        return { reason: 'no-invitation', status: 404, message: err.error?.message ?? err.message };
      }
      return { reason: 'server-error', status: err.status, message: err.error?.message ?? err.message };
    }
    return { reason: 'server-error', status: -1, message: String(err) };
  }
}
