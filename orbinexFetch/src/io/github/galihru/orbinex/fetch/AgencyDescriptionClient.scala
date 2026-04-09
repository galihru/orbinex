package io.github.galihru.orbinex.fetch

import java.net.{URI, URLEncoder}
import java.nio.charset.StandardCharsets
import java.util.regex.Pattern

enum ResponseExtractor:
  case PlainText
  case JsonField(field: String)
  case HtmlMetaDescription
  case RegexGroup(regex: String, group: Int)

final case class AgencySource(
    label: String,
    urlTemplate: String,
    accept: String = "text/plain",
    extractor: ResponseExtractor = ResponseExtractor.PlainText,
    minimumLength: Int = 40
)

final case class AgencyDescriptionHit(
    source: String,
    query: String,
    url: URI,
    description: String
)

final class AgencyDescriptionClient(fetcher: TextFetcher = JavaNetTextFetcher.default):
  def fetchFirst(
      queryCandidates: Seq[String],
      sources: Seq[AgencySource],
      fetchConfig: FetchConfig = FetchConfig()
  ): Either[FetchError, Option[AgencyDescriptionHit]] =
    val uniqueQueries = queryCandidates.map(_.trim).filter(_.nonEmpty).distinct
    var lastError: Option[FetchError] = None
    var found: Option[AgencyDescriptionHit] = None

    for
      source <- sources if found.isEmpty
      query <- uniqueQueries if found.isEmpty
    do
      val uri = resolveUri(source.urlTemplate, query)
      fetcher.get(FetchRequest(uri = uri, accept = source.accept), fetchConfig) match
        case Left(err) =>
          lastError = Some(err)
        case Right(response) =>
          val extracted =
            extract(response.body, source.extractor)
              .map(decodeHtmlEntities)
              .map(normalizeSpaces)
              .filter(_.length >= source.minimumLength)

          extracted.foreach { text =>
            found = Some(AgencyDescriptionHit(source.label, query, uri, text))
          }

    found match
      case Some(hit) => Right(Some(hit))
      case None if sources.nonEmpty && uniqueQueries.nonEmpty && lastError.nonEmpty => Left(lastError.get)
      case None => Right(None)

  private def resolveUri(template: String, query: String): URI =
    val encoded = URLEncoder.encode(query, StandardCharsets.UTF_8.toString)
    URI.create(template.replace("{query}", encoded))

  private def extract(content: String, extractor: ResponseExtractor): Option[String] =
    extractor match
      case ResponseExtractor.PlainText => Some(content)
      case ResponseExtractor.JsonField(field) => extractFirstJsonStringField(content, field)
      case ResponseExtractor.HtmlMetaDescription =>
        firstRegexGroup(content, "<meta name=\\\"description\\\" content=\\\"([^\\\"]+)\\\"")
          .orElse(firstRegexGroup(content, "<meta property=\\\"og:description\\\" content=\\\"([^\\\"]+)\\\""))
      case ResponseExtractor.RegexGroup(regex, group) => firstRegexGroup(content, regex, group)

  private def extractFirstJsonStringField(json: String, field: String): Option[String] =
    val pattern =
      Pattern.compile(
        s"\\\"${Pattern.quote(field)}\\\"\\\\s*:\\s*\\\"((?:\\\\.|[^\\\"\\\\])*)\\\"",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
      )
    val m = pattern.matcher(json)
    if m.find() then Some(decodeJsonEscapes(m.group(1))) else None

  private def firstRegexGroup(text: String, regex: String, group: Int = 1): Option[String] =
    val m = Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(text)
    if m.find() then Option(m.group(group)).map(_.trim).filter(_.nonEmpty) else None

  private def normalizeSpaces(text: String): String =
    text.replaceAll("\\s+", " ").trim

  private def decodeHtmlEntities(text: String): String =
    text
      .replace("&amp;", "&")
      .replace("&quot;", "\"")
      .replace("&#39;", "'")
      .replace("&nbsp;", " ")
      .replace("&lt;", "<")
      .replace("&gt;", ">")

  private def decodeJsonEscapes(raw: String): String =
    val out = new StringBuilder
    var i = 0
    while i < raw.length do
      val ch = raw.charAt(i)
      if ch == '\\' && i + 1 < raw.length then
        raw.charAt(i + 1) match
          case '\"' => out.append('"'); i += 2
          case '\\' => out.append('\\'); i += 2
          case '/' => out.append('/'); i += 2
          case 'b' => out.append('\b'); i += 2
          case 'f' => out.append('\f'); i += 2
          case 'n' => out.append(' '); i += 2
          case 'r' => out.append(' '); i += 2
          case 't' => out.append(' '); i += 2
          case 'u' if i + 5 < raw.length =>
            val hex = raw.substring(i + 2, i + 6)
            try out.append(Integer.parseInt(hex, 16).toChar)
            catch case _: Throwable => out.append('?')
            i += 6
          case _ =>
            out.append(raw.charAt(i + 1))
            i += 2
      else
        out.append(ch)
        i += 1
    out.toString

object AgencyDescriptionClient:
  def apply(fetcher: TextFetcher = JavaNetTextFetcher.default): AgencyDescriptionClient =
    new AgencyDescriptionClient(fetcher)

object AgencySourcePresets:
  def nasaEsaJaxaNed: Seq[AgencySource] = Seq(
    AgencySource(
      label = "NASA Image and Video Library",
      urlTemplate = "https://images-api.nasa.gov/search?q={query}&media_type=image&page=1",
      accept = "application/json",
      extractor = ResponseExtractor.JsonField("description"),
      minimumLength = 30
    ),
    AgencySource(
      label = "ESA Search",
      urlTemplate = "https://www.esa.int/esearch?q={query}",
      accept = "text/html",
      extractor = ResponseExtractor.HtmlMetaDescription,
      minimumLength = 30
    ),
    AgencySource(
      label = "JAXA Digital Archives",
      urlTemplate = "https://jda.jaxa.jp/search.php?lang=e&page=1&keyword={query}&library=0&page_pics=20",
      accept = "text/html",
      extractor = ResponseExtractor.RegexGroup("<span class=\\\"caption__txt\\\">(.*?)</span>", 1),
      minimumLength = 12
    ),
    AgencySource(
      label = "NASA/IPAC Extragalactic Database (NED)",
      urlTemplate = "https://ned.ipac.caltech.edu/cgi-bin/objsearch?objname={query}&extend=no&hconst=73&omegam=0.27&omegav=0.73&corr_z=1&of=ascii_bar",
      accept = "text/plain",
      extractor = ResponseExtractor.RegexGroup("(?m)^1\\|(.+)$", 1),
      minimumLength = 12
    )
  )
