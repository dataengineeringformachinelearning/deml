import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';

@Component({
  selector: 'app-account',
  imports: [Banner],
  templateUrl: './account.html',
  host: { class: 'page' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Account {}
