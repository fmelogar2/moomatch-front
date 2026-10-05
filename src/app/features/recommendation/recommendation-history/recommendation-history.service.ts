import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type RecommendationStatus = 'DRAFT' | 'SCORED' | 'REVIEWED' | 'CONFIRMED' | 'DISCARDED' | 'NO_MATCH' | 'CLOSED';

/** MatingRecommendation row for the audit-trail table (docs/moomatch-HLD.md Data Model → Recommendation), H-3. */
export interface RecommendationHistoryRow {
  id: string;
  cowIdentifier: string;
  requestedAtLabel: string;
  objectiveLabelKey: string;
  recommendedBullRegistryId: string;
  topFitScore: number;
  status: RecommendationStatus;
  actorName: string;
}

@Injectable({ providedIn: 'root' })
export class RecommendationHistoryService {
  /** GET /api/recommendations (mock — recommendation-api RecommendationController, listed per herd). */
  list(): Observable<RecommendationHistoryRow[]> {
    return of([
      {
        id: '1042-A',
        cowIdentifier: '#1042-A',
        requestedAtLabel: 'Oct 24, 2023 · 08:14 AM',
        objectiveLabelKey: 'breedingObjective.milk',
        recommendedBullRegistryId: 'HOUSA123456',
        topFitScore: 94,
        status: 'CONFIRMED',
        actorName: 'Dr. Sarah Jenkins',
      },
      {
        id: '1088-B',
        cowIdentifier: '#1088-B',
        requestedAtLabel: 'Oct 23, 2023 · 14:30 PM',
        objectiveLabelKey: 'breedingObjective.show',
        recommendedBullRegistryId: 'HOCAN987654',
        topFitScore: 68,
        status: 'REVIEWED',
        actorName: 'Auto-Engine',
      },
      {
        id: '0933-C',
        cowIdentifier: '#0933-C',
        requestedAtLabel: 'Oct 22, 2023 · 09:05 AM',
        objectiveLabelKey: 'breedingObjective.fertility',
        recommendedBullRegistryId: 'HOUSA224466',
        topFitScore: 32,
        status: 'DISCARDED',
        actorName: 'Mark Stevens',
      },
    ]);
  }
}
