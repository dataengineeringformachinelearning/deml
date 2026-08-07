import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type SkeletonLine = 'short' | 'medium' | 'long';

/**
 * deml-ui skeleton — quiet loading placeholder lines (+ optional block).
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-skeleton',
  templateUrl: './skeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  /** Line widths rendered top-to-bottom. */
  readonly lines = input<readonly SkeletonLine[]>(['short', 'long', 'medium']);

  /** When true, appends a skeleton__block under the lines. */
  readonly block = input(false);
}
