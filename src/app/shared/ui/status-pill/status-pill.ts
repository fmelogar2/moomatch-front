import { Component, computed, input } from '@angular/core';

export type StatusTone = 'success' | 'warning' | 'error' | 'neutral' | 'info';

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-secondary-container text-on-secondary-container',
  warning: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  info: 'bg-primary-fixed text-on-primary-fixed-variant',
};

const DOT_CLASSES: Record<StatusTone, string> = {
  success: 'bg-secondary',
  warning: 'bg-tertiary-fixed-dim',
  error: 'bg-error',
  info: 'bg-primary',
  neutral: 'bg-outline',
};

/** Small colored status badge used across recommendation/herd/user tables. */
@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1 px-sm py-0.5 rounded-full text-body-sm font-medium" [class]="toneClass()">
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      {{ label() }}
    </span>
  `,
})
export class StatusPillComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');

  readonly toneClass = computed(() => TONE_CLASSES[this.tone()]);
  readonly dotClass = computed(() => DOT_CLASSES[this.tone()]);
}
