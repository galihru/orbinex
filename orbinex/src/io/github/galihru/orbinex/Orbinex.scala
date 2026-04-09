package io.github.galihru.orbinex

import io.github.galihru.orbinex.core.{OrbitalFormulas, PhysicalConstants}
import io.github.galihru.orbinex.fetch.{AgencyDescriptionClient, ExoplanetTapClient, JavaNetTextFetcher, TextFetcher}

object Orbinex:
  val constants: PhysicalConstants.type = PhysicalConstants
  val formulas: OrbitalFormulas.type = OrbitalFormulas

  def exoplanetClient(fetcher: TextFetcher = JavaNetTextFetcher.default): ExoplanetTapClient =
    ExoplanetTapClient(fetcher)

  def agencyClient(fetcher: TextFetcher = JavaNetTextFetcher.default): AgencyDescriptionClient =
    AgencyDescriptionClient(fetcher)
