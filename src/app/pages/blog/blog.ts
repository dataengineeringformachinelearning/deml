import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

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

  readonly lead = computed(() => this.notes[0]);

  readonly spotlight = computed(() => {
    const leadSlug = this.lead()?.slug;
    return this.notes.filter((n) => n.featured && n.slug !== leadSlug).slice(0, 3);
  });

  readonly archive = computed(() => {
    const spot = new Set(this.spotlight().map((n) => n.slug));
    const leadSlug = this.lead()?.slug;
    return this.notes.filter((n) => n.slug !== leadSlug && !spot.has(n.slug));
  });
}
