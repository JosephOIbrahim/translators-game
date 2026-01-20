# HANDOFF: Claude Code → Unreal Engine 5.7 Bridge

**Document Type**: Implementation Handoff
**Created**: January 2026
**For**: Developer or AI agent tasked with building the UE5 bridge
**Research Source**: `docs/CLAUDE_UE5_BRIDGE_RESEARCH.md`

---

## TL;DR (30-Second Brief)

Build a file-based bridge between Claude Code and UE5.7 for the "Translators" cognitive profiling game. Claude writes JSON/USD files → UE5 watches for changes → UE5 displays questions → User answers → UE5 writes response → Claude reads and continues.

**The game is a "hallmark card that plays music"** - a questionnaire disguised as an 8-bit retro game. Not a full game engine project.

---

## CRITICAL GOTCHAS (Read First)

| Issue | Why It Matters | Solution |
|-------|----------------|----------|
| **USD Stage Actor does NOT auto-reload** | Documentation lies. File changes require manual reload. | Implement `FDirectoryWatcher` + call `set_root_layer()` |
| **FDirectoryWatcher is editor-only** | Won't work in packaged builds by default | Keep as editor-only OR implement custom file polling |
| **USD attributes not in Blueprints** | Can't read `cognitive_density` natively | Use [UsdAttributeTool plugin](https://github.com/jack3761/UE-UsdAttributeTool) OR Python |
| **Runtime USD needs flag** | USD won't load at runtime without it | Add `FORCE_ANSI_ALLOCATOR=1` to `Project.Target.cs` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FILE-BASED BRIDGE                              │
│                                                                          │
│   ~/.translators/                                                        │
│   ├── state.json          ← Claude writes, UE5 reads (questions)        │
│   ├── answer.json         ← UE5 writes, Claude reads (user input)       │
│   └── cognitive_substrate.usda  ← Claude writes, UE5 USD Stage reads    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   CLAUDE CODE                        UNREAL ENGINE 5.7                   │
│   ───────────                        ────────────────                    │
│   Python bridge script               BridgeComponent (C++)               │
│   - Writes state.json                - FDirectoryWatcher                 │
│   - Waits for answer.json            - Parses state.json                 │
│   - Generates .usda                  - Displays question UI              │
│                                      - Writes answer.json                │
│                                      - USD Stage Actor (cognitive state) │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Log

| Decision | Chosen | Rejected | Rationale |
|----------|--------|----------|-----------|
| Protocol | File-based | TCP, HTTP, WebSocket | Zero networking complexity. 100-150ms latency acceptable. |
| UE5 LLM | Bypass | Interface with Epic's AI | Different purpose (dev vs game), different model (GPT vs Claude) |
| USD for state | Yes | JSON-only | LIVRPS composition = cognitive priority. Native UE5 support. |
| Rendering | Paper2D (8-bit) | Full 3D | "Hallmark card" scope. 7-10 days, not months. |
| Attribute access | UsdAttributeTool plugin | Native BP, Python | Blueprint-callable. Simple integration. |

---

## Files to Create

### 1. Claude Code Side

**`~/.claude/bridges/ue5_translators_bridge.py`** (already exists - verify)

```python
#!/usr/bin/env python3
"""
Claude Code → UE5 Bridge
Run with: python ue5_translators_bridge.py
"""

import json
import time
from pathlib import Path
from datetime import datetime

BRIDGE_DIR = Path.home() / ".translators"
STATE_FILE = BRIDGE_DIR / "state.json"
ANSWER_FILE = BRIDGE_DIR / "answer.json"
USD_OUTPUT = BRIDGE_DIR / "cognitive_substrate.usda"

class TranslatorsBridge:
    def __init__(self):
        BRIDGE_DIR.mkdir(parents=True, exist_ok=True)
        self.answers = {}

    def send_state(self, data: dict):
        """Write state for UE5 to read"""
        data["timestamp"] = datetime.now().isoformat()
        data["$schema"] = "translators-state-v1"
        STATE_FILE.write_text(json.dumps(data, indent=2))

    def wait_for_answer(self, timeout: float = 300.0) -> dict | None:
        """Block until UE5 writes answer.json"""
        ANSWER_FILE.unlink(missing_ok=True)
        start = time.time()
        while time.time() - start < timeout:
            if ANSWER_FILE.exists():
                try:
                    answer = json.loads(ANSWER_FILE.read_text())
                    ANSWER_FILE.unlink()
                    return answer
                except json.JSONDecodeError:
                    pass
            time.sleep(0.1)
        return None

    def generate_usd(self, dimensions: dict, checksum: str):
        """Write cognitive substrate as USDA"""
        usda = f'''#usda 1.0
(
    defaultPrim = "CognitiveSubstrate"
    doc = "Translators Cognitive Profile"
)

def Xform "CognitiveSubstrate" {{
    def Xform "Profile" {{
        float cognitive_density = {dimensions.get('cognitive_density', 0.5)}
        float home_altitude = {dimensions.get('home_altitude', 0.5)}
        float guidance_frequency = {dimensions.get('guidance_frequency', 0.5)}
        float default_paradigm = {dimensions.get('default_paradigm', 0.5)}
        float feedback_style = {dimensions.get('feedback_style', 0.5)}
        float uncertainty_tolerance = {dimensions.get('uncertainty_tolerance', 0.5)}
        float processing_pace = {dimensions.get('processing_pace', 0.5)}
        float tangent_tolerance = {dimensions.get('tangent_tolerance', 0.5)}
    }}

    def Xform "Session" {{
        string checksum = "{checksum}"
        string generated = "{datetime.now().isoformat()}"
    }}
}}
'''
        USD_OUTPUT.write_text(usda)
```

### 2. UE5 Side

**Project Structure**:
```
TranslatorsCard/
├── Source/
│   └── TranslatorsCard/
│       ├── TranslatorsCard.Build.cs
│       ├── BridgeComponent.h
│       └── BridgeComponent.cpp
├── Content/
│   └── USD/
│       └── (USD Stage Actor will reference ~/.translators/cognitive_substrate.usda)
├── Plugins/
│   └── UsdAttributeTools/  (clone from GitHub)
└── Config/
    └── DefaultEngine.ini
```

**`BridgeComponent.h`**:
```cpp
#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "IDirectoryWatcher.h"
#include "BridgeComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestionReceived, const FString&, QuestionJson);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnUsdUpdated);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class TRANSLATORSCARD_API UBridgeComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UBridgeComponent();

    virtual void BeginPlay() override;
    virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

    UPROPERTY(BlueprintAssignable)
    FOnQuestionReceived OnQuestionReceived;

    UPROPERTY(BlueprintAssignable)
    FOnUsdUpdated OnUsdUpdated;

    UFUNCTION(BlueprintCallable)
    void SendAnswer(int32 QuestionIndex, int32 OptionIndex, float ResponseTimeMs);

    UFUNCTION(BlueprintCallable)
    void SendAcknowledge();

private:
    void SetupFileWatcher();
    void OnDirectoryChanged(const TArray<FFileChangeData>& Changes);
    void OnStateFileChanged();
    void OnUsdFileChanged();

    FString BridgePath;
    FDelegateHandle WatchHandle;
    class AUsdStageActor* UsdStageActor;
};
```

**`BridgeComponent.cpp`**:
```cpp
#include "BridgeComponent.h"
#include "DirectoryWatcherModule.h"
#include "IDirectoryWatcher.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Json.h"
#include "UsdStageActor.h"

UBridgeComponent::UBridgeComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
    BridgePath = FPaths::Combine(FPlatformProcess::UserHomeDir(), TEXT(".translators"));
}

void UBridgeComponent::BeginPlay()
{
    Super::BeginPlay();

    // Ensure directory exists
    IPlatformFile::GetPlatformPhysical().CreateDirectory(*BridgePath);

    SetupFileWatcher();
}

void UBridgeComponent::SetupFileWatcher()
{
    FDirectoryWatcherModule& DirWatcherModule =
        FModuleManager::LoadModuleChecked<FDirectoryWatcherModule>(TEXT("DirectoryWatcher"));
    IDirectoryWatcher* DirWatcher = DirWatcherModule.Get();

    if (DirWatcher)
    {
        IDirectoryWatcher::FDirectoryChanged Callback =
            IDirectoryWatcher::FDirectoryChanged::CreateUObject(
                this, &UBridgeComponent::OnDirectoryChanged);

        DirWatcher->RegisterDirectoryChangedCallback_Handle(
            BridgePath, Callback, WatchHandle, 0);
    }
}

void UBridgeComponent::OnDirectoryChanged(const TArray<FFileChangeData>& Changes)
{
    for (const FFileChangeData& Change : Changes)
    {
        if (Change.Filename.EndsWith(TEXT("state.json")))
        {
            OnStateFileChanged();
        }
        else if (Change.Filename.EndsWith(TEXT(".usda")))
        {
            OnUsdFileChanged();
        }
    }
}

void UBridgeComponent::OnStateFileChanged()
{
    FString FilePath = FPaths::Combine(BridgePath, TEXT("state.json"));
    FString Content;

    if (FFileHelper::LoadFileToString(Content, *FilePath))
    {
        OnQuestionReceived.Broadcast(Content);
    }
}

void UBridgeComponent::OnUsdFileChanged()
{
    // Force USD Stage Actor to reload
    if (UsdStageActor)
    {
        FString CurrentLayer = UsdStageActor->RootLayer.FilePath;
        UsdStageActor->SetRootLayer(TEXT(""));
        UsdStageActor->SetRootLayer(CurrentLayer);
    }

    OnUsdUpdated.Broadcast();
}

void UBridgeComponent::SendAnswer(int32 QuestionIndex, int32 OptionIndex, float ResponseTimeMs)
{
    TSharedPtr<FJsonObject> JsonObj = MakeShareable(new FJsonObject);
    JsonObj->SetStringField(TEXT("$schema"), TEXT("translators-answer-v1"));
    JsonObj->SetStringField(TEXT("type"), TEXT("answer"));

    TSharedPtr<FJsonObject> AnswerObj = MakeShareable(new FJsonObject);
    AnswerObj->SetNumberField(TEXT("option_index"), OptionIndex);
    AnswerObj->SetNumberField(TEXT("response_time_ms"), ResponseTimeMs);
    JsonObj->SetObjectField(TEXT("answer"), AnswerObj);

    FString OutputString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&OutputString);
    FJsonSerializer::Serialize(JsonObj.ToSharedRef(), Writer);

    FString FilePath = FPaths::Combine(BridgePath, TEXT("answer.json"));
    FFileHelper::SaveStringToFile(OutputString, *FilePath);
}

void UBridgeComponent::SendAcknowledge()
{
    TSharedPtr<FJsonObject> JsonObj = MakeShareable(new FJsonObject);
    JsonObj->SetStringField(TEXT("type"), TEXT("ack"));

    TSharedPtr<FJsonObject> AckObj = MakeShareable(new FJsonObject);
    AckObj->SetBoolField(TEXT("ready"), true);
    AckObj->SetStringField(TEXT("ue_version"), TEXT("5.7.0"));
    JsonObj->SetObjectField(TEXT("ack"), AckObj);

    FString OutputString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&OutputString);
    FJsonSerializer::Serialize(JsonObj.ToSharedRef(), Writer);

    FString FilePath = FPaths::Combine(BridgePath, TEXT("answer.json"));
    FFileHelper::SaveStringToFile(OutputString, *FilePath);
}

void UBridgeComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    FDirectoryWatcherModule& DirWatcherModule =
        FModuleManager::LoadModuleChecked<FDirectoryWatcherModule>(TEXT("DirectoryWatcher"));
    IDirectoryWatcher* DirWatcher = DirWatcherModule.Get();

    if (DirWatcher && WatchHandle.IsValid())
    {
        DirWatcher->UnregisterDirectoryChangedCallback_Handle(BridgePath, WatchHandle);
    }

    Super::EndPlay(EndPlayReason);
}
```

**`TranslatorsCard.Build.cs`**:
```csharp
PublicDependencyModuleNames.AddRange(new string[] {
    "Core",
    "CoreUObject",
    "Engine",
    "Json",
    "JsonUtilities",
    "USDImporter",     // For AUsdStageActor
    "USDStageEditor"   // For USD utilities
});

PrivateDependencyModuleNames.AddRange(new string[] {
    "DirectoryWatcher"  // For FDirectoryWatcher
});
```

**`Project.Target.cs`** (add for runtime USD):
```csharp
GlobalDefinitions.Add("FORCE_ANSI_ALLOCATOR=1");
```

---

## Protocol Schemas

### state.json (Claude → UE5)

```json
{
    "$schema": "translators-state-v1",
    "timestamp": "2026-01-19T12:00:00Z",
    "type": "question",
    "question": {
        "index": 0,
        "total": 8,
        "id": "load",
        "text": "How much can you hold at once\nbefore it starts to blur?",
        "scene": "forest_edge",
        "options": [
            {"index": 0, "label": "Not much. One thing at a time.", "direction": "left"},
            {"index": 1, "label": "Quite a lot. I can hold complexity.", "direction": "right"},
            {"index": 2, "label": "It varies. Some days more than others.", "direction": "forward"}
        ]
    }
}
```

### answer.json (UE5 → Claude)

```json
{
    "$schema": "translators-answer-v1",
    "timestamp": "2026-01-19T12:00:05Z",
    "type": "answer",
    "answer": {
        "question_id": "load",
        "option_index": 2,
        "response_time_ms": 3500
    }
}
```

---

## Implementation Checklist

### Phase 1: UE5 Project Setup (Day 1)
- [ ] Create UE5.7 project with Paper2D template
- [ ] Enable plugins: USD Importer, Python Editor Script
- [ ] Clone UsdAttributeTools plugin
- [ ] Add `FORCE_ANSI_ALLOCATOR=1` to Target.cs
- [ ] Create BridgeComponent C++ class
- [ ] Test: Verify FDirectoryWatcher compiles

### Phase 2: File Watcher (Day 2)
- [ ] Implement OnDirectoryChanged callback
- [ ] Test: Create file in ~/.translators, verify callback fires
- [ ] Implement OnStateFileChanged JSON parsing
- [ ] Implement SendAnswer/SendAcknowledge
- [ ] Test: Round-trip with mock Python script

### Phase 3: USD Integration (Day 3)
- [ ] Add USD Stage Actor to level
- [ ] Point to ~/.translators/cognitive_substrate.usda
- [ ] Implement OnUsdFileChanged reload
- [ ] Test: Modify .usda, verify Stage reloads
- [ ] Wire UsdAttributeTools for Blueprint access

### Phase 4: Game UI (Days 4-5)
- [ ] Create Paper2D question display widget
- [ ] Bind OnQuestionReceived to UI update
- [ ] Create option buttons with direction visuals
- [ ] Wire button clicks to SendAnswer
- [ ] Add 8-bit pixel art (NES aesthetic)

### Phase 5: Integration (Days 6-7)
- [ ] Run full Python bridge + UE5 loop
- [ ] Test all 8 questions
- [ ] Verify USD export at finale
- [ ] Add scene transitions between questions
- [ ] Polish: chiptune audio, CRT effects

---

## Testing Commands

**Python side**:
```bash
cd ~/.claude/bridges
python ue5_translators_bridge.py
```

**Verify state file**:
```bash
cat ~/.translators/state.json
```

**Verify answer file**:
```bash
cat ~/.translators/answer.json
```

**Verify USD**:
```bash
cat ~/.translators/cognitive_substrate.usda
```

---

## Failure Modes & Recovery

| Symptom | Cause | Fix |
|---------|-------|-----|
| FDirectoryWatcher callback never fires | Module not loaded | Check `LoadModuleChecked` logs |
| USD Stage doesn't reload | Need clear/reload cycle | Call `SetRootLayer("")` then `SetRootLayer(path)` |
| Blueprint can't read USD attributes | Plugin not installed | Clone UsdAttributeTools to Plugins/ |
| Runtime USD fails | Missing allocator flag | Add `FORCE_ANSI_ALLOCATOR=1` |
| state.json not found | Directory doesn't exist | Call `mkdir -p ~/.translators` |

---

## References

- Research document: `docs/CLAUDE_UE5_BRIDGE_RESEARCH.md`
- Existing Python bridge: `~/.claude/bridges/ue5_translators_bridge.py`
- Architecture doc: `docs/UE5_BRIDGE_ARCHITECTURE.md`
- UsdAttributeTools: https://github.com/jack3761/UE-UsdAttributeTool
- UE5 USD Docs: https://dev.epicgames.com/documentation/en-us/unreal-engine/universal-scene-description-in-unreal-engine

---

## Handoff Complete

This document contains everything needed to implement the Claude Code → UE5.7 bridge. The key insight: **USD Stage Actor does NOT auto-reload** - you must implement file watching yourself.

The game is a "hallmark card" (3-5 minutes), not a full game. Keep it simple.

**Questions?** Read `CLAUDE_UE5_BRIDGE_RESEARCH.md` for deep rationale.
