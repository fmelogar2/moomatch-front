import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TrendDirection = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
      <p class="text-label-caps text-on-surface-variant uppercase">{{ label }}</p>
      <div class="flex items-baseline gap-xs mt-1">
        <p class="font-headline-md text-headline-md text-on-surface">{{ value }}</p>
        @if (trendText) {
          <span
            class="flex items-center text-body-sm"
            [class.text-secondary]="trend === 'up'"
            [class.text-error]="trend === 'down'"
            [class.text-on-surface-variant]="trend === 'flat'"
          >
            <span class="material-symbols-outlined text-[16px]">
              {{ trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat' }}
            </span>
            {{ trendText }}
          </span>
        }
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() trend: TrendDirection | null = null;
  @Input() trendText = '';
}
