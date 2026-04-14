---
name: ":list-phase-assumptions"
description: "Surface Copilot's assumptions about a phase approach before planning"
tools: ["read/readFile", "execute/runInTerminal", "search/textSearch", "read/listDirectory"]
---

## Objective


Analyze a phase and present Copilot's assumptions about technical approach, implementation order, scope boundaries, risk areas, and dependencies.

Purpose: Help users see what Copilot thinks BEFORE planning begins - enabling course correction early when assumptions are wrong.
Output: Conversational output only (no file creation) - ends with "What do you think?" prompt


## Execution context


../skills/list-phase-assumptions/SKILL.md


## Context


Phase number: $ARGUMENTS (required)

**Load project state first:**
@.github/STATE.md

**Load roadmap:**
@.github/ROADMAP.md


## Process


1. Validate phase number argument (error if missing or invalid)
2. Check if phase exists in roadmap
3. Follow list-phase-assumptions.md workflow:
   - Analyze roadmap description
   - Surface assumptions about: technical approach, implementation order, scope, risks, dependencies
   - Present assumptions clearly
   - Prompt "What do you think?"
4. Gather feedback and offer next steps


## Success criteria



- Phase validated against roadmap
- Assumptions surfaced across five areas
- User prompted for feedback
- User knows next steps (discuss context, plan phase, or correct assumptions)
  
