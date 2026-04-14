---
name: ":set-profile"
description: "Switch model profile for  agents (quality/balanced/budget)"
tools: ["read/readFile", "edit/editFiles"]
---

## Objective


Switch the model profile used by  agents. This controls which Copilot model each agent uses, balancing quality vs token spend.


## Profiles


| Profile | Description |
|---------|-------------|
| **quality** | Opus everywhere except read-only verification |
| **balanced** | Opus for planning, Sonnet for execution/verification (default) |
| **budget** | Sonnet for writing, Haiku for .github/research/verification |


## Process



## 1. Validate argument

```
if $ARGUMENTS.profile not in ["quality", "balanced", "budget"]:
  Error: Invalid profile "$ARGUMENTS.profile"
  Valid profiles: quality, balanced, budget
  STOP
```

## 2. Check for project

```bash
ls .github/config.json 2>/dev/null
```

If no `./` directory:

```
Error: No  project found.
Run /new-project.md first to initialize a project.
```

## 3. Update .github/config.json

Read current config:

```bash
cat .github/config.json
```

Update `model_profile` field (or add if missing):

```json
{
  "model_profile": "$ARGUMENTS.profile"
}
```

Write updated config back to `.github/config.json`.

## 4. Confirm

```
✓ Model profile set to: $ARGUMENTS.profile

Agents will now use:
[Show table from model-profiles.md for selected profile]

Next spawned agents will use the new profile.
```



## Examples



**Switch to budget mode:**

```
/set-profile.md budget

✓ Model profile set to: budget

Agents will now use:
| Agent | Model |
|-------|-------|
| planner | sonnet |
| executor | sonnet |
| verifier | haiku |
| ... | ... |
```

**Switch to quality mode:**

```
/set-profile.md quality

✓ Model profile set to: quality

Agents will now use:
| Agent | Model |
|-------|-------|
| planner | opus |
| executor | opus |
| verifier | sonnet |
| ... | ... |
```


