import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type ButtonGroupAlign = 'start' | 'center' | 'end';
/** `responsive` = column → row at 800px; `row` / `column` stay fixed. */
export type ButtonGroupLayout = 'responsive' | 'row' | 'column';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-group',
  templateUrl: './button-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.place-start]': 'align() === "start"',
    '[class.place-center]': 'align() === "center"',
    '[class.place-end]': 'align() === "end"',
    '[attr.data-layout]': 'layout()',
  },
})
export class ButtonGroup {
  /** Horizontal alignment of actions. */
  readonly align = input<ButtonGroupAlign>('start');

  /** Flex direction behavior. */
  readonly layout = input<ButtonGroupLayout>('responsive');
}
