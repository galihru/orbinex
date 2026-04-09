package io.github.galihru.orbinex.fetch

import java.net.URI
import java.net.http.{HttpClient, HttpRequest, HttpResponse}
import java.time.Duration

final case class FetchConfig(
    connectTimeout: Duration = Duration.ofSeconds(6),
    readTimeout: Duration = Duration.ofSeconds(12),
    userAgent: String = "orbinex-fetch/0.1.0",
    defaultHeaders: Map[String, String] = Map.empty
)

final case class FetchRequest(
    uri: URI,
    accept: String = "*/*",
    headers: Map[String, String] = Map.empty
)

final case class FetchResponse(
    uri: URI,
    statusCode: Int,
    body: String
)

sealed trait FetchError:
  def message: String
  def cause: Option[Throwable]

object FetchError:
  final case class NetworkFailure(message: String, throwable: Throwable) extends FetchError:
    val cause: Option[Throwable] = Some(throwable)

  final case class HttpFailure(uri: URI, statusCode: Int, bodyPreview: String) extends FetchError:
    val message: String = s"HTTP $statusCode from $uri"
    val cause: Option[Throwable] = None

  final case class InvalidResponse(message: String) extends FetchError:
    val cause: Option[Throwable] = None

trait TextFetcher:
  def get(
      request: FetchRequest,
      config: FetchConfig = FetchConfig()
  ): Either[FetchError, FetchResponse]

final class JavaNetTextFetcher extends TextFetcher:
  override def get(
      request: FetchRequest,
      config: FetchConfig
  ): Either[FetchError, FetchResponse] =
    try
      val client =
        HttpClient
          .newBuilder()
          .connectTimeout(config.connectTimeout)
          .build()

      val builder =
        HttpRequest
          .newBuilder(request.uri)
          .GET()
          .timeout(config.readTimeout)
          .header("Accept", request.accept)
          .header("User-Agent", config.userAgent)

      config.defaultHeaders.foreach { case (k, v) => builder.header(k, v) }
      request.headers.foreach { case (k, v) => builder.header(k, v) }

      val response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString())
      val status = response.statusCode()
      if status / 100 == 2 then
        Right(FetchResponse(request.uri, status, response.body()))
      else
        val preview = response.body().take(400)
        Left(FetchError.HttpFailure(request.uri, status, preview))
    catch
      case e: Throwable =>
        Left(FetchError.NetworkFailure(s"Failed GET ${request.uri}", e))

object JavaNetTextFetcher:
  val default: JavaNetTextFetcher = new JavaNetTextFetcher()
