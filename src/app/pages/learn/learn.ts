import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Microcard } from '../../components/microcard/microcard';
import { PACKAGE_GROUPS, topicsForGroup } from '../../data/packages';

@Component({
  selector: 'app-learn',
  imports: [Banner, Microcard],
  templateUrl: './learn.html',
  styleUrl: './learn.css',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn {
  readonly sections = PACKAGE_GROUPS.map((group) => ({
    ...group,
    topics: topicsForGroup(group.id),
  }));
}
