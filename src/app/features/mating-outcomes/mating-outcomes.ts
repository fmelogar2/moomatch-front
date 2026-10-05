import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { CalfSex, MatingOutcomeStatus, MatingOutcomesService, PendingMating } from './mating-outcomes.service';

/** mating_outcomes_moomatch prototype (H-4) — logging POSTs for real to recommendation-api. */
@Component({
  selector: 'app-mating-outcomes',
  standalone: true,
  imports: [TranslocoModule, FormsModule],
  templateUrl: './mating-outcomes.html',
})
export class MatingOutcomesComponent implements OnInit {
  private readonly service = inject(MatingOutcomesService);

  readonly pending = signal<PendingMating[]>([]);
  readonly selected = signal<PendingMating | null>(null);
  readonly saving = signal(false);
  readonly savedMessageFor = signal<string | null>(null);

  status: MatingOutcomeStatus = 'LIVE_BIRTH_HEALTHY';
  birthDate = '';
  calfSex: CalfSex = 'HEIFER';
  calfId = '';

  ngOnInit(): void {
    this.service.listPending().subscribe((rows) => {
      this.pending.set(rows);
      if (rows.length > 0) {
        this.select(rows[0]);
      }
    });
  }

  select(mating: PendingMating): void {
    this.selected.set(mating);
    this.status = 'LIVE_BIRTH_HEALTHY';
    this.birthDate = '';
    this.calfSex = 'HEIFER';
    this.calfId = '';
    this.savedMessageFor.set(null);
  }

  saveOutcome(): void {
    const mating = this.selected();
    if (!mating) {
      return;
    }
    this.saving.set(true);
    this.service
      .logOutcome({
        recommendationId: mating.recommendationId,
        status: this.status,
        birthDate: this.birthDate || null,
        calfSex: this.status === 'LIVE_BIRTH_HEALTHY' || this.status === 'COMPLICATIONS' ? this.calfSex : null,
        calfId: this.calfId || null,
        outcomeNotes: null,
      })
      .subscribe((outcome) => {
        this.saving.set(false);
        this.savedMessageFor.set(mating.recommendationId);
        this.pending.set(this.pending().filter((p) => p.recommendationId !== mating.recommendationId));
        this.selected.set(null);
        void outcome;
      });
  }
}
