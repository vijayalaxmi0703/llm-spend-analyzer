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
