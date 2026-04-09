# Security

## Threat model (module level)

Orbinex supports dynamic remote endpoint ingestion. Therefore, primary risks are:

- Untrusted remote data payloads.
- Excessive response sizes or malformed responses.
- Endpoint misuse via unsafe URL template configuration.
- Overly permissive timeout and retry settings.

## Recommended safeguards

- Use explicit endpoint allowlists in production.
- Set strict connect/read timeouts in `FetchConfig`.
- Configure conservative response handling and validation.
- Sanitize all user-provided query strings before composing templates.
- Log endpoint metadata for traceability and incident response.

## Operational guidance

- Treat remote content as untrusted input.
- Avoid storing secrets in source files.
- Use environment-based secret injection for deployment.
- Pin module versions and review changelogs before upgrades.

## Data governance

- Respect the licensing and terms of each external data provider.
- Keep provenance metadata (source label, query, endpoint URL) when persisting results.

## Disclosure policy

Security issues should be reported privately to project maintainers before public disclosure.
