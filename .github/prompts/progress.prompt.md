---
name: ":progress"
description: "Check project progress, show context, and route to next action"
tools: ["read/readFile", "execute/runInTerminal", "search/textSearch", "read/listDirectory"]
---

## Objective


Check project progress, summarize recent work and what's ahead, then intelligently route to the next action - either executing an existing plan or creating the next one.

Provides situational awareness before continuing work.


## Process



### Step: verify


**Verify planning structure exists:**

Use Bash (not Glob) to check—Glob respects .gitignore but ./ is often gitignored:

```bash
test -d . && echo "exists" || echo "missing"
```

If no `./` directory:

```
No planning structure found.

Run /new-project.md to start a new project.
```

Exit.

If missing .github/STATE.md: suggest `/new-project.md`.

**If .github/ROADMAP.md missing but .github/PROJECT.md exists:**

This means a milestone was completed and archived. Go to **Route F** (between milestones).

If missing both .github/ROADMAP.md and .github/PROJECT.md: suggest `/new-project.md`.


### Step: load


**Load full project context:**

- Read `.github/STATE.md` for living memory (position, decisions, issues)
- Read `.github/ROADMAP.md` for phase structure and objectives
- Read `.github/PROJECT.md` for current state (What This Is, Core Value, Requirements)
- Read `.github/config.json` for settings (model_profile, workflow toggles)
  

### Step: recent


**Gather recent work context:**

- Find the 2-3 most recent SUMMARY.md files
- Extract from each: what was accomplished, key decisions, any issues logged
- This shows "what we've been working on"
  

### Step: position


**Parse current position:**

- From .github/STATE.md: current phase, plan number, status
- Calculate: total plans, completed plans, remaining plans
- Note any blockers or concerns
- Check for CONTEXT.md: For phases without PLAN.md files, check if `{phase}-CONTEXT.md` exists in phase directory
- Count pending todos: `ls ./todos/pending/*.md 2>/dev/null | wc -l`
- Check for active debug sessions: `ls ./debug/*.md 2>/dev/null | grep -v resolved | wc -l`
  

### Step: report


**Present rich status report:**

```
# [Project Name]

**Progress:** [████████░░] 8/10 plans complete
**Profile:** [quality/balanced/budget]

## Recent Work
- [Phase X, Plan Y]: [what was accomplished - 1 line]
- [Phase X, Plan Z]: [what was accomplished - 1 line]

## Current Position
Phase [N] of [total]: [phase-name]
Plan [M] of [phase-total]: [status]
CONTEXT: [✓ if CONTEXT.md exists | - if not]

## Key Decisions Made
- [decision 1 from .github/STATE.md]
- [decision 2]

## Blockers/Concerns
- [any blockers or concerns from .github/STATE.md]

## Pending Todos
- [count] pending — /check-todos.md to review

## Active Debug Sessions
- [count] active — /debug.md to continue
(Only show this section if count > 0)

## What's Next
[Next phase/plan objective from ROADMAP]
```



### Step: route


**Determine next action based on verified counts.**

**Step 1: Count plans, summaries, and issues in current phase**

List files in the current phase directory:

```bash
ls -1 ./phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 ./phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 ./phases/[current-phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

State: "This phase has {X} plans, {Y} summaries."

**Step 1.5: Check for unaddressed UAT gaps**

Check for UAT.md files with status "diagnosed" (has gaps needing fixes).

```bash
# Check for diagnosed UAT with gaps
grep -l "status: diagnosed" ./phases/[current-phase-dir]/*-UAT.md 2>/dev/null
```

Track:

- `uat_with_gaps`: UAT.md files with status "diagnosed" (gaps need fixing)

**Step 2: Route based on counts**

| Condition                       | Meaning                 | Action            |
| ------------------------------- | ----------------------- | ----------------- |
| uat_with_gaps > 0               | UAT gaps need fix plans | Go to **Route E** |
| summaries < plans               | Unexecuted plans exist  | Go to **Route A** |
| summaries = plans AND plans > 0 | Phase complete          | Go to Step 3      |
| plans = 0                       | Phase not yet planned   | Go to **Route B** |

---

**Route A: Unexecuted plan exists**

Find the first PLAN.md without matching SUMMARY.md.
Read its `## Objective

` section.

```
---

## ▶ Next Up

**{phase}-{plan}: [Plan Name]** — [objective summary from PLAN.md]

`/execute-phase.md {phase}`

## Sub

`/clear` first → fresh context window

---
```

---

**Route B: Phase needs planning**

Check if `{phase}-CONTEXT.md` exists in phase directory.

**If CONTEXT.md exists:**

```
---

## ▶ Next Up

**Phase {N}: {Name}** — {Goal from .github/ROADMAP.md}
## Sub

✓ Context gathered, ready to plan

`/plan-phase.md {phase-number}`

## Sub

`/clear` first → fresh context window

---
```

**If CONTEXT.md does NOT exist:**

```
---

## ▶ Next Up

**Phase {N}: {Name}** — {Goal from .github/ROADMAP.md}

`/discuss-phase.md {phase}` — gather context and clarify approach

## Sub

`/clear` first → fresh context window

---

**Also available:**
- `/plan-phase.md {phase}` — skip discussion, plan directly
- `/list-phase-assumptions.md {phase}` — see Copilot's assumptions

---
```

---

**Route E: UAT gaps need fix plans**

UAT.md exists with gaps (diagnosed issues). User needs to plan fixes.

```
---

## ⚠ UAT Gaps Found

**{phase}-UAT.md** has {N} gaps requiring fixes.

`/plan-phase.md {phase} --gaps`

## Sub

`/clear` first → fresh context window

---

**Also available:**
- `/execute-phase.md {phase}` — execute phase plans
- `/verify-work.md {phase}` — run more UAT testing

---
```

---

**Step 3: Check milestone status (only when phase complete)**

Read .github/ROADMAP.md and identify:

1. Current phase number
2. All phase numbers in the current milestone section

Count total phases and identify the highest phase number.

State: "Current phase is {X}. Milestone has {N} phases (highest: {Y})."

**Route based on milestone status:**

| Condition                     | Meaning            | Action            |
| ----------------------------- | ------------------ | ----------------- |
| current phase < highest phase | More phases remain | Go to **Route C** |
| current phase = highest phase | Milestone complete | Go to **Route D** |

---

**Route C: Phase complete, more phases remain**

Read .github/ROADMAP.md to get the next phase's name and goal.

```
---

## ✓ Phase {Z} Complete

## ▶ Next Up

**Phase {Z+1}: {Name}** — {Goal from .github/ROADMAP.md}

`/discuss-phase.md {Z+1}` — gather context and clarify approach

## Sub

`/clear` first → fresh context window

---

**Also available:**
- `/plan-phase.md {Z+1}` — skip discussion, plan directly
- `/verify-work.md {Z}` — user acceptance test before continuing

---
```

---

**Route D: Milestone complete**

```
---

## 🎉 Milestone Complete

All {N} phases finished!

## ▶ Next Up

**Complete Milestone** — archive and prepare for next

`/complete-milestone.md`

## Sub

`/clear` first → fresh context window

---

**Also available:**
- `/verify-work.md` — user acceptance test before completing milestone

---
```

---

**Route F: Between milestones (.github/ROADMAP.md missing, .github/PROJECT.md exists)**

A milestone was completed and archived. Ready to start the next milestone cycle.

Read MILESTONES.md to find the last completed milestone version.

```
---

## ✓ Milestone v{X.Y} Complete

Ready to plan the next milestone.

## ▶ Next Up

**Start Next Milestone** — questioning → research → requirements → roadmap

`/new-milestone.md`

## Sub

`/clear` first → fresh context window

---
```



### Step: edge_cases


**Handle edge cases:**

- Phase complete but next phase not planned → offer `/plan-phase.md [next]`
- All work complete → offer milestone completion
- Blockers present → highlight before offering to continue
- Handoff file exists → mention it, offer `/resume-work.md`
  



## Success criteria



- [ ] Rich context provided (recent work, decisions, issues)
- [ ] Current position clear with visual progress
- [ ] What's next clearly explained
- [ ] Smart routing: /execute-phase.md if plans exist, /plan-phase.md if not
- [ ] User confirms before any action
- [ ] Seamless handoff to appropriate  command
      
