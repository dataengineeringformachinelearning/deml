import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { getBlogPost } from '../../data/blog-posts';

@Component({
  selector: 'app-blog-post',
  imports: [Banner, Button, ButtonGroup, RouterLink],
  templateUrl: './blog-post.html',
  styleUrl: './blog-post.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostPage {
  /** Bound from the `:slug` route param via `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  readonly post = computed(() => getBlogPost(this.slug()));

  readonly headingId = computed(() => `post-heading-${this.slug()}`);
}
