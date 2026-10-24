# Security

PMCAS is a development-stage local consultant tool. No supported production release, authentication or tenant isolation is established. Do not expose it to the public Internet with client data.

## Report a vulnerability

GitHub private vulnerability reporting is enabled for this repository. Use [the Security advisories page](https://github.com/magedtahaaa/pmcas/security/advisories) and select **Report a vulnerability** while signed in to GitHub. Reports are private to the repository security workflow. Do not post vulnerabilities, credentials or client information in public issues. If the private reporting option is unavailable, do not publish sensitive details in an issue.

Include affected versions, impact and a minimal reproduction using synthetic data. Maged Taha is the primary maintainer; no response or remediation SLA is promised. No stable version currently receives a separate maintenance guarantee.

Use fresh local database credentials, never seed client databases, and never commit actual environment files or client exports. Dependency alerts and secret protection are enabled in the repository; they do not replace code review and testing.
