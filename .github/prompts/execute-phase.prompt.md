---
name: ":execute-phase"
description: "Execute all plans in a phase with wave-based parallelization"
tools:
  [
    "read/readFile",
    "edit/editFiles",
    "read/listDirectory",
    "search/textSearch",
    "execute/runInTerminal",
    "runSubagent",
    "todos",
  ]
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Objective


Execute all plans in a phase using wave-based parallel execution.

Orchestrator stays lean: discover plans, analyze dependencies, group into waves, spawn subagents, collect results. Each subagent loads the full execute-plan context and handles its own plan.

Context budget: ~15% orchestrator, 100% fresh per subagent.


## Execution context


../instructions/ui-brand.instructions.md
../skills/execute-phase/SKILL.md


## Context


Phase: $ARGUMENTS

**Flags:**

- `--gaps-only` — Execute only gap closure plans (plans with `gap_closure: true` in frontmatter). Use after verify-work creates fix plans.

@.github/ROADMAP.md
@.github/STATE.md


## Process


0. **Resolve Model Profile**

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .github/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

**Model lookup table:**

| Agent        | quality | balanced | budget |
| ------------ | ------- | -------- | ------ |
| executor | opus    | sonnet   | sonnet |
| verifier | sonnet  | sonnet   | haiku  |

Store resolved models for use in Task calls below.

1. **Validate phase exists**
   - Find phase directory matching argument
   - Count PLAN.md files
   - Error if no plans found

2. **Discover plans**
   - List all \*-PLAN.md files in phase directory
   - Check which have \*-SUMMARY.md (already complete)
   - If `--gaps-only`: filter to only plans with `gap_closure: true`
   - Build list of incomplete plans

3. **Group by wave**
   - Read `wave` from each plan's frontmatter
   - Group plans by wave number
   - Report wave structure to user

4. **Execute waves**
   For each wave in order:
   - Spawn `executor` for each plan in wave (parallel Task calls)
   - Wait for completion (Task blocks)
   - Verify SUMMARYs created
   - Proceed to next wave

5. **Aggregate results**
   - Collect summaries from all plans
   - Report phase completion status

6. **Commit any orchestrator corrections**
   Check for uncommitted changes before verification:

   ```bash
   git status --porcelain
   ```

   **If changes exist:** Orchestrator made corrections between executor completions. Commit them:

   ```bash
   git add -u && git commit -m "fix({phase}): orchestrator corrections"
   ```

   **If clean:** Continue to verification.

7. **Verify phase goal**
   Check config: `WORKFLOW_VERIFIER=$(cat .github/config.json 2>/dev/null | grep -o '"verifier"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")`

   **If `workflow.verifier` is `false`:** Skip to step 8 (treat as passed).

   **Otherwise:**
   - Spawn `verifier` subagent with phase directory and goal
   - Verifier checks must_haves against actual codebase (not SUMMARY claims)
   - Creates VERIFICATION.md with detailed report
   - Route by status:
     - `passed` → continue to step 8
     - `human_needed` → present items, get approval or feedback
     - `gaps_found` → present gaps, offer `/plan-phase.md {X} --gaps`

8. **Update roadmap and state**
   - Update .github/ROADMAP.md, .github/STATE.md

9. **Update requirements**
   Mark phase requirements as Complete:
   - Read .github/ROADMAP.md, find this phase's `Requirements:` line (e.g., "AUTH-01, AUTH-02")
   - Read .github/REQUIREMENTS.md traceability table
   - For each REQ-ID in this phase: change Status from "Pending" to "Complete"
   - Write updated .github/REQUIREMENTS.md
   - Skip if: .github/REQUIREMENTS.md doesn't exist, or phase has no Requirements line

10. **Commit phase completion**
    Check `COMMIT_PLANNING_DOCS` from .github/config.json (default: true).
    If false: Skip git operations for ./ files.
    If true: Bundle all phase metadata updates in one commit:
    - Stage: `git add .github/ROADMAP.md .github/STATE.md`
    - Stage .github/REQUIREMENTS.md if updated: `git add .github/REQUIREMENTS.md`
    - Commit: `docs({phase}): complete {phase-name} phase`

11. **Offer next steps** - Route to next action (see `## Offer Next

`)
    

## Offer Next


Output this markdown directly (not as a code block). Route based on status:

| Status                 | Route                                              |
| ---------------------- | -------------------------------------------------- |
| `gaps_found`           | Route C (gap closure)                              |
| `human_needed`         | Present checklist, then re-route based on approval |
| `passed` + more phases | Route A (next phase)                               |
| `passed` + last phase  | Route B (milestone complete)                       |

---

**Route A: Phase verified, more phases remain**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► PHASE {Z} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{Y} plans executed
Goal verified ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase {Z+1}: {Name}** — {Goal from .github/ROADMAP.md}

/discuss-phase.md {Z+1} — gather context and clarify approach

## Sub

/clear first → fresh context window

───────────────────────────────────────────────────────────────

**Also available:**

- /plan-phase.md {Z+1} — skip discussion, plan directly
- /verify-work.md {Z} — manual acceptance testing before continuing

───────────────────────────────────────────────────────────────

---

**Route B: Phase verified, milestone complete**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► MILESTONE COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**v1.0**

{N} phases completed
All phase goals verified ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Audit milestone** — verify requirements, cross-phase integration, E2E flows

/audit-milestone.md

## Sub

/clear first → fresh context window

───────────────────────────────────────────────────────────────

**Also available:**

- /verify-work.md — manual acceptance testing
- /complete-milestone.md — skip audit, archive directly

───────────────────────────────────────────────────────────────

---

**Route C: Gaps found — need additional planning**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► PHASE {Z} GAPS FOUND ⚠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

Score: {N}/{M} must-haves verified
Report: ./phases/{phase_dir}/{phase}-VERIFICATION.md

### What's Missing

{Extract gap summaries from VERIFICATION.md}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Plan gap closure** — create additional plans to complete the phase

/plan-phase.md {Z} --gaps

## Sub

/clear first → fresh context window

───────────────────────────────────────────────────────────────

**Also available:**

- cat ./phases/{phase_dir}/{phase}-VERIFICATION.md — see full report
- /verify-work.md {Z} — manual testing before planning

───────────────────────────────────────────────────────────────

---

After user runs /plan-phase.md {Z} --gaps:

1. Planner reads VERIFICATION.md gaps
2. Creates plans 04, 05, etc. to close gaps
3. User runs /execute-phase.md {Z} again
4. Execute-phase runs incomplete plans (04, 05...)
5. Verifier runs again → loop until passed
   

## Wave Execution


**Parallel spawning:**

Before spawning, read file contents. The `@` syntax does not work across Task() boundaries.

```bash
# Read each plan and .github/STATE.md
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

PLAN_01_CONTENT=$(cat "{plan_01_path}")
PLAN_02_CONTENT=$(cat "{plan_02_path}")
PLAN_03_CONTENT=$(cat "{plan_03_path}")
STATE_CONTENT=$(cat .github/STATE.md)
```

Spawn all plans in a wave with a single message containing multiple Task calls, with inlined content:

```
Task(prompt="Execute plan at {plan_01_path}\n\nPlan:\n{plan_01_content}\n\nProject state:\n{state_content}", subagent_type="executor", model="{executor_model}")
Task(prompt="Execute plan at {plan_02_path}\n\nPlan:\n{plan_02_content}\n\nProject state:\n{state_content}", subagent_type="executor", model="{executor_model}")
Task(prompt="Execute plan at {plan_03_path}\n\nPlan:\n{plan_03_content}\n\nProject state:\n{state_content}", subagent_type="executor", model="{executor_model}")
```

All three run in parallel. Task tool blocks until all complete.

**No polling.** No background agents. No TaskOutput loops.


## Checkpoint Handling


Plans with `autonomous: false` have checkpoints. The execute-phase.md workflow handles the full checkpoint flow:

- Subagent pauses at checkpoint, returns structured state
- Orchestrator presents to user, collects response
- Spawns fresh continuation agent (not resume)

See `../skills/execute-phase/SKILL.md` step `checkpoint_handling` for complete details.


## Deviation Rules


During execution, handle discoveries automatically:

1. **Auto-fix bugs** - Fix immediately, document in Summary
2. **Auto-add critical** - Security/correctness gaps, add and document
3. **Auto-fix blockers** - Can't proceed without fix, do it and document
4. **Ask about architectural** - Major structural changes, stop and ask user

Only rule 4 requires user intervention.


## Commit Rules


**Per-Task Commits:**

After each task completes:

1. Stage only files modified by that task
2. Commit with format: `{type}({phase}-{plan}): {task-name}`
3. Types: feat, fix, test, refactor, perf, chore
4. Record commit hash for SUMMARY.md

**Plan Metadata Commit:**

After all tasks in a plan complete:

1. Stage plan artifacts only: PLAN.md, SUMMARY.md
2. Commit with format: `docs({phase}-{plan}): complete [plan-name] plan`
3. NO code files (already committed per-task)

**Phase Completion Commit:**

After all plans in phase complete (step 7):

1. Stage: .github/ROADMAP.md, .github/STATE.md, .github/REQUIREMENTS.md (if updated), VERIFICATION.md
2. Commit with format: `docs({phase}): complete {phase-name} phase`
3. Bundles all phase-level state updates in one commit

**NEVER use:**

- `git add .`
- `git add -A`
- `git add src/` or any broad directory

**Always stage files individually.**


## Success criteria



- [ ] All incomplete plans in phase executed
- [ ] Each plan has SUMMARY.md
- [ ] Phase goal verified (must_haves checked against codebase)
- [ ] VERIFICATION.md created in phase directory
- [ ] .github/STATE.md reflects phase completion
- [ ] .github/ROADMAP.md updated
- [ ] .github/REQUIREMENTS.md updated (phase requirements marked Complete)
- [ ] User informed of next steps
      
