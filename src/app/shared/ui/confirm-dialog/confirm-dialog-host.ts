import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

/** Placed once in AppShell (and the login shell) — renders whichever ConfirmDialogService request is pending. */
@Component({
  selector: 'app-confirm-dialog-host',
  standalone: true,
  template: `
    @if (service.request(); as req) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md">
        <div class="bg-surface-container-lowest rounded-lg shadow-lg max-w-sm w-full p-lg">
          <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ req.title }}</h2>
          <p class="text-body-md text-on-surface-variant mt-sm">{{ req.message }}</p>
          <div class="flex justify-end gap-sm mt-lg">
            <button
              type="button"
              class="px-md py-2 rounded text-body-md font-medium border border-outline-variant text-on-surface hover:bg-surface-container-high"
              (click)="service.resolve(false)"
            >
              {{ req.cancelLabel || 'Cancel' }}
            </button>
            <button
              type="button"
              class="px-md py-2 rounded text-body-md font-medium text-white"
              [class]="req.tone === 'danger' ? 'bg-error' : 'bg-primary'"
              (click)="service.resolve(true)"
            >
              {{ req.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogHostComponent {
  protected readonly service = inject(ConfirmDialogService);
}
