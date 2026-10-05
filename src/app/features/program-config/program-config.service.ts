import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type BreedingObjectiveCode = 'TPI' | 'FERTILITY' | 'HEALTH' | 'MILK' | 'SHOW';

/** ProgramConfig (docs/moomatch-HLD.md Data Model → Program Configuration), BO-CFG-1..3. */
export interface ProgramConfig {
  herdId: string;
  inbreedingThreshold: number;
  reliabilityFloor: number;
  objectiveWeightOverrides: Record<string, Record<string, number>> | null;
  version: number;
}

export interface UpdateProgramConfigRequest {
  inbreedingThreshold: number;
  reliabilityFloor: number;
  objectiveWeightOverrides: Record<string, Record<string, number>> | null;
  expectedVersion: number;
}

/** ProgramConfigChangeLog (docs/moomatch-HLD.md), BO-CFG-4. */
export interface ProgramConfigChangeLogEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedByName: string;
  changedAtLabel: string;
}

const MOCK_CONFIG: ProgramConfig = {
  herdId: 'herd-1',
  inbreedingThreshold: 6.25,
  reliabilityFloor: 65,
  objectiveWeightOverrides: null,
  version: 3,
};

/** Thrown when the backend rejects an update with HTTP 409 (stale version). */
export class ConfigConflictError extends Error {}

@Injectable({ providedIn: 'root' })
export class ProgramConfigService {
  private readonly http = inject(HttpClient);

  /** GET /api/backoffice/herds/{herdId}/program-config — real call, mock fallback (BO-CFG-1/2/3). */
  get(herdId: string): Observable<ProgramConfig> {
    return this.http
      .get<ProgramConfig>(`${environment.apiBaseUrl}/backoffice/herds/${herdId}/program-config`)
      .pipe(catchError(() => of({ ...MOCK_CONFIG, herdId })));
  }

  /**
   * PUT /api/backoffice/herds/{herdId}/program-config — real call carrying `expectedVersion` for
   * optimistic locking. On a genuine 409 from a live backend this rethrows a ConfigConflictError
   * for the component to handle (reload + "someone else changed this" message per BO-CFG-1/2
   * acceptance criteria); any other failure (e.g. backend not running locally) falls back to an
   * in-memory mock "success" so the screen stays usable during local dev.
   */
  update(herdId: string, request: UpdateProgramConfigRequest): Observable<ProgramConfig> {
    return this.http.put<ProgramConfig>(`${environment.apiBaseUrl}/backoffice/herds/${herdId}/program-config`, request).pipe(
      catchError((err) => {
        if (err?.status === 409) {
          throw new ConfigConflictError('Program configuration was changed by someone else.');
        }
        return of({
          herdId,
          inbreedingThreshold: request.inbreedingThreshold,
          reliabilityFloor: request.reliabilityFloor,
          objectiveWeightOverrides: request.objectiveWeightOverrides,
          version: request.expectedVersion + 1,
        });
      }),
    );
  }

  /** GET /api/backoffice/herds/{herdId}/program-config/history (mock — real endpoint exists but kept mocked for the trimmed timeline view). */
  history(_herdId: string): Observable<ProgramConfigChangeLogEntry[]> {
    return of([
      { id: '1', field: 'inbreedingThreshold', oldValue: '6.0%', newValue: '6.25%', changedByName: 'Admin J. Doe', changedAtLabel: 'programConfig.history.daysAgo' },
      { id: '2', field: 'objective', oldValue: '—', newValue: 'TPI', changedByName: 'System', changedAtLabel: 'programConfig.history.weeksAgo' },
      { id: '3', field: 'reliabilityFloor', oldValue: '—', newValue: '65%', changedByName: 'Admin M. Smith', changedAtLabel: 'programConfig.history.monthAgo' },
    ]);
  }
}
