package io.github.galihru.orbinex.fetch

import io.github.galihru.orbinex.core.{OrbitalFormulas, PhysicalConstants}
import java.net.{URI, URLEncoder}
import java.nio.charset.StandardCharsets
import scala.collection.mutable.ArrayBuffer
import scala.math.max

final case class ExoplanetRow(
    planetName: String,
    hostName: String,
    raDeg: Double,
    decDeg: Double,
    distancePc: Double,
    semimajorAxisAU: Double,
    orbitalPeriodDays: Double,
    planetMassEarth: Option[Double],
    planetRadiusEarth: Option[Double],
    hostMassSolar: Option[Double],
    hostRadiusSolar: Option[Double]
)

final case class ExoplanetTapConfig(
    endpoint: URI = URI.create("https://exoplanetarchive.ipac.caltech.edu/TAP/sync"),
    table: String = "pscomppars",
    limit: Int = 180,
    columns: Seq[String] = ExoplanetTapConfig.defaultColumns,
    whereClause: Option[String] = Some(
      "sy_dist is not null and ra is not null and dec is not null and pl_orbsmax is not null"
    ),
    format: String = "csv",
    extraQueryParams: Map[String, String] = Map.empty
)

object ExoplanetTapConfig:
  val defaultColumns: Seq[String] = Seq(
    "pl_name",
    "hostname",
    "ra",
    "dec",
    "sy_dist",
    "pl_orbsmax",
    "pl_orbper",
    "pl_bmasse",
    "pl_rade",
    "st_mass",
    "st_rad"
  )

final class ExoplanetTapClient(fetcher: TextFetcher = JavaNetTextFetcher.default):
  def buildSql(config: ExoplanetTapConfig): String =
    val top = max(1, config.limit)
    val selectCols =
      if config.columns.isEmpty then "*"
      else config.columns.mkString(",")

    val where = config.whereClause.map(clause => s" where $clause").getOrElse("")
    s"select top $top $selectCols from ${config.table}$where"

  def buildUri(config: ExoplanetTapConfig): URI =
    val params =
      Map(
        "query" -> buildSql(config),
        "format" -> config.format
      ) ++ config.extraQueryParams

    val query =
      params.toSeq
        .map { case (k, v) => s"${enc(k)}=${enc(v)}" }
        .mkString("&")

    val base = config.endpoint.toString
    val separator = if base.contains("?") then "&" else "?"
    URI.create(base + separator + query)

  def fetchRows(
      config: ExoplanetTapConfig = ExoplanetTapConfig(),
      fetchConfig: FetchConfig = FetchConfig()
  ): Either[FetchError, Seq[ExoplanetRow]] =
    fetcher
      .get(FetchRequest(uri = buildUri(config), accept = "text/csv"), fetchConfig)
      .flatMap(res => parseRows(res.body))

  def estimatedOrbitalPeriodDays(hostMassSolar: Double, semimajorAxisAU: Double): Double =
    val massKg = max(0.08, hostMassSolar) * PhysicalConstants.SolarMass
    val axisMeters = max(0.002, semimajorAxisAU) * PhysicalConstants.AU
    OrbitalFormulas.orbitalPeriodSeconds(massKg, axisMeters) / PhysicalConstants.SecondsPerDay

  private def parseRows(csv: String): Either[FetchError, Seq[ExoplanetRow]] =
    val lines =
      csv
        .split("\\n")
        .toSeq
        .map(_.stripSuffix("\r"))
        .filter(_.trim.nonEmpty)

    if lines.length <= 1 then Right(Seq.empty)
    else
      val header = parseCsvLine(lines.head)
      val idx = header.zipWithIndex.toMap

      def field(row: Vector[String], name: String): String =
        idx.get(name)
          .flatMap(i => if i >= 0 && i < row.length then Some(row(i).trim) else None)
          .getOrElse("")

      def toDoubleOpt(raw: String): Option[Double] =
        val t = raw.trim
        if t.isEmpty || t.equalsIgnoreCase("nan") then None
        else t.toDoubleOption

      val parsed =
        lines.tail
          .map(parseCsvLine)
          .flatMap { row =>
            val maybe =
              for
                ra <- toDoubleOpt(field(row, "ra"))
                dec <- toDoubleOpt(field(row, "dec"))
                dist <- toDoubleOpt(field(row, "sy_dist"))
                sma <- toDoubleOpt(field(row, "pl_orbsmax"))
              yield
                ExoplanetRow(
                  planetName = field(row, "pl_name"),
                  hostName = field(row, "hostname"),
                  raDeg = ra,
                  decDeg = dec,
                  distancePc = dist,
                  semimajorAxisAU = sma,
                  orbitalPeriodDays = toDoubleOpt(field(row, "pl_orbper")).getOrElse(0.0),
                  planetMassEarth = toDoubleOpt(field(row, "pl_bmasse")),
                  planetRadiusEarth = toDoubleOpt(field(row, "pl_rade")),
                  hostMassSolar = toDoubleOpt(field(row, "st_mass")),
                  hostRadiusSolar = toDoubleOpt(field(row, "st_rad"))
                )

            maybe.filter(r => r.planetName.nonEmpty && r.hostName.nonEmpty && r.distancePc > 0.0 && r.semimajorAxisAU > 0.0)
          }
          .sortBy(_.distancePc)

      Right(parsed)

  private def parseCsvLine(line: String): Vector[String] =
    val out = ArrayBuffer.empty[String]
    val cur = new StringBuilder
    var inQuotes = false
    var i = 0

    while i < line.length do
      val ch = line.charAt(i)
      if ch == '"' then
        if inQuotes && i + 1 < line.length && line.charAt(i + 1) == '"' then
          cur.append('"')
          i += 1
        else inQuotes = !inQuotes
      else if ch == ',' && !inQuotes then
        out += cur.toString()
        cur.clear()
      else
        cur.append(ch)
      i += 1

    out += cur.toString()
    out.toVector

  private def enc(value: String): String =
    URLEncoder.encode(value, StandardCharsets.UTF_8.toString)

object ExoplanetTapClient:
  def apply(fetcher: TextFetcher = JavaNetTextFetcher.default): ExoplanetTapClient =
    new ExoplanetTapClient(fetcher)
