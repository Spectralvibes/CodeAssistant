---
name: ":verify-work"
description: "Validate built features through conversational UAT"
tools:
  [
    "read/readFile",
    "execute/runInTerminal",
    "read/listDirectory",
    "search/textSearch",
    "edit/editFiles",
    "agent",
  ]
---

## Objective


Validate built features through conversational testing with persistent state.

Purpose: Confirm what Copilot built actually works from user's perspective. One test at a time, plain text responses, no interrogation. When issues are found, automatically diagnose, plan fixes, and prepare for execution.

Output: {phase}-UAT.md tracking all test results. If issues found: diagnosed gaps, verified fix plans ready for /execute-phase.md


## Execution context


../skills/verify-work/SKILL.md
@./templates/UAT.md


## Context


Phase: $ARGUMENTS (optional)
- If provided: Test specific phase (e.g., "4")
- If not provided: Check for active sessions or prompt for phase

@.github/STATE.md
@.github/ROADMAP.md


## Process


1. Check for active UAT sessions (resume or start new)
2. Find SUMMARY.md files for the phase
3. Extract testable deliverables (user-observable outcomes)
4. Create {phase}-UAT.md with test list
5. Present tests one at a time:
   - Show expected behavior
   - Wait for plain text response
   - "yes/y/next" = pass, anything else = issue (severity inferred)
6. Update UAT.md after each response
7. On completion: commit, present summary
8. If issues found:
   - Spawn parallel debug agents to diagnose root causes
   - Spawn planner in --gaps mode to create fix plans
   - Spawn plan-checker to verify fix plans
   - Iterate planner ↔ checker until plans pass (max 3)
   - Present ready status with `/clear` then `/execute-phase.md`


## Anti Patterns



- Don't use HumanAgent MCP (HumanAgent_Chat) for test responses — plain text conversation
- Don't ask severity — infer from description
- Don't present full checklist upfront — one test at a time
- Don't run automated tests — this is manual user validation
- Don't fix issues during testing — log as gaps, diagnose after all tests complete
  

## Offer Next


Output this markdown directly (not as a code block). Route based on UAT results:

| Status                          | Route                         |
| ------------------------------- | ----------------------------- |
| All tests pass + more phases    | Route A (next phase)          |
| All tests pass + last phase     | Route B (milestone complete)  |
| Issues found + fix plans ready  | Route C (execute fixes)       |
| Issues found + planning blocked | Route D (manual intervention) |

---

**Route A: All tests pass, more phases remain**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► PHASE {Z} VERIFIED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{N} tests passed
UAT complete ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase {Z+1}: {Name}** — {Goal from .github/ROADMAP.md}

/discuss-phase.md {Z+1} — gather context and clarify approach

## Sub

/clear first → fresh context window

───────────────────────────────────────────────────────────────

**Also available:**

- /plan-phase.md {Z+1} — skip discussion, plan directly
- /execute-phase.md {Z+1} — skip to execution (if already planned)

───────────────────────────────────────────────────────────────

---

**Route B: All tests pass, milestone complete**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► PHASE {Z} VERIFIED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{N} tests passed
Final phase verified ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Audit milestone** — verify requirements, cross-phase integration, E2E flows

/audit-milestone.md

## Sub

/clear first → fresh context window

───────────────────────────────────────────────────────────────

**Also available:**

- /complete-milestone.md — skip audit, archive directly

───────────────────────────────────────────────────────────────

---

**Route C: Issues found, fix plans ready**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► PHASE {Z} ISSUES FOUND ⚠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{M} tests passed
{X} issues diagnosed
Fix plans verified ✓

### Issues Found

{List issues with severity from UAT.md}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Execute fix plans** — run diagnosed fixes

/execute-phase.md {Z} --gaps-only

## Sub

/clear first → fresh context window

───────────────────────────────────────────────────────────────

**Also available:**

- cat ./phases/{phase_dir}/\*-PLAN.md — review fix plans
- /plan-phase.md {Z} --gaps — regenerate fix plans

───────────────────────────────────────────────────────────────

---

**Route D: Issues found, planning blocked**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ► PHASE {Z} BLOCKED ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{M} tests passed
Fix planning blocked after {X} iterations

### Unresolved Issues

{List blocking issues from planner/checker output}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Manual intervention required**

Review the issues above and either:

1. Provide guidance for fix planning
2. Manually address blockers
3. Accept current state and continue

───────────────────────────────────────────────────────────────

**Options:**

- /plan-phase.md {Z} --gaps — retry fix planning with guidance
- /discuss-phase.md {Z} — gather more context before replanning

───────────────────────────────────────────────────────────────


## Success criteria



- [ ] UAT.md created with tests from SUMMARY.md
- [ ] Tests presented one at a time with expected behavior
- [ ] Plain text responses (no structured forms)
- [ ] Severity inferred, never asked
- [ ] Batched writes: on issue, every 5 passes, or completion
- [ ] Committed on completion
- [ ] If issues: parallel debug agents diagnose root causes
- [ ] If issues: planner creates fix plans from diagnosed gaps
- [ ] If issues: plan-checker verifies fix plans (max 3 iterations)
- [ ] Ready for `/execute-phase.md` when complete
      
