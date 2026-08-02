import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';

export type TextFieldType = 'text' | 'email' | 'password' | 'search' | 'url' | 'tel';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-text-field',
  templateUrl: './text-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-invalid]': 'invalid() ? true : null',
  },
})
export class TextField {
  readonly label = input.required<string>();
  readonly type = input<TextFieldType>('text');
  readonly name = input<string>();
  readonly autocomplete = input<string>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly value = model('');

  readonly invalid = computed(() => this.error().trim().length > 0);

  readonly controlId = computed(() => {
    const name = this.name()?.trim();
    if (name) {
      return `field-${name}`;
    }
    return `field-${this.label().toLowerCase().replace(/\s+/g, '-')}`;
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
