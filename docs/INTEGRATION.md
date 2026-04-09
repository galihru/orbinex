# Integration Validation

This module set was integration-tested directly in this workspace with an executable smoke check.

## What was validated

- Core formulas via `Orbinex.formulas.circularOrbitSpeed`.
- Dynamic exoplanet ingestion through `ExoplanetTapClient` with a configurable endpoint.
- Dynamic agency description extraction through `AgencyDescriptionClient` with a configurable URL template.

## Test entry point

- Source: `integration/ProgramIntegrationCheck.scala`

## Runtime result

The integration run completed successfully and printed:

- `[integration] circular speed @1AU = 29785.142 m/s`
- `[integration] exoplanet rows parsed = 2`
- `[integration] agency source hit = Agency Example`
- `[integration] status = SUCCESS`

## Interpretation

Result: the renamed module architecture (`orbinex-core`, `orbinex-fetch`, `orbinex`) is working as expected for formula execution and dynamic fetch workflows.
