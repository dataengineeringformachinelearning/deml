import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

export type CalloutTone = 'info' | 'warning' | 'error' | 'danger' | 'success';

/**
 * deml-ui callout — inline highlighted message (tone + optional dismiss).
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-callout',
  templateUrl: './callout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Callout {
  readonly tone = input<CalloutTone>('info');
  readonly heading = input<string>();
  readonly text = input.required<string>();
  readonly dismissible = input(false);
  readonly dismissed = output<void>();
}
