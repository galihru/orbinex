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

## Dependency inventory

Complete dependency inventory is documented in [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md).

## Security

Security model, network safety notes, and operational recommendations are documented in [docs/SECURITY.md](docs/SECURITY.md).

## License

This module set is released under the MIT License. See [LICENSE](LICENSE).

## References

Scientific references used by the module are documented in [docs/REFERENCES.md](docs/REFERENCES.md).
