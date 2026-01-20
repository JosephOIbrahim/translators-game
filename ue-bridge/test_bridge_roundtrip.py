#!/usr/bin/env python3
"""
test_bridge_roundtrip.py

Integration test for Claude Code → UE5 Bridge
Simulates UE5 side to test the Python bridge without running Unreal Engine.

Usage:
    Terminal 1: python ~/.claude/bridges/ue5_translators_bridge.py
    Terminal 2: python test_bridge_roundtrip.py

This script:
1. Watches for state.json from Claude Code
2. Responds with acknowledgment
3. Simulates user answers to each question
4. Verifies USD output at the end
"""

import json
import time
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

# Configuration - must match the bridge
BRIDGE_DIR = Path.home() / ".translators"
STATE_FILE = BRIDGE_DIR / "state.json"
ANSWER_FILE = BRIDGE_DIR / "answer.json"
USD_OUTPUT = BRIDGE_DIR / "cognitive_substrate.usda"

# Test configuration
SIMULATED_RESPONSE_TIME_MS = 2500.0  # Simulate 2.5s decision time
AUTO_ANSWER_INDEX = 2  # Always pick option 2 (middle option)


class UE5Simulator:
    """Simulates UE5 side of the bridge for testing"""

    def __init__(self):
        self.questions_received = 0
        self.last_state_mtime = 0

    def log(self, message: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [UE5-SIM] {message}")

    def write_answer(self, data: Dict[str, Any]):
        """Write answer.json for Claude Code to read"""
        data["timestamp"] = datetime.now().isoformat()
        data["$schema"] = "translators-answer-v1"
        ANSWER_FILE.write_text(json.dumps(data, indent=2))
        self.log(f"Wrote answer: {data.get('type', 'unknown')}")

    def read_state(self) -> Optional[Dict[str, Any]]:
        """Read state.json if it changed"""
        if not STATE_FILE.exists():
            return None

        mtime = STATE_FILE.stat().st_mtime
        if mtime <= self.last_state_mtime:
            return None

        self.last_state_mtime = mtime
        try:
            return json.loads(STATE_FILE.read_text())
        except json.JSONDecodeError:
            return None

    def send_ack(self):
        """Send acknowledgment that UE5 is ready"""
        self.write_answer({
            "type": "ack",
            "ack": {
                "ready": True,
                "ue_version": "5.7.0-SIMULATOR"
            }
        })

    def send_answer(self, question_id: str, option_index: int):
        """Send a simulated user answer"""
        self.write_answer({
            "type": "answer",
            "answer": {
                "question_id": question_id,
                "option_index": option_index,
                "response_time_ms": SIMULATED_RESPONSE_TIME_MS
            }
        })

    def handle_state(self, state: Dict[str, Any]):
        """Process incoming state from Claude Code"""
        state_type = state.get("type", "")

        if state_type == "ready":
            total = state.get("total_questions", 0)
            self.log(f"Claude Code ready! {total} questions total")
            self.log("Sending acknowledgment...")
            time.sleep(0.5)  # Simulate startup delay
            self.send_ack()

        elif state_type == "question":
            index = state.get("index", 0)
            total = state.get("total", 0)
            question_id = state.get("id", "")
            text = state.get("text", "").replace("\n", " ")
            self.questions_received += 1

            self.log(f"Question {index + 1}/{total}: {question_id}")
            self.log(f"  Text: {text[:50]}...")

            # Simulate "thinking time"
            self.log(f"  [Simulating {SIMULATED_RESPONSE_TIME_MS/1000:.1f}s response time...]")
            time.sleep(1.0)  # Don't actually wait full time in test

            # Send answer
            self.send_answer(question_id, AUTO_ANSWER_INDEX)
            self.log(f"  Answered: option {AUTO_ANSWER_INDEX}")

        elif state_type == "transition":
            direction = state.get("direction", "")
            next_scene = state.get("next_scene", "")
            progress = state.get("progress", 0)
            self.log(f"Transition: {direction} -> {next_scene} ({progress*100:.0f}% complete)")

        elif state_type == "finale":
            self.log("=" * 50)
            self.log("FINALE RECEIVED!")
            self.log(f"  Message: {state.get('message', '')}")
            self.log(f"  USD Path: {state.get('usd_path', '')}")
            return True  # Signal completion

        return False

    def verify_usd(self):
        """Verify the generated USD file"""
        if not USD_OUTPUT.exists():
            self.log("ERROR: USD file not found!")
            return False

        content = USD_OUTPUT.read_text()
        self.log("=" * 50)
        self.log("USD OUTPUT VERIFICATION")
        self.log("=" * 50)

        # Check for key elements
        checks = [
            ("defaultPrim", "CognitiveSubstrate" in content),
            ("Profile Xform", '"Profile"' in content),
            ("Session Xform", '"Session"' in content),
            ("Answers Xform", '"Answers"' in content),
            ("checksum", 'checksum = "' in content),
        ]

        all_passed = True
        for name, passed in checks:
            status = "PASS" if passed else "FAIL"
            self.log(f"  [{status}] {name}")
            if not passed:
                all_passed = False

        # Extract and display checksum
        import re
        match = re.search(r'checksum = "([a-f0-9]+)"', content)
        if match:
            self.log(f"  Checksum: {match.group(1)}")

        return all_passed

    def run(self, timeout: float = 120.0):
        """Main test loop"""
        self.log("=" * 50)
        self.log("UE5 BRIDGE SIMULATOR")
        self.log("=" * 50)
        self.log(f"Watching: {STATE_FILE}")
        self.log(f"Will auto-answer with option {AUTO_ANSWER_INDEX}")
        self.log("")
        self.log("Start the Claude Code bridge in another terminal:")
        self.log("  python ~/.claude/bridges/ue5_translators_bridge.py")
        self.log("")

        BRIDGE_DIR.mkdir(parents=True, exist_ok=True)
        start_time = time.time()
        completed = False

        while time.time() - start_time < timeout:
            state = self.read_state()
            if state:
                completed = self.handle_state(state)
                if completed:
                    break
            time.sleep(0.1)

        if completed:
            self.log("")
            time.sleep(0.5)  # Wait for USD to be written
            success = self.verify_usd()
            self.log("")
            if success:
                self.log("TEST PASSED!")
            else:
                self.log("TEST FAILED - USD verification errors")
        else:
            self.log("TIMEOUT - no finale received")

        self.log(f"Total questions handled: {self.questions_received}")


def main():
    simulator = UE5Simulator()
    try:
        simulator.run()
    except KeyboardInterrupt:
        simulator.log("Test interrupted by user")


if __name__ == "__main__":
    main()
