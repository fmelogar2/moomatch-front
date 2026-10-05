import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Aggregate view-model for the Dashboard screen. Backed by several entities (HerdProfile,
 * MatingRecommendation, SecurityAuditEvent — see docs/moomatch-HLD.md Data Model) — there is no
 * single "Dashboard" entity, so this is a read/aggregation shape rather than a 1:1 entity mirror.
 * Once a dashboard/aggregation endpoint exists behind the API Gateway, swap the mock body below
 * for an HttpClient call returning this same shape.
 */
export interface DashboardSummary {
  totalHerdSize: number;
  herdSizeDeltaMonth: number;
  avgGeneticMerit: number;
  avgGeneticMeritDeltaYtd: number;
  pendingIntakes: number;
}

export interface ActiveRecommendationSummary {
  id: string;
  runLabel: string;
  groupName: string;
  cowCount: number;
  sireCount: number;
  objectiveLabelKey: string;
  matchRatePercent: number;
  confidence: 'high' | 'review';
}

export interface ActivityLogEntry {
  id: string;
  icon: string;
  tone: 'neutral' | 'success' | 'error';
  messageKey: string;
  messageParams?: Record<string, string | number>;
  occurredAtKey: string;
}

export interface GeneticProgressPoint {
  monthLabel: string;
  avgGeneticMerit: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  /** GET /api/dashboard/summary (mock — see class Javadoc). */
  getSummary(): Observable<DashboardSummary> {
    return of({
      totalHerdSize: 420,
      herdSizeDeltaMonth: 12,
      avgGeneticMerit: 2840,
      avgGeneticMeritDeltaYtd: 45,
      pendingIntakes: 14,
    });
  }

  /** GET /api/recommendations?status=DRAFT,SCORED,REVIEWED&groupBy=run (mock). */
  getActiveRecommendations(): Observable<ActiveRecommendationSummary[]> {
    return of([
      {
        id: '992A',
        runLabel: 'Run ID: #992A',
        groupName: 'Spring Heifer Group',
        cowCount: 45,
        sireCount: 3,
        objectiveLabelKey: 'breedingObjective.milk',
        matchRatePercent: 85,
        confidence: 'high',
      },
      {
        id: '991B',
        runLabel: 'Run ID: #991B',
        groupName: 'Problem Breeders',
        cowCount: 12,
        sireCount: 5,
        objectiveLabelKey: 'breedingObjective.fertility',
        matchRatePercent: 40,
        confidence: 'review',
      },
    ]);
  }

  /** GET /api/backoffice/security-audit?limit=10 (mock). */
  getRecentActivity(): Observable<ActivityLogEntry[]> {
    return of<ActivityLogEntry[]>([
      {
        id: '1',
        icon: 'science',
        tone: 'neutral',
        messageKey: 'dashboard.activity.genomicResults',
        messageParams: { count: 14 },
        occurredAtKey: 'dashboard.activity.hoursAgo',
      },
      {
        id: '2',
        icon: 'done_all',
        tone: 'success',
        messageKey: 'dashboard.activity.runApproved',
        messageParams: { run: '#992A', user: 'J. Smith' },
        occurredAtKey: 'dashboard.activity.yesterdayAt',
      },
      {
        id: '3',
        icon: 'warning',
        tone: 'error',
        messageKey: 'dashboard.activity.inbreedingAlert',
        messageParams: { cow: '402', sire: '99' },
        occurredAtKey: 'dashboard.activity.yesterdayAt',
      },
    ]);
  }

  /** GET /api/dashboard/genetic-progress?months=12 (mock 12-month "genetic progress" trend). */
  getGeneticProgressTrend(): Observable<GeneticProgressPoint[]> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const base = 2795;
    return of(months.map((monthLabel, i) => ({ monthLabel, avgGeneticMerit: base + Math.round(i * 4.1 + (i % 3) * 2) })));
  }
}
