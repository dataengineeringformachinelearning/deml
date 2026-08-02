import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-checkbox-field',
  templateUrl: './checkbox-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxField {
  readonly label = input.required<string>();
  readonly name = input<string>();
  readonly required = input(false);
  readonly disabled = input(false);
  readonly checked = model(false);

  readonly controlId = computed(() => {
    const name = this.name()?.trim();
    if (name) {
      return `check-${name}`;
    }
    return `check-${this.label().toLowerCase().replace(/\s+/g, '-')}`;
  });

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
