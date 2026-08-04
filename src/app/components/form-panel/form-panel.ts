import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type FormPanelHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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
  /** Document outline level — use 2+ when a page banner already owns h1. */
  readonly headingLevel = input<FormPanelHeadingLevel>(1);

  readonly resolvedTitleId = computed(() => this.titleId() || this.autoId);
}
