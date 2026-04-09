# Usage

## 1. Unified facade API

```scala
import io.github.galihru.orbinex.Orbinex

val speed = Orbinex.formulas.circularOrbitSpeed(
  primaryMassKg = Orbinex.constants.SolarMass,
  orbitalRadiusMeters = Orbinex.constants.AU
)
println(f"Circular speed at 1 AU around 1 solar mass: $speed%.2f m/s")
```

## 2. Dynamic Exoplanet TAP ingestion

```scala
import io.github.galihru.orbinex.Orbinex
import io.github.galihru.orbinex.fetch.*
import java.net.URI
import java.time.Duration

val client = Orbinex.exoplanetClient()
val cfg = ExoplanetTapConfig(
  endpoint = URI.create("https://exoplanetarchive.ipac.caltech.edu/TAP/sync"),
  table = "pscomppars",
  limit = 120,
  whereClause = Some("sy_dist is not null and pl_orbsmax is not null")
)

val fetchCfg = FetchConfig(
  connectTimeout = Duration.ofSeconds(6),
  readTimeout = Duration.ofSeconds(12),
  userAgent = "orbinex-user/1.0"
)

val rowsEither = client.fetchRows(cfg, fetchCfg)
```

## 3. Dynamic agency description ingestion

```scala
import io.github.galihru.orbinex.Orbinex
import io.github.galihru.orbinex.fetch.*

val agencyClient = Orbinex.agencyClient()

val customSources = Seq(
  AgencySource(
    label = "Agency Archive",
    urlTemplate = "https://example.org/search?q={query}",
    accept = "text/html",
    extractor = ResponseExtractor.HtmlMetaDescription,
    minimumLength = 24
  )
)

val hit = agencyClient.fetchFirst(
  queryCandidates = Seq("Andromeda Galaxy", "M31"),
  sources = customSources
)
```

## 4. Custom HTTP fetcher (for offline tests)

A custom implementation of `TextFetcher` can be injected to test parsing deterministically without external network calls.

## 5. Numerical reproducibility

For reproducible simulation workflows:

- Pin your Orbinex module version.
- Record endpoint URLs and query templates.
- Record timeout and header settings in experiment metadata.
