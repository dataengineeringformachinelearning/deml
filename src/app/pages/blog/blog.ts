import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { Microcard } from '../../components/microcard/microcard';
import { MicrocardGrid } from '../../components/microcard-grid/microcard-grid';
import { PageSection } from '../../components/page-section/page-section';
import { BLUE_NOTES } from '../../data/blue-notes';

@Component({
  selector: 'app-blog',
  imports: [Banner, Button, Microcard, MicrocardGrid, PageSection],
  templateUrl: './blog.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  readonly notes = BLUE_NOTES;
}
