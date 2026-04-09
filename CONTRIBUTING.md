# Contributing to Orbinex

Thank you for helping improve Orbinex.

## Before You Start

- Read the project scope in README.md and docs/FORMULATIONS.md.
- Keep scientific assumptions explicit and reproducible.
- Open a Discussion first for large design changes.

## Development Setup

1. Install Java 21.
2. Clone the repository.
3. Run Mill compile checks:

```powershell
.\mill.bat __.compile
```

## Branching and Pull Requests

1. Create a feature branch from main.
2. Make focused commits with clear messages.
3. Add or update tests and docs when behavior changes.
4. Open a Pull Request using the PR template.

## Coding Guidelines

- Keep APIs stable and backwards-compatible when possible.
- Prefer small modules with clear boundaries.
- Document non-trivial scientific equations in docs/FORMULATIONS.md.
- Keep dependency additions minimal and justified.

## Testing and Validation

At minimum, run:

```powershell
.\mill.bat __.compile
```

If your change impacts integrations, validate examples under integration/ and
document the result in the PR.

## Commit Message Guidance

Use concise messages that reflect intent, for example:

- feat: add new orbital fallback strategy
- fix: correct eccentric anomaly computation
- docs: clarify installation with GitHub Packages
- ci: adjust release workflow trigger

## Reporting Bugs and Requesting Features

- Use the issue templates for bug reports and feature requests.
- Use Discussions for open-ended questions and ideas.
- Report vulnerabilities through SECURITY.md guidance.

## License

By contributing, you agree that your contributions are licensed under the same
license as this repository (MIT).
