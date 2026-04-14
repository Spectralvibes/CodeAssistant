---
description: "Configuration options for ./ directory behavior and planning settings"
applyTo: "**/.github/config.json,./**"
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Planning config



Configuration options for `./` directory behavior.

> **Convention:** All generated planning docs and workflow references must remain under `.github/` only. Do not create new planning artifacts at repository root.

## Config Schema



```json
"planning": {
  "commit_docs": true,
  "search_gitignored": false
},
"git": {
  "branching_strategy": "none",
  "phase_branch_template": "/phase-{phase}-{slug}",
  "milestone_branch_template": "/{milestone}-{slug}"
}
```

| Option                          | Default                      | Description                                                   |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `commit_docs`                   | `true`                       | Whether to commit planning artifacts to git                   |
| `search_gitignored`             | `false`                      | Add `--no-ignore` to broad rg searches                        |
| `planning_root`                 | `".github"`                | Keep generated planning docs and workflow artifacts under `.github` only |
| `git.branching_strategy`        | `"none"`                     | Git branching approach: `"none"`, `"phase"`, or `"milestone"` |
| `git.phase_branch_template`     | `"/phase-{phase}-{slug}"` | Branch template for phase strategy                            |
| `git.milestone_branch_template` | `"/{milestone}-{slug}"`   | Branch template for milestone strategy                        |



## Commit Docs Behavior



**When `commit_docs: true` (default):**

- Planning files committed normally
- SUMMARY.md, .github/STATE.md, .github/ROADMAP.md tracked in git
- Full history of planning decisions preserved

**When `commit_docs: false`:**

- Skip all `git add`/`git commit` for `./` files
- User must add `./` to `.gitignore`
- Useful for: OSS contributions, client projects, keeping planning private

**Checking the config:**

```bash
# Check .github/config.json first
COMMIT_DOCS=$(cat .github/config.json 2>/dev/null | grep -o '"commit_docs"[[:space:]]*:[[:space:]]*[^,}]*' | grep -o 'true\|false' || echo "true")

# Auto-detect gitignored (overrides config)
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

git check-ignore -q . 2>/dev/null && COMMIT_DOCS=false
```

**Auto-detection:** If `./` is gitignored, `commit_docs` is automatically `false` regardless of .github/config.json. This prevents git errors when users have `./` in `.gitignore`.

**Conditional git operations:**

```bash
if [ "$COMMIT_DOCS" = "true" ]; then
  git add .github/STATE.md
  git commit -m "docs: update state"
fi
```



## Search Behavior



**When `search_gitignored: false` (default):**

- Standard rg behavior (respects .gitignore)
- Direct path searches work: `rg "pattern" ./` finds files
- Broad searches skip gitignored: `rg "pattern"` skips `./`

**When `search_gitignored: true`:**

- Add `--no-ignore` to broad rg searches that should include `./`
- Only needed when searching entire repo and expecting `./` matches

**Note:** Most  operations use direct file reads or explicit paths, which work regardless of gitignore status.



## Setup Uncommitted Mode



To use uncommitted mode:

1. **Set config:**

   ```json
   "planning": {
     "commit_docs": false,
     "search_gitignored": true
   }
   ```

2. **Add to .gitignore:**

   ```
   ./
   ```

3. **Existing tracked files:** If `./` was previously tracked:
   ```bash
   git rm -r --cached ./
   git commit -m "chore: stop tracking planning docs"
   ```



## Branching Strategy Behavior



**Branching Strategies:**

| Strategy    | When branch created                   | Branch scope     | Merge point             |
| ----------- | ------------------------------------- | ---------------- | ----------------------- |
| `none`      | Never                                 | N/A              | N/A                     |
| `phase`     | At `execute-phase` start              | Single phase     | User merges after phase |
| `milestone` | At first `execute-phase` of milestone | Entire milestone | At `complete-milestone` |

**When `git.branching_strategy: "none"` (default):**

- All work commits to current branch
- Standard  behavior

**When `git.branching_strategy: "phase"`:**

- `execute-phase` creates/switches to a branch before execution
- Branch name from `phase_branch_template` (e.g., `/phase-03-authentication`)
- All plan commits go to that branch
- User merges branches manually after phase completion
- `complete-milestone` offers to merge all phase branches

**When `git.branching_strategy: "milestone"`:**

- First `execute-phase` of milestone creates the milestone branch
- Branch name from `milestone_branch_template` (e.g., `/v1.0-mvp`)
- All phases in milestone commit to same branch
- `complete-milestone` offers to merge milestone branch to main

**Template variables:**

| Variable      | Available in              | Description                           |
| ------------- | ------------------------- | ------------------------------------- |
| `{phase}`     | phase_branch_template     | Zero-padded phase number (e.g., "03") |
| `{slug}`      | Both                      | Lowercase, hyphenated name            |
| `{milestone}` | milestone_branch_template | Milestone version (e.g., "v1.0")      |

**Checking the config:**

```bash
# Get branching strategy (default: none)
BRANCHING_STRATEGY=$(cat .github/config.json 2>/dev/null | grep -o '"branching_strategy"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/' || echo "none")

# Get phase branch template
PHASE_BRANCH_TEMPLATE=$(cat .github/config.json 2>/dev/null | grep -o '"phase_branch_template"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/' || echo "/phase-{phase}-{slug}")

# Get milestone branch template
MILESTONE_BRANCH_TEMPLATE=$(cat .github/config.json 2>/dev/null | grep -o '"milestone_branch_template"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/' || echo "/{milestone}-{slug}")
```

**Branch creation:**

```bash
# For phase strategy
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  PHASE_SLUG=$(echo "$PHASE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  BRANCH_NAME=$(echo "$PHASE_BRANCH_TEMPLATE" | sed "s/{phase}/$PADDED_PHASE/g" | sed "s/{slug}/$PHASE_SLUG/g")
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi

# For milestone strategy
if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  MILESTONE_SLUG=$(echo "$MILESTONE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  BRANCH_NAME=$(echo "$MILESTONE_BRANCH_TEMPLATE" | sed "s/{milestone}/$MILESTONE_VERSION/g" | sed "s/{slug}/$MILESTONE_SLUG/g")
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi
```

**Merge options at complete-milestone:**

| Option                     | Git command          | Result                           |
| -------------------------- | -------------------- | -------------------------------- |
| Squash merge (recommended) | `git merge --squash` | Single clean commit per branch   |
| Merge with history         | `git merge --no-ff`  | Preserves all individual commits |
| Delete without merging     | `git branch -D`      | Discard branch work              |
| Keep branches              | (none)               | Manual handling later            |

Squash merge is recommended — keeps main branch history clean while preserving the full development history in the branch (until deleted).

**Use cases:**

| Strategy    | Best for                                                     |
| ----------- | ------------------------------------------------------------ |
| `none`      | Solo development, simple projects                            |
| `phase`     | Code review per phase, granular rollback, team collaboration |
| `milestone` | Release branches, staging environments, PR per version       |




