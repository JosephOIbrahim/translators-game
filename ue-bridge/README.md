# Claude Code → UE5.7 Bridge

Starter files for bidirectional communication between Claude Code and Unreal Engine 5.7.

## Setup

### 1. Enable Python in UE5.7

1. Edit → Plugins → Search "Python"
2. Enable "Python Editor Script Plugin"
3. Restart Editor

### 2. Copy Bridge Script

Copy `ue_claude_bridge.py` to your UE project's `Content/Python/` folder.

### 3. Start the Bridge

In UE Editor, open Output Log (Window → Developer Tools → Output Log)

Run Python command:
```python
import ue_claude_bridge
ue_claude_bridge.start()
```

You should see: `Claude Bridge running on port 8765`

### 4. Test from Claude Code

```bash
curl -X POST http://localhost:8765 \
  -H "Content-Type: application/json" \
  -d '{"type": "ping"}'
```

Should return: `{"status": "pong", "engine": "UE5.7"}`

## Commands

| Command | Description |
|---------|-------------|
| `ping` | Test connection |
| `get_usd_stage` | Get current USD stage info |
| `set_usd_attribute` | Set attribute on USD prim |
| `create_usd_layer` | Create new USD layer |
| `spawn_niagara` | Spawn particle system |

## The Translators Integration

Once bridge is running, The Translators can:
1. Send question answers to UE
2. Update CognitiveProfile USD layer in real-time
3. Trigger garden growth effects
4. Export final profile

## Files

- `ue_claude_bridge.py` — Main bridge server (runs in UE)
- `claude_ue_client.mjs` — Node.js client for Claude Code
- `test_bridge.py` — Test script for UE side
