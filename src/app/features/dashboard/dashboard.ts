import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { EChartsOption } from 'echarts';
import { FarmService } from '../../core/farm.service';
import { EChartComponent } from '../../shared/ui/echart/echart';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card';
import {
  ActiveRecommendationSummary,
  ActivityLogEntry,
  DashboardService,
  DashboardSummary,
} from './dashboard.service';

/** dashboard_moomatch_updated prototype, re-skinned to the real design tokens (H-3 / HERD-6). */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslocoModule, StatCardComponent, EChartComponent],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly transloco = inject(TranslocoService);
  private readonly farmService = inject(FarmService);
  readonly router = inject(Router);
  readonly farm = this.farmService.farm;

  readonly summary = signal<DashboardSummary | null>(null);
  readonly activeRecommendations = signal<ActiveRecommendationSummary[]>([]);
  readonly recentActivity = signal<ActivityLogEntry[]>([]);
  readonly chartOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe((s) => this.summary.set(s));
    this.dashboardService.getActiveRecommendations().subscribe((r) => this.activeRecommendations.set(r));
    this.dashboardService.getRecentActivity().subscribe((a) => this.recentActivity.set(a));
    this.dashboardService.getGeneticProgressTrend().subscribe((points) => {
      this.chartOptions.set({
        grid: { left: 40, right: 16, top: 16, bottom: 24 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: points.map((p) => p.monthLabel), axisLine: { lineStyle: { color: '#c4c6cf' } } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#e0e3e5' } } },
        series: [
          {
            name: this.transloco.translate('dashboard.geneticProgress'),
            type: 'line',
            data: points.map((p) => p.avgGeneticMerit),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#127f45', width: 3 },
            itemStyle: { color: '#127f45' },
            areaStyle: { color: 'rgba(18, 127, 69, 0.12)' },
          },
        ],
      });
    });
  }

  goToNewRun(): void {
    this.router.navigateByUrl('/herd-optimization/setup');
  }
}
