---
name: ":update"
description: "Update  to latest version via git pull"
tools: ["read/readFile", "execute/runInTerminal", "web/fetch"]
---

## Objective


Check for  updates, pull if available, and display what changed.

For GitHub Copilot,  is distributed via the repository's `.github/` folder. Updates are pulled via git.


## Process



### Step: check_remote_changes


Fetch remote changes and check for updates:

```bash
git fetch origin
git log HEAD..origin/main --oneline 2>/dev/null | head -20
```

**If no changes:**

```
##  Update

You're already on the latest version.
```

STOP here if already up to date.


### Step: show_changes_and_confirm


**If update available**, show what's new BEFORE updating:

1. Show commit log between current and remote
2. Display preview and ask for confirmation:

```
##  Update Available

### What's New
────────────────────────────────────────────────────────────

{commit log}

────────────────────────────────────────────────────────────

⚠️  **Note:** This will pull the latest changes from the repository.

If you've modified any  files directly, consider:
- Stashing your changes first (`git stash`)
- Or committing your changes before updating
```

Use HumanAgent MCP (HumanAgent_Chat):

- Question: "Proceed with update?"
- Options:
  - "Yes, update now"
  - "No, cancel"

**If user cancels:** STOP here.


### Step: run_update


Pull the latest changes:

```bash
git pull origin main
```

Capture output. If pull fails (conflicts, etc.), show error and suggest resolution.


### Step: display_result


Format completion message:

```
╔═══════════════════════════════════════════════════════════╗
║   Updated Successfully                                  ║
╚═══════════════════════════════════════════════════════════╝

Reload VS Code window to pick up the new agents and prompts.

[View full changelog](https://github.com/glittercowboy/get-stuff-done/blob/main/CHANGELOG.md)
```





## Success criteria



- [ ] Remote changes checked correctly
- [ ] Update skipped if already current
- [ ] Changelog displayed BEFORE update
- [ ] User confirmation obtained
- [ ] Git pull executed successfully
- [ ] Restart reminder shown
      
