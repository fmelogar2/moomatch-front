import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { StatusPillComponent, StatusTone } from '../../../shared/ui/status-pill/status-pill';
import { HerdOptimizationLandingService, RecentJob } from './herd-optimization-landing.service';

const STATUS_TONE: Record<RecentJob['status'], StatusTone> = {
  QUEUED: 'neutral',
  RUNNING: 'info',
  COMPLETE: 'success',
  FAILED: 'error',
};

/** Small landing screen at /herd-optimization — no prototype; a simple list + CTA card (G-1/G-2/G-3). */
@Component({
  selector: 'app-herd-optimization-landing',
  standalone: true,
  imports: [TranslocoModule, RouterLink, StatusPillComponent],
  templateUrl: './herd-optimization-landing.html',
})
export class HerdOptimizationLandingComponent implements OnInit {
  private readonly service = inject(HerdOptimizationLandingService);

  readonly recentJobs = signal<RecentJob[]>([]);

  ngOnInit(): void {
    this.service.listRecentJobs().subscribe((jobs) => this.recentJobs.set(jobs));
  }

  toneFor(status: RecentJob['status']): StatusTone {
    return STATUS_TONE[status];
  }
}
