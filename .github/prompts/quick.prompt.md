---
name: ":quick"
description: "Execute a quick task with  guarantees (atomic commits, state tracking) but skip optional agents"
tools:
  [
    "read/readFile",
    "edit/editFiles",
    "read/listDirectory",
    "search/textSearch",
    "execute/runInTerminal",
    "runSubagent",
  ]
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Objective


Execute small, ad-hoc tasks with  guarantees (atomic commits, .github/STATE.md tracking) while skipping optional agents (research, plan-checker, verifier).

Quick mode is the same system with a shorter path:

- Spawns planner (quick mode) + executor(s)
- Skips phase-researcher, plan-checker, verifier
- Quick tasks live in `./quick/` separate from planned phases
- Updates .github/STATE.md "Quick Tasks Completed" table (NOT .github/ROADMAP.md)

Use when: You know exactly what to do and the task is small enough to not need research or verification.


## Execution context


Orchestration is inline - no separate workflow file. Quick mode is deliberately simpler than full .


## Context


@.github/STATE.md


## Process


**Step 0: Resolve Model Profile**

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .github/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

**Model lookup table:**

| Agent        | quality | balanced | budget |
| ------------ | ------- | -------- | ------ |
| planner  | opus    | opus     | sonnet |
| executor | opus    | sonnet   | sonnet |

Store resolved models for use in Task calls below.

---

**Step 1: Pre-flight validation**

Check that an active  project exists:

```bash
if [ ! -f .github/ROADMAP.md ]; then
  echo "Quick mode requires an active project with .github/ROADMAP.md."
  echo "Run /new-project.md first."
  exit 1
fi
```

If validation fails, stop immediately with the error message.

Quick tasks can run mid-phase - validation only checks .github/ROADMAP.md exists, not phase status.

---

**Step 2: Get task description**

Prompt user interactively for the task description:

```
HumanAgent MCP (HumanAgent_Chat)(
  header: "Quick Task",
  question: "What do you want to do?",
  followUp: null
)
```

Store response as `$DESCRIPTION`.

If empty, re-prompt: "Please provide a task description."

Generate slug from description:

```bash
slug=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//' | cut -c1-40)
```

---

**Step 3: Calculate next quick task number**

Ensure `./quick/` directory exists and find the next sequential number:

```bash
# Ensure ./quick/ exists
mkdir -p ./quick

# Find highest existing number and increment
last=$(ls -1d ./quick/[0-9][0-9][0-9]-* 2>/dev/null | sort -r | head -1 | xargs -I{} basename {} | grep -oE '^[0-9]+')

if [ -z "$last" ]; then
  next_num="001"
else
  next_num=$(printf "%03d" $((10#$last + 1)))
fi
```

---

**Step 4: Create quick task directory**

Create the directory for this quick task:

```bash
QUICK_DIR="./quick/${next_num}-${slug}"
mkdir -p "$QUICK_DIR"
```

Report to user:

```
Creating quick task ${next_num}: ${DESCRIPTION}
Directory: ${QUICK_DIR}
```

Store `$QUICK_DIR` for use in orchestration.

---

**Step 5: Spawn planner (quick mode)**

Spawn planner with quick mode context:

```
Task(
  prompt="
## Planning Context



**Mode:** quick
**Directory:** ${QUICK_DIR}
**Description:** ${DESCRIPTION}

**Project State:**
@.github/STATE.md



## Constraints


- Create a SINGLE plan with 1-3 focused tasks
- Quick tasks should be atomic and self-contained
- No research phase, no checker phase
- Target ~30% context usage (simple, focused)


## Output


Write plan to: ${QUICK_DIR}/${next_num}-PLAN.md
Return: ## PLANNING COMPLETE with plan path

",
  subagent_type="planner",
  model="{planner_model}",
  description="Quick plan: ${DESCRIPTION}"
)
```

After planner returns:

1. Verify plan exists at `${QUICK_DIR}/${next_num}-PLAN.md`
2. Extract plan count (typically 1 for quick tasks)
3. Report: "Plan created: ${QUICK_DIR}/${next_num}-PLAN.md"

If plan not found, error: "Planner failed to create ${next_num}-PLAN.md"

---

**Step 6: Spawn executor**

Spawn executor with plan reference:

```
Task(
  prompt="
Execute quick task ${next_num}.

Plan: @${QUICK_DIR}/${next_num}-PLAN.md
Project state: @.github/STATE.md

## Constraints


- Execute all tasks in the plan
- Commit each task atomically
- Create summary at: ${QUICK_DIR}/${next_num}-SUMMARY.md
- Do NOT update .github/ROADMAP.md (quick tasks are separate from planned phases)

",
  subagent_type="executor",
  model="{executor_model}",
  description="Execute: ${DESCRIPTION}"
)
```

After executor returns:

1. Verify summary exists at `${QUICK_DIR}/${next_num}-SUMMARY.md`
2. Extract commit hash from executor output
3. Report completion status

If summary not found, error: "Executor failed to create ${next_num}-SUMMARY.md"

Note: For quick tasks producing multiple plans (rare), spawn executors in parallel waves per execute-phase patterns.

---

**Step 7: Update .github/STATE.md**

Update .github/STATE.md with quick task completion record.

**7a. Check if "Quick Tasks Completed" section exists:**

Read .github/STATE.md and check for `### Quick Tasks Completed` section.

**7b. If section doesn't exist, create it:**

Insert after `### Blockers/Concerns` section:

```markdown
### Quick Tasks Completed

| #   | Description | Date | Commit | Directory |
| --- | ----------- | ---- | ------ | --------- |
```

**7c. Append new row to table:**

```markdown
| ${next_num} | ${DESCRIPTION} | $(date +%Y-%m-%d) | ${commit_hash} | [${next_num}-${slug}](./quick/${next_num}-${slug}/) |
```

**7d. Update "Last activity" line:**

Find and update the line:

```
Last activity: $(date +%Y-%m-%d) - Completed quick task ${next_num}: ${DESCRIPTION}
```

Use Edit tool to make these changes atomically

---

**Step 8: Final commit and completion**

Stage and commit quick task artifacts:

```bash
# Stage quick task artifacts
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

git add ${QUICK_DIR}/${next_num}-PLAN.md
git add ${QUICK_DIR}/${next_num}-SUMMARY.md
git add .github/STATE.md

# Commit with quick task format
git commit -m "$(cat <<'EOF'
docs(quick-${next_num}): ${DESCRIPTION}

Quick task completed.

Co-Authored-By: Copilot Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

Get final commit hash:

```bash
commit_hash=$(git rev-parse --short HEAD)
```

Display completion output:

```
---

 > QUICK TASK COMPLETE

Quick Task ${next_num}: ${DESCRIPTION}

Summary: ${QUICK_DIR}/${next_num}-SUMMARY.md
Commit: ${commit_hash}

---

Ready for next task: /quick.md
```



## Success criteria



- [ ] .github/ROADMAP.md validation passes
- [ ] User provides task description
- [ ] Slug generated (lowercase, hyphens, max 40 chars)
- [ ] Next number calculated (001, 002, 003...)
- [ ] Directory created at `./quick/NNN-slug/`
- [ ] `${next_num}-PLAN.md` created by planner
- [ ] `${next_num}-SUMMARY.md` created by executor
- [ ] .github/STATE.md updated with quick task row
- [ ] Artifacts committed
      
