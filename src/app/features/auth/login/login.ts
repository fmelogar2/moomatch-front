import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../../core/auth.service';

/** login_moomatch prototype, fully wired to Firebase Authentication (AUTH-1/AUTH-2). */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslocoModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  submitting = signal(false);
  errorKey = signal<string | null>(null);
  resetSent = signal(false);

  async submitEmailLogin(): Promise<void> {
    this.errorKey.set(null);
    this.submitting.set(true);
    try {
      await this.auth.signInWithEmail(this.email, this.password);
      await this.afterSignIn();
    } catch (err) {
      this.errorKey.set(this.mapError(err));
    } finally {
      this.submitting.set(false);
    }
  }

  async continueWithGoogle(): Promise<void> {
    this.errorKey.set(null);
    this.submitting.set(true);
    try {
      await this.auth.signInWithGoogle();
      await this.afterSignIn();
    } catch (err) {
      this.errorKey.set(this.mapError(err));
    } finally {
      this.submitting.set(false);
    }
  }

  async continueWithMicrosoft(): Promise<void> {
    this.errorKey.set(null);
    this.submitting.set(true);
    try {
      await this.auth.signInWithMicrosoft();
      await this.afterSignIn();
    } catch (err) {
      this.errorKey.set(this.mapError(err));
    } finally {
      this.submitting.set(false);
    }
  }

  async requestPasswordReset(): Promise<void> {
    if (!this.email) {
      return;
    }
    try {
      await this.auth.resetPassword(this.email);
    } finally {
      // Never reveal whether the email exists in the system (AUTH-6).
      this.resetSent.set(true);
    }
  }

  private async afterSignIn(): Promise<void> {
    const profile = await this.auth.ensureProvisioned();
    if (profile) {
      await this.router.navigateByUrl('/dashboard');
      return;
    }
    const error = this.auth.provisionError();
    switch (error?.reason) {
      case 'network-or-cors':
        this.errorKey.set('login.provisionNetworkError');
        break;
      case 'server-error':
        this.errorKey.set('login.provisionServerError');
        break;
      default:
        this.errorKey.set('login.noPendingInvitation');
    }
  }

  private mapError(err: unknown): string {
    if (err instanceof FirebaseError) {
      if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(err.code)) {
        return 'login.invalidCredentials';
      }
      if (err.code === 'auth/popup-closed-by-user') {
        return '';
      }
    }
    return 'login.genericError';
  }
}
