---
name: ":resume-work"
description: "Resume work from previous session with full context restoration"
tools: ["read/readFile", "execute/runInTerminal", "edit/editFiles"]
---

## Objective


Restore complete project context and resume work seamlessly from previous session.

Routes to the resume-project workflow which handles:

- .github/STATE.md loading (or reconstruction if missing)
- Checkpoint detection (.continue-here files)
- Incomplete work detection (PLAN without SUMMARY)
- Status presentation
- Context-aware next action routing
  

## Execution context


../skills/resume-project/SKILL.md


## Process


**Follow the resume-project workflow** from `../skills/resume-project/SKILL.md`.

The workflow handles all resumption logic including:

1. Project existence verification
2. .github/STATE.md loading or reconstruction
3. Checkpoint and incomplete work detection
4. Visual status presentation
5. Context-aware option offering (checks CONTEXT.md before suggesting plan vs discuss)
6. Routing to appropriate next command
7. Session continuity updates
   
