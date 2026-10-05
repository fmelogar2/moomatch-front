import { Component, Input, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * Linear classification trait slider — canonical WHFF scale, 1–9 (see docs/moomatch-HLD.md
 * TraitDefinition/LinearClassification). Rebuilt from the cow_intake_manual_entry_updated
 * prototype's 1–50 slider pattern (tick marks, "sweet spot" overlay, mono value readout),
 * re-labeled to the finalized canonical scale with biological low/mid/high anchors.
 */
@Component({
  selector: 'app-trait-slider',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './trait-slider.html',
  styleUrl: './trait-slider.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TraitSliderComponent),
      multi: true,
    },
  ],
})
export class TraitSliderComponent implements ControlValueAccessor {
  @Input({ required: true }) traitCode = '';
  @Input({ required: true }) lowLabel = '';
  @Input({ required: true }) midLabel = '';
  @Input({ required: true }) highLabel = '';
  /** Optional "sweet spot" range for the selected breeding objective, e.g. [4, 6]. */
  @Input() sweetSpot: [number, number] | null = null;
  @Input() disabled = false;

  value = 5;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  readonly min = 1;
  readonly max = 9;

  get sweetSpotStyle(): { left: string; width: string } | null {
    if (!this.sweetSpot) {
      return null;
    }
    const [from, to] = this.sweetSpot;
    const pct = (n: number) => ((n - this.min) / (this.max - this.min)) * 100;
    return { left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` };
  }

  handleInput(raw: string): void {
    this.value = Number(raw);
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: number): void {
    this.value = value ?? 5;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
