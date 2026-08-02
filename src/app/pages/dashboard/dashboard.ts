import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';

@Component({
  selector: 'app-dashboard',
  imports: [Banner],
  templateUrl: './dashboard.html',
  host: { class: 'page' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
