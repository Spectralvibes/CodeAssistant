---
name: ":new-milestone"
description: "Start a new milestone cycle — update .github/PROJECT.md and route to requirements"
tools: ["read/readFile", "edit/editFiles", "execute/runInTerminal", "runSubagent"]
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Objective


Start a new milestone through unified flow: questioning → research (optional) → requirements → roadmap.

This is the brownfield equivalent of new-project. The project exists, .github/PROJECT.md has history. This command gathers "what's next", updates .github/PROJECT.md, then continues through the full requirements → roadmap cycle.

**Creates/Updates:**

- `.github/PROJECT.md` — updated with new milestone goals
- `.github/research/` — domain research (optional, focuses on NEW features)
- `.github/REQUIREMENTS.md` — scoped requirements for this milestone
- `.github/ROADMAP.md` — phase structure (continues numbering)
- `.github/STATE.md` — reset for new milestone

**After this command:** Run `/plan-phase.md [N]` to start execution.


## Execution context


../instructions/questioning.instructions.md
../instructions/ui-brand.instructions.md
@./templates/project.md
@./templates/requirements.md


## Context


Milestone name: $ARGUMENTS (optional - will prompt if not provided)

**Load project context:**
@.github/PROJECT.md
@.github/STATE.md
@./MILESTONES.md
@.github/config.json

**Load milestone context (if exists, from /discuss-milestone.md):**
@./MILESTONE-CONTEXT.md


## Process



## Phase 1: Load Context

- Read .github/PROJECT.md (existing project, Validated requirements, decisions)
- Read MILESTONES.md (what shipped previously)
- Read .github/STATE.md (pending todos, blockers)
- Check for MILESTONE-CONTEXT.md (from /discuss-milestone.md)

## Phase 2: Gather Milestone Goals

**If MILESTONE-CONTEXT.md exists:**

- Use features and scope from discuss-milestone
- Present summary for confirmation

**If no context file:**

- Present what shipped in last milestone
- Ask: "What do you want to build next?"
- Use HumanAgent MCP (HumanAgent_Chat) to explore features
- Probe for priorities, constraints, scope

## Phase 3: Determine Milestone Version

- Parse last version from MILESTONES.md
- Suggest next version (v1.0 → v1.1, or v2.0 for major)
- Confirm with user

## Phase 4: Update .github/PROJECT.md

Add/update these sections:

```markdown
## Current Milestone: v[X.Y] [Name]

**Goal:** [One sentence describing milestone focus]

**Target features:**

- [Feature 1]
- [Feature 2]
- [Feature 3]
```

Update Active requirements section with new goals.

Update "Last updated" footer.

## Phase 5: Update .github/STATE.md

```markdown
## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: [today] — Milestone v[X.Y] started
```

Keep Accumulated Context section (decisions, blockers) from previous milestone.

## Phase 6: Cleanup and Commit
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


Delete MILESTONE-CONTEXT.md if exists (consumed).

Check planning config:

```bash
COMMIT_PLANNING_DOCS=$(cat .github/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
git check-ignore -q . 2>/dev/null && COMMIT_PLANNING_DOCS=false
```

If `COMMIT_PLANNING_DOCS=false`: Skip git operations

If `COMMIT_PLANNING_DOCS=true` (default):

```bash
git add .github/PROJECT.md .github/STATE.md
git commit -m "docs: start milestone v[X.Y] [Name]"
```

## Phase 6.5: Resolve Model Profile

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .github/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

**Model lookup table:**

| Agent                    | quality | balanced | budget |
| ------------------------ | ------- | -------- | ------ |
| project-researcher   | opus    | sonnet   | haiku  |
| research-synthesizer | sonnet  | sonnet   | haiku  |
| roadmapper           | opus    | sonnet   | sonnet |

Store resolved models for use in Task calls below.

## Phase 7: Research Decision

Use HumanAgent MCP (HumanAgent_Chat):

- header: "Research"
- question: "Research the domain ecosystem for new features before defining requirements?"
- options:
  - "Research first (Recommended)" — Discover patterns, expected features, architecture for NEW capabilities
  - "Skip research" — I know what I need, go straight to requirements

**If "Research first":**

Display stage banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ► RESEARCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Researching [new features] ecosystem...
```

Create research directory:

```bash
mkdir -p ./research
```

Display spawning indicator:

```
◆ Spawning 4 researchers in parallel...
  → Stack research (for new features)
  → Features research
  → Architecture research (integration)
  → Pitfalls research
```

Spawn 4 parallel project-researcher agents with milestone-aware context:

```
Task(prompt="
## Research Type


Project Research — Stack dimension for [new features].


## Milestone Context


SUBSEQUENT MILESTONE — Adding [target features] to existing app.

Existing validated capabilities (DO NOT re-research):
[List from .github/PROJECT.md Validated requirements]

Focus ONLY on what's needed for the NEW features.


## Question


What stack additions/changes are needed for [new features]?


## Project context


[.github/PROJECT.md summary - current state, new milestone goals]


## Downstream Consumer


Your STACK.md feeds into roadmap creation. Be prescriptive:
- Specific libraries with versions for NEW capabilities
- Integration points with existing stack
- What NOT to add and why


## Quality Gate


- [ ] Versions are current (verify with Context7/official docs, not training data)
- [ ] Rationale explains WHY, not just WHAT
- [ ] Integration with existing stack considered


## Output


Write to: .github/research/STACK.md
Use template: ~/./templates/research-project/STACK.md

", subagent_type="project-researcher", model="{researcher_model}", description="Stack research")

Task(prompt="
## Research Type


Project Research — Features dimension for [new features].


## Milestone Context


SUBSEQUENT MILESTONE — Adding [target features] to existing app.

Existing features (already built):
[List from .github/PROJECT.md Validated requirements]

Focus on how [new features] typically work, expected behavior.


## Question


How do [target features] typically work? What's expected behavior?


## Project context


[.github/PROJECT.md summary - new milestone goals]


## Downstream Consumer


Your FEATURES.md feeds into requirements definition. Categorize clearly:
- Table stakes (must have for these features)
- Differentiators (competitive advantage)
- Anti-features (things to deliberately NOT build)


## Quality Gate


- [ ] Categories are clear (table stakes vs differentiators vs anti-features)
- [ ] Complexity noted for each feature
- [ ] Dependencies on existing features identified


## Output


Write to: .github/research/FEATURES.md
Use template: ~/./templates/research-project/FEATURES.md

", subagent_type="project-researcher", model="{researcher_model}", description="Features research")

Task(prompt="
## Research Type


Project Research — Architecture dimension for [new features].


## Milestone Context


SUBSEQUENT MILESTONE — Adding [target features] to existing app.

Existing architecture:
[Summary from .github/PROJECT.md or codebase map]

Focus on how [new features] integrate with existing architecture.


## Question


How do [target features] integrate with existing [domain] architecture?


## Project context


[.github/PROJECT.md summary - current architecture, new features]


## Downstream Consumer


Your ARCHITECTURE.md informs phase structure in roadmap. Include:
- Integration points with existing components
- New components needed
- Data flow changes
- Suggested build order


## Quality Gate


- [ ] Integration points clearly identified
- [ ] New vs modified components explicit
- [ ] Build order considers existing dependencies


## Output


Write to: .github/research/ARCHITECTURE.md
Use template: ~/./templates/research-project/ARCHITECTURE.md

", subagent_type="project-researcher", model="{researcher_model}", description="Architecture research")

Task(prompt="
## Research Type


Project Research — Pitfalls dimension for [new features].


## Milestone Context


SUBSEQUENT MILESTONE — Adding [target features] to existing app.

Focus on common mistakes when ADDING these features to an existing system.


## Question


What are common mistakes when adding [target features] to [domain]?


## Project context


[.github/PROJECT.md summary - current state, new features]


## Downstream Consumer


Your PITFALLS.md prevents mistakes in roadmap/planning. For each pitfall:
- Warning signs (how to detect early)
- Prevention strategy (how to avoid)
- Which phase should address it


## Quality Gate


- [ ] Pitfalls are specific to adding these features (not generic)
- [ ] Integration pitfalls with existing system covered
- [ ] Prevention strategies are actionable


## Output


Write to: .github/research/PITFALLS.md
Use template: ~/./templates/research-project/PITFALLS.md

", subagent_type="project-researcher", model="{researcher_model}", description="Pitfalls research")
```

After all 4 agents complete, spawn synthesizer to create SUMMARY.md:

```
Task(prompt="
## Task


Synthesize research outputs into SUMMARY.md.


## Research Files


Read these files:
- .github/research/STACK.md
- .github/research/FEATURES.md
- .github/research/ARCHITECTURE.md
- .github/research/PITFALLS.md


## Output


Write to: .github/research/SUMMARY.md
Use template: ~/./templates/research-project/SUMMARY.md
Commit after writing.

", subagent_type="research-synthesizer", model="{synthesizer_model}", description="Synthesize research")
```

Display research complete banner and key findings:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ► RESEARCH COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Key Findings

**Stack additions:** [from SUMMARY.md]
**New feature table stakes:** [from SUMMARY.md]
**Watch Out For:** [from SUMMARY.md]

Files: `.github/research/`
```

**If "Skip research":** Continue to Phase 8.

## Phase 8: Define Requirements

Display stage banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ► DEFINING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Load context:**

Read .github/PROJECT.md and extract:

- Core value (the ONE thing that must work)
- Current milestone goals
- Validated requirements (what already exists)

**If research exists:** Read .github/research/FEATURES.md and extract feature categories.

**Present features by category:**

```
Here are the features for [new capabilities]:

## [Category 1]
**Table stakes:**
- Feature A
- Feature B

**Differentiators:**
- Feature C
- Feature D

**Research notes:** [any relevant notes]

---

## [Next Category]
...
```

**If no research:** Gather requirements through conversation instead.

Ask: "What are the main things users need to be able to do with [new features]?"

For each capability mentioned:

- Ask clarifying questions to make it specific
- Probe for related capabilities
- Group into categories

**Scope each category:**

For each category, use HumanAgent MCP (HumanAgent_Chat):

- header: "[Category name]"
- question: "Which [category] features are in this milestone?"
- multiSelect: true
- options:
  - "[Feature 1]" — [brief description]
  - "[Feature 2]" — [brief description]
  - "[Feature 3]" — [brief description]
  - "None for this milestone" — Defer entire category

Track responses:

- Selected features → this milestone's requirements
- Unselected table stakes → future milestone
- Unselected differentiators → out of scope

**Identify gaps:**

Use HumanAgent MCP (HumanAgent_Chat):

- header: "Additions"
- question: "Any requirements research missed? (Features specific to your vision)"
- options:
  - "No, research covered it" — Proceed
  - "Yes, let me add some" — Capture additions

**Generate .github/REQUIREMENTS.md:**

Create `.github/REQUIREMENTS.md` with:

- v1 Requirements for THIS milestone grouped by category (checkboxes, REQ-IDs)
- Future Requirements (deferred to later milestones)
- Out of Scope (explicit exclusions with reasoning)
- Traceability section (empty, filled by roadmap)

**REQ-ID format:** `[CATEGORY]-[NUMBER]` (AUTH-01, NOTIF-02)

Continue numbering from existing requirements if applicable.

**Requirement quality criteria:**

Good requirements are:

- **Specific and testable:** "User can reset password via email link" (not "Handle password reset")
- **User-centric:** "User can X" (not "System does Y")
- **Atomic:** One capability per requirement (not "User can login and manage profile")
- **Independent:** Minimal dependencies on other requirements

**Present full requirements list:**

Show every requirement (not counts) for user confirmation:

```
## Milestone v[X.Y] Requirements

### [Category 1]
- [ ] **CAT1-01**: User can do X
- [ ] **CAT1-02**: User can do Y

> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

### [Category 2]
- [ ] **CAT2-01**: User can do Z

[... full list ...]

---

Does this capture what you're building? (yes / adjust)
```

If "adjust": Return to scoping.

**Commit requirements:**

Check planning config (same pattern as Phase 6).

If committing:

```bash
git add .github/REQUIREMENTS.md
git commit -m "$(cat <<'EOF'
docs: define milestone v[X.Y] requirements

[X] requirements across [N] categories
EOF
)"
```

## Phase 9: Create Roadmap

Display stage banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ► CREATING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning roadmapper...
```

**Determine starting phase number:**

Read MILESTONES.md to find the last phase number from previous milestone.
New phases continue from there (e.g., if v1.0 ended at phase 5, v1.1 starts at phase 6).

Spawn roadmapper agent with context:

```
Task(prompt="
## Planning Context



**Project:**
@.github/PROJECT.md

**Requirements:**
@.github/REQUIREMENTS.md

**Research (if exists):**
@.github/research/SUMMARY.md

**Config:**
@.github/config.json

**Previous milestone (for phase numbering):**
@./MILESTONES.md



## Instructions


Create roadmap for milestone v[X.Y]:
1. Start phase numbering from [N] (continues from previous milestone)
2. Derive phases from THIS MILESTONE's requirements (don't include validated/existing)
3. Map every requirement to exactly one phase
4. Derive 2-5 success criteria per phase (observable user behaviors)
5. Validate 100% coverage of new requirements
6. Write files immediately (.github/ROADMAP.md, .github/STATE.md, update .github/REQUIREMENTS.md traceability)
7. Return ROADMAP CREATED with summary

Write files first, then return. This ensures artifacts persist even if context is lost.

", subagent_type="roadmapper", model="{roadmapper_model}", description="Create roadmap")
```

**Handle roadmapper return:**

**If `## ROADMAP BLOCKED`:**

- Present blocker information
- Work with user to resolve
- Re-spawn when resolved

**If `## ROADMAP CREATED`:**

Read the created .github/ROADMAP.md and present it nicely inline:

```
---

## Proposed Roadmap

**[N] phases** | **[X] requirements mapped** | All milestone requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| [N] | [Name] | [Goal] | [REQ-IDs] | [count] |
| [N+1] | [Name] | [Goal] | [REQ-IDs] | [count] |
...
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


### Phase Details

**Phase [N]: [Name]**
Goal: [goal]
Requirements: [REQ-IDs]
Success criteria:
1. [criterion]
2. [criterion]

[... continue for all phases ...]

---
```

**CRITICAL: Ask for approval before committing:**

Use HumanAgent MCP (HumanAgent_Chat):

- header: "Roadmap"
- question: "Does this roadmap structure work for you?"
- options:
  - "Approve" — Commit and continue
  - "Adjust phases" — Tell me what to change
  - "Review full file" — Show raw .github/ROADMAP.md

**If "Approve":** Continue to commit.

**If "Adjust phases":**

- Get user's adjustment notes
- Re-spawn roadmapper with revision context:

  ```
  Task(prompt="
  ## Revision


  User feedback on roadmap:
  [user's notes]

  Current .github/ROADMAP.md: @.github/ROADMAP.md

  Update the roadmap based on feedback. Edit files in place.
  Return ROADMAP REVISED with changes made.
  
  ", subagent_type="roadmapper", model="{roadmapper_model}", description="Revise roadmap")
  ```

- Present revised roadmap
- Loop until user approves

**If "Review full file":** Display raw `cat .github/ROADMAP.md`, then re-ask.

**Commit roadmap (after approval):**

Check planning config (same pattern as Phase 6).

If committing:

```bash
git add .github/ROADMAP.md .github/STATE.md .github/REQUIREMENTS.md
git commit -m "$(cat <<'EOF'
docs: create milestone v[X.Y] roadmap ([N] phases)

Phases:
[N]. [phase-name]: [requirements covered]
[N+1]. [phase-name]: [requirements covered]
...

All milestone requirements mapped to phases.
EOF
)"
```

## Phase 10: Done

Present completion with next steps:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ► MILESTONE INITIALIZED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Milestone v[X.Y]: [Name]**

| Artifact       | Location                    |
|----------------|-----------------------------|
| Project        | `.github/PROJECT.md`      |
| Research       | `.github/research/`       |
| Requirements   | `.github/REQUIREMENTS.md` |
| Roadmap        | `.github/ROADMAP.md`      |

**[N] phases** | **[X] requirements** | Ready to build ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase [N]: [Phase Name]** — [Goal from .github/ROADMAP.md]

`/discuss-phase.md [N]` — gather context and clarify approach

## Sub

`/clear` first → fresh context window

---

**Also available:**
- `/plan-phase.md [N]` — skip discussion, plan directly

───────────────────────────────────────────────────────────────
```



## Success criteria



- [ ] .github/PROJECT.md updated with Current Milestone section
- [ ] .github/STATE.md reset for new milestone
- [ ] MILESTONE-CONTEXT.md consumed and deleted (if existed)
- [ ] Research completed (if selected) — 4 parallel agents spawned, milestone-aware
- [ ] Requirements gathered (from research or conversation)
- [ ] User scoped each category
- [ ] .github/REQUIREMENTS.md created with REQ-IDs
- [ ] roadmapper spawned with phase numbering context
- [ ] Roadmap files written immediately (not draft)
- [ ] User feedback incorporated (if any)
- [ ] .github/ROADMAP.md created with phases continuing from previous milestone
- [ ] All commits made (if planning docs committed)
- [ ] User knows next step is `/discuss-phase.md [N]`

**Atomic commits:** Each phase commits its artifacts immediately. If context is lost, artifacts persist.

