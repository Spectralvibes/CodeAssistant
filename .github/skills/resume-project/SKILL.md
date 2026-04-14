---
name: resume-project
description: Instantly restore full project context when resuming work. Use when user says continue, what's next, where were we, or resume.
---

## Trigger


Use this workflow when:
- Starting a new session on an existing project
- User says "continue", "what's next", "where were we", "resume"
- Any planning operation when ./ already exists
- User returns after time away from project


## Purpose


Instantly restore full project context so "Where were we?" has an immediate, complete answer.


## Required reading


../../instructions/continuation-format.instructions.md


## Process



### Step: detect_existing_project


Check if this is an existing project:

```bash
ls .github/STATE.md 2>/dev/null && echo "Project exists"
ls .github/ROADMAP.md 2>/dev/null && echo "Roadmap exists"
ls .github/PROJECT.md 2>/dev/null && echo "Project file exists"
```

**If .github/STATE.md exists:** Proceed to load_state
**If only .github/ROADMAP.md/.github/PROJECT.md exist:** Offer to reconstruct .github/STATE.md
**If ./ doesn't exist:** This is a new project - route to /new-project.md


### Step: load_state



Read and parse .github/STATE.md, then .github/PROJECT.md:

```bash
cat .github/STATE.md
cat .github/PROJECT.md
```

**From .github/STATE.md extract:**

- **Project Reference**: Core value and current focus
- **Current Position**: Phase X of Y, Plan A of B, Status
- **Progress**: Visual progress bar
- **Recent Decisions**: Key decisions affecting current work
- **Pending Todos**: Ideas captured during sessions
- **Blockers/Concerns**: Issues carried forward
- **Session Continuity**: Where we left off, any resume files

**From .github/PROJECT.md extract:**

- **What This Is**: Current accurate description
- **Requirements**: Validated, Active, Out of Scope
- **Key Decisions**: Full decision log with outcomes
- **Constraints**: Hard limits on implementation



### Step: check_incomplete_work


Look for incomplete work that needs attention:

```bash
# Check for continue-here files (mid-plan resumption)
ls ./phases/*/.continue-here*.md 2>/dev/null

# Check for plans without summaries (incomplete execution)
for plan in ./phases/*/*-PLAN.md; do
  summary="${plan/PLAN/SUMMARY}"
  [ ! -f "$summary" ] && echo "Incomplete: $plan"
done 2>/dev/null

# Check for interrupted agents
if [ -f ./current-agent-id.txt ] && [ -s ./current-agent-id.txt ]; then
  AGENT_ID=$(cat ./current-agent-id.txt | tr -d '\n')
  echo "Interrupted agent: $AGENT_ID"
fi
```

**If .continue-here file exists:**

- This is a mid-plan resumption point
- Read the file for specific resumption context
- Flag: "Found mid-plan checkpoint"

**If PLAN without SUMMARY exists:**

- Execution was started but not completed
- Flag: "Found incomplete plan execution"

**If interrupted agent found:**

- Subagent was spawned but session ended before completion
- Read agent-history.json for task details
- Flag: "Found interrupted agent"
  

### Step: present_status


Present complete project status to user:

```
╔══════════════════════════════════════════════════════════════╗
║  PROJECT STATUS                                               ║
╠══════════════════════════════════════════════════════════════╣
║  Building: [one-liner from .github/PROJECT.md "What This Is"]         ║
║                                                               ║
║  Phase: [X] of [Y] - [Phase name]                            ║
║  Plan:  [A] of [B] - [Status]                                ║
║  Progress: [██████░░░░] XX%                                  ║
║                                                               ║
║  Last activity: [date] - [what happened]                     ║
╚══════════════════════════════════════════════════════════════╝

[If incomplete work found:]
⚠️  Incomplete work detected:
    - [.continue-here file or incomplete plan]

[If interrupted agent found:]
⚠️  Interrupted agent detected:
    Agent ID: [id]
    Task: [task description from agent-history.json]
    Interrupted: [timestamp]

    Resume with: Task tool (resume parameter with agent ID)

[If pending todos exist:]
📋 [N] pending todos — /check-todos.md to review

[If blockers exist:]
⚠️  Carried concerns:
    - [blocker 1]
    - [blocker 2]

[If alignment is not ✓:]
⚠️  Brief alignment: [status] - [assessment]
```



### Step: determine_next_action


Based on project state, determine the most logical next action:

**If interrupted agent exists:**
→ Primary: Resume interrupted agent (Task tool with resume parameter)
→ Option: Start fresh (abandon agent work)

**If .continue-here file exists:**
→ Primary: Resume from checkpoint
→ Option: Start fresh on current plan

**If incomplete plan (PLAN without SUMMARY):**
→ Primary: Complete the incomplete plan
→ Option: Abandon and move on

**If phase in progress, all plans complete:**
→ Primary: Transition to next phase
→ Option: Review completed work

**If phase ready to plan:**
→ Check if CONTEXT.md exists for this phase:

- If CONTEXT.md missing:
  → Primary: Discuss phase vision (how user imagines it working)
  → Secondary: Plan directly (skip context gathering)
- If CONTEXT.md exists:
  → Primary: Plan the phase
  → Option: Review roadmap

**If phase ready to execute:**
→ Primary: Execute next plan
→ Option: Review the plan first


### Step: offer_options


Present contextual options based on project state:

```
What would you like to do?

[Primary action based on state - e.g.:]
1. Resume interrupted agent [if interrupted agent found]
   OR
1. Execute phase (/execute-phase.md {phase})
   OR
1. Discuss Phase 3 context (/discuss-phase.md 3) [if CONTEXT.md missing]
   OR
1. Plan Phase 3 (/plan-phase.md 3) [if CONTEXT.md exists or discuss option declined]

[Secondary options:]
2. Review current phase status
3. Check pending todos ([N] pending)
4. Review brief alignment
5. Something else
```

**Note:** When offering phase planning, check for CONTEXT.md existence first:

```bash
ls ./phases/XX-name/*-CONTEXT.md 2>/dev/null
```

If missing, suggest discuss-phase before plan. If exists, offer plan directly.

Wait for user selection.


### Step: route_to_workflow


Based on user selection, route to appropriate workflow:

- **Execute plan** → Show command for user to run after clearing:

  ```
  ---

  ## ▶ Next Up

  **{phase}-{plan}: [Plan Name]** — [objective from PLAN.md]

  `/execute-phase.md {phase}`

  ## Sub

`/clear` first → fresh context window

  ---
  ```

- **Plan phase** → Show command for user to run after clearing:

  ```
  ---

  ## ▶ Next Up

  **Phase [N]: [Name]** — [Goal from .github/ROADMAP.md]

  `/plan-phase.md [phase-number]`

  ## Sub

`/clear` first → fresh context window

  ---

  **Also available:**
  - `/discuss-phase.md [N]` — gather context first
  - `/research-phase.md [N]` — investigate unknowns

  ---
  ```

- **Transition** → ./transition.md
- **Check todos** → Read ./todos/pending/, present summary
- **Review alignment** → Read .github/PROJECT.md, compare to current state
- **Something else** → Ask what they need
  

### Step: update_session


Before proceeding to routed workflow, update session continuity:

Update .github/STATE.md:

```markdown
## Session Continuity

Last session: [now]
Stopped at: Session resumed, proceeding to [action]
Resume file: [updated if applicable]
```

This ensures if session ends unexpectedly, next resume knows the state.




## Reconstruction


If .github/STATE.md is missing but other artifacts exist:

".github/STATE.md missing. Reconstructing from artifacts..."

1. Read .github/PROJECT.md → Extract "What This Is" and Core Value
2. Read .github/ROADMAP.md → Determine phases, find current position
3. Scan \*-SUMMARY.md files → Extract decisions, concerns
4. Count pending todos in ./todos/pending/
5. Check for .continue-here files → Session continuity

Reconstruct and write .github/STATE.md, then proceed normally.

This handles cases where:

- Project predates .github/STATE.md introduction
- File was accidentally deleted
- Cloning repo without full ./ state
  

## Quick Resume


If user says "continue" or "go":

- Load state silently
- Determine primary action
- Execute immediately without presenting options

"Continuing from [state]... [action]"


## Success criteria


Resume is complete when:

- [ ] .github/STATE.md loaded (or reconstructed)
- [ ] Incomplete work detected and flagged
- [ ] Clear status presented to user
- [ ] Contextual next actions offered
- [ ] User knows exactly where project stands
- [ ] Session continuity updated
      
