import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';

@Component({
  selector: 'app-not-found',
  imports: [Banner, Button],
  templateUrl: './not-found.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
