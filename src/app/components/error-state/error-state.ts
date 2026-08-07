import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * deml-ui error-state — centered error module with optional actions slot.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-error-state',
  templateUrl: './error-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
}
