import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideBoxes, LucideMenu, LucideX } from '@lucide/angular';

import { AuthService } from '../../services/auth';
import { BREAKPOINT_MD_MQ } from '../../shared/breakpoints';
import { Button } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

export interface NavLink {
  label: string;
  path: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
];

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
  host: {
    '[style.--navbar-icon-color]': 'iconColor() || null',
  },
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly menuPanel = viewChild<ElementRef<HTMLElement>>('menuPanel');

  /** Override the navbar logo stroke color (any CSS color). */
  readonly iconColor = input<string>();

  /** Accessible name for the brand home control. */
  readonly brandLabel = input('DEML home');

  /** Brand destination (router path). */
  readonly brandHref = input('/');

  /** Primary navigation links. */
  readonly links = input<NavLink[]>(DEFAULT_LINKS);

  readonly loggedIn = this.auth.loggedIn;
  readonly menuOpen = signal(false);

  login(): void {
    this.auth.login();
    this.closeMenu(true);
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
    queueMicrotask(() => this.focusFirstInMenu());
  }

  closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    this.setMainInert(false);
    if (returnFocus) {
      queueMicrotask(() => this.menuToggle()?.nativeElement.focus());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu(true);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined' && window.matchMedia(BREAKPOINT_MD_MQ).matches) {
      this.closeMenu();
    }
  }

  @HostListener('keydown', ['$event'])
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
    const active = document.activeElement as HTMLElement | null;

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

  private focusFirstInMenu(): void {
    const panel = this.menuPanel()?.nativeElement as HTMLElement | undefined;
    const first = panel?.querySelector(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement | null;
    first?.focus();
  }

  private focusableInNavbar(): HTMLElement[] {
    const root = this.host.nativeElement as HTMLElement;
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
    if (typeof document === 'undefined') {
      return;
    }
    const main = document.getElementById('main-content');
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
