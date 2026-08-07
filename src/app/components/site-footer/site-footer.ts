import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_FOOTER_GROUPS, type FooterLink } from '../../shared/footer-links';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  readonly groups = SITE_FOOTER_GROUPS;
  readonly year = new Date().getFullYear();

  protected isExternal(link: FooterLink): boolean {
    return Boolean(link.external) || /^https?:\/\//i.test(link.href);
  }
}
