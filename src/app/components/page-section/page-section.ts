import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PageSectionVariant = 'catalog' | 'prose' | 'auth';

@Component({
  selector: 'app-page-section',
  templateUrl: './page-section.html',
  styleUrl: './page-section.css',
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
