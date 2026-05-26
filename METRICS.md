# Metrics

## North Star metric
- Number of audited AI stacks completed per month.

## Input metrics
- Visitor-to-audit start rate
- Audit completion rate
- Report share rate
- Lead capture rate after results

## Instrumentation strategy
- Track page views for `/audit` and `/report/[id]`.
- Capture event when audit is submitted and when lead form is submitted.
- Monitor report share interactions and copy-link clicks.

## Pivot thresholds
- If audit completion rate < 35%, improve form clarity and reduce friction.
- If lead capture rate < 25%, optimize the post-audit email gate and CTA copy.
- If report share rate < 10%, improve the share section and add a clear investor-friendly callout.
