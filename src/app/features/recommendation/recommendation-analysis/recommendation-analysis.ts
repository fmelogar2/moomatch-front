import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CandidateCardComponent } from '../../../shared/ui/candidate-card/candidate-card';
import { ReliabilityBandComponent } from '../../../shared/ui/reliability-band/reliability-band';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { RecommendationAnalysisService, RecommendationCandidateView, RecommendationHeader } from './recommendation-analysis.service';

/** recommendation_analysis_updated prototype (F-1..F-5, H-1/H-2). */
@Component({
  selector: 'app-recommendation-analysis',
  standalone: true,
  imports: [TranslocoModule, CandidateCardComponent, ReliabilityBandComponent],
  templateUrl: './recommendation-analysis.html',
})
export class RecommendationAnalysisComponent implements OnInit {
  private readonly service = inject(RecommendationAnalysisService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly header = signal<RecommendationHeader | null>(null);
  readonly candidate = signal<RecommendationCandidateView | null>(null);

  ngOnInit(): void {
    const cowId = this.route.snapshot.paramMap.get('cowId') ?? '';
    this.service.getRecommendation(cowId).subscribe(({ header, topCandidate }) => {
      this.header.set(header);
      this.candidate.set(topCandidate);
    });
  }

  async confirmMating(): Promise<void> {
    const c = this.candidate();
    const h = this.header();
    if (!c || !h) {
      return;
    }
    const confirmed = await this.confirmDialog.confirm({
      title: 'Confirm Mating',
      message: `Confirm ${c.bullName} for cow ${h.cowIdentifier}?`,
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
    });
    if (confirmed) {
      this.service.confirm(h.recommendationId).subscribe(() => this.router.navigateByUrl('/recommendations/history'));
    }
  }

  async discard(): Promise<void> {
    const h = this.header();
    if (!h) {
      return;
    }
    const confirmed = await this.confirmDialog.confirm({
      title: 'Discard Recommendation',
      message: 'This recommendation will be marked as discarded.',
      confirmLabel: 'Discard',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });
    if (confirmed) {
      this.service.discard(h.recommendationId, 'Discarded by user').subscribe(() => this.router.navigateByUrl('/recommendations/history'));
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/herds');
  }
}
