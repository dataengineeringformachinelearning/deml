import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.html',
  styleUrl: './card-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGrid {}
