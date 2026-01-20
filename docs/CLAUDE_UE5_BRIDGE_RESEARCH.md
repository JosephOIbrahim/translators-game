# Claude Code → Unreal Engine 5.7+ Bridge: Deep Research

## Research Date: January 2026
## Ralph Iteration: 2 of 5

---

## Executive Summary

This research evaluates approaches for bridging Claude Code to Unreal Engine 5.7+, with specific focus on:
1. UE5.7's built-in LLM capabilities
2. Existing MCP implementations on GitHub
3. How USD Substrate differentiates from naive approaches
4. Recommended architecture

**Key Insight**: The existing MCP implementations are **tool-oriented** (spawn actor, create blueprint). Our approach with USD Substrate is **state-oriented** (cognitive profile drives behavior). This is a fundamentally different paradigm that none of the existing projects address.

---

## 1. UE5.7 Built-In LLM Capabilities

### Epic Developer Assistant (UE5.7)
- **What it is**: In-editor AI assistant for documentation queries and C++ code generation
- **Access**: Press F1 while hovering over UI elements
- **LLM**: GPT 4.1 (OpenAI)
- **Purpose**: Developer assistance (not runtime NPC/game use)
- **Verdict**: **NOT FOR US** - This is a developer tool, not a game integration API

### Persona Device (UEFN, coming to UE5)
- **What it is**: System for creating AI-powered NPCs with personalities
- **Based on**: Same tech that powered Darth Vader in Fortnite's Galactic Battle season
- **Features**: Voice selection, personality characteristics, player conversation
- **Availability**: Currently UEFN only, coming to UE5 "later in 2025"
- **Verdict**: **NOT FOR US** - This is for runtime NPC dialogue, not Claude Code bridging

### Conclusion: Bypass Built-In LLMs

Neither Epic's AI Assistant nor Persona Device are designed for:
- External LLM integration (Claude, not GPT)
- State synchronization via USD
- Cognitive profiling workflows
- Developer-side orchestration

**Recommendation**: Build our own bridge. Epic's tools solve different problems.

---

## 2. Existing MCP Implementations Analysis

### 2.1 UnrealClaude (Natfii)
**GitHub**: [Natfii/UnrealClaude](https://github.com/Natfii/UnrealClaude)

**Architecture**:
- Shells out to Claude Code CLI: `claude -p --skip-permissions --append-system-prompt "..." "your prompt"`
- MCP server on port 3000 (starts with editor)
- Working directory = project root

**Tools Provided**:
- Actor tools: Spawn, delete, move, set properties
- Blueprint tools: Create/modify, add variables, functions, nodes
- Animation tools: State machines, states, transitions
- Asset tools: Search, query dependencies
- `unreal_get_ue_context`: Query UE5.7 documentation by category

**Strengths**:
- Direct Claude Code integration
- UE5.7 documentation context
- Viewport capture

**Limitations**:
- Tool-oriented, not state-oriented
- No USD integration
- No concept of "cognitive state" driving behavior

### 2.2 Unreal-MCP (chongdashu)
**GitHub**: [chongdashu/unreal-mcp](https://github.com/chongdashu/unreal-mcp)

**Architecture**:
- TCP socket on port 55557
- 3-tier: Claude Desktop → Python MCP Server → C++ Plugin
- Starter project included (UE 5.5)

**Tools Provided**:
- Create/delete actors (cubes, spheres, lights, cameras)
- Set transforms
- Create Blueprint classes with components
- Compile and spawn Blueprint actors

**Strengths**:
- Multi-client support (Claude Desktop, Cursor, Windsurf)
- Clean separation of concerns

**Limitations**:
- No cognitive state
- No USD integration
- Imperative commands only

### 2.3 UnrealGenAISupport (prajwalshettydev)
**GitHub**: [prajwalshettydev/UnrealGenAISupport](https://github.com/prajwalshettydev/UnrealGenAISupport)

**Architecture**:
- MCP server via Python (`mcp_server.py`)
- Port 9877 over TCP
- Also supports direct API calls (OpenAI, Claude, Deepseek)

**Tools Provided**:
- Scene manipulation (spawning, transforms, materials)
- Blueprint generation (buggy per issues)
- UI widget generation
- Multi-model support

**Strengths**:
- Most comprehensive feature set
- Direct Claude API support
- Active development

**Limitations**:
- Still tool-oriented
- No USD cognitive substrate
- Blueprint generation noted as buggy

### Comparison Matrix

| Feature | UnrealClaude | Unreal-MCP | GenAISupport | **Our Approach** |
|---------|--------------|------------|--------------|------------------|
| Claude Support | CLI | Desktop | API | **CLI + MCP** |
| Port | 3000 | 55557 | 9877 | **File-based** |
| USD Integration | ❌ | ❌ | ❌ | **✅ Native** |
| State Sync | ❌ | ❌ | ❌ | **✅ Cognitive** |
| Blueprint Gen | ✅ | ✅ | ⚠️ Buggy | ❌ Not needed |
| Actor Control | ✅ | ✅ | ✅ | ⚠️ Limited |
| Paradigm | Tool | Tool | Tool | **State** |

---

## 3. USD Integration in UE5.7

### USD Stage Actor Capabilities

From [Epic's USD documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/universal-scene-description-in-unreal-engine):

- **Native USD workflow**: Works directly with USD data without conversion
- **Prim types**: Static meshes, skeletal meshes, materials, lights, cameras, variants, animation, blend shapes
- **Non-destructive editing**: Attribute modifications without altering source
- **Scene hierarchy**: Full scene graph visualization
- **Payload management**: Selective loading/unloading

### Live Update Mechanism

**CRITICAL FINDING (Iteration 2)**: Despite documentation claiming USD Stage "handles live updates as you make changes to the source USD file on disk," **this does NOT work automatically**.

Per [forum reports](https://forums.unrealengine.com/t/usd-stage-actor-live-updates/211417), users must manually click "reload" to see changes. The USD Stage Actor does NOT have automatic file watching built in.

**Implication**: We MUST implement our own file watcher that triggers `set_root_layer()` reload:

```cpp
// Our custom file watcher - USD Stage Actor does NOT do this automatically
void UBridgeComponent::OnUsdFileChanged(const FString& Path) {
    // Force reload the USD stage
    if (UsdStageActor) {
        FString CurrentLayer = UsdStageActor->RootLayer.FilePath;
        UsdStageActor->SetRootLayer(TEXT(""));  // Clear
        UsdStageActor->SetRootLayer(CurrentLayer);  // Reload
    }
}
```

This changes our architecture: We need `FDirectoryWatcher` for BOTH state.json AND cognitive_substrate.usda.

### Runtime Loading

```cpp
// Blueprint: Set Root Layer on USD Stage Actor
USDStageActor->SetRootLayer("path/to/cognitive_substrate.usda");
```

Runtime loading requires `FORCE_ANSI_ALLOCATOR=1` in `Project.Target.cs`.

### Python Scripting

UE5 exposes `unreal.UsdStageActor` for programmatic control:
- `set_root_layer(path)`: Load USD file
- `time`: Evaluate at specific timeCode
- `purposes_to_load`: Filter by prim purpose
- `render_context`: Shader selection

---

## 4. Why USD Substrate is Different

### Existing Approaches: Imperative Tool Calls

```
Claude: "Create a red cube at 0,0,0"
MCP Server: spawn_actor("Cube", {color: "red", position: [0,0,0]})
UE5: Creates cube
```

This is **stateless**. Each command is independent. No understanding of why.

### Our Approach: Declarative State Synchronization

```usda
def Xform "CognitiveSubstrate" {
    def Xform "Profile" {
        float cognitive_density = 0.7
        float home_altitude = 0.5
        float tangent_tolerance = 0.9
        float uncertainty_tolerance = 0.8
    }

    def Xform "Session" {
        string active_mode = "exploring"
        float energy_level = 0.6
        int questions_answered = 8
    }
}
```

UE5 reads this USD file and **derives behavior from state**:
- High `tangent_tolerance` → Allow wandering paths in game
- High `uncertainty_tolerance` → Fog effects, ambiguous visuals
- High `cognitive_density` → Dense, information-rich scenes
- `active_mode = "exploring"` → Enable discovery mechanics

**The game doesn't receive commands. It reads state and responds.**

### Key Differentiators

| Aspect | Naive MCP | USD Substrate |
|--------|-----------|---------------|
| Paradigm | Imperative | Declarative |
| State | Stateless | Persistent |
| Coupling | Tight | Loose |
| Failure Mode | Command fails | Graceful degradation |
| Extensibility | New tools needed | New attributes |
| Audit Trail | Command log | USD layer history |
| Composition | N/A | LIVRPS precedence |

### LIVRPS = Cognitive Priority

USD composition (LIVRPS) maps perfectly to cognitive priority:

| USD Layer | Cognitive Layer | Example |
|-----------|-----------------|---------|
| Local | Session state | Current burnout level |
| Inherits | Parent context | Inherited from task chain |
| VariantSets | Mode switching | focused/exploring/recovery |
| References | Calibration data | Cross-session learning |
| Payloads | Domain knowledge | VFX expertise |
| Specializes | Base profile | Core traits (immutable) |

**Higher layers win**. Session state overrides base profile. This is native USD semantics.

---

## 5. Communication Protocol Analysis

### Option A: TCP Socket (Port-based)

**How it works**: MCP server listens on port (e.g., 55557), receives JSON commands, executes in UE5.

**Pros**:
- Real-time bidirectional
- Industry standard
- Existing implementations

**Cons**:
- Network complexity
- Port conflicts
- Firewall issues
- Connection management

### Option B: HTTP REST (Remote Control API)

**How it works**: UE5 Remote Control API exposes HTTP endpoints on port 30010.

**Pros**:
- Built into UE5
- Standard protocols
- Easy debugging (curl)

**Cons**:
- Request/response latency
- No persistent state
- Overkill for local communication

### Option C: File-Based (USD Stage Watching)

**How it works**: Claude Code writes `.usda` file → UE5 USD Stage Actor detects change → Reloads.

**Pros**:
- **Zero networking** - No ports, no firewall, no connection management
- **Native USD** - Uses UE5's built-in USD file watching
- **Persistent state** - File is the truth
- **Offline capable** - Works without network
- **Debug friendly** - State is human-readable text
- **Composition** - Can layer multiple USD files (session.usda references profile.usda)

**Cons**:
- Slightly higher latency (~100ms file write/detect)
- Requires shared filesystem

### Recommendation: Hybrid File + Minimal TCP

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐                ┌──────────────────────────┐   │
│  │   Claude Code    │                │      Unreal Engine 5.7    │   │
│  │                  │                │                          │   │
│  │  ┌────────────┐  │    USD FILE    │  ┌────────────────────┐  │   │
│  │  │ USD        │──┼───────────────►│  │ USD Stage Actor    │  │   │
│  │  │ Generator  │  │  (primary)     │  │ (file watching)    │  │   │
│  │  └────────────┘  │                │  └────────────────────┘  │   │
│  │                  │                │                          │   │
│  │  ┌────────────┐  │    ANSWER      │  ┌────────────────────┐  │   │
│  │  │ Answer     │◄─┼───────────────┤│  │ User Input Handler │  │   │
│  │  │ Receiver   │  │  (JSON file)   │  │ (writes answer.json)│  │   │
│  │  └────────────┘  │                │  └────────────────────┘  │   │
│  │                  │                │                          │   │
│  │  ┌────────────┐  │    TCP/PING    │  ┌────────────────────┐  │   │
│  │  │ Heartbeat  │◄─┼───────────────►│  │ Heartbeat Listener │  │   │
│  │  │ (optional) │  │  (optional)    │  │ (status only)      │  │   │
│  │  └────────────┘  │                │  └────────────────────┘  │   │
│  └──────────────────┘                └──────────────────────────┘   │
│                                                                      │
│  State flow: USD files (primary, persistent)                        │
│  User input: JSON files (answer.json)                               │
│  Status: TCP ping (optional, for "is UE5 running?" checks)          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Should We Interface with UE5's Built-In LLM?

**No.**

| Reason | Explanation |
|--------|-------------|
| Different purpose | Epic's AI is for dev assistance, not game runtime |
| Different model | Epic uses GPT, we use Claude |
| Different paradigm | Epic's is chat, ours is state sync |
| Different scope | Epic's is in-editor, ours is cross-tool |
| Tight coupling | Depending on Epic's AI ties us to their roadmap |
| USD is our bridge | USD Stage Actor gives us everything we need |

**The built-in LLM is a distraction. Our bridge is simpler without it.**

---

## 7. Recommended Architecture

### Layer 1: Claude Code (Orchestrator)

```python
# ~/.claude/bridges/ue5_translators_bridge.py

class TranslatorsBridge:
    def __init__(self):
        self.state_dir = Path.home() / ".translators"
        self.usd_out = self.state_dir / "cognitive_substrate.usda"
        self.answer_in = self.state_dir / "answer.json"

    def send_question(self, question: Dict):
        """Write state.json for UE5 to read"""
        state = {"type": "question", "data": question}
        (self.state_dir / "state.json").write_text(json.dumps(state))

    def wait_for_answer(self) -> Dict:
        """Block until UE5 writes answer.json"""
        while not self.answer_in.exists():
            time.sleep(0.1)
        return json.loads(self.answer_in.read_text())

    def generate_usd(self, profile: Dict):
        """Write cognitive substrate as USD"""
        usda = self.profile_to_usda(profile)
        self.usd_out.write_text(usda)
```

### Layer 2: UE5 Plugin (Receiver)

```cpp
// BridgeComponent.cpp

void UBridgeComponent::BeginPlay() {
    // Watch for state.json changes
    StateWatcher = MakeShared<FFileWatcher>();
    StateWatcher->OnFileChanged.AddUObject(this, &UBridgeComponent::OnStateChanged);
    StateWatcher->Watch(FPaths::Combine(BridgePath, TEXT("state.json")));
}

void UBridgeComponent::OnStateChanged(const FString& Path) {
    // Parse state and update game
    FString Content;
    FFileHelper::LoadFileToString(Content, *Path);
    // ... apply to game state
}
```

### Layer 3: USD Stage Actor (Cognitive State)

```usda
#usda 1.0
(
    defaultPrim = "CognitiveSubstrate"
    doc = "Live cognitive profile - drives game behavior"
)

def Xform "CognitiveSubstrate" {
    # Profile from calibration
    def Xform "Profile" {
        float cognitive_density = 0.7
        float home_altitude = 0.5
        float guidance_frequency = 0.3
        float default_paradigm = 0.8
        float feedback_style = 0.5
        float uncertainty_tolerance = 0.8
        float processing_pace = 0.6
        float tangent_tolerance = 0.9
    }

    # Session state (mutable)
    def Xform "Session" {
        int questions_answered = 5
        string current_scene = "forest_edge"
        float completion = 0.625
        string checksum = "101bfab5"
    }
}
```

UE5 USD Stage Actor watches this file. Game reads `cognitive_density` and adjusts visual complexity. No commands needed.

---

## 8. Technical Implementation Details (Iteration 2)

### 8.1 USD Stage Actor Python API

From [UE5 Python API](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/UsdStageActor):

**Key Methods**:
```python
# Load/reload USD file
stage_actor.set_root_layer(root_file_path: str) → None

# Time evaluation
stage_actor.get_time() → float
stage_actor.set_time(time: float) → None

# Create new in-memory stage
stage_actor.new_stage() → None

# Query generated assets/components
stage_actor.get_generated_component(prim_path: str) → SceneComponent
stage_actor.get_generated_assets(prim_path: str) → Array[Object]

# Map back to source prims
stage_actor.get_source_prim_path(object: Object) → str
```

**Key Properties**:
- `root_layer` (FilePath) - Read-Only
- `time` (float) - Read-Write
- `stage_state` (UsdStageState) - Read-Only

### 8.2 Reading USD Attributes in Blueprints

**Problem**: Native UE5 does NOT expose USD prim attributes to Blueprints directly.

**Solution**: Use [UsdAttributeTool plugin](https://github.com/jack3761/UE-UsdAttributeTool) which provides Blueprint-callable functions for:

| Type | Function |
|------|----------|
| Integer | `GetUsdAttributeInt(StageActor, PrimPath, AttrName)` |
| Float | `GetUsdAttributeFloat(StageActor, PrimPath, AttrName)` |
| Double | `GetUsdAttributeDouble(StageActor, PrimPath, AttrName)` |
| Vec3 | `GetUsdAttributeVec3(StageActor, PrimPath, AttrName)` |

**Example**:
```
GetUsdAttributeFloat(
    StageActor: UsdStageActor,
    PrimPath: "/CognitiveSubstrate/Profile",
    AttrName: "cognitive_density"
) → 0.7
```

**Alternative**: Use Python scripting for more complex attribute access.

### 8.3 File Watcher Implementation

UE5 provides `FDirectoryWatcher` module. **Note**: Editor-only in default builds.

```cpp
// Include
#include "DirectoryWatcherModule.h"
#include "IDirectoryWatcher.h"

// Setup
void UBridgeComponent::SetupFileWatcher() {
    FDirectoryWatcherModule& DirWatcherModule =
        FModuleManager::LoadModuleChecked<FDirectoryWatcherModule>(TEXT("DirectoryWatcher"));
    IDirectoryWatcher* DirWatcher = DirWatcherModule.Get();

    if (DirWatcher) {
        // Watch the bridge directory
        FString WatchPath = FPaths::Combine(
            FPlatformProcess::UserHomeDir(),
            TEXT(".translators")
        );

        IDirectoryWatcher::FDirectoryChanged Callback =
            IDirectoryWatcher::FDirectoryChanged::CreateUObject(
                this,
                &UBridgeComponent::OnDirectoryChanged
            );

        DirWatcher->RegisterDirectoryChangedCallback_Handle(
            WatchPath,
            Callback,
            WatchHandle,
            IDirectoryWatcher::WatchOptions::IgnoreChangesInSubtree
        );
    }
}

void UBridgeComponent::OnDirectoryChanged(const TArray<FFileChangeData>& Changes) {
    for (const FFileChangeData& Change : Changes) {
        if (Change.Filename.EndsWith(TEXT("state.json"))) {
            OnStateFileChanged();
        } else if (Change.Filename.EndsWith(TEXT(".usda"))) {
            OnUsdFileChanged();
        }
    }
}
```

**Windows Implementation**: Uses `ReadDirectoryChangesW` internally.
**Latency**: Typically <50ms for local filesystem changes.

### 8.4 Protocol Schemas

#### state.json (Claude → UE5)

```json
{
    "$schema": "translators-state-v1",
    "timestamp": "2026-01-19T12:00:00Z",
    "type": "question|transition|finale|ready",

    // For type: "question"
    "question": {
        "index": 0,
        "total": 8,
        "id": "load",
        "text": "How much can you hold at once\nbefore it starts to blur?",
        "scene": "forest_edge",
        "options": [
            {
                "index": 0,
                "label": "Not much. One thing at a time.",
                "direction": "left"
            }
        ]
    },

    // For type: "transition"
    "transition": {
        "direction": "left|right|forward|up|down",
        "next_scene": "crossroads",
        "progress": 0.125
    },

    // For type: "finale"
    "finale": {
        "message": "Your cognitive profile is complete.",
        "usd_path": "~/.translators/cognitive_substrate.usda",
        "checksum": "101bfab5"
    }
}
```

#### answer.json (UE5 → Claude)

```json
{
    "$schema": "translators-answer-v1",
    "timestamp": "2026-01-19T12:00:05Z",
    "type": "ack|answer",

    // For type: "ack"
    "ack": {
        "ready": true,
        "ue_version": "5.7.0"
    },

    // For type: "answer"
    "answer": {
        "question_id": "load",
        "option_index": 2,
        "response_time_ms": 3500
    }
}
```

### 8.5 Edge Cases and Error Handling

| Scenario | Detection | Response |
|----------|-----------|----------|
| UE5 not running | No ack within 60s | Exit with clear message |
| File locked | Write fails | Retry 3x with 100ms delay |
| JSON parse error | Catch exception | Log, wait for valid file |
| USD invalid | set_root_layer fails | Log, keep previous state |
| User closes UE5 | Heartbeat fails | Pause, notify user |
| Rapid file changes | Multiple callbacks | Debounce (50ms window) |

### 8.6 Latency Analysis

| Protocol | Write Latency | Detection Latency | Total Round-Trip |
|----------|---------------|-------------------|------------------|
| File-based | ~5ms | ~50ms | ~100-150ms |
| TCP Socket | ~1ms | ~1ms | ~5-10ms |
| HTTP REST | ~5ms | ~5ms | ~20-50ms |

**Verdict**: File-based is acceptable. 100-150ms for state sync is imperceptible in a questionnaire game. TCP would add complexity for minimal benefit.

---

## 9. Next Steps

1. ~~**Finalize bridge protocol spec**~~ ✅ Done (Section 8.4)
2. **Create UE5.7 project** - Paper2D + USD Stage Actor + custom file watcher
3. ~~**Test USD live reload**~~ ⚠️ WILL NOT WORK - Need custom file watcher (Section 3)
4. **Build BridgeComponent** - C++ plugin with `FDirectoryWatcher`
5. **Integrate UsdAttributeTool** - For Blueprint attribute access
6. **Build minimal prototype** - One question round-trip
7. **Add cognitive visualization** - USD state → visual representation

---

## 10. Open Questions for Iteration 3

1. **Packaging**: `FDirectoryWatcher` is editor-only. How to enable in packaged builds?
2. **USD in runtime**: Does `FORCE_ANSI_ALLOCATOR=1` have performance implications?
3. **Hot reload stability**: What happens if USD file is malformed during reload?
4. **Blueprint vs C++**: Should cognitive state reading be Blueprint or C++ only?
5. **Multi-layer USD**: Can we use References to separate profile.usda from session.usda?

---

## Sources

### Iteration 1
- [Epic Developer Assistant Announcement](https://forums.unrealengine.com/t/the-epic-developer-assistant-ai-powered-developer-assistant-for-unreal-engine-5-6/2659525)
- [State of Unreal 2025](https://www.unrealengine.com/en-US/news/all-the-big-news-and-announcements-from-the-state-of-unreal-2025)
- [UnrealClaude (Natfii)](https://github.com/Natfii/UnrealClaude)
- [Unreal-MCP (chongdashu)](https://github.com/chongdashu/unreal-mcp)
- [UnrealGenAISupport](https://github.com/prajwalshettydev/UnrealGenAISupport)
- [USD in Unreal Engine Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/universal-scene-description-in-unreal-engine)
- [MCP Overview (Anthropic)](https://www.anthropic.com/news/model-context-protocol)
- [USD Stage Actor Python API](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/UsdStageActor)

### Iteration 2
- [USD Stage Actor Live Updates Issue](https://forums.unrealengine.com/t/usd-stage-actor-live-updates/211417) - Critical: Auto-reload doesn't work
- [UsdAttributeTool Plugin](https://github.com/jack3761/UE-UsdAttributeTool) - Blueprint USD attribute access
- [FDirectoryWatcher Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Developer/DirectoryWatcher)
- [UE5 Python API - UsdStageActor](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/UsdStageActor?application_version=5.4)
- [File Watcher Forum Discussion](https://forums.unrealengine.com/t/how-to-trigger-an-event-when-a-file-changes-and-get-the-path-to-this-file/145224)
