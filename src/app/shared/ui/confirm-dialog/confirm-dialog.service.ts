import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

interface PendingRequest extends ConfirmDialogRequest {
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly requestSignal = signal<PendingRequest | null>(null);
  readonly request = this.requestSignal.asReadonly();

  confirm(request: ConfirmDialogRequest): Promise<boolean> {
    return new Promise((resolve) => {
      this.requestSignal.set({ ...request, resolve });
    });
  }

  resolve(confirmed: boolean): void {
    this.requestSignal()?.resolve(confirmed);
    this.requestSignal.set(null);
  }
}
