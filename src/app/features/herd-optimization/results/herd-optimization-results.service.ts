import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/** HerdOptimizationJob (docs/moomatch-HLD.md Data Model → Recommendation), G-2. */
export interface JobStatusView {
  jobId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  percentComplete: number;
  summaryLabel: string;
}

/** HerdMatingPlan aggregate stats — assignments joined with fit scores (G-3). */
export interface MatingPlanSummary {
  totalCowsAssigned: number;
  eligibleHerdPercent: number;
  avgExpectedInbreedingPercent: number;
  inbreedingDeltaPercent: number;
  avgFitScore: number;
  fitScoreDelta: number;
}

/** One row of `HerdMatingPlan.assignments` (CowId -> BullId) joined with scoring detail. */
export interface MatingAssignmentRow {
  cowId: string;
  lactationNumber: number;
  assignedBullName: string;
  sireId: string;
  expectedInbreedingPercent: number;
  fitScore: number;
  inbreedingFlag: boolean;
}

@Injectable({ providedIn: 'root' })
export class HerdOptimizationResultsService {
  /** GET /api/herd-optimization/jobs/{jobId} (mock). */
  getJobStatus(jobId: string): Observable<JobStatusView> {
    return of({
      jobId,
      status: 'COMPLETE',
      percentComplete: 100,
      summaryLabel: 'herdOptimizationResults.processedSummary',
    });
  }

  /** GET /api/herd-optimization/jobs/{jobId}/plan (mock — HerdMatingPlan). */
  getSummary(_jobId: string): Observable<MatingPlanSummary> {
    return of({
      totalCowsAssigned: 450,
      eligibleHerdPercent: 100,
      avgExpectedInbreedingPercent: 5.2,
      inbreedingDeltaPercent: -1.1,
      avgFitScore: 89.4,
      fitScoreDelta: 4.2,
    });
  }

  /** GET /api/herd-optimization/jobs/{jobId}/assignments (mock). */
  getAssignments(_jobId: string): Observable<MatingAssignmentRow[]> {
    return of([
      { cowId: '#4892', lactationNumber: 2, assignedBullName: 'HO-ROCKET-99', sireId: '29HO19483', expectedInbreedingPercent: 4.8, fitScore: 92, inbreedingFlag: false },
      { cowId: '#4915', lactationNumber: 1, assignedBullName: 'HO-THUNDER', sireId: '14HO15002', expectedInbreedingPercent: 6.1, fitScore: 85, inbreedingFlag: true },
      { cowId: '#5022', lactationNumber: 3, assignedBullName: 'HO-MAVERICK', sireId: '7HO14859', expectedInbreedingPercent: 5.0, fitScore: 95, inbreedingFlag: false },
    ]);
  }
}
