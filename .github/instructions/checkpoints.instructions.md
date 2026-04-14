---
description: "Checkpoint protocols for plan execution - when to pause for human verification or decisions"
applyTo: "**/*.md,**/PLAN.md"
---
> **NOTE:** This file contains project-specific path/framework assumptions (`projectSpecific`) and examples like `src/`, `app/api`, `package.json`, `vercel`, `xcodebuild`, `Next.js`, `React`. Update these references to match your project before reuse.


## Overview


Plans execute autonomously. Checkpoints formalize the interaction points where human verification or decisions are needed.

**Core principle:** Copilot automates everything with CLI/API. Checkpoints are for verification and decisions, not manual work.

**Golden rules:**

1. **If Copilot can run it, Copilot runs it** - Never ask user to execute CLI commands, start servers, or run builds
2. **Copilot sets up the verification environment** - Start dev servers, seed databases, configure env vars
3. **User only does what requires human judgment** - Visual checks, UX evaluation, "does this feel right?"
4. **Secrets come from user, automation comes from Copilot** - Ask for API keys, then Copilot uses them via CLI
   

## Checkpoint Types



## Type


## checkpoint:human-verify (Most Common - 90%)
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


**When:** Copilot completed automated work, human confirms it works correctly.

**Use for:**

- Visual UI checks (layout, styling, responsiveness)
- Interactive flows (click through wizard, test user flows)
- Functional verification (feature works as expected)
- Audio/video playback quality
- Animation smoothness
- Accessibility testing

**Structure:**

```xml
<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

[What Copilot automated and deployed/built]
  ## How To Verify


    [Exact steps to test - URLs, commands, expected behavior]
  
  ## Resume Signal

[How to continue - "approved", "yes", or describe issues]

```

**Key elements:**

- `## What Built

`: What Copilot automated (deployed, built, configured)
- `## How To Verify

`: Exact steps to confirm it works (numbered, specific)
- `## Resume Signal

`: Clear indication of how to continue

**Example: Vercel Deployment**

```xml
<task type="auto">
  ## Name

Deploy to Vercel
  ## Files

.vercel/, vercel.json
  ## Action

Run `vercel --yes` to create project and deploy. Capture deployment URL from output.
  ## Verify

vercel ls shows deployment, curl {url} returns 200
  ## Done

App deployed, URL captured


<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Deployed to Vercel at https://myapp-abc123.vercel.app
  ## How To Verify


    Visit https://myapp-abc123.vercel.app and confirm:
    - Homepage loads without errors
    - Login form is visible
    - No console errors in browser DevTools
  
  ## Resume Signal

Type "approved" to continue, or describe issues to fix

```

**Example: UI Component**

```xml
<task type="auto">
  ## Name

Build responsive dashboard layout
  ## Files

src/components/Dashboard.tsx, src/app/dashboard/page.tsx
  ## Action

Create dashboard with sidebar, header, and content area. Use Tailwind responsive classes for mobile.
  ## Verify

npm run build succeeds, no TypeScript errors
  ## Done

Dashboard component builds without errors


<task type="auto">
  ## Name

Start dev server for verification
  ## Action

Run `npm run dev` in background, wait for "ready" message, capture port
  ## Verify

curl http://localhost:3000 returns 200
  ## Done

Dev server running at http://localhost:3000


<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Responsive dashboard layout - dev server running at http://localhost:3000
  ## How To Verify


    Visit http://localhost:3000/dashboard and verify:
    1. Desktop (>1024px): Sidebar left, content right, header top
    2. Tablet (768px): Sidebar collapses to hamburger menu
    3. Mobile (375px): Single column layout, bottom nav appears
    4. No layout shift or horizontal scroll at any size
  
  ## Resume Signal

Type "approved" or describe layout issues

```

**Key pattern:** Copilot starts the dev server BEFORE the checkpoint. User only needs to visit the URL.

**Example: Xcode Build**

```xml
<task type="auto">
  ## Name

Build macOS app with Xcode
  ## Files

App.xcodeproj, Sources/
  ## Action

Run `xcodebuild -project App.xcodeproj -scheme App build`. Check for compilation errors in output.
  ## Verify

Build output contains "BUILD SUCCEEDED", no errors
  ## Done

App builds successfully


<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Built macOS app at DerivedData/Build/Products/Debug/App.app
  ## How To Verify


    Open App.app and test:
    - App launches without crashes
    - Menu bar icon appears
    - Preferences window opens correctly
    - No visual glitches or layout issues
  
  ## Resume Signal

Type "approved" or describe issues

```



## Type


> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

## checkpoint:decision (9%)

**When:** Human must make choice that affects implementation direction.

**Use for:**

- Technology selection (which auth provider, which database)
- Architecture decisions (monorepo vs separate repos)
- Design choices (color scheme, layout approach)
- Feature prioritization (which variant to build)
- Data model decisions (schema structure)

**Structure:**

```xml
<task type="checkpoint:decision" gate="blocking">
  ## Decision

[What's being decided]
  ## Context

[Why this decision matters]
  ## Options


    <option id="option-a">
      ## Name

[Option name]
      ## Pros

[Benefits]
      ## Cons

[Tradeoffs]
    
    <option id="option-b">
      ## Name

[Option name]
      ## Pros

[Benefits]
      ## Cons

[Tradeoffs]
    
  
  ## Resume Signal

[How to indicate choice]

```

**Key elements:**

- `## Decision

`: What's being decided
- `## Context

`: Why this matters
- `## Options

`: Each option with balanced pros/cons (not prescriptive)
- `## Resume Signal

`: How to indicate choice

**Example: Auth Provider Selection**

```xml
<task type="checkpoint:decision" gate="blocking">
  ## Decision

Select authentication provider
  ## Context


    Need user authentication for the app. Three solid options with different tradeoffs.
  
  ## Options


    <option id="supabase">
      ## Name

Supabase Auth
      ## Pros

Built-in with Supabase DB we're using, generous free tier, row-level security integration
      ## Cons

Less customizable UI, tied to Supabase ecosystem
    
    <option id="clerk">
      ## Name

Clerk
      ## Pros

Beautiful pre-built UI, best developer experience, excellent docs
      ## Cons

Paid after 10k MAU, vendor lock-in
    
    <option id="nextauth">
      ## Name

NextAuth.js
      ## Pros

Free, self-hosted, maximum control, widely adopted
      ## Cons

More setup work, you manage security updates, UI is DIY
    
  
  ## Resume Signal

Select: supabase, clerk, or nextauth

```

**Example: Database Selection**

```xml
<task type="checkpoint:decision" gate="blocking">
  ## Decision

Select database for user data
  ## Context


    App needs persistent storage for users, sessions, and user-generated content.
    Expected scale: 10k users, 1M records first year.
  
  ## Options


    <option id="supabase">
      ## Name

Supabase (Postgres)
      ## Pros

Full SQL, generous free tier, built-in auth, real-time subscriptions
      ## Cons

Vendor lock-in for real-time features, less flexible than raw Postgres
    
    <option id="planetscale">
      ## Name

PlanetScale (MySQL)
      ## Pros

Serverless scaling, branching workflow, excellent DX
      ## Cons

MySQL not Postgres, no foreign keys in free tier
    
    <option id="convex">
      ## Name

Convex
      ## Pros

Real-time by default, TypeScript-native, automatic caching
      ## Cons

Newer platform, different mental model, less SQL flexibility
    
  
  ## Resume Signal

Select: supabase, planetscale, or convex

```



> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

## Type


## checkpoint:human-action (1% - Rare)

**When:** Action has NO CLI/API and requires human-only interaction, OR Copilot hit an authentication gate during automation.

**Use ONLY for:**

- **Authentication gates** - Copilot tried to use CLI/API but needs credentials to continue (this is NOT a failure)
- Email verification links (account creation requires clicking email)
- SMS 2FA codes (phone verification)
- Manual account approvals (platform requires human review before API access)
- Credit card 3D Secure flows (web-based payment authorization)
- OAuth app approvals (some platforms require web-based approval)

**Do NOT use for pre-planned manual work:**

- Manually deploying to Vercel (use `vercel` CLI - auth gate if needed)
- Manually creating Stripe webhooks (use Stripe API - auth gate if needed)
- Manually creating databases (use provider CLI - auth gate if needed)
- Running builds/tests manually (use Bash tool)
- Creating files manually (use Write tool)

**Structure:**

```xml
<task type="checkpoint:human-action" gate="blocking">
  ## Action

[What human must do - Copilot already did everything automatable]
  ## Instructions


    [What Copilot already automated]
    [The ONE thing requiring human action]
  
  ## Verification

[What Copilot can check afterward]
  ## Resume Signal

[How to continue]

```

**Key principle:** Copilot automates EVERYTHING possible first, only asks human for the truly unavoidable manual step.

**Example: Email Verification**

```xml
<task type="auto">
  ## Name

Create SendGrid account via API
  ## Action

Use SendGrid API to create subuser account with provided email. Request verification email.
  ## Verify

API returns 201, account created
  ## Done

Account created, verification email sent


<task type="checkpoint:human-action" gate="blocking">
  ## Action

Complete email verification for SendGrid account
  ## Instructions


    I created the account and requested verification email.
    Check your inbox for SendGrid verification link and click it.
  
  ## Verification

SendGrid API key works: curl test succeeds
  ## Resume Signal

Type "done" when email verified

```

**Example: Credit Card 3D Secure**

```xml
<task type="auto">
  ## Name

Create Stripe payment intent
  ## Action

Use Stripe API to create payment intent for $99. Generate checkout URL.
  ## Verify

Stripe API returns payment intent ID and URL
  ## Done

Payment intent created


<task type="checkpoint:human-action" gate="blocking">
  ## Action

Complete 3D Secure authentication
  ## Instructions


    I created the payment intent: https://checkout.stripe.com/pay/cs_test_abc123
    Visit that URL and complete the 3D Secure verification flow with your test card.
  
  ## Verification

Stripe webhook receives payment_intent.succeeded event
  ## Resume Signal

Type "done" when payment completes

```

**Example: Authentication Gate (Dynamic Checkpoint)**

```xml
<task type="auto">
  ## Name

Deploy to Vercel
  ## Files

.vercel/, vercel.json
  ## Action

Run `vercel --yes` to deploy
  ## Verify

vercel ls shows deployment, curl returns 200


<!-- If vercel returns "Error: Not authenticated", Copilot creates checkpoint on the fly -->

<task type="checkpoint:human-action" gate="blocking">
  ## Action

Authenticate Vercel CLI so I can continue deployment
  ## Instructions


    I tried to deploy but got authentication error.
    Run: vercel login
    This will open your browser - complete the authentication flow.
  
  ## Verification

vercel whoami returns your account email
  ## Resume Signal

Type "done" when authenticated


<!-- After authentication, Copilot retries the deployment -->

<task type="auto">
  ## Name

Retry Vercel deployment
  ## Action

Run `vercel --yes` (now authenticated)
  ## Verify

vercel ls shows deployment, curl returns 200

```

**Key distinction:** Authentication gates are created dynamically when Copilot encounters auth errors during automation. They're NOT pre-planned - Copilot tries to automate first, only asks for credentials when blocked.



## Execution Protocol



When Copilot encounters `type="checkpoint:*"`:

1. **Stop immediately** - do not proceed to next task
2. **Display checkpoint clearly** using the format below
3. **Wait for user response** - do not hallucinate completion
4. **Verify if possible** - check files, run tests, whatever is specified
5. **Resume execution** - continue to next task only after confirmation

**For checkpoint:human-verify:**

```
╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: Verification Required                    ║
╚═══════════════════════════════════════════════════════╝

Progress: 5/8 tasks complete
Task: Responsive dashboard layout

Built: Responsive dashboard at /dashboard

How to verify:
  1. Run: npm run dev
  2. Visit: http://localhost:3000/dashboard
  3. Desktop (>1024px): Sidebar visible, content fills remaining space
  4. Tablet (768px): Sidebar collapses to icons
  5. Mobile (375px): Sidebar hidden, hamburger menu appears

────────────────────────────────────────────────────────
→ YOUR ACTION: Type "approved" or describe issues
────────────────────────────────────────────────────────
```

**For checkpoint:decision:**

```
╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: Decision Required                        ║
╚═══════════════════════════════════════════════════════╝

Progress: 2/6 tasks complete
Task: Select authentication provider

Decision: Which auth provider should we use?

Context: Need user authentication. Three options with different tradeoffs.

Options:
  1. supabase - Built-in with our DB, free tier
     Pros: Row-level security integration, generous free tier
     Cons: Less customizable UI, ecosystem lock-in

  2. clerk - Best DX, paid after 10k users
     Pros: Beautiful pre-built UI, excellent documentation
     Cons: Vendor lock-in, pricing at scale

  3. nextauth - Self-hosted, maximum control
     Pros: Free, no vendor lock-in, widely adopted
     Cons: More setup work, DIY security updates

────────────────────────────────────────────────────────
→ YOUR ACTION: Select supabase, clerk, or nextauth
────────────────────────────────────────────────────────
```

**For checkpoint:human-action:**

```
╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: Action Required                          ║
╚═══════════════════════════════════════════════════════╝

Progress: 3/8 tasks complete
Task: Deploy to Vercel

Attempted: vercel --yes
Error: Not authenticated. Please run 'vercel login'

What you need to do:
  1. Run: vercel login
  2. Complete browser authentication when it opens
  3. Return here when done

I'll verify: vercel whoami returns your account

────────────────────────────────────────────────────────
→ YOUR ACTION: Type "done" when authenticated
────────────────────────────────────────────────────────
```



## Authentication Gates



**Critical:** When Copilot tries CLI/API and gets auth error, this is NOT a failure - it's a gate requiring human input to unblock automation.

**Pattern:** Copilot tries automation → auth error → creates checkpoint → you authenticate → Copilot retries → continues

**Gate protocol:**

1. Recognize it's not a failure - missing auth is expected
2. Stop current task - don't retry repeatedly
3. Create checkpoint:human-action dynamically
4. Provide exact authentication steps
5. Verify authentication works
6. Retry the original task
7. Continue normally

**Example execution flow (Vercel auth gate):**

```
Copilot: Running `vercel --yes` to deploy...

Error: Not authenticated. Please run 'vercel login'

╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: Action Required                          ║
╚═══════════════════════════════════════════════════════╝

Progress: 2/8 tasks complete
Task: Deploy to Vercel

Attempted: vercel --yes
Error: Not authenticated

What you need to do:
  1. Run: vercel login
  2. Complete browser authentication

I'll verify: vercel whoami returns your account

────────────────────────────────────────────────────────
→ YOUR ACTION: Type "done" when authenticated
────────────────────────────────────────────────────────

User: done

Copilot: Verifying authentication...
Running: vercel whoami
✓ Authenticated as: user@example.com

Retrying deployment...
Running: vercel --yes
✓ Deployed to: https://myapp-abc123.vercel.app

Task 3 complete. Continuing to task 4...
```

**Key distinction:**

- Pre-planned checkpoint: "I need you to do X" (wrong - Copilot should automate)
- Auth gate: "I tried to automate X but need credentials" (correct - unblocks automation)



## Automation Reference



> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

**The rule:** If it has CLI/API, Copilot does it. Never ask human to perform automatable work.

## Service CLI Reference

| Service     | CLI/API        | Key Commands                              | Auth Gate            |
| ----------- | -------------- | ----------------------------------------- | -------------------- |
| Vercel      | `vercel`       | `--yes`, `env add`, `--prod`, `ls`        | `vercel login`       |
| Railway     | `railway`      | `init`, `up`, `variables set`             | `railway login`      |
| Fly         | `fly`          | `launch`, `deploy`, `secrets set`         | `fly auth login`     |
| Stripe      | `stripe` + API | `listen`, `trigger`, API calls            | API key in .env      |
| Supabase    | `supabase`     | `init`, `link`, `db push`, `gen types`    | `supabase login`     |
| Upstash     | `upstash`      | `redis create`, `redis get`               | `upstash auth login` |
| PlanetScale | `pscale`       | `database create`, `branch create`        | `pscale auth login`  |
| GitHub      | `gh`           | `repo create`, `pr create`, `secret set`  | `gh auth login`      |
| Node        | `npm`/`pnpm`   | `install`, `run build`, `test`, `run dev` | N/A                  |
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

| Xcode       | `xcodebuild`   | `-project`, `-scheme`, `build`, `test`    | N/A                  |
| Convex      | `npx convex`   | `dev`, `deploy`, `env set`, `env get`     | `npx convex login`   |

## Environment Variable Automation

**Env files:** Use Write/Edit tools. Never ask human to create .env manually.

**Dashboard env vars via CLI:**

| Platform | CLI Command             | Example                                    |
| -------- | ----------------------- | ------------------------------------------ |
| Convex   | `npx convex env set`    | `npx convex env set OPENAI_API_KEY sk-...` |
| Vercel   | `vercel env add`        | `vercel env add STRIPE_KEY production`     |
| Railway  | `railway variables set` | `railway variables set API_KEY=value`      |
| Fly      | `fly secrets set`       | `fly secrets set DATABASE_URL=...`         |
| Supabase | `supabase secrets set`  | `supabase secrets set MY_SECRET=value`     |

**Pattern for secret collection:**

```xml
<!-- WRONG: Asking user to add env vars in dashboard -->
<task type="checkpoint:human-action">
  ## Action

Add OPENAI_API_KEY to Convex dashboard
  ## Instructions

Go to dashboard.convex.dev → Settings → Environment Variables → Add


<!-- RIGHT: Copilot asks for value, then adds via CLI -->
<task type="checkpoint:human-action">
  ## Action

Provide your OpenAI API key
  ## Instructions


    I need your OpenAI API key to configure the Convex backend.
    Get it from: https://platform.openai.com/api-keys
    Paste the key (starts with sk-)
  
  ## Verification

I'll add it via `npx convex env set` and verify it's configured
  ## Resume Signal

Paste your API key


<task type="auto">
  ## Name

Configure OpenAI key in Convex
  ## Action

Run `npx convex env set OPENAI_API_KEY {user-provided-key}`
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

  ## Verify

`npx convex env get OPENAI_API_KEY` returns the key (masked)

```

## Dev Server Automation

**Copilot starts servers, user visits URLs:**

| Framework | Start Command                | Ready Signal                   | Default URL           |
| --------- | ---------------------------- | ------------------------------ | --------------------- |
| Next.js   | `npm run dev`                | "Ready in" or "started server" | http://localhost:3000 |
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

| Vite      | `npm run dev`                | "ready in"                     | http://localhost:5173 |
| Convex    | `npx convex dev`             | "Convex functions ready"       | N/A (backend only)    |
| Express   | `npm start`                  | "listening on port"            | http://localhost:3000 |
| Django    | `python manage.py runserver` | "Starting development server"  | http://localhost:8000 |

### Server Lifecycle Protocol

**Starting servers:**

```bash
# Run in background, capture PID for cleanup
npm run dev &
DEV_SERVER_PID=$!

# Wait for ready signal (max 30s)
timeout 30 bash -c 'until curl -s localhost:3000 > /dev/null 2>&1; do sleep 1; done'
```

**Port conflicts:**
If default port is in use, check what's running and either:

1. Kill the existing process if it's stale: `lsof -ti:3000 | xargs kill`
2. Use alternate port: `npm run dev -- --port 3001`

**Server stays running** for the duration of the checkpoint. After user approves, server continues running for subsequent tasks. Only kill explicitly if:

- Plan is complete and no more verification needed
- Switching to production deployment
- Port needed for different service

**Pattern:**

```xml
<!-- Copilot starts server before checkpoint -->
<task type="auto">
  ## Name

Start dev server
  ## Action

Run `npm run dev` in background, wait for ready signal
  ## Verify

curl http://localhost:3000 returns 200
  ## Done

Dev server running


<!-- User only visits URL -->
<task type="checkpoint:human-verify">
  ## What Built

Feature X - dev server running at http://localhost:3000
  ## How To Verify


    Visit http://localhost:3000/feature and verify:
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

    1. [Visual check 1]
    2. [Visual check 2]
  

```

## CLI Installation Handling

**When a required CLI is not installed:**

| CLI           | Auto-install? | Command                                               |
| ------------- | ------------- | ----------------------------------------------------- |
| npm/pnpm/yarn | No - ask user | User chooses package manager                          |
| vercel        | Yes           | `npm i -g vercel`                                     |
| gh (GitHub)   | Yes           | `brew install gh` (macOS) or `apt install gh` (Linux) |
| stripe        | Yes           | `npm i -g stripe`                                     |
| supabase      | Yes           | `npm i -g supabase`                                   |
| convex        | No - use npx  | `npx convex` (no install needed)                      |
| fly           | Yes           | `brew install flyctl` or curl installer               |
| railway       | Yes           | `npm i -g @railway/cli`                               |

**Protocol:**

1. Try the command
2. If "command not found", check if auto-installable
3. If yes: install silently, retry command
4. If no: create checkpoint asking user to install

```xml
<!-- Example: vercel not found -->
<task type="auto">
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

  ## Name

Install Vercel CLI
  ## Action

Run `npm i -g vercel`
  ## Verify

`vercel --version` succeeds
  ## Done

Vercel CLI installed

```

## Pre-Checkpoint Automation Failures

**When setup fails before checkpoint:**

| Failure            | Response                                                           |
| ------------------ | ------------------------------------------------------------------ |
| Server won't start | Check error output, fix issue, retry (don't proceed to checkpoint) |
| Port in use        | Kill stale process or use alternate port                           |
| Missing dependency | Run `npm install`, retry                                           |
| Build error        | Fix the error first (this is a bug, not a checkpoint issue)        |
| Auth error         | Create auth gate checkpoint                                        |
| Network timeout    | Retry with backoff, then checkpoint if persistent                  |

**Key principle:** Never present a checkpoint with broken verification environment. If `curl localhost:3000` fails, don't ask user to "visit localhost:3000".

```xml
<!-- WRONG: Checkpoint with broken environment -->
<task type="checkpoint:human-verify">
  ## What Built

Dashboard (server failed to start)
  ## How To Verify

Visit http://localhost:3000...


<!-- RIGHT: Fix first, then checkpoint -->
<task type="auto">
  ## Name

Fix server startup issue
  ## Action

Investigate error, fix root cause, restart server
  ## Verify

curl http://localhost:3000 returns 200
  ## Done

Server running correctly
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.



<task type="checkpoint:human-verify">
  ## What Built

Dashboard - server running at http://localhost:3000
  ## How To Verify

Visit http://localhost:3000/dashboard...

```

## Quick Reference

| Action                           | Automatable?               | Copilot does it? |
| -------------------------------- | -------------------------- | ----------------- |
| Deploy to Vercel                 | Yes (`vercel`)             | YES               |
| Create Stripe webhook            | Yes (API)                  | YES               |
| Write .env file                  | Yes (Write tool)           | YES               |
| Create Upstash DB                | Yes (`upstash`)            | YES               |
| Run tests                        | Yes (`npm test`)           | YES               |
| Start dev server                 | Yes (`npm run dev`)        | YES               |
| Add env vars to Convex           | Yes (`npx convex env set`) | YES               |
| Add env vars to Vercel           | Yes (`vercel env add`)     | YES               |
| Seed database                    | Yes (CLI/API)              | YES               |
| Click email verification link    | No                         | NO                |
| Enter credit card with 3DS       | No                         | NO                |
| Complete OAuth in browser        | No                         | NO                |
| Visually verify UI looks correct | No                         | NO                |
| Test interactive user flows      | No                         | NO                |



## Writing Guidelines



**DO:**

- Automate everything with CLI/API before checkpoint
- Be specific: "Visit https://myapp.vercel.app" not "check deployment"
- Number verification steps: easier to follow
- State expected outcomes: "You should see X"
- Provide context: why this checkpoint exists
- Make verification executable: clear, testable steps

**DON'T:**

- Ask human to do work Copilot can automate (deploy, create resources, run builds)
- Assume knowledge: "Configure the usual settings" ❌
- Skip steps: "Set up database" ❌ (too vague)
- Mix multiple verifications in one checkpoint (split them)
- Make verification impossible (Copilot can't check visual appearance without user confirmation)

**Placement:**

- **After automation completes** - not before Copilot does the work
- **After UI buildout** - before declaring phase complete
- **Before dependent work** - decisions before implementation
- **At integration points** - after configuring external services

> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

**Bad placement:**

- Before Copilot automates (asking human to do automatable work) ❌
- Too frequent (every other task is a checkpoint) ❌
- Too late (checkpoint is last task, but earlier tasks needed its result) ❌
  

## Examples



### Example 1: Deployment Flow (Correct)

```xml
<!-- Copilot automates everything -->
<task type="auto">
  ## Name

Deploy to Vercel
  ## Files

.vercel/, vercel.json, package.json
  ## Action


    1. Run `vercel --yes` to create project and deploy
    2. Capture deployment URL from output
    3. Set environment variables with `vercel env add`
    4. Trigger production deployment with `vercel --prod`
  
  ## Verify


    - vercel ls shows deployment
    - curl {url} returns 200
    - Environment variables set correctly
  
  ## Done

App deployed to production, URL captured


<!-- Human verifies visual/functional correctness -->
<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Deployed to https://myapp.vercel.app
  ## How To Verify


> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

    Visit https://myapp.vercel.app and confirm:
    - Homepage loads correctly
    - All images/assets load
    - Navigation works
    - No console errors
  
  ## Resume Signal

Type "approved" or describe issues

```

### Example 2: Database Setup (No Checkpoint Needed)

```xml
<!-- Copilot automates everything -->
<task type="auto">
  ## Name

Create Upstash Redis database
  ## Files

.env
  ## Action


    1. Run `upstash redis create myapp-cache --region us-east-1`
    2. Capture connection URL from output
    3. Write to .env: UPSTASH_REDIS_URL={url}
    4. Verify connection with test command
  
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

  ## Verify


    - upstash redis list shows database
    - .env contains UPSTASH_REDIS_URL
    - Test connection succeeds
  
  ## Done

Redis database created and configured


<!-- NO CHECKPOINT NEEDED - Copilot automated everything and verified programmatically -->
```

### Example 3: Stripe Webhooks (Correct)

```xml
<!-- Copilot automates everything -->
<task type="auto">
  ## Name

Configure Stripe webhooks
  ## Files

.env, src/app/api/webhooks/route.ts
  ## Action


    1. Use Stripe API to create webhook endpoint pointing to /api/webhooks
    2. Subscribe to events: payment_intent.succeeded, customer.subscription.updated
    3. Save webhook signing secret to .env
    4. Implement webhook handler in route.ts
  
  ## Verify


    - Stripe API returns webhook endpoint ID
    - .env contains STRIPE_WEBHOOK_SECRET
    - curl webhook endpoint returns 200
  
  ## Done

Stripe webhooks configured and handler implemented

> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


<!-- Human verifies in Stripe dashboard -->
<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Stripe webhook configured via API
  ## How To Verify


    Visit Stripe Dashboard > Developers > Webhooks
    Confirm: Endpoint shows https://myapp.com/api/webhooks with correct events
  
  ## Resume Signal

Type "yes" if correct

```

### Example 4: Full Auth Flow Verification (Correct)

```xml
<task type="auto">
  ## Name

Create user schema
  ## Files

src/db/schema.ts
  ## Action

Define User, Session, Account tables with Drizzle ORM
  ## Verify

npm run db:generate succeeds


<task type="auto">
  ## Name

Create auth API routes
  ## Files

src/app/api/auth/[...nextauth]/route.ts
  ## Action

Set up NextAuth with GitHub provider, JWT strategy
  ## Verify

TypeScript compiles, no errors


<task type="auto">
  ## Name

Create login UI
  ## Files

src/app/login/page.tsx, src/components/LoginButton.tsx
  ## Action

Create login page with GitHub OAuth button
  ## Verify

npm run build succeeds


<task type="auto">
  ## Name

Start dev server for auth testing
  ## Action

Run `npm run dev` in background, wait for ready signal
  ## Verify

curl http://localhost:3000 returns 200
  ## Done

Dev server running at http://localhost:3000


<!-- ONE checkpoint at end verifies the complete flow - Copilot already started server -->
<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Complete authentication flow - dev server running at http://localhost:3000
  ## How To Verify


    1. Visit: http://localhost:3000/login
    2. Click "Sign in with GitHub"
    3. Complete GitHub OAuth flow
    4. Verify: Redirected to /dashboard, user name displayed
    5. Refresh page: Session persists
    6. Click logout: Session cleared
  
  ## Resume Signal

Type "approved" or describe issues

```



## Anti Patterns



### ❌ BAD: Asking user to start dev server

```xml
<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Dashboard component
  ## How To Verify


    1. Run: npm run dev
    2. Visit: http://localhost:3000/dashboard
    3. Check layout is correct
  

```

**Why bad:** Copilot can run `npm run dev`. User should only visit URLs, not execute commands.

### ✅ GOOD: Copilot starts server, user visits

```xml
<task type="auto">
  ## Name

Start dev server
  ## Action

Run `npm run dev` in background
  ## Verify

curl localhost:3000 returns 200


<task type="checkpoint:human-verify" gate="blocking">
  ## What Built

Dashboard at http://localhost:3000/dashboard (server running)
  ## How To Verify


    Visit http://localhost:3000/dashboard and verify:
    1. Layout matches design
    2. No console errors
  

```

### ❌ BAD: Asking user to add env vars in dashboard

```xml
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

<task type="checkpoint:human-action" gate="blocking">
  ## Action

Add environment variables to Convex
  ## Instructions


    1. Go to dashboard.convex.dev
    2. Select your project
    3. Navigate to Settings → Environment Variables
    4. Add OPENAI_API_KEY with your key
  

```

**Why bad:** Convex has `npx convex env set`. Copilot should ask for the key value, then run the CLI command.

### ✅ GOOD: Copilot collects secret, adds via CLI

```xml
<task type="checkpoint:human-action" gate="blocking">
  ## Action

Provide your OpenAI API key
  ## Instructions


> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

    I need your OpenAI API key. Get it from: https://platform.openai.com/api-keys
    Paste the key below (starts with sk-)
  
  ## Verification

I'll configure it via CLI
  ## Resume Signal

Paste your key


<task type="auto">
  ## Name

Add OpenAI key to Convex
  ## Action

Run `npx convex env set OPENAI_API_KEY {key}`
  ## Verify

`npx convex env get` shows OPENAI_API_KEY configured

```

### ❌ BAD: Asking human to deploy

```xml
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

<task type="checkpoint:human-action" gate="blocking">
  ## Action

Deploy to Vercel
  ## Instructions


    1. Visit vercel.com/new
    2. Import Git repository
    3. Click Deploy
    4. Copy deployment URL
  
  ## Verification

Deployment exists
  ## Resume Signal

Paste URL

```

**Why bad:** Vercel has a CLI. Copilot should run `vercel --yes`.

> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

### ✅ GOOD: Copilot automates, human verifies

```xml
<task type="auto">
  ## Name

Deploy to Vercel
  ## Action

Run `vercel --yes`. Capture URL.
  ## Verify

vercel ls shows deployment, curl returns 200


<task type="checkpoint:human-verify">
  ## What Built

Deployed to {url}
  ## How To Verify

Visit {url}, check homepage loads
  ## Resume Signal

Type "approved"

```

### ❌ BAD: Too many checkpoints

```xml
<task type="auto">Create schema
<task type="checkpoint:human-verify">Check schema
<task type="auto">Create API route
<task type="checkpoint:human-verify">Check API
<task type="auto">Create UI form
<task type="checkpoint:human-verify">Check form
```

**Why bad:** Verification fatigue. Combine into one checkpoint at end.

### ✅ GOOD: Single verification checkpoint

```xml
<task type="auto">Create schema
<task type="auto">Create API route
<task type="auto">Create UI form

<task type="checkpoint:human-verify">
  ## What Built

Complete auth flow (schema + API + UI)
  ## How To Verify

Test full flow: register, login, access protected page
  ## Resume Signal

Type "approved"

> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.

```

### ❌ BAD: Asking for automatable file operations

```xml
<task type="checkpoint:human-action">
  ## Action

Create .env file
  ## Instructions


    1. Create .env in project root
    2. Add: DATABASE_URL=...
    3. Add: STRIPE_KEY=...
  

```

**Why bad:** Copilot has Write tool. This should be `type="auto"`.

### ❌ BAD: Vague verification steps

```xml
<task type="checkpoint:human-verify">
  ## What Built

Dashboard
  ## How To Verify

Check it works
  ## Resume Signal

Continue

```

**Why bad:** No specifics. User doesn't know what to test or what "works" means.

### ✅ GOOD: Specific verification steps (server already running)

```xml
<task type="checkpoint:human-verify">
  ## What Built

Responsive dashboard - server running at http://localhost:3000
  ## How To Verify


    Visit http://localhost:3000/dashboard and verify:
    1. Desktop (>1024px): Sidebar visible, content area fills remaining space
    2. Tablet (768px): Sidebar collapses to icons
    3. Mobile (375px): Sidebar hidden, hamburger menu in header
    4. No horizontal scroll at any size
  
  ## Resume Signal

Type "approved" or describe layout issues
> **NOTE:** This section contains project-specific assumptions (`projectSpecific`). Update these references to match your project.


```

### ❌ BAD: Asking user to run any CLI command

```xml
<task type="checkpoint:human-action">
  ## Action

Run database migrations
  ## Instructions


    1. Run: npx prisma migrate deploy
    2. Run: npx prisma db seed
    3. Verify tables exist
  

```

**Why bad:** Copilot can run these commands. User should never execute CLI commands.

### ❌ BAD: Asking user to copy values between services

```xml
<task type="checkpoint:human-action">
  ## Action

Configure webhook URL in Stripe
  ## Instructions


    1. Copy the deployment URL from terminal
    2. Go to Stripe Dashboard → Webhooks
    3. Add endpoint with URL + /api/webhooks
    4. Copy webhook signing secret
    5. Add to .env file
  

```

**Why bad:** Stripe has an API. Copilot should create the webhook via API and write to .env directly.



## Summary



Checkpoints formalize human-in-the-loop points. Use them when Copilot cannot complete a task autonomously OR when human verification is required for correctness.

**The golden rule:** If Copilot CAN automate it, Copilot MUST automate it.

**Checkpoint priority:**

1. **checkpoint:human-verify** (90% of checkpoints) - Copilot automated everything, human confirms visual/functional correctness
2. **checkpoint:decision** (9% of checkpoints) - Human makes architectural/technology choices
3. **checkpoint:human-action** (1% of checkpoints) - Truly unavoidable manual steps with no API/CLI

**When NOT to use checkpoints:**

- Things Copilot can verify programmatically (tests pass, build succeeds)
- File operations (Copilot can read files to verify)
- Code correctness (use tests and static analysis)
- Anything automatable via CLI/API

