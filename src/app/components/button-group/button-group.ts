import { Component, input } from '@angular/core';

export type ButtonGroupAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'app-button-group',
  imports: [],
  templateUrl: './button-group.html',
  styleUrl: './button-group.css',
  host: {
    '[class.place-start]': 'align() === "start"',
    '[class.place-center]': 'align() === "center"',
    '[class.place-end]': 'align() === "end"',
  },
})
export class ButtonGroup {
  /** Horizontal alignment of actions (row layout at md+). */
  readonly align = input<ButtonGroupAlign>('start');
}
