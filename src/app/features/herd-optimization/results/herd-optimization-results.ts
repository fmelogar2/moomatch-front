import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';
import {
  HerdOptimizationResultsService,
  JobStatusView,
  MatingAssignmentRow,
  MatingPlanSummary,
} from './herd-optimization-results.service';

/** whole_herd_mating_plan_results prototype (G-2/G-3). */
@Component({
  selector: 'app-herd-optimization-results',
  standalone: true,
  imports: [TranslocoModule, StatCardComponent],
  templateUrl: './herd-optimization-results.html',
})
export class HerdOptimizationResultsComponent implements OnInit {
  private readonly service = inject(HerdOptimizationResultsService);
  private readonly route = inject(ActivatedRoute);

  readonly jobStatus = signal<JobStatusView | null>(null);
  readonly summary = signal<MatingPlanSummary | null>(null);
  readonly assignments = signal<MatingAssignmentRow[]>([]);

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('jobId') ?? '';
    this.service.getJobStatus(jobId).subscribe((s) => this.jobStatus.set(s));
    this.service.getSummary(jobId).subscribe((s) => this.summary.set(s));
    this.service.getAssignments(jobId).subscribe((rows) => this.assignments.set(rows));
  }
}
