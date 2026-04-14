---
name: complete-milestone
description: Mark a shipped version (v1.0, v1.1, v2.0) as complete. Creates historical record in MILESTONES.md, performs .github/PROJECT.md evolution review, reorganizes .github/ROADMAP.md, and tags the release in git.
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Purpose



Mark a shipped version (v1.0, v1.1, v2.0) as complete. This creates a historical record in MILESTONES.md, performs full .github/PROJECT.md evolution review, reorganizes .github/ROADMAP.md with milestone groupings, and tags the release in git.

This is the ritual that separates "development" from "shipped."



## Required reading



**Read these files NOW:**

1. templates/milestone.md
2. templates/milestone-archive.md
3. `.github/ROADMAP.md`
4. `.github/REQUIREMENTS.md`
5. `.github/PROJECT.md`



## Archival behavior



When a milestone completes, this workflow:

1. Extracts full milestone details to `./milestones/v[X.Y]-ROADMAP.md`
2. Archives requirements to `./milestones/v[X.Y]-REQUIREMENTS.md`
3. Updates .github/ROADMAP.md to replace milestone details with one-line summary
4. Deletes .github/REQUIREMENTS.md (fresh one created for next milestone)
5. Performs full .github/PROJECT.md evolution review
6. Offers to create next milestone inline

**Context Efficiency:** Archives keep .github/ROADMAP.md constant-size and .github/REQUIREMENTS.md milestone-scoped.

**Archive Format:**

**ROADMAP archive** uses `templates/milestone-archive.md` template with:

- Milestone header (status, phases, date)
- Full phase details from roadmap
- Milestone summary (decisions, issues, technical debt)

**REQUIREMENTS archive** contains:

- All v1 requirements marked complete with outcomes
- Traceability table with final status
- Notes on any requirements that changed during milestone



## Process



### Step: verify_readiness



Check if milestone is truly complete:

```bash
cat .github/ROADMAP.md
ls ./phases/*/SUMMARY.md 2>/dev/null | wc -l
```

**Questions to ask:**

- Which phases belong to this milestone?
- Are all those phases complete (all plans have summaries)?
- Has the work been tested/validated?
- Is this ready to ship/tag?

Present:

```
Milestone: [Name from user, e.g., "v1.0 MVP"]

Appears to include:
- Phase 1: Foundation (2/2 plans complete)
- Phase 2: Authentication (2/2 plans complete)
- Phase 3: Core Features (3/3 plans complete)
- Phase 4: Polish (1/1 plan complete)

Total: 4 phases, 8 plans, all complete
```

## Config Check



```bash
cat .github/config.json 2>/dev/null
```



<if mode="yolo">

```
⚡ Auto-approved: Milestone scope verification

[Show breakdown summary without prompting]

Proceeding to stats gathering...
```

Proceed directly to gather_stats step.



<if mode="interactive" OR="custom with gates.confirm_milestone_scope true">

```
Ready to mark this milestone as shipped?
(yes / wait / adjust scope)
```

Wait for confirmation.

If "adjust scope": Ask which phases should be included.
If "wait": Stop, user will return when ready.





### Step: gather_stats



Calculate milestone statistics:

```bash
# Count phases and plans in milestone
# (user specified or detected from roadmap)

# Find git range
git log --oneline --grep="feat(" | head -20

# Count files modified in range
git diff --stat FIRST_COMMIT..LAST_COMMIT | tail -1

# Count LOC (adapt to language)
find . -name "*.swift" -o -name "*.ts" -o -name "*.py" | xargs wc -l 2>/dev/null

# Calculate timeline
git log --format="%ai" FIRST_COMMIT | tail -1  # Start date
git log --format="%ai" LAST_COMMIT | head -1   # End date
```

Present summary:

```
Milestone Stats:
- Phases: [X-Y]
- Plans: [Z] total
- Tasks: [N] total (estimated from phase summaries)
- Files modified: [M]
- Lines of code: [LOC] [language]
- Timeline: [Days] days ([Start] → [End])
- Git range: feat(XX-XX) → feat(YY-YY)
```



### Step: extract_accomplishments



Read all phase SUMMARY.md files in milestone range:

```bash
cat ./phases/01-*/01-*-SUMMARY.md
cat ./phases/02-*/02-*-SUMMARY.md
# ... for each phase in milestone
```

From summaries, extract 4-6 key accomplishments.

Present:

```
Key accomplishments for this milestone:
1. [Achievement from phase 1]
2. [Achievement from phase 2]
3. [Achievement from phase 3]
4. [Achievement from phase 4]
5. [Achievement from phase 5]
```



### Step: create_milestone_entry



Create or update `./MILESTONES.md`.

If file doesn't exist:

```markdown
# Project Milestones: [Project Name from .github/PROJECT.md]

[New entry]
```

If exists, prepend new entry (reverse chronological order).

Use template from `templates/milestone.md`:

```markdown
## v[Version] [Name] (Shipped: YYYY-MM-DD)

**Delivered:** [One sentence from user]

**Phases completed:** [X-Y] ([Z] plans total)

**Key accomplishments:**

- [List from previous step]

**Stats:**

- [Files] files created/modified
- [LOC] lines of [language]
- [Phases] phases, [Plans] plans, [Tasks] tasks
- [Days] days from [start milestone or start project] to ship

**Git range:** `feat(XX-XX)` → `feat(YY-YY)`

**What's next:** [Ask user: what's the next goal?]

---
```



### Step: evolve_project_full_review



Perform full .github/PROJECT.md evolution review at milestone completion.

**Read all phase summaries in this milestone:**

```bash
cat ./phases/*-*/*-SUMMARY.md
```

**Full review checklist:**

1. **"What This Is" accuracy:**
   - Read current description
   - Compare to what was actually built
   - Update if the product has meaningfully changed

2. **Core Value check:**
   - Is the stated core value still the right priority?
   - Did shipping reveal a different core value?
   - Update if the ONE thing has shifted

3. **Requirements audit:**

   **Validated section:**
   - All Active requirements shipped in this milestone → Move to Validated
   - Format: `- ✓ [Requirement] — v[X.Y]`

   **Active section:**
   - Remove requirements that moved to Validated
   - Add any new requirements for next milestone
   - Keep requirements that weren't addressed yet

   **Out of Scope audit:**
   - Review each item — is the reasoning still valid?
   - Remove items that are no longer relevant
   - Add any requirements invalidated during this milestone

4. **Context update:**
   - Current codebase state (LOC, tech stack)
   - User feedback themes (if any)
   - Known issues or technical debt to address

5. **Key Decisions audit:**
   - Extract all decisions from milestone phase summaries
   - Add to Key Decisions table with outcomes where known
   - Mark ✓ Good, ⚠️ Revisit, or — Pending for each

6. **Constraints check:**
   - Any constraints that changed during development?
   - Update as needed

**Update .github/PROJECT.md:**

Make all edits inline. Update "Last updated" footer:

```markdown
---

_Last updated: [date] after v[X.Y] milestone_
```

**Example full evolution (v1.0 → v1.1 prep):**

Before:

```markdown
## What This Is

A real-time collaborative whiteboard for remote teams.

## Core Value

Real-time sync that feels instant.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Canvas drawing tools
- [ ] Real-time sync < 500ms
- [ ] User authentication
- [ ] Export to PNG

### Out of Scope

- Mobile app — web-first approach
- Video chat — use external tools
```

After v1.0:

```markdown
## What This Is

A real-time collaborative whiteboard for remote teams with instant sync and drawing tools.

## Core Value

Real-time sync that feels instant.

## Requirements

### Validated

- ✓ Canvas drawing tools — v1.0
- ✓ Real-time sync < 500ms — v1.0 (achieved 200ms avg)
- ✓ User authentication — v1.0

### Active

- [ ] Export to PNG
- [ ] Undo/redo history
- [ ] Shape tools (rectangles, circles)

### Out of Scope

- Mobile app — web-first approach, PWA works well
- Video chat — use external tools
- Offline mode — real-time is core value

## Context
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


Shipped v1.0 with 2,400 LOC TypeScript.
Tech stack: Next.js, Supabase, Canvas API.
Initial user testing showed demand for shape tools.
```

**Step complete when:**

- [ ] "What This Is" reviewed and updated if needed
- [ ] Core Value verified as still correct
- [ ] All shipped requirements moved to Validated
- [ ] New requirements added to Active for next milestone
- [ ] Out of Scope reasoning audited
- [ ] Context updated with current state
- [ ] All milestone decisions added to Key Decisions
- [ ] "Last updated" footer reflects milestone completion



### Step: reorganize_roadmap



Update `.github/ROADMAP.md` to group completed milestone phases.

Add milestone headers and collapse completed work:

```markdown
# Roadmap: [Project Name]

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped YYYY-MM-DD)
- 🚧 **v1.1 Security** — Phases 5-6 (in progress)
- 📋 **v2.0 Redesign** — Phases 7-10 (planned)

## Phases

## Details


## Summary

✅ v1.0 MVP (Phases 1-4) — SHIPPED YYYY-MM-DD

- [x] Phase 1: Foundation (2/2 plans) — completed YYYY-MM-DD
- [x] Phase 2: Authentication (2/2 plans) — completed YYYY-MM-DD
- [x] Phase 3: Core Features (3/3 plans) — completed YYYY-MM-DD
- [x] Phase 4: Polish (1/1 plan) — completed YYYY-MM-DD



### 🚧 v[Next] [Name] (In Progress / Planned)

- [ ] Phase 5: [Name] ([N] plans)
- [ ] Phase 6: [Name] ([N] plans)

## Progress

| Phase             | Milestone | Plans Complete | Status      | Completed  |
| ----------------- | --------- | -------------- | ----------- | ---------- |
| 1. Foundation     | v1.0      | 2/2            | Complete    | YYYY-MM-DD |
| 2. Authentication | v1.0      | 2/2            | Complete    | YYYY-MM-DD |
| 3. Core Features  | v1.0      | 3/3            | Complete    | YYYY-MM-DD |
| 4. Polish         | v1.0      | 1/1            | Complete    | YYYY-MM-DD |
| 5. Security Audit | v1.1      | 0/1            | Not started | -          |
| 6. Hardening      | v1.1      | 0/2            | Not started | -          |
```



### Step: archive_milestone



Extract completed milestone details and create archive file.

**Process:**

1. Create archive file path: `./milestones/v[X.Y]-ROADMAP.md`

2. Read `~/./templates/milestone-archive.md` template

3. Extract data from current .github/ROADMAP.md:
   - All phases belonging to this milestone (by phase number range)
   - Full phase details (goals, plans, dependencies, status)
   - Phase plan lists with completion checkmarks

4. Extract data from .github/PROJECT.md:
   - Key decisions made during this milestone
   - Requirements that were validated

5. Fill template {{PLACEHOLDERS}}:
   - {{VERSION}} — Milestone version (e.g., "1.0")
   - {{MILESTONE_NAME}} — From .github/ROADMAP.md milestone header
   - {{DATE}} — Today's date
   - {{PHASE_START}} — First phase number in milestone
   - {{PHASE_END}} — Last phase number in milestone
   - {{TOTAL_PLANS}} — Count of all plans in milestone
   - {{MILESTONE_DESCRIPTION}} — From .github/ROADMAP.md overview
   - {{PHASES_SECTION}} — Full phase details extracted
   - {{DECISIONS_FROM_PROJECT}} — Key decisions from .github/PROJECT.md
   - {{ISSUES_RESOLVED_DURING_MILESTONE}} — From summaries

6. Write filled template to `./milestones/v[X.Y]-ROADMAP.md`

7. Delete .github/ROADMAP.md (fresh one created for next milestone):

   ```bash
   rm .github/ROADMAP.md
   ```

8. Verify archive exists:

   ```bash
   ls ./milestones/v[X.Y]-ROADMAP.md
   ```

9. Confirm roadmap archive complete:

   ```
   ✅ v[X.Y] roadmap archived to milestones/v[X.Y]-ROADMAP.md
   ✅ .github/ROADMAP.md deleted (fresh one for next milestone)
   ```

**Note:** Phase directories (`./phases/`) are NOT deleted. They accumulate across milestones as the raw execution history. Phase numbering continues (v1.0 phases 1-4, v1.1 phases 5-8, etc.).



### Step: archive_requirements



Archive requirements and prepare for fresh requirements in next milestone.

**Process:**

1. Read current .github/REQUIREMENTS.md:

   ```bash
   cat .github/REQUIREMENTS.md
   ```

2. Create archive file: `./milestones/v[X.Y]-REQUIREMENTS.md`

3. Transform requirements for archive:
   - Mark all v1 requirements as `[x]` complete
   - Add outcome notes where relevant (validated, adjusted, dropped)
   - Update traceability table status to "Complete" for all shipped requirements
   - Add "Milestone Summary" section with:
     - Total requirements shipped
     - Any requirements that changed scope during milestone
     - Any requirements dropped and why

4. Write archive file with header:

   ```markdown
   # Requirements Archive: v[X.Y] [Milestone Name]

   **Archived:** [DATE]
   **Status:** ✅ SHIPPED

   This is the archived requirements specification for v[X.Y].
   For current requirements, see `.github/REQUIREMENTS.md` (created for next milestone).

   ---

   [Full .github/REQUIREMENTS.md content with checkboxes marked complete]

   ---

   ## Milestone Summary

   **Shipped:** [X] of [Y] v1 requirements
   **Adjusted:** [list any requirements that changed during implementation]
   **Dropped:** [list any requirements removed and why]

   ---

   _Archived: [DATE] as part of v[X.Y] milestone completion_
   ```

5. Delete original .github/REQUIREMENTS.md:

   ```bash
   rm .github/REQUIREMENTS.md
   ```

6. Confirm:
   ```
   ✅ Requirements archived to milestones/v[X.Y]-REQUIREMENTS.md
   ✅ .github/REQUIREMENTS.md deleted (fresh one needed for next milestone)
   ```

**Important:** The next milestone workflow starts with `/new-milestone.md` which includes requirements definition. .github/PROJECT.md's Validated section carries the cumulative record across milestones.



### Step: archive_audit



Move the milestone audit file to the archive (if it exists):

```bash
# Move audit to milestones folder (if exists)
[ -f ./v[X.Y]-MILESTONE-AUDIT.md ] && mv ./v[X.Y]-MILESTONE-AUDIT.md ./milestones/
```

Confirm:

```
✅ Audit archived to milestones/v[X.Y]-MILESTONE-AUDIT.md
```

(Skip silently if no audit file exists — audit is optional)



### Step: update_state



Update .github/STATE.md to reflect milestone completion.

**Project Reference:**

```markdown
## Project Reference

See: .github/PROJECT.md (updated [today])

**Core value:** [Current core value from .github/PROJECT.md]
**Current focus:** [Next milestone or "Planning next milestone"]
```

**Current Position:**

```markdown
Phase: [Next phase] of [Total] ([Phase name])
Plan: Not started
Status: Ready to plan
Last activity: [today] — v[X.Y] milestone complete

Progress: [updated progress bar]
```

**Accumulated Context:**

- Clear decisions summary (full log in .github/PROJECT.md)
- Clear resolved blockers
- Keep open blockers for next milestone



### Step: handle_branches



Check if branching was used and offer merge options.

**Check branching strategy:**

```bash
# Get branching strategy from config
BRANCHING_STRATEGY=$(cat .github/config.json 2>/dev/null | grep -o '"branching_strategy"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/' || echo "none")
```

**If strategy is "none":** Skip to git_tag step.

**For "phase" strategy — find phase branches:**

```bash
PHASE_BRANCH_TEMPLATE=$(cat .github/config.json 2>/dev/null | grep -o '"phase_branch_template"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/' || echo "/phase-{phase}-{slug}")

# Extract prefix from template (before first variable)
BRANCH_PREFIX=$(echo "$PHASE_BRANCH_TEMPLATE" | sed 's/{.*//')

# Find all phase branches for this milestone
PHASE_BRANCHES=$(git branch --list "${BRANCH_PREFIX}*" 2>/dev/null | sed 's/^\*//' | tr -d ' ')
```

**For "milestone" strategy — find milestone branch:**

```bash
MILESTONE_BRANCH_TEMPLATE=$(cat .github/config.json 2>/dev/null | grep -o '"milestone_branch_template"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/' || echo "/{milestone}-{slug}")

# Extract prefix from template
BRANCH_PREFIX=$(echo "$MILESTONE_BRANCH_TEMPLATE" | sed 's/{.*//')

# Find milestone branch
MILESTONE_BRANCH=$(git branch --list "${BRANCH_PREFIX}*" 2>/dev/null | sed 's/^\*//' | tr -d ' ' | head -1)
```

**If no branches found:** Skip to git_tag step.

**If branches exist — present merge options:**

```
## Git Branches Detected

Branching strategy: {phase/milestone}

Branches found:
{list of branches}

Options:
1. **Merge to main** — Merge branch(es) to main
2. **Delete without merging** — Branches already merged or not needed
3. **Keep branches** — Leave for manual handling
```

Use HumanAgent MCP (HumanAgent_Chat):

```
HumanAgent MCP (HumanAgent_Chat)([
  {
    question: "How should branches be handled?",
    header: "Branches",
    multiSelect: false,
    options: [
      { label: "Squash merge (Recommended)", description: "Squash all commits into one clean commit on main" },
      { label: "Merge with history", description: "Preserve all individual commits (--no-ff)" },
      { label: "Delete without merging", description: "Branches already merged or not needed" },
      { label: "Keep branches", description: "Leave branches for manual handling later" }
    ]
  }
])
```

**If "Squash merge":**

```bash
CURRENT_BRANCH=$(git branch --show-current)
git checkout main

# For phase strategy - squash merge each phase branch
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    echo "Squash merging $branch..."
    git merge --squash "$branch"
    git commit -m "feat: $branch for v[X.Y]"
  done
fi

# For milestone strategy - squash merge milestone branch
if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  echo "Squash merging $MILESTONE_BRANCH..."
  git merge --squash "$MILESTONE_BRANCH"
  git commit -m "feat: $MILESTONE_BRANCH for v[X.Y]"
fi

git checkout "$CURRENT_BRANCH"
```

Report: "Squash merged branches to main"

**If "Merge with history":**

```bash
CURRENT_BRANCH=$(git branch --show-current)
git checkout main

# For phase strategy - merge each phase branch
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    echo "Merging $branch..."
    git merge --no-ff "$branch" -m "Merge branch '$branch' for v[X.Y]"
  done
fi

# For milestone strategy - merge milestone branch
if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  echo "Merging $MILESTONE_BRANCH..."
  git merge --no-ff "$MILESTONE_BRANCH" -m "Merge branch '$MILESTONE_BRANCH' for v[X.Y]"
fi

git checkout "$CURRENT_BRANCH"
```

Report: "Merged branches to main with full history"

**If "Delete without merging":**

```bash
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git branch -d "$branch" 2>/dev/null || git branch -D "$branch"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git branch -d "$MILESTONE_BRANCH" 2>/dev/null || git branch -D "$MILESTONE_BRANCH"
fi
```

Report: "Deleted branches"

**If "Keep branches":**

Report: "Branches preserved for manual handling"



### Step: git_tag



Create git tag for milestone:

```bash
git tag -a v[X.Y] -m "$(cat <<'EOF'
v[X.Y] [Name]

Delivered: [One sentence]

Key accomplishments:
- [Item 1]
- [Item 2]
- [Item 3]

See ./MILESTONES.md for full details.
EOF
)"
```

Confirm: "Tagged: v[X.Y]"

Ask: "Push tag to remote? (y/n)"

If yes:

```bash
git push origin v[X.Y]
```



### Step: git_commit_milestone



Commit milestone completion including archive files and deletions.

**Check planning config:**

```bash
COMMIT_PLANNING_DOCS=$(cat .github/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
git check-ignore -q . 2>/dev/null && COMMIT_PLANNING_DOCS=false
```

**If `COMMIT_PLANNING_DOCS=false`:** Skip git operations

**If `COMMIT_PLANNING_DOCS=true` (default):**

```bash
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

# Stage archive files (new)
git add ./milestones/v[X.Y]-ROADMAP.md
git add ./milestones/v[X.Y]-REQUIREMENTS.md
git add ./milestones/v[X.Y]-MILESTONE-AUDIT.md 2>/dev/null || true
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


# Stage updated files
git add ./MILESTONES.md
git add .github/PROJECT.md
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

git add .github/STATE.md

> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

# Stage deletions
git add -u ./

# Commit with descriptive message
git commit -m "$(cat <<'EOF'
chore: complete v[X.Y] milestone

Archived:
- milestones/v[X.Y]-ROADMAP.md
- milestones/v[X.Y]-REQUIREMENTS.md
- milestones/v[X.Y]-MILESTONE-AUDIT.md (if audit was run)

Deleted (fresh for next milestone):
- .github/ROADMAP.md
- .github/REQUIREMENTS.md

Updated:
- MILESTONES.md (new entry)
- .github/PROJECT.md (requirements → Validated)
- .github/STATE.md (reset for next milestone)

Tagged: v[X.Y]
EOF
)"
```

Confirm: "Committed: chore: complete v[X.Y] milestone"



### Step: offer_next



```
✅ Milestone v[X.Y] [Name] complete

Shipped:
- [N] phases ([M] plans, [P] tasks)
- [One sentence of what shipped]

Archived:
- milestones/v[X.Y]-ROADMAP.md
- milestones/v[X.Y]-REQUIREMENTS.md

Summary: ./MILESTONES.md
Tag: v[X.Y]

---

## ▶ Next Up

**Start Next Milestone** — questioning → research → requirements → roadmap

`/new-milestone.md`

## Sub

`/clear` first → fresh context window

---
```





## Milestone Naming



**Version conventions:**

- **v1.0** — Initial MVP
- **v1.1, v1.2, v1.3** — Minor updates, new features, fixes
- **v2.0, v3.0** — Major rewrites, breaking changes, significant new direction

**Name conventions:**

- v1.0 MVP
- v1.1 Security
- v1.2 Performance
- v2.0 Redesign
- v2.0 iOS Launch

Keep names short (1-2 words describing the focus).



## What Qualifies



**Create milestones for:**

- Initial release (v1.0)
- Public releases
- Major feature sets shipped
- Before archiving planning

**Don't create milestones for:**

- Every phase completion (too granular)
- Work in progress (wait until shipped)
- Internal dev iterations (unless truly shipped internally)

If uncertain, ask: "Is this deployed/usable/shipped in some form?"
If yes → milestone. If no → keep working.



## Success criteria



Milestone completion is successful when:

- [ ] MILESTONES.md entry created with stats and accomplishments
- [ ] .github/PROJECT.md full evolution review completed
- [ ] All shipped requirements moved to Validated in .github/PROJECT.md
- [ ] Key Decisions updated with outcomes
- [ ] .github/ROADMAP.md reorganized with milestone grouping
- [ ] Roadmap archive created (milestones/v[X.Y]-ROADMAP.md)
- [ ] Requirements archive created (milestones/v[X.Y]-REQUIREMENTS.md)
- [ ] .github/REQUIREMENTS.md deleted (fresh for next milestone)
- [ ] .github/STATE.md updated with fresh project reference
- [ ] Git tag created (v[X.Y])
- [ ] Milestone commit made (includes archive files and deletion)
- [ ] User knows next step (/new-milestone.md)


