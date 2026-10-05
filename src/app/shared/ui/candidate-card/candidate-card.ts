import { Component, computed, input } from '@angular/core';

/** "Top Match Banner" / Candidate Card, per moomatch/DESIGN.md and recommendation_analysis_updated prototype. */
@Component({
  selector: 'app-candidate-card',
  standalone: true,
  template: `
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-center gap-md">
      <svg width="88" height="88" viewBox="0 0 88 88" class="shrink-0">
        <circle cx="44" cy="44" r="38" fill="none" stroke="var(--color-surface-container-high)" stroke-width="8" />
        <circle
          cx="44"
          cy="44"
          r="38"
          fill="none"
          stroke="var(--color-secondary)"
          stroke-width="8"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          transform="rotate(-90 44 44)"
        />
        <text x="44" y="49" text-anchor="middle" class="fill-on-surface font-headline-sm text-headline-sm" font-family="Inter">
          {{ fitScore() }}
        </text>
      </svg>
      <div class="min-w-0 flex-1">
        <p class="font-headline-sm text-headline-sm text-on-surface truncate">{{ bullName() }}</p>
        <p class="text-body-sm text-on-surface-variant font-data-mono">{{ registryId() }}</p>
        <div class="flex gap-md mt-1 text-body-sm">
          <span class="text-on-surface-variant">PTA Milk <b class="text-on-surface">{{ ptaMilk() }}</b></span>
          <span class="text-on-surface-variant">Reliability <b class="text-on-surface">{{ (reliability() * 100).toFixed(0) }}%</b></span>
        </div>
      </div>
    </div>
  `,
})
export class CandidateCardComponent {
  readonly bullName = input.required<string>();
  readonly registryId = input.required<string>();
  readonly fitScore = input.required<number>();
  readonly ptaMilk = input<string>('—');
  readonly reliability = input.required<number>();

  readonly circumference = 2 * Math.PI * 38;
  readonly dashOffset = computed(() => this.circumference * (1 - this.fitScore() / 100));
}
