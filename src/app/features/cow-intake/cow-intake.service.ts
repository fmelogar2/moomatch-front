import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/** TraitDefinition (docs/moomatch-HLD.md) — canonical WHFF 1–9 scale, seeded in V2__seed_reference_data.sql. */
export type TraitCategory = 'FRAME' | 'DAIRY_STRENGTH' | 'FEET_LEGS' | 'UDDER' | 'BODY_CONDITION';

export interface TraitDefinition {
  traitCode: string;
  category: TraitCategory;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
}

export type BreedingObjectiveCode = 'TPI' | 'FERTILITY' | 'HEALTH' | 'MILK' | 'SHOW';

export type MeasurementBasis = 'CURRENT_TEST_DAY' | 'LACTATION_AVERAGE' | 'MATURE_EQUIVALENT_305D';

/** ProductionRecord (docs/moomatch-HLD.md Data Model → Cow & Herd), E-6. */
export interface ProductionRecordInput {
  lactationNumber: number | null;
  daysInMilk: number | null;
  milkYieldKg: number | null;
  fatPercent: number | null;
  proteinPercent: number | null;
  solidsPercent: number | null;
  somaticCellScore: number | null;
  measurementBasis: MeasurementBasis;
}

export type ReproductiveStatusCode = 'OPEN' | 'BRED' | 'PREGNANT' | 'DRY' | 'FRESH';

/** ReproductiveStatus (docs/moomatch-HLD.md Data Model → Cow & Herd), E-7. */
export interface ReproductiveStatusInput {
  status: ReproductiveStatusCode;
  lastCalvingDate: string | null;
  daysOpen: number | null;
}

export type HealthEventType =
  | 'MASTITIS'
  | 'LAMENESS'
  | 'KETOSIS'
  | 'DISPLACED_ABOMASUM'
  | 'MILK_FEVER'
  | 'RETAINED_PLACENTA'
  | 'METRITIS'
  | 'OTHER';
export type HealthSeverity = 'MILD' | 'MODERATE' | 'SEVERE';

/** HealthRecord (docs/moomatch-HLD.md Data Model → Cow & Herd), E-8. */
export interface HealthEventInput {
  eventType: HealthEventType;
  severity: HealthSeverity | null;
  occurredAt: string;
}

/** CowProfile + LinearClassification[] intake payload (E-2). */
export interface CowIntakePayload {
  identifier: string;
  registrationName: string | null;
  dateOfBirth: string | null;
  objective: BreedingObjectiveCode;
  linearClassifications: Record<string, number>;
  production: ProductionRecordInput;
  reproductiveStatus: ReproductiveStatusInput;
  healthEvents: HealthEventInput[];
}

const TRAIT_DEFINITIONS: TraitDefinition[] = [
  { traitCode: 'STATURE', category: 'FRAME', lowLabel: 'Short', midLabel: 'Intermediate', highLabel: 'Tall' },
  { traitCode: 'CHEST_WIDTH', category: 'FRAME', lowLabel: 'Narrow', midLabel: 'Intermediate', highLabel: 'Wide' },
  { traitCode: 'BODY_DEPTH', category: 'FRAME', lowLabel: 'Shallow', midLabel: 'Intermediate', highLabel: 'Deep' },
  { traitCode: 'RUMP_ANGLE', category: 'FRAME', lowLabel: 'High pins', midLabel: 'Level', highLabel: 'Extreme slope' },
  { traitCode: 'RIB_STRUCTURE', category: 'DAIRY_STRENGTH', lowLabel: 'Lacks angularity', midLabel: 'Intermediate', highLabel: 'Very angular' },
  { traitCode: 'FOOT_ANGLE', category: 'FEET_LEGS', lowLabel: 'Very low angle', midLabel: 'Intermediate', highLabel: 'Very steep' },
  { traitCode: 'REAR_LEGS_SET', category: 'FEET_LEGS', lowLabel: 'Straight', midLabel: 'Intermediate', highLabel: 'Sickle' },
  { traitCode: 'LOCOMOTION', category: 'FEET_LEGS', lowLabel: 'Short stride, severe abduction', midLabel: 'Intermediate', highLabel: 'Long stride, no abduction' },
  { traitCode: 'FORE_UDDER_ATTACHMENT', category: 'UDDER', lowLabel: 'Weak and loose', midLabel: 'Intermediate', highLabel: 'Extremely strong and tight' },
  { traitCode: 'UDDER_DEPTH', category: 'UDDER', lowLabel: 'Below hock', midLabel: 'Intermediate', highLabel: 'Shallow' },
  { traitCode: 'REAR_UDDER_HEIGHT', category: 'UDDER', lowLabel: 'Very low', midLabel: 'Intermediate', highLabel: 'High' },
  { traitCode: 'TEAT_LENGTH', category: 'UDDER', lowLabel: 'Short', midLabel: 'Intermediate', highLabel: 'Long' },
  { traitCode: 'BODY_CONDITION_SCORE', category: 'BODY_CONDITION', lowLabel: 'Poor', midLabel: 'Intermediate', highLabel: 'Grossly fat' },
];

@Injectable({ providedIn: 'root' })
export class CowIntakeService {
  /** GET /api/reference/trait-definitions (mock; seeded from V2__seed_reference_data.sql). */
  getTraitDefinitions(): Observable<TraitDefinition[]> {
    return of(TRAIT_DEFINITIONS);
  }

  /** POST /api/cows (mock — creates CowProfile + LinearClassification[] + ProductionRecord + ReproductiveStatus + HealthRecord[]). */
  submitIntake(payload: CowIntakePayload): Observable<{ cowId: string }> {
    // eslint-disable-next-line no-console
    console.info('[mock] cow intake submitted', payload);
    return of({ cowId: `cow-${Date.now()}` });
  }
}
