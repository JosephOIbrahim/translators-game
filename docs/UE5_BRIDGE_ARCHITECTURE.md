# Claude Code → Unreal Engine 5.7 Bridge
## "The Hallmark Card That Plays Music"

---

## The Reframe

**What this is NOT:**
- A 3-6 month AAA game development project
- Complex game mechanics, AI, physics
- Story arcs, characters, dialogue trees

**What this IS:**
- A "hallmark card" that distracts the user
- 8-12 bit retro aesthetic (NES/early SNES era)
- Questions disguised as "game prompts"
- Visual feedback that feels like a game
- **Output: USD Cognitive Substrate file**

> The user thinks they're playing a game.
> They're actually filling out a questionnaire.
> The "game" is the spoonful of sugar.

---

## Timeline Reality Check

| Scope | Time | What You Get |
|-------|------|--------------|
| Full UE5 game | 3-6 months | Overkill |
| **UE5 as fancy renderer** | **1-2 weeks** | **This proposal** |
| Current Canvas 2D | Done | Already works |

**Key insight:** UE5 is just rendering pixels. We're not building a game engine—we're using UE5 as a **pixel art display with USD export**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      THE BRIDGE                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────────────────────┐  │
│  │   Claude Code    │         │      Unreal Engine 5.7           │  │
│  │   (Terminal)     │         │      (8-12 bit Renderer)         │  │
│  │                  │         │                                  │  │
│  │  ┌────────────┐  │  JSON   │  ┌────────────────────────────┐  │  │
│  │  │ Question   │──┼────────►│  │ Paper2D Sprite Scene      │  │  │
│  │  │ Generator  │  │  HTTP   │  │ - Pixel-perfect NES look  │  │  │
│  │  └────────────┘  │         │  │ - 256x224 internal res    │  │  │
│  │                  │         │  │ - 54-color NES palette    │  │  │
│  │  ┌────────────┐  │         │  └────────────────────────────┘  │  │
│  │  │ Answer     │◄─┼────────┤                                   │  │
│  │  │ Receiver   │  │  JSON   │  ┌────────────────────────────┐  │  │
│  │  └────────────┘  │         │  │ USD Stage Actor           │  │  │
│  │                  │         │  │ - Live cognitive state    │  │  │
│  │  ┌────────────┐  │         │  │ - Hot-reload .usda        │  │  │
│  │  │ USD        │──┼────────►│  │ - Visual scene graph      │  │  │
│  │  │ Generator  │  │  FILE   │  └────────────────────────────┘  │  │
│  │  └────────────┘  │         │                                  │  │
│  └──────────────────┘         └──────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Bridge Protocol

### 1. Communication Layer

**Option A: HTTP REST (Simplest)**
```
Claude Code                          UE5
    │                                 │
    │──── POST /question ────────────►│  (display question)
    │                                 │
    │◄─── POST /answer ───────────────│  (user selected option)
    │                                 │
    │──── POST /visual ──────────────►│  (update scene)
    │                                 │
```

**Option B: WebSocket (Real-time)**
```python
# UE5 Python plugin
import asyncio
import websockets

async def bridge():
    async with websockets.connect("ws://localhost:8765") as ws:
        while True:
            msg = await ws.recv()
            if msg["type"] == "question":
                display_question(msg["text"], msg["options"])
            elif msg["type"] == "visual":
                update_scene(msg["state"])
```

**Option C: File Watcher (Zero networking)**
```
Claude Code writes → ~/.translators/state.json
UE5 watches file  → Hot-reloads on change
```

**Recommendation:** Start with File Watcher (Option C). Zero networking complexity.

---

### 2. UE5 Project Structure (Minimal)

```
TranslatorsCard/
├── Content/
│   ├── Sprites/                    # 8-bit pixel art
│   │   ├── Characters/
│   │   │   └── Protagonist.png     # 16x24 sprite
│   │   ├── Environment/
│   │   │   ├── Ground_Tiles.png    # 16x16 tileset
│   │   │   └── Sky_Gradient.png
│   │   └── UI/
│   │       ├── TextBox.png
│   │       └── Cursor.png
│   │
│   ├── USD/                        # Cognitive substrate
│   │   └── cognitive_state.usda    # Live-updating
│   │
│   └── Blueprints/
│       ├── BP_GameManager.uasset   # Orchestrates everything
│       ├── BP_QuestionDisplay.uasset
│       └── BP_VisualFeedback.uasset
│
├── Source/
│   └── TranslatorsCard/
│       └── BridgeComponent.cpp     # File watcher + USD loader
│
└── Plugins/
    └── USDImporter/                # Built-in UE5 USD support
```

---

### 3. 8-12 Bit Aesthetic Constraints

**NES Spec (8-bit):**
- Resolution: 256×224 (render at this, upscale to window)
- Colors: 54-color palette (NES PPU)
- Sprites: 8×8 or 8×16 pixels
- No anti-aliasing, no gradients
- 1-2 parallax layers max

**SNES Spec (16-bit, if you want more):**
- Resolution: 256×224 or 512×448
- Colors: 256 on-screen (from 32,768)
- Sprites: Up to 64×64
- Mode 7 rotation effects (optional)

**UE5 Implementation:**
```cpp
// Force pixel-perfect rendering
GetWorld()->GetGameViewport()->SetConsoleVariableValue(
    TEXT("r.SetRes"), TEXT("256x224"));

// Nearest-neighbor filtering (no smoothing)
Texture->Filter = TF_Nearest;

// Disable all post-processing
PostProcessSettings.bOverride_AutoExposureMethod = true;
PostProcessSettings.AutoExposureMethod = EAutoExposureMethod::Manual;
```

**Material Setup:**
```
Unlit Material
├── No lighting calculations
├── Nearest-neighbor sampling
├── Palette-limited colors
└── Emissive output only
```

---

### 4. The "Game" Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER EXPERIENCE                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SCENE: A lone figure stands at the edge of a pixelated forest.     │
│         Chiptune music plays softly. Stars twinkle (2 colors).      │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░ ★    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░★  ░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░░░▓▓▓░░░░░░░▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░▓▓▓▓▓▓░░░▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │    │
│  │           🧍                                                │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ "The path ahead forks.                               │  │    │
│  │  │  Which way do you feel drawn?"                       │  │    │
│  │  │                                                      │  │    │
│  │  │  ► Into the forest (detail-oriented)                 │  │    │
│  │  │    Up the mountain (big-picture)                     │  │    │
│  │  │    Along the river (go with the flow)                │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  User selects an option.                                            │
│  Character walks that direction (4 frames of animation).            │
│  Scene transitions (fade to black, 0.5s).                           │
│  Next scene loads with next question.                               │
│  USD state updates in real-time.                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5. Claude Code Side (Bridge Implementation)

```python
# ~/.claude/bridges/ue5_bridge.py

import json
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

STATE_FILE = Path.home() / ".translators" / "state.json"
ANSWER_FILE = Path.home() / ".translators" / "answer.json"

class TranslatorsBridge:
    def __init__(self):
        self.questions = self.load_questions()
        self.answers = {}
        self.current_q = 0

    def send_to_ue5(self, data):
        """Write state that UE5 will read"""
        STATE_FILE.parent.mkdir(exist_ok=True)
        STATE_FILE.write_text(json.dumps(data, indent=2))

    def wait_for_answer(self):
        """Block until UE5 writes an answer"""
        ANSWER_FILE.unlink(missing_ok=True)
        while not ANSWER_FILE.exists():
            time.sleep(0.1)
        return json.loads(ANSWER_FILE.read_text())

    def run(self):
        for i, q in enumerate(self.questions):
            # Send question to UE5
            self.send_to_ue5({
                "type": "question",
                "index": i,
                "text": q["text"],
                "options": q["options"],
                "scene": q.get("scene", "forest")
            })

            # Wait for user answer (from UE5)
            answer = self.wait_for_answer()
            self.answers[q["id"]] = answer

            # Send visual feedback
            self.send_to_ue5({
                "type": "transition",
                "direction": answer["direction"],
                "next_scene": self.questions[i+1]["scene"] if i+1 < len(self.questions) else "finale"
            })

        # Generate USD output
        self.generate_usd_substrate()

    def generate_usd_substrate(self):
        """Output the cognitive profile as USD"""
        usd_path = Path.home() / ".translators" / "cognitive_substrate.usda"
        # ... USD generation logic from existing DeterministicProfileEngine
```

---

### 6. UE5 Side (Blueprint + C++)

**BridgeComponent.h:**
```cpp
#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "BridgeComponent.generated.h"

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class UBridgeComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UPROPERTY(BlueprintReadOnly)
    FString CurrentQuestion;

    UPROPERTY(BlueprintReadOnly)
    TArray<FString> CurrentOptions;

    UFUNCTION(BlueprintCallable)
    void SendAnswer(int32 OptionIndex);

    UFUNCTION(BlueprintCallable)
    void CheckForUpdates();

private:
    FString StatePath;
    FString AnswerPath;
    FDateTime LastModified;
};
```

**Blueprint Logic (Visual):**
```
Event Tick
    → Check For Updates (C++)
    → If new question:
        → Update Text Widget
        → Update Option Buttons
        → Play "question appear" animation

On Button Clicked
    → Send Answer (C++)
    → Play "character walk" animation
    → Fade to black
    → Load next scene
```

---

### 7. USD Integration (The Payoff)

**Live USD State in UE5:**
```usda
#usda 1.0
(
    defaultPrim = "CognitiveState"
)

def Xform "CognitiveState" (
    kind = "component"
)
{
    def Xform "Profile"
    {
        float cognitive_density = 0.7
        float home_altitude = 0.5
        string active_mode = "exploring"
        float energy_level = 0.8
    }

    def Xform "Session"
    {
        int questions_answered = 5
        string current_scene = "mountain_peak"
        float completion = 0.625
    }
}
```

**UE5 USD Stage Actor:**
- Loads `cognitive_substrate.usda`
- Watches for file changes
- Updates in real-time as user answers
- Can visualize the cognitive state as actual 3D geometry (optional)

---

## Implementation Timeline

| Phase | Task | Time |
|-------|------|------|
| **1** | UE5 project setup (Paper2D, pixel rendering) | 1 day |
| **2** | Bridge protocol (file watcher) | 1 day |
| **3** | 8-bit sprite assets (can use asset packs) | 1-2 days |
| **4** | Question display + answer handling | 1 day |
| **5** | Scene transitions + visual feedback | 1 day |
| **6** | USD export integration | 1 day |
| **7** | Polish + chiptune audio | 1-2 days |
| **TOTAL** | | **7-10 days** |

---

## Why This Works

1. **UE5 is overkill—but that's the point.**
   - Stable, well-documented, native USD support
   - Paper2D handles pixel art perfectly
   - You're not fighting the engine

2. **8-bit aesthetic is FAST to produce.**
   - 16x16 sprites take minutes, not hours
   - Limited palette = limited decisions
   - Nostalgia does the heavy lifting

3. **The bridge is simple.**
   - JSON files on disk
   - No networking complexity
   - Either side can be restarted independently

4. **USD is first-class.**
   - UE5 has native USD Stage Actors
   - Claude Code generates .usda
   - The loop is closed

---

## The Hallmark Card Philosophy

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   "It's not a game. It's a feeling."                                │
│                                                                      │
│   The user sees: Nostalgic pixel art. Gentle chiptune music.        │
│                  A character on a journey. Choices that feel        │
│                  meaningful but low-stakes.                          │
│                                                                      │
│   What's actually happening: Cognitive profiling via carefully      │
│                             designed questions, exported as USD     │
│                             for Claude to use forever.              │
│                                                                      │
│   Duration: 3-5 minutes.                                            │
│   Feeling: Like opening a card that plays a song.                   │
│   Output: cognitive_substrate.usda                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Install UE5.7** if not already
2. **Create Paper2D project** with pixel-perfect settings
3. **Implement file watcher bridge** (simplest path)
4. **Port questions** from current CalibrationState.js
5. **Test the loop** (Claude Code → UE5 → USD)

Want me to generate the starter UE5 project files or the Claude Code bridge script?
