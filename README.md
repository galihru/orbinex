# Orbinex Scientific Scala Modules

Orbinex is a modular scientific toolkit extracted from a large astronomy simulation codebase. It is designed for international, research-oriented software projects that need reproducible formulations, configurable data ingestion, and clean API boundaries.

## Module architecture

- `io.github.galihru:orbinex-core_3`
  - Physical constants, vector algebra, orbital mechanics formulas, and scientific catalog interfaces.
- `io.github.galihru:orbinex-fetch_3`
  - Dynamic HTTP ingestion clients for exoplanet TAP data and agency description sources.
- `io.github.galihru:orbinex_3`
  - Unified facade API for core and fetch modules.

## Scientific scope

Orbinex focuses on computational astronomy primitives:

- Newtonian gravitation and derived orbital quantities.
- Coordinate transforms (RA/Dec/parsec to Cartesian meters).
- Deterministic estimation formulas for period/radius fallback scenarios.
- Configurable ingestion of astronomy datasets from dynamic endpoints.

Detailed equations and assumptions are documented in [docs/FORMULATIONS.md](docs/FORMULATIONS.md).

## Installation

Installation methods and dependency coordinates are documented in [docs/INSTALLATION.md](docs/INSTALLATION.md).

## Usage

Usage patterns and API examples are documented in [docs/USAGE.md](docs/USAGE.md).

## Training Website

Interactive tutorial website (RustTraining-inspired layout with runnable cards and terminal lab) is located in [website](website).

Deployment is automated via GitHub Pages workflow on push to `main` when website or docs files change.

## Dependency inventory

Complete dependency inventory is documented in [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md).

## Security

Security model, network safety notes, and operational recommendations are documented in [docs/SECURITY.md](docs/SECURITY.md).

## Community and Governance

- Code of Conduct: [.github/CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md)
- Contributing Guidelines: [CONTRIBUTING.md](CONTRIBUTING.md)
- Security Policy: [.github/SECURITY.md](.github/SECURITY.md)
- Citation Metadata: [CITATION.cff](CITATION.cff)
- Issue Templates: [.github/ISSUE_TEMPLATE](.github/ISSUE_TEMPLATE)
- Pull Request Template: [.github/pull_request_template.md](.github/pull_request_template.md)
- Discussion Template: [.github/DISCUSSION_TEMPLATE/general.yml](.github/DISCUSSION_TEMPLATE/general.yml)

## Automation

- GitHub Packages publish on each push to `main`.
- Sonatype Central publish on release tags (`v*`) or manual dispatch.
- Automated discussion creation on changes to `main`.
- Automated wiki synchronization from `README.md`, `docs/`, and governance docs.
- Automated release creation:
  - `dev-latest` prerelease on each push to `main`
  - stable release on pushed tags matching `v*`
- Automated training website deployment to GitHub Pages.

## License

This module set is released under the MIT License. See [LICENSE](LICENSE).

## References

Scientific references used by the module are documented in [docs/REFERENCES.md](docs/REFERENCES.md).
