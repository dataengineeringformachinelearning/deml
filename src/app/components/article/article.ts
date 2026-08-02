import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Banner } from '../banner/banner';
import { Button } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';

let articleIdSeq = 0;

@Component({
  selector: 'app-article',
  imports: [Banner, Button, ButtonGroup, RouterLink],
  templateUrl: './article.html',
  styleUrl: './article.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Article {
  private readonly autoId = `article-heading-${++articleIdSeq}`;

  /** When set, renders the article; when unset, renders the missing state. */
  readonly title = input<string>();

  readonly preheader = input('DEML');

  /** Meta / lede under the heading. */
  readonly lede = input<string>();

  /** Body paragraphs. */
  readonly body = input<readonly string[]>([]);

  readonly backLink = input.required<string | readonly string[]>();

  readonly backLabel = input('Back');

  /** Missing-state copy when `title` is empty. */
  readonly missingHeading = input('Not found');

  readonly missingLede = input('That page is not in the archive.');

  readonly headingId = input<string>();

  readonly resolvedHeadingId = computed(() => this.headingId() || this.autoId);

  readonly hasEntry = computed(() => {
    const title = this.title();
    return typeof title === 'string' && title.length > 0;
  });
}
