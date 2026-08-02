import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';

@Component({
  selector: 'app-sites',
  imports: [Banner],
  templateUrl: './sites.html',
  host: { class: 'page' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sites {}
