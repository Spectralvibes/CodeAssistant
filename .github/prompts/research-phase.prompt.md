---
name: ":research-phase"
description: "Research how to implement a phase (standalone - usually use plan-phase instead)"
tools: ["read/readFile", "execute/runInTerminal", "runSubagent"]
---

## Objective


Research how to implement a phase. Spawns phase-researcher agent with phase context.

**Note:** This is a standalone research command. For most workflows, use `/plan-phase.md` which integrates research automatically.

**Use this command when:**

- You want to research without planning yet
- You want to re-research after planning is complete
- You need to investigate before deciding if a phase is feasible

**Orchestrator role:** Parse phase, validate against roadmap, check existing research, gather context, spawn researcher agent, present results.

**Why subagent:** Research burns context fast (Web Search MCP, Context7 queries, source verification). Fresh 200k context for investigation. Main context stays lean for user interaction.


## Context


Phase number: $ARGUMENTS (required)

Normalize phase input in step 1 before any directory lookups.


## Process



## 0. Resolve Model Profile

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .github/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

**Model lookup table:**

| Agent                | quality | balanced | budget |
| -------------------- | ------- | -------- | ------ |
| phase-researcher | opus    | sonnet   | haiku  |

Store resolved model for use in Task calls below.

## 1. Normalize and Validate Phase

```bash
# Normalize phase number (8 → 08, but preserve decimals like 2.1 → 02.1)
if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]]; then
  PHASE=$(printf "%02d" "$ARGUMENTS")
elif [[ "$ARGUMENTS" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
  PHASE=$(printf "%02d.%s" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}")
else
  PHASE="$ARGUMENTS"
fi

grep -A5 "Phase ${PHASE}:" .github/ROADMAP.md 2>/dev/null
```

**If not found:** Error and exit. **If found:** Extract phase number, name, description.

## 2. Check Existing Research

```bash
ls ./phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

**If exists:** Offer: 1) Update research, 2) View existing, 3) Skip. Wait for response.

**If doesn't exist:** Continue.

## 3. Gather Phase Context

```bash
grep -A20 "Phase ${PHASE}:" .github/ROADMAP.md
cat .github/REQUIREMENTS.md 2>/dev/null
cat ./phases/${PHASE}-*/*-CONTEXT.md 2>/dev/null
grep -A30 "### Decisions Made" .github/STATE.md 2>/dev/null
```

Present summary with phase description, requirements, prior decisions.

## 4. Spawn phase-researcher Agent

Research modes: ecosystem (default), feasibility, implementation, comparison.

```markdown
## Research Type


Phase Research — investigating HOW to implement a specific phase well.


## Key Insight


The question is NOT "which library should I use?"

The question is: "What do I not know that I don't know?"

For this phase, discover:

- What's the established architecture pattern?
- What libraries form the standard stack?
- What problems do people commonly hit?
- What's SOTA vs what Copilot's training thinks is SOTA?
- What should NOT be hand-rolled?
  

## Objective


Research implementation approach for Phase {phase_number}: {phase_name}
Mode: ecosystem


## Context


**Phase description:** {phase_description}
**Requirements:** {requirements_list}
**Prior decisions:** {decisions_if_any}
**Phase context:** {context_md_content}


## Downstream Consumer


Your RESEARCH.md will be loaded by `/plan-phase.md` which uses specific sections:

- `## Standard Stack` → Plans use these libraries
- `## Architecture Patterns` → Task structure follows these
- `## Don't Hand-Roll` → Tasks NEVER build custom solutions for listed problems
- `## Common Pitfalls` → Verification steps check for these
- `## Code Examples` → Task actions reference these patterns

Be prescriptive, not exploratory. "Use X" not "Consider X or Y."


## Quality Gate


Before declaring complete, verify:

- [ ] All domains investigated (not just some)
- [ ] Negative claims verified with official docs
- [ ] Multiple sources for critical claims
- [ ] Confidence levels assigned honestly
- [ ] Section names match what plan-phase expects
      

## Output


Write to: ./phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md

```

```
Task(
  prompt="First, read .github/agents/phase-researcher.agent.md for your role and instructions.\n\n" + filled_prompt,
  subagent_type="general-purpose",
  model="{researcher_model}",
  description="Research Phase {phase}"
)
```

## 5. Handle Agent Return

**`## RESEARCH COMPLETE`:** Display summary, offer: Plan phase, Dig deeper, Review full, Done.

**`## CHECKPOINT REACHED`:** Present to user, get response, spawn continuation.

**`## RESEARCH INCONCLUSIVE`:** Show what was attempted, offer: Add context, Try different mode, Manual.

## 6. Spawn Continuation Agent

```markdown
## Objective


Continue research for Phase {phase_number}: {phase_name}


## Prior State


Research file: @./phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md


## Checkpoint Response


**Type:** {checkpoint_type}
**Response:** {user_response}

```

```
Task(
  prompt="First, read .github/agents/phase-researcher.agent.md for your role and instructions.\n\n" + continuation_prompt,
  subagent_type="general-purpose",
  model="{researcher_model}",
  description="Continue research Phase {phase}"
)
```



## Success criteria



- [ ] Phase validated against roadmap
- [ ] Existing research checked
- [ ] phase-researcher spawned with context
- [ ] Checkpoints handled correctly
- [ ] User knows next steps
      
