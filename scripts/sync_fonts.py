#!/usr/bin/env python3
"""NFTS font policy — Geist only. Inter / Viking font sync is retired.

Product Angular loads Geist via `@fontsource-variable/geist` (angular.json).
Django / deml-ui CSS declare the Geist stack; do not reintroduce Inter binaries
or Google Fonts CDNs for Syne / Fraunces.
"""

from __future__ import annotations

import sys


def main() -> int:
  print(
    "sync_fonts.py retired: NFTS uses Geist only "
    "(@fontsource-variable/geist in Angular; deml-ui token stack).",
    file=sys.stderr,
  )
  print(
    "Do not sync Inter or Viking font bundles. See THEME.md and npm run check:nfts.",
    file=sys.stderr,
  )
  return 1


if __name__ == "__main__":
  raise SystemExit(main())
