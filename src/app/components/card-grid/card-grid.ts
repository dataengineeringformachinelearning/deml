import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-card-grid',
  templateUrl: './card-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGrid {}
