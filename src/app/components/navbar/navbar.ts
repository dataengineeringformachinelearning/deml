import { Component, HostListener, input, signal } from '@angular/core';
import { LucideBoxes, LucideMenu, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  imports: [LucideBoxes, LucideMenu, LucideX],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '[style.--navbar-icon-color]': 'iconColor() || null',
  },
})
export class Navbar {
  /** Override the navbar logo stroke color (any CSS color). */
  readonly iconColor = input<string>();

  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 800px)').matches) {
      this.closeMenu();
    }
  }
}
