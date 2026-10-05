import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type ComparisonMethod = 'NATIVE' | 'MACE_CONVERTED' | 'PERCENTILE_APPROX';
export type ReliabilityTier = 'PROVEN' | 'YOUNG_GENOMIC';

/** RecommendationCandidate (docs/moomatch-HLD.md Data Model → Recommendation), F-2. */
export interface RecommendationCandidateView {
  bullId: string;
  bullName: string;
  registryId: string;
  fitScore: number;
  ptaMilk: string;
  productiveLifeMonths: string;
  reasons: { icon: string; titleKey: string; titleParams?: Record<string, string>; bodyKey: string; bodyParams?: Record<string, string> }[];
  inbreedingCoefficient: number;
  inbreedingThreshold: number;
  reliability: number;
  reliabilityTier: ReliabilityTier;
  comparisonMethod: ComparisonMethod;
  environmentCaveat: boolean;
}

/** MatingRecommendation summary for the single-cow analysis header (F-1). */
export interface RecommendationHeader {
  recommendationId: string;
  cowIdentifier: string;
  breed: string;
  lactationNumber: number;
  dataAsOfLabel: string;
}

@Injectable({ providedIn: 'root' })
export class RecommendationAnalysisService {
  /** GET /api/recommendations/{id} (mock — see recommendation-api RecommendationController). */
  getRecommendation(cowId: string): Observable<{ header: RecommendationHeader; topCandidate: RecommendationCandidateView }> {
    return of({
      header: {
        recommendationId: 'rec-1',
        cowIdentifier: cowId,
        breed: 'Holstein',
        lactationNumber: 2,
        dataAsOfLabel: 'recommendationAnalysis.dataDaysAgo',
      },
      topCandidate: {
        bullId: 'bull-1',
        bullName: 'AltaLawson',
        registryId: 'NAAB: 11HO15606 • HO840M003215425509',
        fitScore: 94,
        ptaMilk: '+1842',
        productiveLifeMonths: '+8.2',
        reasons: [
          {
            icon: 'check',
            titleKey: 'recommendationAnalysis.reason.rumpAngle.title',
            bodyKey: 'recommendationAnalysis.reason.rumpAngle.body',
          },
          {
            icon: 'trending_up',
            titleKey: 'recommendationAnalysis.reason.milkYield.title',
            bodyKey: 'recommendationAnalysis.reason.milkYield.body',
          },
          {
            icon: 'shield',
            titleKey: 'recommendationAnalysis.reason.health.title',
            bodyKey: 'recommendationAnalysis.reason.health.body',
          },
        ],
        inbreedingCoefficient: 0.042,
        inbreedingThreshold: 0.06,
        reliability: 0.85,
        reliabilityTier: 'PROVEN',
        comparisonMethod: 'NATIVE',
        environmentCaveat: false,
      },
    });
  }

  /** PUT /api/recommendations/{id}/confirm (mock). */
  confirm(recommendationId: string): Observable<void> {
    // eslint-disable-next-line no-console
    console.info('[mock] confirm recommendation', recommendationId);
    return of(void 0);
  }

  /** PUT /api/recommendations/{id}/discard (mock). */
  discard(recommendationId: string, reason: string): Observable<void> {
    // eslint-disable-next-line no-console
    console.info('[mock] discard recommendation', recommendationId, reason);
    return of(void 0);
  }
}
