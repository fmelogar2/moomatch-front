import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MatingOutcomeStatus = 'LIVE_BIRTH_HEALTHY' | 'COMPLICATIONS' | 'STILLBORN' | 'ABORTED';
export type CalfSex = 'HEIFER' | 'BULL';

/**
 * Pending confirmed mating awaiting an outcome — joins `MatingRecommendation` (status=CONFIRMED)
 * with its cow/bull identifiers. recommendation-api does not (yet) expose a "list confirmed
 * matings awaiting outcome for a herd" endpoint — only per-recommendation outcome lookups
 * (`GET /api/mating-outcomes?recommendationId=`) — so the pending queue below stays mocked.
 * TODO: wire to a real herd-scoped "pending outcomes" endpoint once recommendation-api adds one.
 */
export interface PendingMating {
  recommendationId: string;
  damId: string;
  sireId: string;
  matingDateLabel: string;
  estimatedDueDateLabel: string;
  overdue: boolean;
  predictedMilkPta: string;
  predictedProductiveLife: string;
}

/** MatingOutcome (docs/moomatch-HLD.md Data Model → Recommendation), H-4. */
export interface LogMatingOutcomeRequest {
  recommendationId: string;
  status: MatingOutcomeStatus;
  birthDate: string | null;
  calfSex: CalfSex | null;
  calfId: string | null;
  outcomeNotes: string | null;
}

export interface MatingOutcome {
  id: string;
  recommendationId: string;
  status: MatingOutcomeStatus;
  birthDate: string | null;
  calfSex: CalfSex | null;
  calfId: string | null;
  genomicSampleKitRequested: boolean;
  loggedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MatingOutcomesService {
  private readonly http = inject(HttpClient);

  /** Mocked pending queue — see class Javadoc. */
  listPending(): Observable<PendingMating[]> {
    return of([
      {
        recommendationId: 'rec-4921',
        damId: 'D-4921',
        sireId: 'S-HO-992',
        matingDateLabel: '2023-01-15',
        estimatedDueDateLabel: '2023-10-25',
        overdue: true,
        predictedMilkPta: '+1240 lbs',
        predictedProductiveLife: '+4.2 mo',
      },
      {
        recommendationId: 'rec-5104',
        damId: 'D-5104',
        sireId: 'S-JE-114',
        matingDateLabel: '2023-01-20',
        estimatedDueDateLabel: '2023-10-30',
        overdue: false,
        predictedMilkPta: '+980 lbs',
        predictedProductiveLife: '+3.1 mo',
      },
      {
        recommendationId: 'rec-3882',
        damId: 'D-3882',
        sireId: 'S-HO-455',
        matingDateLabel: '2023-01-22',
        estimatedDueDateLabel: '2023-11-01',
        overdue: false,
        predictedMilkPta: '+1105 lbs',
        predictedProductiveLife: '+3.8 mo',
      },
    ]);
  }

  /**
   * POST /api/mating-outcomes — real HTTP call to recommendation-api's MatingOutcomeController
   * (H-4; genomicSampleKitRequested is auto-set server-side on LIVE_BIRTH_HEALTHY). Falls back to
   * an in-memory mock response if the backend isn't reachable during local dev.
   */
  logOutcome(request: LogMatingOutcomeRequest): Observable<MatingOutcome> {
    return this.http.post<MatingOutcome>(`${environment.apiBaseUrl}/mating-outcomes`, request).pipe(
      catchError(() =>
        of<MatingOutcome>({
          id: `mock-${Date.now()}`,
          recommendationId: request.recommendationId,
          status: request.status,
          birthDate: request.birthDate,
          calfSex: request.calfSex,
          calfId: request.calfId,
          genomicSampleKitRequested: request.status === 'LIVE_BIRTH_HEALTHY',
          loggedAt: new Date().toISOString(),
        }),
      ),
    );
  }
}
