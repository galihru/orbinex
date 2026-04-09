# Installation

## Platform requirements

- Java Development Kit (JDK) 17 or newer.
- Scala 3.8.x toolchain.
- A build system compatible with Scala 3 (Mill, SBT, or Scala CLI).

## Module coordinates

The canonical artifact identifiers are:

- `io.github.galihru:orbinex-core_3`
- `io.github.galihru:orbinex-fetch_3`
- `io.github.galihru:orbinex_3`

## Source-based installation

Clone this repository and compile modules from source:

```powershell
cd orbinex-modules
```

Then build with your preferred Scala build workflow.

## Dependency usage in downstream projects

Add one or more Orbinex modules to your project dependencies.

Recommended selection:

- Use `orbinex-core` for deterministic scientific formulas only.
- Use `orbinex-fetch` when dynamic remote ingestion is required.
- Use `orbinex` for unified access to all public APIs.

## Versioning policy

- Semantic versioning is used for module versions.
- Patch versions target bug fixes.
- Minor versions add backward-compatible features.
- Major versions may contain API-breaking changes.
