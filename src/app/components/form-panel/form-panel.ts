import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-panel',
  templateUrl: './form-panel.html',
  styleUrl: './form-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPanel {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly description = input('');
}
