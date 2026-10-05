import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import type { EChartsOption } from 'echarts';
import { EChartComponent } from '../../../shared/ui/echart/echart';
import { StatusPillComponent, StatusTone } from '../../../shared/ui/status-pill/status-pill';
import { HerdListItem, HerdListService, HerdOptimizationState } from './herd-list.service';

const STATE_TONE: Record<HerdOptimizationState, StatusTone> = {
  OPTIMIZED: 'success',
  NEEDS_UPDATE: 'warning',
  REVIEW_GENETICS: 'error',
};

const STATE_LABEL_KEY: Record<HerdOptimizationState, string> = {
  OPTIMIZED: 'herdList.status.optimized',
  NEEDS_UPDATE: 'herdList.status.needsUpdate',
  REVIEW_GENETICS: 'herdList.status.reviewGenetics',
};

/** herd_management_moomatch prototype, re-skinned; SVG mini trend replaced with app-echart (HERD-6). */
@Component({
  selector: 'app-herd-list',
  standalone: true,
  imports: [TranslocoModule, StatusPillComponent, EChartComponent],
  templateUrl: './herd-list.html',
})
export class HerdListComponent implements OnInit {
  private readonly herdListService = inject(HerdListService);
  protected readonly router = inject(Router);

  readonly herds = signal<HerdListItem[]>([]);
  readonly trendChartOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    this.herdListService.list().subscribe((herds) => {
      this.herds.set(herds);
      const overall = herds[0]?.tpiHistory ?? [];
      this.trendChartOptions.set({
        grid: { left: 0, right: 0, top: 8, bottom: 20 },
        xAxis: { type: 'category', show: false, data: overall.map((_, i) => `Q${i + 1}`) },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: overall,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#127f45', width: 2 },
            areaStyle: { color: 'rgba(18, 127, 69, 0.15)' },
          },
        ],
      });
    });
  }

  toneFor(state: HerdOptimizationState): StatusTone {
    return STATE_TONE[state];
  }

  labelKeyFor(state: HerdOptimizationState): string {
    return STATE_LABEL_KEY[state];
  }

  openHerd(_herd: HerdListItem): void {
    // No single-herd detail screen in this phase's scope; whole-herd optimization is the closest
    // downstream action available today.
    this.router.navigateByUrl('/herd-optimization/setup');
  }
}
