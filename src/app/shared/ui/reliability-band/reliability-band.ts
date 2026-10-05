import { Component, computed, input } from '@angular/core';

/**
 * moomatch/DESIGN.md "Reliability Bands" component: red/amber/green semantics matching the
 * reliability floor bands from docs/moomatch-HLD.md (full-confidence >=65%, flagged 40-65%, excluded <40%).
 */
@Component({
  selector: 'app-reliability-band',
  standalone: true,
  template: `
    <div>
      <div class="flex items-center justify-between mb-1">
        <span class="text-body-sm text-on-surface-variant">{{ label() }}</span>
        <span class="font-data-mono text-data-mono" [class]="textClass()">{{ (value() * 100).toFixed(0) }}%</span>
      </div>
      <div class="h-2 rounded-full bg-surface-container-high overflow-hidden">
        <div class="h-full rounded-full transition-all" [class]="barClass()" [style.width.%]="value() * 100"></div>
      </div>
    </div>
  `,
})
export class ReliabilityBandComponent {
  readonly label = input.required<string>();
  /** 0..1 */
  readonly value = input.required<number>();

  private readonly band = computed(() => {
    const v = this.value();
    if (v >= 0.65) return 'high';
    if (v >= 0.4) return 'medium';
    return 'low';
  });

  readonly barClass = computed(() =>
    this.band() === 'high' ? 'bg-secondary' : this.band() === 'medium' ? 'bg-tertiary-fixed-dim' : 'bg-error',
  );
  readonly textClass = computed(() =>
    this.band() === 'high' ? 'text-secondary' : this.band() === 'medium' ? 'text-on-tertiary-fixed-variant' : 'text-error',
  );
}
