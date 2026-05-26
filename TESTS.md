# Tests

## Audit engine coverage
The suite validates the core deterministic rules used to generate recommendations.

- Enterprise downgrade logic
- Duplicate overlapping subscriptions
- API spend optimization
- Free tier recommendation detection
- Non-negative savings output

## Running tests

```bash
npm run test
```

## Notes
The audit engine tests are intentionally focused on business logic rather than UI rendering. This keeps the most important product behavior validated and makes the system easier to maintain.
