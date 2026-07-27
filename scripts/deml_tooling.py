#!/usr/bin/env python3
"""
DEML unified dev tooling — sync, hygiene, quality gates, and hook installation.

Usage:
  python scripts/deml_tooling.py sync [--all|--content|--design-system|--widgets]
  python scripts/deml_tooling.py hygiene [--cache] [--theme [--apply]]
  python scripts/deml_tooling.py quality [--fix] [--fast|--full|--ci]
  python scripts/deml_tooling.py install-hooks
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _run(cmd: list[str], *, cwd: Path | None = None, env: dict[str, str] | None = None) -> None:
  label = " ".join(cmd)
  print(f"\n→ {label}")
  subprocess.run(cmd, cwd=cwd or ROOT, env=env, check=True)


def _uvx(*args: str) -> None:
  _run(["uvx", *args])


def cmd_sync(args: argparse.Namespace) -> None:
  if args.all or not (args.content or args.design_system or args.widgets):
    targets = {"content", "design-system", "widgets"}
  else:
    targets = {
      t
      for t, on in (
        ("content", args.content),
        ("design-system", args.design_system),
        ("widgets", args.widgets),
      )
      if on
    }

  if "content" in targets:
    _run([sys.executable, "scripts/sync_content.py"])

  if "design-system" in targets:
    _run([sys.executable, "scripts/sync_design_system.py"])

  if "widgets" in targets:
    _run([sys.executable, "scripts/sync_widgets.py"])


def cmd_hygiene(args: argparse.Namespace) -> None:
  if args.cache:
    _run(["bash", "scripts/deml-cleanup.sh"])

  if args.theme:
    theme_args = ["node", "scripts/enforce-theme.js"]
    theme_args.append("--apply" if args.apply else "--dry-run")
    if args.verbose:
      theme_args.append("--verbose")
    _run(theme_args)


def cmd_quality(args: argparse.Namespace) -> None:
  stage = args.stage
  fix = args.fix

  if stage in {"fast", "full", "ci"}:
    hook_args = ["pre-commit", "run", "--all-files", "--color=always"]
    if stage == "fast":
      hook_args.extend(["--hook-stage", "pre-commit"])
    elif stage == "full":
      hook_args.extend(["--hook-stage", "pre-push"])
    _uvx(*hook_args)

  if stage == "ci":
    _uvx("pre-commit", "run", "--all-files", "--color=always", "--hook-stage", "manual")

  if fix and stage in {"fast", "full", "ci"}:
    print("\n✓ Auto-fix hooks (ruff --fix, prettier) ran via pre-commit")

  if args.theme:
    cmd_hygiene(
      argparse.Namespace(cache=False, theme=True, apply=fix, verbose=args.verbose),
    )


def cmd_install_hooks(args: argparse.Namespace) -> None:
  src = ROOT / "scripts" / "hooks" / "pre-commit"
  dest = ROOT / ".git" / "hooks" / "pre-commit"
  if not src.is_file():
    print(f"Missing hook template: {src}", file=sys.stderr)
    sys.exit(1)
  if not (ROOT / ".git").is_dir():
    print("Not a git repository — cannot install hooks.", file=sys.stderr)
    sys.exit(1)
  shutil.copy2(src, dest)
  dest.chmod(dest.stat().st_mode | 0o111)
  print(f"Installed {dest}")
  _uvx(
    "pre-commit",
    "install",
    "--install-hooks",
    "--hook-type",
    "pre-commit",
    "--hook-type",
    "pre-push",
  )


def cmd_bootstrap(args: argparse.Namespace) -> None:
  """Fresh-clone install: npm workspaces + backend venv + contracts."""
  _run(["npm", "ci", "--legacy-peer-deps"])
  _run(["npm", "run", "build:contracts"])
  venv = ROOT / "backend" / ".venv"
  if not venv.is_dir():
    _run([sys.executable, "-m", "venv", str(venv)])
  pip = venv / ("Scripts" if os.name == "nt" else "bin") / "pip"
  _run([str(pip), "install", "-e", "packages/deml-contracts"])
  _run([str(pip), "install", "-r", "backend/requirements.txt"])
  if not args.skip_hooks:
    cmd_install_hooks(argparse.Namespace())
  print("\n✓ bootstrap complete — next: npm run verify")


def cmd_verify(args: argparse.Namespace) -> None:
  """install → build → test smoke for a clean clone."""
  venv_python = ROOT / "backend" / ".venv" / ("Scripts" if os.name == "nt" else "bin") / "python"
  py = str(venv_python) if venv_python.is_file() else sys.executable
  _run([py, "scripts/check_config_catalog.py"])
  _run(["npm", "run", "validate:contracts"])
  _run([py, "scripts/check_usecase_coverage.py"])
  _run(
    [py, "-m", "pytest", "utils/test_env.py", "config/test_ready_contract.py", "-q", "--tb=line"],
    cwd=ROOT / "backend",
  )
  _run(["npm", "run", "typecheck", "--workspace", "frontend"])
  print("\n✓ verify passed (config + contracts + usecase registry + backend smoke + frontend tsc)")


def build_parser() -> argparse.ArgumentParser:
  parser = argparse.ArgumentParser(description="DEML unified dev tooling")
  sub = parser.add_subparsers(dest="command", required=True)

  bootstrap = sub.add_parser("bootstrap", help="Fresh-clone npm + backend venv + contracts")
  bootstrap.add_argument("--skip-hooks", action="store_true")
  bootstrap.set_defaults(func=cmd_bootstrap, skip_hooks=False)

  verify = sub.add_parser("verify", help="Config/contracts/usecase + smoke tests")
  verify.set_defaults(func=cmd_verify)

  sync = sub.add_parser("sync", help="Propagate design system, widgets, and docs")
  sync.add_argument("--all", action="store_true", help="Sync content, design-system, and widgets")
  sync.add_argument("--content", action="store_true", help="Sync BOOK.md / README / version")
  sync.add_argument(
    "--design-system",
    action="store_true",
    help="Build static CSS via viking-ui-docs and sync to all surfaces",
  )
  sync.add_argument("--widgets", action="store_true", help="Sync navbar/widget assets")
  sync.set_defaults(func=cmd_sync, all=False, content=False, design_system=False, widgets=False)

  hygiene = sub.add_parser("hygiene", help="Cache purge and theme cleanup")
  hygiene.add_argument("--cache", action="store_true", help="Purge build caches (deml-cleanup.sh)")
  hygiene.add_argument("--theme", action="store_true", help="Run enforce-theme.js audit")
  hygiene.add_argument("--apply", action="store_true", help="Apply safe theme fixes")
  hygiene.add_argument("-v", "--verbose", action="store_true")
  hygiene.set_defaults(func=cmd_hygiene, cache=True, theme=False, apply=False, verbose=False)

  quality = sub.add_parser("quality", help="Run lint, format, and security gates")
  quality.add_argument("--fix", action="store_true", help="Apply auto-fixes where supported")
  quality.add_argument(
    "--fast",
    action="store_const",
    const="fast",
    dest="stage",
    help="Pre-commit stage only (format, lint, secrets, a11y)",
  )
  quality.add_argument(
    "--full",
    action="store_const",
    const="full",
    dest="stage",
    help="Pre-push stage (SAST, IaC, dependency scans)",
  )
  quality.add_argument(
    "--ci",
    action="store_const",
    const="ci",
    dest="stage",
    help="All stages including manual (CI parity)",
  )
  quality.add_argument("--theme", action="store_true", help="Also run theme cleanup dry-run/apply")
  quality.add_argument("-v", "--verbose", action="store_true")
  quality.set_defaults(func=cmd_quality, stage="fast", fix=False, theme=False, verbose=False)

  install = sub.add_parser("install-hooks", help="Install tracked git pre-commit hook")
  install.set_defaults(func=cmd_install_hooks)

  return parser


def main() -> None:
  os.chdir(ROOT)
  parser = build_parser()
  args = parser.parse_args()
  args.func(args)


if __name__ == "__main__":
  main()
