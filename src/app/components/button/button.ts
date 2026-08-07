import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'accent';
export type ButtonShape = 'default' | 'pill';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-shape]': 'shape()',
  },
})
export class Button {
  /** Visual color treatment. */
  readonly variant = input<ButtonVariant>('primary');

  /** Geometry: square default or rounded pill. */
  readonly shape = input<ButtonShape>('default');

  /** Native button type when rendered as a `<button>`. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** Associates a submit control with a form by id (footer actions outside `<form>`). */
  readonly form = input<string>();

  /** When set, renders an `<a href>` instead of a `<button>`. */
  readonly href = input<string>();

  /** When set, renders a router link instead of a `<button>`. */
  readonly routerLink = input<string | readonly string[]>();

  readonly disabled = input(false);

  /** Quiet in-button progress — spinner replaces label. */
  readonly busy = input(false);

  /** Emits when the control is activated and not disabled. */
  readonly pressed = output<Event>();

  readonly isRouterLink = computed(() => {
    const link = this.routerLink();
    if (link === undefined || link === null) {
      return false;
    }
    if (Array.isArray(link)) {
      return link.length > 0;
    }
    return String(link).length > 0;
  });

  readonly isHref = computed(() => {
    const href = this.href();
    return typeof href === 'string' && href.length > 0;
  });

  /** Shared class list for the interactive control. */
  readonly controlClass = computed(() => {
    const classes = ['button', `button--${this.variant()}`];
    if (this.shape() === 'pill') {
      classes.push('button--pill');
    }
    if (this.disabled()) {
      classes.push('is-disabled');
    }
    if (this.busy()) {
      classes.push('is-busy');
    }
    return classes.join(' ');
  });

  onActivate(event: Event): void {
    if (this.disabled() || this.busy()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.pressed.emit(event);
  }
}
