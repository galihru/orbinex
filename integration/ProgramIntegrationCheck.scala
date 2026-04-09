import io.github.galihru.orbinex.Orbinex
import io.github.galihru.orbinex.fetch.*
import java.net.URI

object ProgramIntegrationCheck:

  private final class DemoFetcher extends TextFetcher:
    private val sampleCsv =
      """pl_name,hostname,ra,dec,sy_dist,pl_orbsmax,pl_orbper,pl_bmasse,pl_rade,st_mass,st_rad
        |Orbinex-b,Star-A,10.0,20.0,15.5,0.72,220.0,5.2,1.8,1.1,1.0
        |Orbinex-c,Star-B,11.0,21.0,20.0,1.10,330.0,7.5,2.1,0.9,0.95
        |""".stripMargin

    override def get(
        request: FetchRequest,
        config: FetchConfig
    ): Either[FetchError, FetchResponse] =
      val uri = request.uri.toString

      if uri.contains("format=csv") then
        Right(FetchResponse(request.uri, 200, sampleCsv))
      else if uri.contains("agency.example") then
        Right(
          FetchResponse(
            request.uri,
            200,
            """<html><head><meta name="description" content="Agency dataset confirms calibrated observational summary for this target." /></head><body></body></html>"""
          )
        )
      else
        Left(FetchError.InvalidResponse(s"No demo payload configured for URI: $uri"))

  def main(args: Array[String]): Unit =
    println("[integration] Orbinex module smoke check")

    val orbitalSpeed =
      Orbinex.formulas.circularOrbitSpeed(
        primaryMassKg = Orbinex.constants.SolarMass,
        orbitalRadiusMeters = Orbinex.constants.AU
      )
    println(f"[integration] circular speed @1AU = $orbitalSpeed%.3f m/s")

    val fetcher = new DemoFetcher

    val exoplanetClient = Orbinex.exoplanetClient(fetcher)
    val rowsResult = exoplanetClient.fetchRows(
      ExoplanetTapConfig(
        endpoint = URI.create("https://dynamic.example.org/tap/sync"),
        limit = 5
      )
    )

    rowsResult match
      case Right(rows) =>
        println(s"[integration] exoplanet rows parsed = ${rows.size}")
        if rows.size != 2 then
          throw new IllegalStateException(s"Expected 2 rows, got ${rows.size}")
      case Left(err) =>
        throw new IllegalStateException(s"Exoplanet client failed: ${err.message}")

    val agencyClient = Orbinex.agencyClient(fetcher)
    val agencyResult = agencyClient.fetchFirst(
      queryCandidates = Seq("Andromeda Galaxy"),
      sources = Seq(
        AgencySource(
          label = "Agency Example",
          urlTemplate = "https://agency.example/search?q={query}",
          accept = "text/html",
          extractor = ResponseExtractor.HtmlMetaDescription,
          minimumLength = 20
        )
      )
    )

    agencyResult match
      case Right(Some(hit)) =>
        println(s"[integration] agency source hit = ${hit.source}")
      case Right(None) =>
        throw new IllegalStateException("Agency client returned no hit")
      case Left(err) =>
        throw new IllegalStateException(s"Agency client failed: ${err.message}")

    println("[integration] status = SUCCESS")
