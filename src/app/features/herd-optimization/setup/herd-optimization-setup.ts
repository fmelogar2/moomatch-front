import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  BullPoolRow,
  HerdOptimizationSetupService,
  OptimizationObjective,
  OptimizationSetupSummary,
} from './herd-optimization-setup.service';

/**
 * whole_herd_optimization_setup prototype (G-1). DEVIATION: rendered inside the standard
 * AppShell sidenav layout rather than the prototype's standalone top-nav variant, for consistency
 * with every other screen (decided up front — see task brief).
 */
@Component({
  selector: 'app-herd-optimization-setup',
  standalone: true,
  imports: [TranslocoModule, FormsModule],
  templateUrl: './herd-optimization-setup.html',
})
export class HerdOptimizationSetupComponent implements OnInit {
  private readonly service = inject(HerdOptimizationSetupService);
  private readonly router = inject(Router);

  readonly bullPool = signal<BullPoolRow[]>([]);
  readonly summary = signal<OptimizationSetupSummary | null>(null);
  readonly starting = signal(false);

  readonly objectives: OptimizationObjective[] = ['TPI', 'FERTILITY', 'CUSTOM'];
  objective: OptimizationObjective = 'TPI';
  maxExpectedInbreedingPercent = 6.25;

  ngOnInit(): void {
    this.service.getBullPool().subscribe((rows) => this.bullPool.set(rows));
    this.service.getSummary().subscribe((s) => this.summary.set(s));
  }

  selectObjective(objective: OptimizationObjective): void {
    this.objective = objective;
  }

  start(): void {
    this.starting.set(true);
    this.service
      .startOptimization({
        herdId: 'herd-1',
        objective: this.objective,
        bullPool: this.bullPool(),
        maxExpectedInbreedingPercent: this.maxExpectedInbreedingPercent,
      })
      .subscribe(({ jobId }) => {
        this.starting.set(false);
        this.router.navigate(['/herd-optimization/results', jobId]);
      });
  }
}
