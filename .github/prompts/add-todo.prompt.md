---
name: ":add-todo"
description: "Capture idea or task as todo from current conversation context"
tools: ["read/readFile", "edit/editFiles", "execute/runInTerminal", "read/listDirectory"]
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Objective


Capture an idea, task, or issue that surfaces during a  session as a structured todo for later work.

Enables "thought → capture → continue" flow without losing context or derailing current work.


## Context


@.github/STATE.md


## Process



### Step: ensure_directory


```bash
mkdir -p ./todos/pending ./todos/done
```


### Step: check_existing_areas


```bash
ls ./todos/pending/*.md 2>/dev/null | xargs -I {} grep "^area:" {} 2>/dev/null | cut -d' ' -f2 | sort -u
```

Note existing areas for consistency in infer_area step.


### Step: extract_content


**With arguments:** Use as the title/focus.
- `/add-todo.md Add auth token refresh` → title = "Add auth token refresh"

**Without arguments:** Analyze recent conversation to extract:

- The specific problem, idea, or task discussed
- Relevant file paths mentioned
- Technical details (error messages, line numbers, constraints)

Formulate:

- `title`: 3-10 word descriptive title (action verb preferred)
- `problem`: What's wrong or why this is needed
- `solution`: Approach hints or "TBD" if just an idea
- `files`: Relevant paths with line numbers from conversation
  

### Step: infer_area


Infer area from file paths:

| Path pattern                   | Area       |
| ------------------------------ | ---------- |
| `src/api/*`, `api/*`           | `api`      |
| `src/components/*`, `src/ui/*` | `ui`       |
| `src/auth/*`, `auth/*`         | `auth`     |
| `src/db/*`, `database/*`       | `database` |
| `tests/*`, `__tests__/*`       | `testing`  |
| `docs/*`                       | `docs`     |
| `./*`                       | `planning` |
| `scripts/*`, `bin/*`           | `tooling`  |
| No files or unclear            | `general`  |

Use existing area from step 2 if similar match exists.


### Step: check_duplicates


```bash
grep -l -i "[key words from title]" ./todos/pending/*.md 2>/dev/null
```

If potential duplicate found:

1. Read the existing todo
2. Compare scope

If overlapping, use HumanAgent MCP (HumanAgent_Chat):

- header: "Duplicate?"
- question: "Similar todo exists: [title]. What would you like to do?"
- options:
  - "Skip" — keep existing todo
  - "Replace" — update existing with new context
  - "Add anyway" — create as separate todo
    

### Step: create_file


```bash
timestamp=$(date "+%Y-%m-%dT%H:%M")
date_prefix=$(date "+%Y-%m-%d")
```

Generate slug from title (lowercase, hyphens, no special chars in FILENAME only).

Write to `./todos/pending/${date_prefix}-${slug}.md`:

```markdown
---
created: [timestamp]
title: [title]
area: [area]
files:
  - [file:lines]
---

## Problem

[problem description - enough context for future Copilot to understand weeks later]

## Solution
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


[approach hints or "TBD"]
```



### Step: update_state


If `.github/STATE.md` exists:

1. Count todos: `ls ./todos/pending/*.md 2>/dev/null | wc -l`
2. Update "### Pending Todos" under "## Accumulated Context"
   

### Step: git_commit


Commit the todo and any updated state:

**Check planning config:**

```bash
COMMIT_PLANNING_DOCS=$(cat .github/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")
git check-ignore -q . 2>/dev/null && COMMIT_PLANNING_DOCS=false
```

**If `COMMIT_PLANNING_DOCS=false`:** Skip git operations, log "Todo saved (not committed - commit_docs: false)"

**If `COMMIT_PLANNING_DOCS=true` (default):**

```bash
git add ./todos/pending/[filename]
[ -f .github/STATE.md ] && git add .github/STATE.md
git commit -m "$(cat <<'EOF'
docs: capture todo - [title]

Area: [area]
EOF
)"
```

Confirm: "Committed: docs: capture todo - [title]"


### Step: confirm


```
Todo saved: ./todos/pending/[filename]

[title]
Area: [area]
Files: [count] referenced

---

Would you like to:

1. Continue with current work
2. Add another todo
3. View all todos (/check-todos.md)

```




## Output


- `./todos/pending/[date]-[slug].md`
- Updated `.github/STATE.md` (if exists)


## Anti Patterns


- Don't create todos for work in current plan (that's deviation rule territory)
- Don't create elaborate solution sections — captures ideas, not plans
- Don't block on missing information — "TBD" is fine


## Success criteria


- [ ] Directory structure exists
- [ ] Todo file created with valid frontmatter
- [ ] Problem section has enough context for future Copilot
- [ ] No duplicates (checked and resolved)
- [ ] Area consistent with existing todos
- [ ] .github/STATE.md updated if exists
- [ ] Todo and state committed to git

```
