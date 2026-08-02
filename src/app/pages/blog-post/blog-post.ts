import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Article } from '../../components/article/article';
import { getBlogPost } from '../../data/blog-posts';

@Component({
  selector: 'app-blog-post',
  imports: [Article],
  templateUrl: './blog-post.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostPage {
  /** Bound from the `:slug` route param via `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  readonly post = computed(() => getBlogPost(this.slug()));

  readonly headingId = computed(() => `post-heading-${this.slug()}`);
}
