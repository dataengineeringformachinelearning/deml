import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type PageSectionVariant = 'catalog' | 'prose' | 'auth';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-page-section',
  templateUrl: './page-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'page-section',
    '[attr.data-variant]': 'variant()',
  },
})
export class PageSection {
  /** Layout measure: catalog grid, prose column, or auth center. */
  readonly variant = input<PageSectionVariant>('catalog');

  /** Accessible name when no labelled-by heading is provided. */
  readonly ariaLabel = input<string>();

  /** Id of a heading that labels this region. */
  readonly labelledBy = input<string>();
}
