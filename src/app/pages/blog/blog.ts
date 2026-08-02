import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Microcard } from '../../components/microcard/microcard';
import { MicrocardGrid } from '../../components/microcard-grid/microcard-grid';
import { SectionHeader } from '../../components/section-header/section-header';
import { BLOG_POSTS } from '../../data/blog-posts';

@Component({
  selector: 'app-blog',
  imports: [Banner, Microcard, MicrocardGrid, SectionHeader],
  templateUrl: './blog.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  readonly posts = BLOG_POSTS;
}
