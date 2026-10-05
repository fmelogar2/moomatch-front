import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import type { EChartsOption } from 'echarts';
import { AuthService } from '../../core/auth.service';
import { EChartComponent } from '../../shared/ui/echart/echart';
import {
  BreedingObjectiveCode,
  ConfigConflictError,
  ProgramConfig,
  ProgramConfigChangeLogEntry,
  ProgramConfigService,
} from './program-config.service';

const TPI_TRAIT_DISTRIBUTION = [
  { labelKey: 'programConfig.distribution.production', percent: 40, color: '#465f88' },
  { labelKey: 'programConfig.distribution.healthFertility', percent: 30, color: '#127f45' },
  { labelKey: 'programConfig.distribution.type', percent: 30, color: '#12314e' },
];

/** program_configuration_moomatch prototype (BO-CFG-1..4) — real HTTP with optimistic-lock handling. */
@Component({
  selector: 'app-program-config',
  standalone: true,
  imports: [TranslocoModule, FormsModule, EChartComponent],
  templateUrl: './program-config.html',
})
export class ProgramConfigComponent implements OnInit {
  private readonly service = inject(ProgramConfigService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly herdId = 'herd-1';

  readonly config = signal<ProgramConfig | null>(null);
  readonly history = signal<ProgramConfigChangeLogEntry[]>([]);
  readonly isAdmin = signal(false);
  readonly conflictMessage = signal<string | null>(null);
  readonly saving = signal(false);
  readonly activeObjective = signal<BreedingObjectiveCode>('TPI');
  readonly objectiveCodes: BreedingObjectiveCode[] = ['TPI', 'MILK', 'FERTILITY', 'HEALTH', 'SHOW'];
  readonly distribution = TPI_TRAIT_DISTRIBUTION;
  readonly chartOptions = signal<EChartsOption>({});

  inbreedingThreshold = 6.25;
  reliabilityFloor = 65;

  ngOnInit(): void {
    const admin = this.auth.profile()?.role === 'FARM_ADMIN';
    this.isAdmin.set(admin);
    if (!admin) {
      this.router.navigateByUrl('/dashboard');
      return;
    }
    this.load();
    this.service.history(this.herdId).subscribe((h) => this.history.set(h));
    this.buildChart();
  }

  private load(): void {
    this.service.get(this.herdId).subscribe((cfg) => {
      this.config.set(cfg);
      this.inbreedingThreshold = cfg.inbreedingThreshold;
      this.reliabilityFloor = cfg.reliabilityFloor;
    });
  }

  private buildChart(): void {
    this.chartOptions.set({
      grid: { left: 140, right: 32, top: 8, bottom: 8 },
      xAxis: { type: 'value', show: false, max: 100 },
      yAxis: { type: 'category', data: this.distribution.map((d) => d.labelKey), axisLine: { show: false }, axisTick: { show: false } },
      series: [
        {
          type: 'bar',
          data: this.distribution.map((d) => ({ value: d.percent, itemStyle: { color: d.color } })),
          barWidth: 14,
          label: { show: true, position: 'right', formatter: '{c}%' },
        },
      ],
    });
  }

  selectObjective(code: BreedingObjectiveCode): void {
    this.activeObjective.set(code);
  }

  save(): void {
    const cfg = this.config();
    if (!cfg) {
      return;
    }
    this.conflictMessage.set(null);
    this.saving.set(true);
    this.service
      .update(this.herdId, {
        inbreedingThreshold: this.inbreedingThreshold,
        reliabilityFloor: this.reliabilityFloor,
        objectiveWeightOverrides: cfg.objectiveWeightOverrides,
        expectedVersion: cfg.version,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.config.set(updated);
        },
        error: (err) => {
          this.saving.set(false);
          if (err instanceof ConfigConflictError) {
            this.conflictMessage.set('programConfig.conflictReloading');
            this.load();
          }
        },
      });
  }

  discard(): void {
    this.load();
  }
}
