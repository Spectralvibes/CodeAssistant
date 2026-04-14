---
name: ":complete-milestone"
description: "Archive completed milestone and prepare for next version"
tools: ["read/readFile", "edit/editFiles", "execute/runInTerminal"]
---

## Objective


Mark milestone {{version}} complete, archive to milestones/, and update .github/ROADMAP.md and .github/REQUIREMENTS.md.

Purpose: Create historical record of shipped version, archive milestone artifacts (roadmap + requirements), and prepare for next milestone.
Output: Milestone archived (roadmap + requirements), .github/PROJECT.md evolved, git tagged.


## Execution context


**Load these files NOW (before proceeding):**

- ../skills/complete-milestone/SKILL.md (main workflow)
- @./templates/milestone-archive.md (archive template)
  

## Context


**Project files:**
- `.github/ROADMAP.md`
- `.github/REQUIREMENTS.md`
- `.github/STATE.md`
- `.github/PROJECT.md`

**User input:**

- Version: {{version}} (e.g., "1.0", "1.1", "2.0")
  

## Process



**Follow complete-milestone.md workflow:**

0. **Check for audit:**
   - Look for `./v{{version}}-MILESTONE-AUDIT.md`
   - If missing or stale: recommend `/audit-milestone.md` first
   - If audit status is `gaps_found`: recommend `/plan-milestone-gaps.md` first
   - If audit status is `passed`: proceed to step 1

   ```markdown
   ## Pre-flight Check

   {If no v{{version}}-MILESTONE-AUDIT.md:}
   ⚠ No milestone audit found. Run `/audit-milestone.md` first to verify
   requirements coverage, cross-phase integration, and E2E flows.

   {If audit has gaps:}
   ⚠ Milestone audit found gaps. Run `/plan-milestone-gaps.md` to create
   phases that close the gaps, or proceed anyway to accept as tech debt.

   {If audit passed:}
   ✓ Milestone audit passed. Proceeding with completion.
   ```

1. **Verify readiness:**
   - Check all phases in milestone have completed plans (SUMMARY.md exists)
   - Present milestone scope and stats
   - Wait for confirmation

2. **Gather stats:**
   - Count phases, plans, tasks
   - Calculate git range, file changes, LOC
   - Extract timeline from git log
   - Present summary, confirm

3. **Extract accomplishments:**
   - Read all phase SUMMARY.md files in milestone range
   - Extract 4-6 key accomplishments
   - Present for approval

4. **Archive milestone:**
   - Create `./milestones/v{{version}}-.github/ROADMAP.md`
   - Extract full phase details from .github/ROADMAP.md
   - Fill milestone-archive.md template
   - Update .github/ROADMAP.md to one-line summary with link

5. **Archive requirements:**
   - Create `./milestones/v{{version}}-.github/REQUIREMENTS.md`
   - Mark all v1 requirements as complete (checkboxes checked)
   - Note requirement outcomes (validated, adjusted, dropped)
   - Delete `.github/REQUIREMENTS.md` (fresh one created for next milestone)

6. **Update .github/PROJECT.md:**
   - Add "Current State" section with shipped version
   - Add "Next Milestone Goals" section
   - Archive previous content in `## Details

` (if v1.1+)

7. **Commit and tag:**
   - Stage: MILESTONES.md, .github/PROJECT.md, .github/ROADMAP.md, .github/STATE.md, archive files
   - Commit: `chore: archive v{{version}} milestone`
   - Tag: `git tag -a v{{version}} -m "[milestone summary]"`
   - Ask about pushing tag

8. **Offer next steps:**
   - `/new-milestone.md` — start next milestone (questioning → research → requirements → roadmap)



## Success criteria



- Milestone archived to `./milestones/v{{version}}-.github/ROADMAP.md`
- Requirements archived to `./milestones/v{{version}}-.github/REQUIREMENTS.md`
- `.github/REQUIREMENTS.md` deleted (fresh for next milestone)
- .github/ROADMAP.md collapsed to one-line entry
- .github/PROJECT.md updated with current state
- Git tag v{{version}} created
- Commit successful
- User knows next steps (including need for fresh requirements)
  

## Critical rules



- **Load workflow first:** Read complete-milestone.md before executing
- **Verify completion:** All phases must have SUMMARY.md files
- **User confirmation:** Wait for approval at verification gates
- **Archive before deleting:** Always create archive files before updating/deleting originals
- **One-line summary:** Collapsed milestone in .github/ROADMAP.md should be single line with link
- **Context efficiency:** Archive keeps .github/ROADMAP.md and .github/REQUIREMENTS.md constant size per milestone
- **Fresh requirements:** Next milestone starts with `/new-milestone.md` which includes requirements definition
  
