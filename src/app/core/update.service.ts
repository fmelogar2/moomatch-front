import { ApplicationRef, Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { first } from 'rxjs/operators';

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h

/**
 * PWA auto-update: checks for new deployed versions on app stable and on a timer, and applies
 * them immediately on the next reload — no blocking "reload?" prompt, per typical SaaS behavior.
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);

  init(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        this.applyUpdate(event as VersionReadyEvent);
      }
    });

    this.appRef.isStable.pipe(first((stable) => stable)).subscribe(() => {
      void this.swUpdate.checkForUpdate();
      setInterval(() => void this.swUpdate.checkForUpdate(), CHECK_INTERVAL_MS);
    });
  }

  private applyUpdate(_event: VersionReadyEvent): void {
    void this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
