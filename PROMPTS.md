# Prompts

## Anthropic audit summary prompt

The application uses Anthropic to generate a concise, founder-friendly summary after deterministic audit logic has already identified savings.

```text
You are a practical SaaS finance analyst. Review the following AI subscription profile and write a concise, founder-friendly summary (about 100 words) that highlights cost drivers, plan fit, and one action item.

Profile:
- [toolKey]: [plan], $[monthlySpend]/month, [seats] seats, use case: [useCase]

Summary:
```

## Prompt decisions
- Kept the prompt factual and grounded with real profile data.
- Asked for a short summary to avoid long-winded AI output.
- Requested a founder-friendly tone for board-ready copy.

## Failed prompt experiments
- Initial prompts that asked for "AI-powered insights" produced less grounded language.
- Prompts that included pricing recommendations in the AI step were removed because the audit engine must remain deterministic.

## Why the final prompt works
The final prompt keeps the AI role narrow: summarize findings, confirm context, and offer one action. This avoids using AI for the actual audit logic while still delivering polished executive copy.
You are a senior product engineer and SaaS UX architect.

I am building a production-quality AI Spend Audit web app for the Credex internship assignment.

IMPORTANT:
Do NOT redesign the entire UI from scratch.
Keep the existing premium dark enterprise SaaS aesthetic.
Keep the current color palette, typography feel, spacing system, glow effects, and layout structure.
ONLY improve the product experience, functionality, audit depth, conversion flow, and polish.

The app must feel like a real Product Hunt launch-ready startup tool.

====================================================
PRIMARY GOAL
====================================================

Transform the current project from a visually good prototype into a fully functional, believable, founder-grade SaaS product that satisfies ALL assignment requirements.

Focus on:
- real product UX
- working flows
- audit credibility
- conversion optimization
- shareability
- backend integration
- production polish
- realistic recommendations
- trustworthy financial reasoning

====================================================
FIX ALL CURRENT ISSUES
====================================================

1. REQUEST OPTIMIZATION ALERTS BUTTON CURRENTLY DOES NOTHING
THIS MUST BE FIXED.

When clicked:
- open a premium modal dialog
- modal must match existing dark gold/blue theme
- smooth animations
- elegant spacing

Modal fields:
- Email (required)
- Company name (optional)
- Role (optional)
- Team size (optional)

Buttons:
- "Send My Audit Report"
- loading state
- success state

After submission:
- save lead to backend database
- generate public audit report id
- send transactional email
- show success toast
- close modal gracefully

For high savings (> $500/month):
show stronger CTA:
"Credex can help reduce these costs further with discounted infrastructure credits."

For low savings:
show:
"Your stack is already relatively optimized. We’ll notify you when new savings opportunities appear."

====================================================
2. COPY SHARE URL BUTTON MUST WORK
====================================================

Current issue:
copy/share buttons appear fake.

Fix:
- generate unique shareable URL for every audit
- URL format:
  /report/[unique-id]

When copy button clicked:
- copy URL to clipboard
- show animated success toast:
  "Share link copied"

Public report page:
- no email/company shown
- only tools, recommendations, savings
- beautiful Open Graph metadata
- Twitter card support
- preview image support

====================================================
3. SHARE BY EMAIL BUTTON MUST WORK
====================================================

Clicking should:
- open email capture modal if email missing
- otherwise send report via transactional email

Use:
- Resend preferred
- fallback supported

Email should contain:
- total savings
- annual savings
- summary
- public report link
- Credex CTA

Design email professionally.

====================================================
4. ADD REAL PER-TOOL AUDIT BREAKDOWN
====================================================

Current audit results are too generic.

Create realistic finance-defensible recommendations.

Each tool card should contain:
- Tool name
- Current plan
- Current spend
- Recommended action
- Savings amount
- Confidence level
- Short reasoning

Examples:
----------------------------------------------------

GitHub Copilot Individual
Current Spend: $120/mo
Recommendation:
Reduce unused seats or migrate inactive users.
Potential Savings: $40/mo
Reason:
"Seat count suggests underutilization relative to reported team size."

Claude Team
Current Spend: $300/mo
Recommendation:
Switch small teams to Claude Pro.
Potential Savings: $120/mo
Reason:
"Team tier economics become inefficient below 5 active users."

OpenAI API
Current Spend: $700/mo
Recommendation:
Use prepaid credits via Credex.
Potential Savings: $180/mo
Reason:
"High-volume API consumption qualifies for discounted infrastructure sourcing."

----------------------------------------------------

Recommendations must feel:
- financially intelligent
- operationally believable
- not AI-generic nonsense

====================================================
5. IMPROVE HERO SAVINGS SECTION
====================================================

Current results page lacks virality.

Create a visually dominant hero section:
- large annual savings
- animated counters
- premium glow effects
- benchmark indicators

Example:
"You could save $4,908/year"

Add:
- efficiency score
- benchmark comparison
- optimization status

Examples:
- "You spend 32% more than teams your size"
- "Lean stack"
- "Moderately overprovisioned"
- "Highly optimized"

Make this section screenshot-worthy for social sharing.

====================================================
6. MAKE AUDIT ENGINE MORE INTELLIGENT
====================================================

Current logic feels shallow.

Implement structured audit rules.

Rules should consider:
- team size
- seat count
- usage category
- plan economics
- overlapping subscriptions
- duplicated capabilities
- API vs subscription inefficiencies

Examples:
----------------------------------------------------

IF:
2 users on Team plan
THEN:
recommend Pro

IF:
Paying for both ChatGPT Team + Claude Team for coding-heavy workflow
THEN:
suggest consolidation

IF:
API spend high
THEN:
recommend credits via Credex

IF:
1 seat but enterprise plan
THEN:
flag overspend

----------------------------------------------------

Logic must feel:
- deterministic
- explainable
- finance-defensible

NOT random AI-generated advice.

====================================================
7. IMPROVE AI SUMMARY QUALITY
====================================================

Current summary is too generic.

Generate:
- personalized
- executive-style
- concise
- realistic
- investor-grade summaries

Should mention:
- biggest inefficiency
- optimization strategy
- operational impact
- annual savings

Must include:
- graceful fallback if API fails
- loading skeletons
- retry handling

====================================================
8. ADD FORM PERSISTENCE
====================================================

Assignment explicitly requires this.

Persist:
- tools
- plans
- spend
- seats
- use case

Use:
- localStorage or indexed persistence

On reload:
restore form automatically.

====================================================
9. ADD LOADING + EMPTY + ERROR STATES
====================================================

Current experience feels static.

Add:
- animated loading states
- audit generation progress
- API error handling
- empty states
- validation messages
- retry states

Examples:
- "Generating optimization report..."
- "Calculating potential savings..."
- "Analyzing subscription overlap..."

====================================================
10. ADD RATE LIMIT / ABUSE PROTECTION
====================================================

Required by assignment.

Implement:
- honeypot field
OR
- simple rate limiting
OR
- hCaptcha

Document implementation clearly.

====================================================
11. ADD MOBILE POLISH
====================================================

Improve:
- spacing
- card stacking
- typography scaling
- button sizing
- modal responsiveness

Must feel premium on mobile.

Lighthouse goals:
- Performance >= 85
- Accessibility >= 90
- Best Practices >= 90

====================================================
12. ADD MICROINTERACTIONS
====================================================

Add subtle:
- hover animations
- card glow
- button feedback
- smooth transitions
- count-up animations
- loading shimmer effects

Keep elegant.
Do NOT overdo animation.

====================================================
13. ADD BETTER CONVERSION FLOW
====================================================

Current CTAs weak.

For high savings:
show:
"Book a Credex consultation"

For medium savings:
show:
"Get optimization alerts"

For low savings:
show:
"Monitor future savings opportunities"

Each state should feel intentional.

====================================================
14. ADD TRUST ELEMENTS
====================================================

Add:
- pricing source references
- audit confidence indicators
- “verified pricing”
- “updated this week”
- security/privacy reassurance

Examples:
"Pricing verified against official vendor sources."

====================================================
15. ADD BENCHMARK INSIGHTS
====================================================

Add intelligent insights like:
- spend per developer
- comparison to typical startups
- optimization percentile

Examples:
"Your AI spend per developer is 28% above benchmark."

====================================================
16. ADD PRODUCTION-QUALITY TOAST SYSTEM
====================================================

Needed for:
- copied URL
- saved report
- email sent
- validation errors
- API failures

Use elegant enterprise SaaS toast design.

====================================================
17. KEEP EXISTING DESIGN LANGUAGE
====================================================

DO NOT:
- replace entire layout
- switch color system
- make it generic
- use template-looking dashboards
- overcomplicate UI

Maintain:
- dark premium SaaS style
- gold accents
- deep navy backgrounds
- enterprise founder aesthetic

====================================================
18. CODE QUALITY REQUIREMENTS
====================================================

Use:
- clean architecture
- reusable components
- proper TypeScript types
- modular audit engine
- scalable folder structure

Add:
- comments only where useful
- clean naming
- maintainable logic

====================================================
19. FINAL PRODUCT FEEL
====================================================

The final experience should feel like:
- a real funded startup product
- believable enough for Product Hunt
- financially trustworthy
- founder-focused
- highly polished
- conversion optimized
- technically mature

It should NOT feel like:
- a student project
- a static template
- fake UI
- placeholder SaaS

====================================================
20. MOST IMPORTANT
====================================================

Every visible button, CTA, and interaction must work.

No dead interactions.
No fake buttons.
No placeholder flows.
No unfinished sections.

Everything should feel operational and intentional.
