import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Farm {
  id: string;
  name: string;
  mfaRequired: boolean;
}

/**
 * Loads the current user's Farm (GET /api/backoffice/farms/me) as soon as a profile is
 * provisioned, so any component can just read `farm()` without triggering the fetch itself.
 */
@Injectable({ providedIn: 'root' })
export class FarmService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly farmSignal = signal<Farm | null>(null);
  readonly farm = this.farmSignal.asReadonly();

  constructor() {
    effect(() => {
      const profile = this.auth.profile();
      if (!profile) {
        this.farmSignal.set(null);
        return;
      }
      this.http
        .get<Farm>(`${environment.apiBaseUrl}/backoffice/farms/me`)
        .pipe(catchError(() => of(null)))
        .subscribe((farm) => this.farmSignal.set(farm));
    });
  }
}
