---
name: ":debug"
description: "Systematic debugging with persistent state across context resets"
tools: ["read/readFile", "execute/runInTerminal", "runSubagent"]
---

## Objective


Debug issues using scientific method with subagent isolation.

**Orchestrator role:** Gather symptoms, spawn debugger agent, handle checkpoints, spawn continuations.

**Why subagent:** Investigation burns context fast (reading files, forming hypotheses, testing). Fresh 200k context per investigation. Main context stays lean for user interaction.


## Context


User's issue: $ARGUMENTS

Check for active sessions:

```bash
ls ./debug/*.md 2>/dev/null | grep -v resolved | head -5
```



## Process



## 0. Resolve Model Profile

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .github/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

**Model lookup table:**

| Agent        | quality | balanced | budget |
| ------------ | ------- | -------- | ------ |
| debugger | opus    | sonnet   | sonnet |

Store resolved model for use in Task calls below.

## 1. Check Active Sessions

If active sessions exist AND no $ARGUMENTS:

- List sessions with status, hypothesis, next action
- User picks number to resume OR describes new issue

If $ARGUMENTS provided OR user describes new issue:

- Continue to symptom gathering

## 2. Gather Symptoms (if new issue)

Use HumanAgent MCP (HumanAgent_Chat) for each:

1. **Expected behavior** - What should happen?
2. **Actual behavior** - What happens instead?
3. **Error messages** - Any errors? (paste or describe)
4. **Timeline** - When did this start? Ever worked?
5. **Reproduction** - How do you trigger it?

After all gathered, confirm ready to investigate.

## 3. Spawn debugger Agent

Fill prompt and spawn:

```markdown
## Objective


Investigate issue: {slug}

**Summary:** {trigger}


## Symptoms


expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}


## Mode


symptoms_prefilled: true
goal: find_and_fix


## Debug File


Create: ./debug/{slug}.md

```

```
Task(
  prompt=filled_prompt,
  subagent_type="debugger",
  model="{debugger_model}",
  description="Debug {slug}"
)
```

## 4. Handle Agent Return

**If `## ROOT CAUSE FOUND`:**

- Display root cause and evidence summary
- Offer options:
  - "Fix now" - spawn fix subagent
  - "Plan fix" - suggest /plan-phase.md --gaps
  - "Manual fix" - done

**If `## CHECKPOINT REACHED`:**

- Present checkpoint details to user
- Get user response
- Spawn continuation agent (see step 5)

**If `## INVESTIGATION INCONCLUSIVE`:**

- Show what was checked and eliminated
- Offer options:
  - "Continue investigating" - spawn new agent with additional context
  - "Manual investigation" - done
  - "Add more context" - gather more symptoms, spawn again

## 5. Spawn Continuation Agent (After Checkpoint)

When user responds to checkpoint, spawn fresh agent:

```markdown
## Objective


Continue debugging {slug}. Evidence is in the debug file.


## Prior State


Debug file: @./debug/{slug}.md


## Checkpoint Response


**Type:** {checkpoint_type}
**Response:** {user_response}


## Mode


goal: find_and_fix

```

```
Task(
  prompt=continuation_prompt,
  subagent_type="debugger",
  model="{debugger_model}",
  description="Continue debug {slug}"
)
```



## Success criteria



- [ ] Active sessions checked
- [ ] Symptoms gathered (if new)
- [ ] debugger spawned with context
- [ ] Checkpoints handled correctly
- [ ] Root cause confirmed before fixing
      
