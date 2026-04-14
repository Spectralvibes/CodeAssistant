---
name: ":plan-milestone-gaps"
description: "Create phases to close all gaps identified by milestone audit"
tools: ["read/readFile", "edit/editFiles", "execute/runInTerminal", "read/listDirectory", "search/textSearch"]
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Objective


Create all phases necessary to close gaps identified by `/audit-milestone.md`.

Reads MILESTONE-AUDIT.md, groups gaps into logical phases, creates phase entries in .github/ROADMAP.md, and offers to plan each phase.

One command creates all fix phases — no manual `/add-phase.md` per gap.


## Execution context



<!-- Spawns planner agent which has all planning expertise baked in -->



## Context


**Audit results:**
Glob: ./v*-MILESTONE-AUDIT.md (use most recent)

**Original intent (for prioritization):**
@.github/PROJECT.md
@.github/REQUIREMENTS.md

**Current state:**
@.github/ROADMAP.md
@.github/STATE.md


## Process



## 1. Load Audit Results

```bash
# Find the most recent audit file
ls -t ./v*-MILESTONE-AUDIT.md 2>/dev/null | head -1
```

Parse YAML frontmatter to extract structured gaps:

- `gaps.requirements` — unsatisfied requirements
- `gaps.integration` — missing cross-phase connections
- `gaps.flows` — broken E2E flows

If no audit file exists or has no gaps, error:

```
No audit gaps found. Run `/audit-milestone.md` first.
```

## 2. Prioritize Gaps

Group gaps by priority from .github/REQUIREMENTS.md:

| Priority | Action                         |
| -------- | ------------------------------ |
| `must`   | Create phase, blocks milestone |
| `should` | Create phase, recommended      |
| `nice`   | Ask user: include or defer?    |

For integration/flow gaps, infer priority from affected requirements.

## 3. Group Gaps into Phases

Cluster related gaps into logical phases:

**Grouping rules:**

- Same affected phase → combine into one fix phase
- Same subsystem (auth, API, UI) → combine
- Dependency order (fix stubs before wiring)
- Keep phases focused: 2-4 tasks each

**Example grouping:**

```
Gap: DASH-01 unsatisfied (Dashboard doesn't fetch)
Gap: Integration Phase 1→3 (Auth not passed to API calls)
Gap: Flow "View dashboard" broken at data fetch

→ Phase 6: "Wire Dashboard to API"
  - Add fetch to Dashboard.tsx
  - Include auth header in fetch
  - Handle response, update state
  - Render user data
```

## 4. Determine Phase Numbers

Find highest existing phase:

```bash
ls -d ./phases/*/ | sort -V | tail -1
```

New phases continue from there:

- If Phase 5 is highest, gaps become Phase 6, 7, 8...

## 5. Present Gap Closure Plan

```markdown
## Gap Closure Plan

**Milestone:** {version}
**Gaps to close:** {N} requirements, {M} integration, {K} flows

### Proposed Phases

**Phase {N}: {Name}**
Closes:

- {REQ-ID}: {description}
- Integration: {from} → {to}
  Tasks: {count}

**Phase {N+1}: {Name}**
Closes:

- {REQ-ID}: {description}
- Flow: {flow name}
  Tasks: {count}

{If nice-to-have gaps exist:}

### Deferred (nice-to-have)

These gaps are optional. Include them?

- {gap description}
- {gap description}

---

Create these {X} phases? (yes / adjust / defer all optional)
```

Wait for user confirmation.

## 6. Update .github/ROADMAP.md

Add new phases to current milestone:

```markdown
### Phase {N}: {Name}

**Goal:** {derived from gaps being closed}
**Requirements:** {REQ-IDs being satisfied}
**Gap Closure:** Closes gaps from audit

### Phase {N+1}: {Name}

...
```

## 7. Create Phase Directories

```bash
mkdir -p "./phases/{NN}-{name}"
```

## 8. Commit Roadmap Update
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


**Check planning config:**

```bash
COMMIT_PLANNING_DOCS=$(cat .github/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
git check-ignore -q . 2>/dev/null && COMMIT_PLANNING_DOCS=false
```

**If `COMMIT_PLANNING_DOCS=false`:** Skip git operations

**If `COMMIT_PLANNING_DOCS=true` (default):**

```bash
git add .github/ROADMAP.md
git commit -m "docs(roadmap): add gap closure phases {N}-{M}"
```

## 9. Offer Next Steps

```markdown
## ✓ Gap Closure Phases Created

**Phases added:** {N} - {M}
**Gaps addressed:** {count} requirements, {count} integration, {count} flows

---

## ▶ Next Up

**Plan first gap closure phase**

`/plan-phase.md {N}`

## Sub

`/clear` first → fresh context window

---

**Also available:**

- `/execute-phase.md {N}` — if plans already exist
- `cat .github/ROADMAP.md` — see updated roadmap

---

**After all gap phases complete:**

`/audit-milestone.md` — re-audit to verify gaps closed
`/complete-milestone.md {version}` — archive when audit passes
```



## Gap To Phase Mapping



> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

## How Gaps Become Tasks

**Requirement gap → Tasks:**

```yaml
gap:
  id: DASH-01
  description: "User sees their data"
  reason: "Dashboard exists but doesn't fetch from API"
  missing:
    - "useEffect with fetch to /api/user/data"
    - "State for user data"
    - "Render user data in JSX"

becomes:

phase: "Wire Dashboard Data"
tasks:
  - name: "Add data fetching"
    files: [src/components/Dashboard.tsx]
    action: "Add useEffect that fetches /api/user/data on mount"

  - name: "Add state management"
    files: [src/components/Dashboard.tsx]
    action: "Add useState for userData, loading, error states"

  - name: "Render user data"
    files: [src/components/Dashboard.tsx]
    action: "Replace placeholder with userData.map rendering"
```

**Integration gap → Tasks:**

```yaml
gap:
  from_phase: 1
  to_phase: 3
  connection: "Auth token → API calls"
  reason: "Dashboard API calls don't include auth header"
  missing:
    - "Auth header in fetch calls"
    - "Token refresh on 401"

becomes:

phase: "Add Auth to Dashboard API Calls"
tasks:
  - name: "Add auth header to fetches"
    files: [src/components/Dashboard.tsx, src/lib/api.ts]
    action: "Include Authorization header with token in all API calls"

  - name: "Handle 401 responses"
    files: [src/lib/api.ts]
    action: "Add interceptor to refresh token or redirect to login on 401"
```

**Flow gap → Tasks:**

```yaml
gap:
  name: "User views dashboard after login"
  broken_at: "Dashboard data load"
  reason: "No fetch call"
  missing:
    - "Fetch user data on mount"
    - "Display loading state"
    - "Render user data"

becomes:

# Usually same phase as requirement/integration gap
# Flow gaps often overlap with other gap types
```



## Success criteria



- [ ] MILESTONE-AUDIT.md loaded and gaps parsed
- [ ] Gaps prioritized (must/should/nice)
- [ ] Gaps grouped into logical phases
- [ ] User confirmed phase plan
- [ ] .github/ROADMAP.md updated with new phases
- [ ] Phase directories created
- [ ] Changes committed
- [ ] User knows to run `/plan-phase.md` next
      
