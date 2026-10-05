import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { TraitSliderComponent } from '../../shared/ui/trait-slider/trait-slider';
import {
  BreedingObjectiveCode,
  CowIntakeService,
  HealthEventInput,
  HealthEventType,
  HealthSeverity,
  MeasurementBasis,
  ReproductiveStatusCode,
  TraitCategory,
  TraitDefinition,
} from './cow-intake.service';

type IntakeTab = 'linear' | 'production' | 'reproductive' | 'health';

const SWEET_SPOTS: Record<string, [number, number]> = {
  STATURE: [5, 7],
  CHEST_WIDTH: [5, 7],
  BODY_DEPTH: [5, 7],
  RUMP_ANGLE: [4, 6],
  RIB_STRUCTURE: [6, 8],
  FOOT_ANGLE: [5, 7],
  REAR_LEGS_SET: [5, 7],
  LOCOMOTION: [6, 8],
  FORE_UDDER_ATTACHMENT: [6, 8],
  UDDER_DEPTH: [6, 8],
  REAR_UDDER_HEIGHT: [6, 8],
  TEAT_LENGTH: [4, 6],
  BODY_CONDITION_SCORE: [4, 6],
};

const CATEGORY_LABEL_KEY: Record<TraitCategory, string> = {
  FRAME: 'cowIntake.category.frame',
  DAIRY_STRENGTH: 'cowIntake.category.dairyStrength',
  FEET_LEGS: 'cowIntake.category.feetLegs',
  UDDER: 'cowIntake.category.udder',
  BODY_CONDITION: 'cowIntake.category.bodyCondition',
};

/**
 * cow_intake_manual_entry_updated prototype, rebuilt on the canonical 1–9 app-trait-slider scale
 * (not the prototype's 1–50 custom slider), plus three new sections (Production, Reproductive
 * Status, Health Events) that have no prototype of their own — see docs/moomatch-user-stories.md
 * E-6/E-7/E-8.
 */
@Component({
  selector: 'app-cow-intake',
  standalone: true,
  imports: [TranslocoModule, FormsModule, TraitSliderComponent],
  templateUrl: './cow-intake.html',
})
export class CowIntakeComponent implements OnInit {
  private readonly cowIntakeService = inject(CowIntakeService);
  private readonly router = inject(Router);

  readonly traitDefinitions = signal<TraitDefinition[]>([]);
  readonly activeTab = signal<IntakeTab>('linear');
  readonly saving = signal(false);

  identifier = '';
  registrationName = '';
  dateOfBirth = '';
  objective: BreedingObjectiveCode = 'TPI';

  traitValues: Record<string, number> = {};

  production = {
    lactationNumber: null as number | null,
    daysInMilk: null as number | null,
    milkYieldKg: null as number | null,
    fatPercent: null as number | null,
    proteinPercent: null as number | null,
    solidsPercent: null as number | null,
    somaticCellScore: null as number | null,
    measurementBasis: 'CURRENT_TEST_DAY' as MeasurementBasis,
  };

  reproductiveStatus = {
    status: 'OPEN' as ReproductiveStatusCode,
    lastCalvingDate: null as string | null,
    daysOpen: null as number | null,
  };

  healthEvents: HealthEventInput[] = [];

  readonly measurementBasisOptions: MeasurementBasis[] = ['CURRENT_TEST_DAY', 'LACTATION_AVERAGE', 'MATURE_EQUIVALENT_305D'];
  readonly reproductiveStatusOptions: ReproductiveStatusCode[] = ['OPEN', 'BRED', 'PREGNANT', 'DRY', 'FRESH'];
  readonly healthEventTypeOptions: HealthEventType[] = [
    'MASTITIS',
    'LAMENESS',
    'KETOSIS',
    'DISPLACED_ABOMASUM',
    'MILK_FEVER',
    'RETAINED_PLACENTA',
    'METRITIS',
    'OTHER',
  ];
  readonly healthSeverityOptions: HealthSeverity[] = ['MILD', 'MODERATE', 'SEVERE'];

  ngOnInit(): void {
    this.cowIntakeService.getTraitDefinitions().subscribe((defs) => {
      this.traitDefinitions.set(defs);
      for (const def of defs) {
        this.traitValues[def.traitCode] = 5;
      }
    });
  }

  get categories(): TraitCategory[] {
    const seen = new Set<TraitCategory>();
    for (const def of this.traitDefinitions()) {
      seen.add(def.category);
    }
    return [...seen];
  }

  traitsFor(category: TraitCategory): TraitDefinition[] {
    return this.traitDefinitions().filter((d) => d.category === category);
  }

  categoryLabelKey(category: TraitCategory): string {
    return CATEGORY_LABEL_KEY[category];
  }

  sweetSpotFor(traitCode: string): [number, number] | null {
    return SWEET_SPOTS[traitCode] ?? null;
  }

  get classifiedCount(): number {
    return Object.keys(this.traitValues).filter((code) => this.traitValues[code] !== 5).length;
  }

  addHealthEvent(): void {
    this.healthEvents = [...this.healthEvents, { eventType: 'MASTITIS', severity: 'MILD', occurredAt: '' }];
  }

  removeHealthEvent(index: number): void {
    this.healthEvents = this.healthEvents.filter((_, i) => i !== index);
  }

  setTab(tab: IntakeTab): void {
    this.activeTab.set(tab);
  }

  saveAndAnalyze(): void {
    this.saving.set(true);
    this.cowIntakeService
      .submitIntake({
        identifier: this.identifier,
        registrationName: this.registrationName || null,
        dateOfBirth: this.dateOfBirth || null,
        objective: this.objective,
        linearClassifications: { ...this.traitValues },
        production: { ...this.production },
        reproductiveStatus: { ...this.reproductiveStatus },
        healthEvents: [...this.healthEvents],
      })
      .subscribe(({ cowId }) => {
        this.saving.set(false);
        this.router.navigate(['/recommendations', cowId]);
      });
  }

  discardDraft(): void {
    this.router.navigateByUrl('/herds');
  }
}
