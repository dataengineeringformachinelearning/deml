import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { PageSection } from '../../components/page-section/page-section';
import { adjacentBlueNotes, getBlueNote } from '../../data/blue-notes';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-blog-post',
  imports: [RouterLink, Banner, Button, PageSection],
  templateUrl: './blog-post.html',
  host: { class: 'page page--prose' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostPage {
  private readonly sanitizer = inject(DomSanitizer);

  /** Bound from the `:slug` route param via `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  readonly post = computed(() => getBlueNote(this.slug()));

  readonly headingId = computed(() => `post-heading-${this.slug()}`);

  readonly safeHtml = computed(() => {
    const html = this.post()?.html ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly older = computed(() => adjacentBlueNotes(this.slug()).older);

  readonly newer = computed(() => adjacentBlueNotes(this.slug()).newer);
}
