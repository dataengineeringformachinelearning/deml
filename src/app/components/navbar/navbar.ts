import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideBoxes, LucideMenu, LucideX } from '@lucide/angular';

import { AuthService } from '../../services/auth';
import { BREAKPOINT_MD_MQ } from '../../shared/breakpoints';
import { AUTH_NAV_LINKS, GUEST_NAV_LINKS, type NavLink } from '../../shared/nav-links';
import { Button } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

export type { NavLink };

@Component({
  selector: 'app-navbar',
  imports: [
    LucideBoxes,
    LucideMenu,
    LucideX,
    RouterLink,
    RouterLinkActive,
    Button,
    ButtonGroup,
    ThemeToggle,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--navbar-icon-color]': 'iconColor() || null',
    '(document:keydown.escape)': 'onEscape()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly menuToggle = viewChild.required<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly menuPanel = viewChild.required<ElementRef<HTMLElement>>('menuPanel');

  /** Override the navbar logo stroke color (any CSS color). */
  readonly iconColor = input<string>();

  /** Accessible name for the brand home control. */
  readonly brandLabel = input('DEML home');

  /** Brand destination (router path). */
  readonly brandHref = input('/');

  /** Optional full override of primary navigation links. */
  readonly links = input<NavLink[]>();

  readonly loggedIn = this.auth.loggedIn;

  /** Guest vs auth link set, unless `links` is provided. */
  readonly navLinks = computed(() => {
    const override = this.links();
    if (override) {
      return override;
    }
    return this.loggedIn() ? AUTH_NAV_LINKS : GUEST_NAV_LINKS;
  });

  readonly menuOpen = signal(false);

  constructor() {
    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win?.matchMedia) {
        return;
      }

      const media = win.matchMedia(BREAKPOINT_MD_MQ);
      const onBreakpoint = () => {
        if (media.matches) {
          this.closeMenu();
        }
      };

      media.addEventListener('change', onBreakpoint);
      this.destroyRef.onDestroy(() => media.removeEventListener('change', onBreakpoint));
    });
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu(true);
  }

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu(true);
      return;
    }
    this.openMenu();
  }

  openMenu(): void {
    this.menuOpen.set(true);
    this.setMainInert(true);
    this.afterView(() => this.focusFirstInMenu());
  }

  closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    this.setMainInert(false);
    if (returnFocus) {
      this.afterView(() => this.menuToggle().nativeElement.focus());
    }
  }

  onEscape(): void {
    this.closeMenu(true);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.menuOpen() || event.key !== 'Tab') {
      return;
    }

    const focusables = this.focusableInNavbar();
    if (focusables.length === 0) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private afterView(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }

  private focusFirstInMenu(): void {
    const panel = this.menuPanel().nativeElement;
    const first = panel.querySelector(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement | null;
    first?.focus();
  }

  private focusableInNavbar(): HTMLElement[] {
    const root = this.host.nativeElement;
    const nodes = Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    return nodes.filter((node): node is HTMLElement => {
      if (!(node instanceof HTMLElement)) {
        return false;
      }
      if (node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true') {
        return false;
      }
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  private setMainInert(inert: boolean): void {
    const main = this.document.getElementById('main-content');
    if (!main) {
      return;
    }
    if (inert) {
      main.setAttribute('inert', '');
    } else {
      main.removeAttribute('inert');
    }
  }
}
