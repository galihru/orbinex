# Dependency Inventory

## Runtime dependencies

Orbinex modules are intentionally lightweight.

- Java standard library (JDK 17+)
  - `java.net.http` for HTTP client transport.
  - `java.time` for timeout and duration handling.
  - `java.util.regex` for extractor patterns.
- Scala 3 standard library
  - Collections and math utilities.

No third-party runtime library is required for the current implementation.

## Build-time dependencies

- Scala 3 compiler toolchain.
- A Scala build runner (Mill or equivalent).

## Optional operational dependencies

- Public data endpoints for dynamic ingestion (for example TAP/CSV/HTML/JSON providers).

## Compatibility notes

- JVM target: Java 17+
- Scala binary target: Scala 3 (`_3` artifacts)
