import logging
import mimetypes

from django.conf import settings
from django.http import FileResponse, Http404, HttpRequest, HttpResponse
from django.shortcuts import render

logger = logging.getLogger(__name__)


def home(request: HttpRequest) -> HttpResponse:
  """Centered brand-mark splash (parity with backend.forjd.co)."""
  return render(
    request,
    "home.html",
    {
      "frontend_url": settings.FRONTEND_URL.rstrip("/"),
      "marketing_url": settings.MARKETING_URL.rstrip("/"),
    },
  )


def custom_404(request: HttpRequest, exception: Exception) -> HttpResponse:
  frontend_url = settings.FRONTEND_URL.rstrip("/")
  return render(
    request,
    "404.html",
    {
      "debug": settings.DEBUG,
      "frontend_url": frontend_url,
      "marketing_url": settings.MARKETING_URL.rstrip("/"),
    },
    status=404,
  )


def serve_asset(request: HttpRequest, path: str) -> FileResponse:
  """Serve shared JSON/CSS/JS assets at /assets/* (marketing + widget parity).

  Embed contract: external sites load https://deml.app/assets/widget.js.
  Backend mirrors that path so /assets/widget.js also resolves on
  backend.deml.app (from static/widgets/) for CDN fallbacks.
  """
  static_root = (settings.BASE_DIR / "static").resolve()
  candidates = [(static_root / "assets" / path).resolve()]
  # Legacy / canonical embed filenames live under static/widgets/.
  if path in {"widget.js", "widget.css"} or path.startswith("widgets/"):
    widget_rel = path.removeprefix("widgets/")
    candidates.append((static_root / "widgets" / widget_rel).resolve())

  file_path = next(
    (
      candidate
      for candidate in candidates
      if str(candidate).startswith(str(static_root)) and candidate.is_file()
    ),
    None,
  )
  if file_path is None:
    raise Http404
  content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
  return FileResponse(file_path.open("rb"), content_type=content_type)


def robots_txt(request: HttpRequest) -> HttpResponse:
  """Serve robots.txt with sitemap reference. — Antigravity - Claude Opus 4.6"""
  sitemap_url = request.build_absolute_uri("/sitemap.xml")
  lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /api/v1/openapi.json",
    "",
    f"Sitemap: {sitemap_url}",
  ]
  return HttpResponse("\n".join(lines), content_type="text/plain")
