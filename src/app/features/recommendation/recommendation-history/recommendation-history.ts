import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { StatusPillComponent, StatusTone } from '../../../shared/ui/status-pill/status-pill';
import { RecommendationHistoryRow, RecommendationHistoryService, RecommendationStatus } from './recommendation-history.service';

const STATUS_TONE: Record<RecommendationStatus, StatusTone> = {
  DRAFT: 'neutral',
  SCORED: 'info',
  REVIEWED: 'warning',
  CONFIRMED: 'success',
  DISCARDED: 'error',
  NO_MATCH: 'error',
  CLOSED: 'neutral',
};

const STATUS_LABEL_KEY: Record<RecommendationStatus, string> = {
  DRAFT: 'recommendationHistory.status.draft',
  SCORED: 'recommendationHistory.status.scored',
  REVIEWED: 'recommendationHistory.status.pending',
  CONFIRMED: 'recommendationHistory.status.confirmed',
  DISCARDED: 'recommendationHistory.status.discarded',
  NO_MATCH: 'recommendationHistory.status.noMatch',
  CLOSED: 'recommendationHistory.status.closed',
};

/** recommendation_history_moomatch prototype (H-3). */
@Component({
  selector: 'app-recommendation-history',
  standalone: true,
  imports: [TranslocoModule, StatusPillComponent],
  templateUrl: './recommendation-history.html',
})
export class RecommendationHistoryComponent implements OnInit {
  private readonly service = inject(RecommendationHistoryService);

  readonly rows = signal<RecommendationHistoryRow[]>([]);
  readonly expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.service.list().subscribe((rows) => this.rows.set(rows));
  }

  toggle(row: RecommendationHistoryRow): void {
    this.expandedId.set(this.expandedId() === row.id ? null : row.id);
  }

  toneFor(status: RecommendationStatus): StatusTone {
    return STATUS_TONE[status];
  }

  labelKeyFor(status: RecommendationStatus): string {
    return STATUS_LABEL_KEY[status];
  }
}
