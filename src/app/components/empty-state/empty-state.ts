import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * deml-ui empty-state — centered empty module with optional actions slot.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
}
