---
name: ":add-phase"
description: "Add phase to end of current milestone in roadmap"
tools: ["read/readFile", "edit/editFiles", "execute/runInTerminal"]
---

## Objective


Add a new integer phase to the end of the current milestone in the roadmap.

This command appends sequential phases to the current milestone's phase list, automatically calculating the next phase number based on existing phases.

Purpose: Add planned work discovered during execution that belongs at the end of current milestone.


## Execution context


@.github/ROADMAP.md
@.github/STATE.md


## Process



### Step: parse_arguments


Parse the command arguments:
- All arguments become the phase description
- Example: `/add-phase.md Add authentication` → description = "Add authentication"
- Example: `/add-phase.md Fix critical performance issues` → description = "Fix critical performance issues"

If no arguments provided:

```
ERROR: Phase description required
Usage: /add-phase.md ## Description


Example: /add-phase.md Add authentication system
```

Exit.


### Step: load_roadmap


Load the roadmap file:

```bash
if [ -f .github/ROADMAP.md ]; then
  ROADMAP=".github/ROADMAP.md"
else
  echo "ERROR: No roadmap found (.github/ROADMAP.md)"
  exit 1
fi
```

Read roadmap content for parsing.


### Step: find_current_milestone


Parse the roadmap to find the current milestone section:

1. Locate the "## Current Milestone:" heading
2. Extract milestone name and version
3. Identify all phases under this milestone (before next "---" separator or next milestone heading)
4. Parse existing phase numbers (including decimals if present)

Example structure:

```
## Current Milestone: v1.0 Foundation

### Phase 4: Focused Command System
### Phase 5: Path Routing & Validation
### Phase 6: Documentation & Distribution
```



### Step: calculate_next_phase


Find the highest integer phase number in the current milestone:

1. Extract all phase numbers from phase headings (### Phase N:)
2. Filter to integer phases only (ignore decimals like 4.1, 4.2)
3. Find the maximum integer value
4. Add 1 to get the next phase number

Example: If phases are 4, 5, 5.1, 6 → next is 7

Format as two-digit: `printf "%02d" $next_phase`


### Step: generate_slug


Convert the phase description to a kebab-case slug:

```bash
# Example transformation:
# "Add authentication" → "add-authentication"
# "Fix critical performance issues" → "fix-critical-performance-issues"

slug=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
```

Phase directory name: `{two-digit-phase}-{slug}`
Example: `07-add-authentication`


### Step: create_phase_directory


Create the phase directory structure:

```bash
phase_dir="./phases/${phase_num}-${slug}"
mkdir -p "$phase_dir"
```

Confirm: "Created directory: $phase_dir"


### Step: update_roadmap


Add the new phase entry to the roadmap:

1. Find the insertion point (after last phase in current milestone, before "---" separator)
2. Insert new phase heading:

   ```
   ### Phase {N}: {Description}

   **Goal:** [To be planned]
   **Depends on:** Phase {N-1}
   **Plans:** 0 plans

   Plans:
   - [ ] TBD (run /plan-phase.md {N} to break down)

   **Details:**
   [To be added during planning]
   ```

3. Write updated roadmap back to file

Preserve all other content exactly (formatting, spacing, other phases).


### Step: update_project_state


Update .github/STATE.md to reflect the new phase:

1. Read `.github/STATE.md`
2. Under "## Current Position" → "**Next Phase:**" add reference to new phase
3. Under "## Accumulated Context" → "### Roadmap Evolution" add entry:
   ```
   - Phase {N} added: {description}
   ```

If "Roadmap Evolution" section doesn't exist, create it.


### Step: completion


Present completion summary:

```
Phase {N} added to current milestone:
- Description: {description}
- Directory: ./phases/{phase-num}-{slug}/
- Status: Not planned yet

Roadmap updated: {roadmap-path}
Project state updated: .github/STATE.md

---

## ▶ Next Up

**Phase {N}: {description}**

`/plan-phase.md {N}`

## Sub

`/clear` first → fresh context window

---

**Also available:**
- `/add-phase.md ## Description

` — add another phase
- Review roadmap

---
```





## Anti Patterns



- Don't modify phases outside current milestone
- Don't renumber existing phases
- Don't use decimal numbering (that's /insert-phase.md)
- Don't create plans yet (that's /plan-phase.md)
- Don't commit changes (user decides when to commit)
  

## Success criteria


Phase addition is complete when:

- [ ] Phase directory created: `./phases/{NN}-{slug}/`
- [ ] Roadmap updated with new phase entry
- [ ] .github/STATE.md updated with roadmap evolution note
- [ ] New phase appears at end of current milestone
- [ ] Next phase number calculated correctly (ignoring decimals)
- [ ] User informed of next steps
      
