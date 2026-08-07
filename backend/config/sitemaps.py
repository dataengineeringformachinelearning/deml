# Sitemaps — brand splash only (human docs live on the community site).
from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticViewSitemap(Sitemap):
  priority = 0.5
  changefreq = "daily"

  def items(self):
    return ["home"]

  def location(self, item):
    return reverse(item)
