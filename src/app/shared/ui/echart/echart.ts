import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input } from '@angular/core';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';

/**
 * Thin wrapper around Apache ECharts — the prototypes' "charts" (TPI trend line, Fit Score ring,
 * trait-distribution bars) were all hand-authored SVG/CSS mockups with no charting library
 * referenced, so this is the first real integration (see docs/design survey notes).
 */
@Component({
  selector: 'app-echart',
  standalone: true,
  template: `<div #host [style.height.px]="height()" class="w-full"></div>`,
})
export class EChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  readonly options = input.required<EChartsOption>();
  readonly height = input<number>(240);

  private instance: echarts.ECharts | null = null;

  constructor() {
    effect(() => {
      const opts = this.options();
      this.instance?.setOption(opts, true);
    });
  }

  ngAfterViewInit(): void {
    this.instance = echarts.init(this.hostRef.nativeElement);
    this.instance.setOption(this.options());
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.instance?.dispose();
  }

  private readonly handleResize = () => this.instance?.resize();
}
