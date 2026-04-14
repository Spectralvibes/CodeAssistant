---
name: ":pause-work"
description: "Create context handoff when pausing work mid-phase"
tools: ["read/readFile", "edit/editFiles", "execute/runInTerminal"]
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Objective


Create `.continue-here.md` handoff file to preserve complete work state across sessions.

Enables seamless resumption in fresh session with full context restoration.


## Context


@.github/STATE.md


## Process



### Step: detect


Find current phase directory from most recently modified files.


### Step: gather


**Collect complete state for handoff:**

1. **Current position**: Which phase, which plan, which task
2. **Work completed**: What got done this session
3. **Work remaining**: What's left in current plan/phase
4. **Decisions made**: Key decisions and rationale
5. **Blockers/issues**: Anything stuck
6. **Mental context**: The approach, next steps, "vibe"
7. **Files modified**: What's changed but not committed

Ask user for clarifications if needed.


### Step: write


**Write handoff to `./phases/XX-name/.continue-here.md`:**

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: [timestamp]
---

## Current State


[Where exactly are we? Immediate context]


## Completed Work



- Task 1: [name] - Done
- Task 2: [name] - Done
- Task 3: [name] - In progress, [what's done]
  

## Remaining Work



- Task 3: [what's left]
- Task 4: Not started
- Task 5: Not started
  

## Decisions Made



- Decided to use [X] because [reason]
- Chose [approach] over [alternative] because [reason]
  

## Blockers


- [Blocker 1]: [status/workaround]


## Context


[Mental state, what were you thinking, the plan]


## Next Action


Start with: [specific first action when resuming]

```

Be specific enough for a fresh Copilot to understand immediately.


### Step: commit


**Check planning config:**

```bash
COMMIT_PLANNING_DOCS=$(cat .github/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
git check-ignore -q . 2>/dev/null && COMMIT_PLANNING_DOCS=false
```

**If `COMMIT_PLANNING_DOCS=false`:** Skip git operations

**If `COMMIT_PLANNING_DOCS=true` (default):**

```bash
git add ./phases/*/.continue-here.md
git commit -m "wip: [phase-name] paused at task [X]/[Y]"
```



### Step: confirm


```
✓ Handoff created: ./phases/[XX-name]/.continue-here.md

Current state:

- Phase: [XX-name]
- Task: [X] of [Y]
- Status: [in_progress/blocked]
- Committed as WIP

To resume: /resume-work.md

```




## Success criteria


- [ ] .continue-here.md created in correct phase directory
- [ ] All sections filled with specific content
- [ ] Committed as WIP
- [ ] User knows location and how to resume

```
