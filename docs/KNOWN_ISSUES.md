# Known issues and scope

- The recovery baseline showed pending production save controls. After dependency updates, a production response-save scenario displayed success and refreshed 80 → 60 → 80 without manual reload. The exact cause was not isolated; other forms and browsers still need regression coverage.
- This is a reconstructed working baseline. Missing Git objects and absent commit chronology prevent confirmation that it is the latest historical version.
- Import/prioritization helpers include placeholders. No complete spreadsheet intake, AI runtime, advertising integration, authentication, tenant isolation or Arabic/RTL implementation is established by the recovery test.
- Dense criterion current-state fields can appear cramped at narrower content widths. Responsive form layout needs further work.
- Only synthetic local data was exercised. Clean-machine setup, hosted deployment, complete browser coverage and spreadsheet visual QA remain outstanding.
- Regression tests cover representative scoring and CSV cases, not every audit scenario. Missing answers are excluded from score denominators and completion is reported separately. A high partial score is not proof of audit readiness.
- CSV text that could be interpreted as a spreadsheet formula receives a tab prefix. Programmatic text consumers must account for that policy.
- MIT is adopted for original project work. GitHub private vulnerability reporting is enabled. Additional obligations for distributing bundled binaries remain release checks. The repository is a development baseline; no stable production release is claimed.
