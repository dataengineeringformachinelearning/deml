"""URL map — minimal control-plane surface.

Product job: identity + public status + site management.
Partners that need SIEM/ML/exports call FORJD directly with ``fjsvc_``.
"""

from django.contrib.sitemaps.views import sitemap
from django.urls import converters, path, re_path
from django.views.generic import RedirectView

from . import views
from .sitemaps import StaticViewSitemap

_COMMUNITY_DOCS = "https://dataengineeringformachinelearning.com/documentation"

# Django 6 / Django-Ninja Workaround: Unregister 'uuid' path converter before importing Ninja
if "uuid" in converters.DEFAULT_CONVERTERS:
  del converters.DEFAULT_CONVERTERS["uuid"]
if "uuid" in converters.REGISTERED_CONVERTERS:
  del converters.REGISTERED_CONVERTERS["uuid"]
converters.get_converters.cache_clear()

from forjd.views import (
  forjd_capabilities_proxy,
  forjd_tenant_proxy,
  ingest_processing_status_proxy,
  native_forjd_proxy,
  native_status_page_proxy,
  session_revoke_proxy,
  status_incident_delete_proxy,
  status_page_detail_proxy,
  status_page_incidents_proxy,
  status_page_services_proxy,
  status_pages_list_proxy,
  status_service_delete_proxy,
  unsupported_forjd_proxy,
)
from forjd.widget_telemetry import widget_telemetry_proxy
from monitor.views import cookie_consent, newsletter

from .api import api

sitemaps = {
  "static": StaticViewSitemap,
}

urlpatterns = [
  path("", views.home, name="home"),
  path(
    "documentation",
    RedirectView.as_view(url=_COMMUNITY_DOCS, permanent=True),
    name="documentation-redirect",
  ),
  path(
    "api/v1/docs",
    RedirectView.as_view(url=_COMMUNITY_DOCS, permanent=True),
    name="api-docs-redirect",
  ),
  path(
    "api/v1/redoc",
    RedirectView.as_view(url=_COMMUNITY_DOCS, permanent=True),
    name="api-redoc-redirect",
  ),
  path("assets/<path:path>", views.serve_asset, name="serve_asset"),
  path("api/v1/telemetry/cookie-consent", cookie_consent, name="cookie-consent"),
  path("api/v1/telemetry/subscribe", newsletter, name="newsletter-subscribe"),
  path(
    "api/v1/forjd/capabilities",
    forjd_capabilities_proxy,
    name="forjd-capabilities-adapter",
  ),
  path(
    "api/v1/forjd/tenant",
    forjd_tenant_proxy,
    name="forjd-tenant-adapter",
  ),
  path(
    "api/v1/system-status/health",
    native_forjd_proxy,
    {
      "target_path": "/health",
      "allowed_methods": ("GET",),
      "public": True,
    },
    name="forjd-health-adapter",
  ),
  path(
    "api/v1/system-status/ready",
    native_forjd_proxy,
    {
      "target_path": "/ready",
      "allowed_methods": ("GET",),
      "public": True,
    },
    name="forjd-readiness-adapter",
  ),
  # --- Status pages (product SoT) ---
  path(
    "api/v1/system-status/status_pages/slug/<str:slug>/",
    native_status_page_proxy,
    name="forjd-public-status-page-adapter-slash",
  ),
  path(
    "api/v1/system-status/status_pages/slug/<str:slug>",
    native_status_page_proxy,
    name="forjd-public-status-page-adapter",
  ),
  path(
    "api/v1/system-status/status_pages/<str:page_id>/services/",
    status_page_services_proxy,
    name="forjd-status-page-services-adapter-slash",
  ),
  path(
    "api/v1/system-status/status_pages/<str:page_id>/services",
    status_page_services_proxy,
    name="forjd-status-page-services-adapter",
  ),
  path(
    "api/v1/system-status/status_pages/<str:page_id>/incidents/",
    status_page_incidents_proxy,
    name="forjd-status-page-incidents-adapter-slash",
  ),
  path(
    "api/v1/system-status/status_pages/<str:page_id>/incidents",
    status_page_incidents_proxy,
    name="forjd-status-page-incidents-adapter",
  ),
  path(
    "api/v1/system-status/status_pages/<str:page_id>/",
    status_page_detail_proxy,
    name="forjd-status-page-detail-adapter-slash",
  ),
  path(
    "api/v1/system-status/status_pages/<str:page_id>",
    status_page_detail_proxy,
    name="forjd-status-page-detail-adapter",
  ),
  path(
    "api/v1/system-status/status_pages/",
    status_pages_list_proxy,
    name="forjd-status-pages-list-adapter-slash",
  ),
  path(
    "api/v1/system-status/status_pages",
    status_pages_list_proxy,
    name="forjd-status-pages-list-adapter",
  ),
  path(
    "api/v1/system-status/services/<str:service_id>",
    status_service_delete_proxy,
    name="forjd-status-service-delete-adapter",
  ),
  path(
    "api/v1/system-status/incidents/<str:incident_id>",
    status_incident_delete_proxy,
    name="forjd-status-incident-delete-adapter",
  ),
  path(
    "api/v1/system-status/widget-telemetry",
    widget_telemetry_proxy,
    name="forjd-widget-telemetry",
  ),
  # --- Sealed ingest / crypto sessions (widget + deml_ headless) ---
  path(
    "api/v1/ingest",
    native_forjd_proxy,
    {
      "target_path": "/api/v1/ingest",
      "allowed_methods": ("POST",),
      "tenant_binding": "sealed",
    },
    name="forjd-sealed-ingest-adapter",
  ),
  path(
    "api/v1/ingest/events:batch",
    native_forjd_proxy,
    {
      "target_path": "/api/v1/ingest/events:batch",
      "allowed_methods": ("POST",),
      "tenant_binding": "sealed_batch",
    },
    name="forjd-sealed-ingest-batch-adapter",
  ),
  path(
    "api/v1/ingest/processing/<str:batch_id>",
    ingest_processing_status_proxy,
    name="forjd-ingest-processing-status-adapter",
  ),
  path(
    "api/v1/ingest/events",
    native_forjd_proxy,
    {
      "target_path": "/api/v1/ingest/events",
      "allowed_methods": ("GET", "POST"),
      "tenant_binding": "sealed_method",
    },
    name="forjd-sealed-events-adapter",
  ),
  path(
    "api/v1/ingest/results",
    native_forjd_proxy,
    {
      "target_path": "/api/v1/ingest/results",
      "allowed_methods": ("GET",),
      "tenant_binding": "query",
    },
    name="forjd-ingest-results-adapter",
  ),
  re_path(
    r"^api/v1/sessions/?$",
    native_forjd_proxy,
    {
      "target_path": "/api/v1/sessions",
      "allowed_methods": ("GET", "POST"),
      "tenant_binding": "method",
    },
    name="forjd-sessions-adapter",
  ),
  path(
    "api/v1/sessions/<str:session_id>",
    session_revoke_proxy,
    name="forjd-session-revoke-adapter",
  ),
  # Retired product/partner facade → explicit 404 (partners use FORJD directly).
  re_path(
    r"^api/v1/(?P<capability>analytics|telemetry|ml|exports|integrations|model|predict|siem|projections|workflows|replay)(?:/.*)?$",
    unsupported_forjd_proxy,
    name="forjd-unsupported-domain",
  ),
  re_path(
    r"^api/v1/agent/(?P<capability>vulnerabilities)(?:/.*)?$",
    unsupported_forjd_proxy,
    name="forjd-unsupported-agent",
  ),
  re_path(
    r"^api/v1/system-status/(?P<capability>endpoints|integrations)(?:/.*)?$",
    unsupported_forjd_proxy,
    name="forjd-unsupported-status-extras",
  ),
  path("api/v1/", api.urls),
  path("robots.txt", views.robots_txt, name="robots_txt"),
  path(
    "sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="django.contrib.sitemaps.views.sitemap"
  ),
]

handler404 = "config.views.custom_404"
