#!/usr/bin/env python3
"""Thin shim → canonical brave_sweep.py.

This project used to carry its own copy of a 2500-line script. 140 copies existed across
D:/Yahia in 16 versions, most of them stale, so fixes never propagated. This forwards to
the single canonical file instead.

Nothing about the interface changes: same CLI, same flags, same outputs. .env.local is
still resolved per project, because load_env_key() walks up from the OUTPUT directory
rather than from this file.

The previous copy is preserved beside this one as brave_sweep.py.bak-<hash>.
Canonical: D:/Yahia/active/qsearch/research/scripts/brave_sweep.py
"""
import runpy
import sys
from pathlib import Path

CANONICAL = Path(r"D:/Yahia/active/qsearch/research/scripts/brave_sweep.py")

if not CANONICAL.exists():
    raise SystemExit(
        f"ERROR: canonical brave_sweep.py not found at {CANONICAL}\n"
        "Restore it, or replace this shim with the .bak file sitting next to it."
    )

# run_name="__main__" so the canonical script's entry point fires; runpy also sets its
# __file__ to the canonical path, which is what sub-engine recursion resolves.
runpy.run_path(str(CANONICAL), run_name="__main__")
