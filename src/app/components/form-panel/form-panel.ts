import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

let formPanelIdSeq = 0;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-form-panel',
  templateUrl: './form-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPanel {
  private readonly autoId = `form-panel-title-${++formPanelIdSeq}`;

  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly titleId = input<string>();

  readonly resolvedTitleId = computed(() => this.titleId() || this.autoId);
}
