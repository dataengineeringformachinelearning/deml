import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Microcard } from '../../components/microcard/microcard';
import { MicrocardGrid } from '../../components/microcard-grid/microcard-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { BLUE_NOTES } from '../../data/blue-notes';

@Component({
  selector: 'app-blog',
  imports: [Banner, Button, ButtonGroup, Microcard, MicrocardGrid, PageSection, SectionHeader],
  templateUrl: './blog.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  readonly notes = BLUE_NOTES;
}
