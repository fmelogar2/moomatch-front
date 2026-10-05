import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type ManagementSystem = 'GRAZING' | 'CONFINEMENT' | 'MIXED';
export type HerdStatus = 'ACTIVE' | 'INACTIVE';
export type HerdOptimizationState = 'OPTIMIZED' | 'NEEDS_UPDATE' | 'REVIEW_GENETICS';

/**
 * List-row view-model over `HerdProfile` (docs/moomatch-HLD.md Data Model → Cow & Herd), with a
 * few display-only aggregates (headcount, avgTpi, tpiTrend, lastRunAt) that a real `/api/herds`
 * list endpoint would join in. Swapping the mock body below for `HttpClient.get<HerdListItem[]>`
 * against `${environment.apiBaseUrl}/herds` is a one-line change once Cow Profile Service exposes it.
 */
export interface HerdListItem {
  id: string;
  farmId: string;
  name: string;
  managementSystem: ManagementSystem;
  region: string | null;
  status: HerdStatus;
  createdAt: string;
  headcount: number;
  avgTpi: number;
  tpiTrend: 'up' | 'down' | 'flat';
  lastRunAtLabel: string;
  optimizationState: HerdOptimizationState;
  tpiHistory: number[];
}

@Injectable({ providedIn: 'root' })
export class HerdListService {
  /** GET /api/herds (mock — see class Javadoc). */
  list(): Observable<HerdListItem[]> {
    return of([
      {
        id: 'herd-1',
        farmId: 'farm-1',
        name: 'Main Milking Herd',
        managementSystem: 'CONFINEMENT',
        region: 'Wisconsin',
        status: 'ACTIVE',
        createdAt: '2022-03-01T00:00:00Z',
        headcount: 452,
        avgTpi: 2845,
        tpiTrend: 'up',
        lastRunAtLabel: 'herdList.today0430',
        optimizationState: 'OPTIMIZED',
        tpiHistory: [2680, 2705, 2718, 2740, 2765, 2790, 2810, 2825, 2845],
      },
      {
        id: 'herd-2',
        farmId: 'farm-1',
        name: 'North Barn Heifers',
        managementSystem: 'MIXED',
        region: 'Wisconsin',
        status: 'ACTIVE',
        createdAt: '2022-06-15T00:00:00Z',
        headcount: 128,
        avgTpi: 2910,
        tpiTrend: 'flat',
        lastRunAtLabel: 'herdList.oct24',
        optimizationState: 'NEEDS_UPDATE',
        tpiHistory: [2900, 2895, 2905, 2900, 2908, 2905, 2910, 2909, 2910],
      },
      {
        id: 'herd-3',
        farmId: 'farm-1',
        name: 'Pasture Group B',
        managementSystem: 'GRAZING',
        region: 'Vermont',
        status: 'ACTIVE',
        createdAt: '2023-01-10T00:00:00Z',
        headcount: 85,
        avgTpi: 2650,
        tpiTrend: 'down',
        lastRunAtLabel: 'herdList.oct12',
        optimizationState: 'REVIEW_GENETICS',
        tpiHistory: [2720, 2705, 2690, 2685, 2670, 2665, 2660, 2655, 2650],
      },
    ]);
  }
}
