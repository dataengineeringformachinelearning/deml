import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

let sheetIdSeq = 0;

/**
 * deml-ui sheet — bottom sheet (phone) / centered panel (md+).
 * Project body content; put actions in `[sheetFooter]`.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-sheet',
  templateUrl: './sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sheet {
  private readonly autoId = `sheet-title-${++sheetIdSeq}`;

  readonly open = input(false);
  readonly leaving = input(false);
  readonly title = input.required<string>();
  readonly titleId = input<string>();
  readonly dismissed = output<void>();

  readonly resolvedTitleId = computed(() => this.titleId() || this.autoId);

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismissed.emit();
    }
  }
}
