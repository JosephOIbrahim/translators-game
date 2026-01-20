# The Translators — Parallel Track Plan

## The Vision

Two versions of The Translators, both exporting cognitive profiles as USD:

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE TRANSLATORS                               │
├──────────────────────┬──────────────────────────────────────────┤
│   WEB VERSION        │         UE5.7 VERSION                     │
│   (Canvas/JS)        │         (Native USD)                      │
├──────────────────────┼──────────────────────────────────────────┤
│ 2D Garden Metaphor   │ 3D Immersive Experience                   │
│ 8 Questions          │ 8 Questions                               │
│ Generate USDA text   │ Live USD Layer manipulation               │
│ Export to file       │ Export via USD Stage Actor                │
├──────────────────────┴──────────────────────────────────────────┤
│                    SAME CHECKSUM                                 │
│                    SAME ANCHOR                                   │
│                    SAME AI BEHAVIOR                              │
│                           ↓                                      │
│                    CLAUDE.md                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Marketing Story:** "Built the same cognitive profiler twice — once in web, once in Unreal — both produce identical AI behavior profiles. Here's why that matters."

---

## Timeline: 1-2 Weeks

| Day | Web Track | UE Track | Checkpoint |
|-----|-----------|----------|------------|
| 1-2 | Polish + Deploy | Bridge architecture | Is bridge feasible? |
| 3-4 | Live on portfolio | USD Stage Actor working | Can we update USD live? |
| 5-6 | Iterate on feedback | Question UI + flow | Core loop functional? |
| 7 | Ship v1.0 | Basic garden (Niagara) | CHECKPOINT: Ship web? |
| 8-10 | Documentation | Polish + export verification | UE matching web? |
| 11-14 | Marketing prep | Package for portfolio | Both ready? |

**Hard Rule:** Web ships by Day 7 regardless of UE progress.

---

## Stage 1: Claude Code → UE5.7 Bridge

### What Is It?

A communication layer between Claude Code CLI and Unreal Engine 5.7, enabling:
- Claude Code sending commands to UE Editor
- UE responding with scene state
- Bidirectional iteration on USD scenes

### Why Build It First?

1. It's the **research contribution** — nobody else has this
2. It makes UE development **faster** (Claude helps build the game)
3. It's **reusable** beyond The Translators
4. It's the **portfolio differentiator**

### Architecture Options

**Option A: HTTP REST API (Simple)**
```
Claude Code → HTTP POST → UE Python Server → Execute in Editor
          ← HTTP Response ← JSON result
```
- Pro: Simple, works now
- Con: One-way feel, polling required

**Option B: WebSocket (Real-time)**
```
Claude Code ←→ WebSocket ←→ UE Python/C++ Plugin
```
- Pro: Bidirectional, real-time
- Con: More complex setup

**Option C: MCP Server in UE (Ideal)**
```
Claude Code → MCP Protocol → UE as MCP Server
```
- Pro: Native Claude Code integration, tool discovery
- Con: Requires MCP server implementation in UE

### Recommended: Start with Option A, evolve to C

Day 1-2 deliverable:
- UE5.7 project with Python scripting enabled
- Simple HTTP endpoint that can receive commands
- Test: Claude Code can trigger Blueprint execution

---

## Stage 2: Parallel Game Development

### Web Version (SHIP THIS)

**Current State:** Functional, deterministic, exports USDA

**Remaining Tasks:**
- [ ] Deploy to josephibrahim.com
- [ ] Add loading/save to localStorage (Phase 3 from improvement plan)
- [ ] Polish UI transitions
- [ ] Test on mobile
- [ ] Add meta tags for social sharing

**Ship Criteria:** Playable, exports working profile, looks professional

### UE5.7 Version (BONUS)

**Target State:** Functional prototype demonstrating USD-native approach

**Core Features:**
1. Mac model on desk in 3D environment
2. UI widget for 8 questions
3. USD Stage Actor with live CognitiveProfile layer
4. As answers come in, USD attributes update
5. Export produces identical checksum to web version
6. Basic garden visualization (Niagara particles)

**Ship Criteria:** Demonstrates concept, exports verifiable profile

---

## The Bridge in Detail

### UE5.7 Python Scripting Setup

```python
# ue_claude_bridge.py — runs inside UE Editor
import unreal
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import threading

class ClaudeBridgeHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        command = json.loads(post_data)

        # Execute command in UE
        result = execute_ue_command(command)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

def execute_ue_command(command):
    cmd_type = command.get('type')

    if cmd_type == 'get_usd_stage':
        # Return current USD stage info
        stage_actor = unreal.EditorLevelLibrary.get_all_level_actors()[0]  # Simplified
        return {'stage': str(stage_actor)}

    elif cmd_type == 'set_usd_attribute':
        # Set attribute on USD prim
        prim_path = command['prim']
        attr_name = command['attribute']
        value = command['value']
        # USD manipulation here
        return {'success': True}

    elif cmd_type == 'spawn_actor':
        # Spawn actor in scene
        return spawn_actor(command['class'], command['location'])

    return {'error': 'Unknown command'}

# Start server in background thread
def start_bridge(port=8765):
    server = HTTPServer(('localhost', port), ClaudeBridgeHandler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    unreal.log(f"Claude Bridge running on port {port}")
```

### Claude Code Side (MCP or direct HTTP)

```javascript
// claude-ue-bridge.mjs — MCP server or direct calls
async function sendToUE(command) {
  const response = await fetch('http://localhost:8765', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  return response.json();
}

// Example: Set cognitive trait in USD
await sendToUE({
  type: 'set_usd_attribute',
  prim: '/TranslatorsProfile',
  attribute: 'pace',
  value: 'Quick'
});
```

---

## USD Parity Verification

Both versions must produce **identical checksums** for the same answers.

### Test Protocol

1. Answer all 8 questions identically in both versions
2. Export USDA from both
3. Compute checksum from both
4. **Must match exactly**

If they don't match:
- Check dimension ordering (must be alphabetical)
- Check value precision (must be integer percentages)
- Check VERSION prefix (must be TRL_v1)

---

## Daily Checkpoints

### Format

```
DAY N CHECKPOINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Web:    [■■■■■■□□□□] 60% — [status]
UE:     [■■□□□□□□□□] 20% — [status]
Bridge: [■■■■□□□□□□] 40% — [status]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODAY: [what you'll work on]
BLOCKER: [if any]
ENERGY: [1-5]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Energy Check

If ENERGY < 3 for two consecutive days:
- Switch to polish/documentation only
- No new features
- Consider shipping early

---

## Exit Criteria

### Web Version (Required)
- [ ] Deployed to live URL
- [ ] All 8 questions functional
- [ ] Exports USDA with valid checksum
- [ ] Looks professional on desktop + mobile

### UE Version (Bonus)
- [ ] USD Stage Actor manipulates live layer
- [ ] Questions update USD attributes
- [ ] Export matches web checksum
- [ ] Basic 3D environment renders

### Bridge (Research Value)
- [ ] Claude Code can send commands to UE
- [ ] UE responds with state
- [ ] Documented for portfolio

---

## The Marketing Arc

After shipping, the breakdown tells this story:

1. **The Problem:** AI doesn't know how to talk to me
2. **The Insight:** Cognitive profiling via honest interview
3. **The Innovation:** USD as Universal State Description
4. **The Proof:** Built it twice, same checksum both times
5. **The Bridge:** Claude Code literally helped build the UE version
6. **The Thesis:** AI tools that understand human cognition

This is **unique**. Nobody else is showing this.

---

## Next Action

1. ✅ Create this plan
2. ⏳ You start ADHD reinforcement chat (separate)
3. ⏳ Return here with reinforced profile
4. ⏳ Day 1 begins: Deploy web + start bridge

---

*Plan generated by Ralph Loop iteration 1*
*Checksum context: 101bfab5*
