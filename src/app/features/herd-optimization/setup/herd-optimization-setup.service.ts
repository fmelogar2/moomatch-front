import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type OptimizationObjective = 'TPI' | 'FERTILITY' | 'CUSTOM';

/** BullUsageCap row (docs/moomatch-HLD.md Data Model → Bull Pool), G-4. */
export interface BullPoolRow {
  bullId: string;
  registryId: string;
  maxMatings: number;
  semenInventory: number;
}

/** Aggregate preview backing the "Configuration Summary" panel — HerdProfile + BullProfile joins. */
export interface OptimizationSetupSummary {
  eligibleFemales: number;
  siresInPool: number;
  totalStrawsAvailable: number;
  estimatedComputeTimeLabel: string;
}

export interface StartOptimizationRequest {
  herdId: string;
  objective: OptimizationObjective;
  bullPool: BullPoolRow[];
  maxExpectedInbreedingPercent: number;
}

@Injectable({ providedIn: 'root' })
export class HerdOptimizationSetupService {
  /** GET /api/bull-pool/usage-caps?herdId= (mock). */
  getBullPool(): Observable<BullPoolRow[]> {
    return of([
      { bullId: 'b1', registryId: '29HO19821', maxMatings: 50, semenInventory: 120 },
      { bullId: 'b2', registryId: '7HO15167', maxMatings: 100, semenInventory: 250 },
    ]);
  }

  /** GET /api/herd-optimization/setup-summary?herdId= (mock). */
  getSummary(): Observable<OptimizationSetupSummary> {
    return of({ eligibleFemales: 850, siresInPool: 14, totalStrawsAvailable: 1420, estimatedComputeTimeLabel: '~45 sec' });
  }

  /** POST /api/herd-optimization/jobs (mock — HerdOptimizationJob, G-1). */
  startOptimization(request: StartOptimizationRequest): Observable<{ jobId: string }> {
    // eslint-disable-next-line no-console
    console.info('[mock] start herd optimization', request);
    return of({ jobId: 'job-fall-2024' });
  }
}
