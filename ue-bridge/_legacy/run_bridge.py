#!/usr/bin/env python3
"""
Quick launcher for Translators Bridge.
Usage:
    python run_bridge.py          # JSON mode (no USD deps needed)
    python run_bridge.py --test   # Write test question and exit
"""
import subprocess
import sys
from pathlib import Path

script = Path(__file__).parent / "bridge_orchestrator.py"
args = [sys.executable, str(script), "--json"] + sys.argv[1:]
sys.exit(subprocess.call(args))
