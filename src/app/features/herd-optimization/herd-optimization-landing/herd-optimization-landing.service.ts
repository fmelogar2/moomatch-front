import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/** Recent HerdOptimizationJob rows for the landing list (G-2). */
export interface RecentJob {
  jobId: string;
  herdName: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  completedAtLabel: string;
}

@Injectable({ providedIn: 'root' })
export class HerdOptimizationLandingService {
  /** GET /api/herd-optimization/jobs?herdId= (mock). */
  listRecentJobs(): Observable<RecentJob[]> {
    return of([
      { jobId: 'job-fall-2024', herdName: 'Main Milking Herd', status: 'COMPLETE', completedAtLabel: 'herdOptimizationLanding.daysAgo' },
      { jobId: 'job-summer-2024', herdName: 'North Barn Heifers', status: 'COMPLETE', completedAtLabel: 'herdOptimizationLanding.monthAgo' },
    ]);
  }
}
