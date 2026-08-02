import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-container',
  templateUrl: './container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Container {}
