import os
import shutil
import subprocess
import sys


def sync_design_system() -> None:
  script_dir = os.path.dirname(os.path.abspath(__file__))
  root_dir = os.path.dirname(script_dir)
  docs_dir = os.path.join(root_dir, "viking-ui-docs")
  package_dir = os.path.join(root_dir, "packages", "viking-ui")
  dist_dir = os.path.join(package_dir, "dist")
  frontend_dir = os.path.join(root_dir, "frontend")

  print("Building canonical Viking-UI package artifacts...")
  subprocess.run(["npm", "run", "build"], cwd=package_dir, check=True)

  dist_viking = os.path.join(dist_dir, "viking-ui.css")
  dist_viking_app = os.path.join(dist_dir, "viking-app.css")
  dist_elements = os.path.join(dist_dir, "viking-ui-elements.js")
  dist_tokens_json = os.path.join(dist_dir, "viking-tokens.json")
  docs_static_dir = os.path.join(docs_dir, "dist", "static-css")

  prettier_config = os.path.join(root_dir, "frontend", ".prettierrc")
  subprocess.run(
    [
      "npx",
      "-y",
      "prettier@3.8.2",
      "--config",
      prettier_config,
      "--write",
      dist_viking,
    ],
    check=True,
  )

  for path in (
    dist_viking,
    dist_viking_app,
    dist_elements,
    dist_tokens_json,
  ):
    if not os.path.isfile(path):
      print(f"Expected build output missing: {path}", file=sys.stderr)
      sys.exit(1)

  # Marketing lives in the community repo — never create a stub tree here.
  marketing_alive = os.path.isfile(
    os.path.join(root_dir, "marketing", "src", "layouts", "Layout.astro")
  )

  def _optional_target(path: str) -> str | None:
    if "marketing" in path.split(os.sep) and not marketing_alive:
      return None
    return path

  viking_css_targets = [
    t
    for t in (
      os.path.join(root_dir, "frontend", "public", "assets", "viking-ui.css"),
      os.path.join(root_dir, "backend", "static", "viking-ui.css"),
      os.path.join(root_dir, "marketing", "public", "assets", "viking-ui.css"),
      os.path.join(root_dir, "viking-ui-docs", "public", "assets", "viking-ui.css"),
      os.path.join(docs_static_dir, "viking-ui.css"),
    )
    if _optional_target(t)
  ]

  suite_fonts_src = os.path.join(dist_dir, "suite-fonts.css")
  suite_fonts_targets = [
    t
    for t in (
      os.path.join(root_dir, "frontend", "public", "assets", "suite-fonts.css"),
      os.path.join(root_dir, "marketing", "public", "assets", "suite-fonts.css"),
      os.path.join(root_dir, "viking-ui-docs", "public", "assets", "suite-fonts.css"),
    )
    if _optional_target(t)
  ]

  # API docs skin SoT — fan out to Django static (not folded into viking-ui.css).
  suite_apidocs_src = os.path.join(
    package_dir, "src", "tokens", "suite-apidocs.css"
  )
  suite_apidocs_targets = [
    os.path.join(root_dir, "backend", "static", "suite-apidocs.css"),
  ]
  suite_backend_src = os.path.join(
    package_dir, "src", "tokens", "suite-backend.css"
  )

  viking_app_css_targets = [
    os.path.join(root_dir, "frontend", "public", "assets", "viking-app.css"),
  ]

  elements_targets = [
    t
    for t in (
      os.path.join(root_dir, "backend", "static", "viking-ui-elements.js"),
      os.path.join(root_dir, "marketing", "public", "assets", "viking-ui-elements.js"),
      os.path.join(root_dir, "viking-ui-docs", "public", "assets", "viking-ui-elements.js"),
      os.path.join(docs_static_dir, "viking-ui-elements.js"),
    )
    if _optional_target(t)
  ]

  tokens_json_targets = [
    os.path.join(root_dir, "backend", "static", "viking-tokens.json"),
    os.path.join(docs_static_dir, "viking-tokens.json"),
    os.path.join(root_dir, "viking-ui-docs", "public", "assets", "viking-tokens.json"),
  ]

  if not os.path.isfile(suite_fonts_src):
    print(f"Expected build output missing: {suite_fonts_src}", file=sys.stderr)
    sys.exit(1)
  if not os.path.isfile(suite_apidocs_src):
    print(f"Expected suite-apidocs missing: {suite_apidocs_src}", file=sys.stderr)
    sys.exit(1)
  if not os.path.isfile(suite_backend_src):
    print(f"Expected suite-backend missing: {suite_backend_src}", file=sys.stderr)
    sys.exit(1)

  for src, targets in (
    (dist_viking, viking_css_targets),
    (dist_viking_app, viking_app_css_targets),
    (suite_fonts_src, suite_fonts_targets),
    (suite_apidocs_src, suite_apidocs_targets),
    (suite_backend_src, [os.path.join(root_dir, "backend", "static", "suite-backend.css")]),
    (dist_elements, elements_targets),
    (dist_tokens_json, tokens_json_targets),
  ):
    for target in targets:
      os.makedirs(os.path.dirname(target), exist_ok=True)
      shutil.copy2(src, target)

  print("Syncing self-hosted Inter fonts...")
  subprocess.run(
    [sys.executable, os.path.join(root_dir, "scripts", "sync_fonts.py")],
    check=True,
  )

  print("Successfully synced design system to:")
  for target in viking_css_targets + viking_app_css_targets + elements_targets:
    print(f" - {target}")

  print("Building site-drakkar assets and Django partials...")
  subprocess.run(["npm", "run", "build:site-drakkar"], cwd=frontend_dir, check=True)

  print("Syncing widget assets...")
  subprocess.run(
    [sys.executable, os.path.join(root_dir, "scripts", "sync_widgets.py")],
    check=True,
  )

  print("Validating Viking-UI package propagation...")
  subprocess.run(
    ["node", os.path.join(root_dir, "scripts", "validate_viking_ui_assets.mjs")],
    check=True,
  )


if __name__ == "__main__":
  sync_design_system()
