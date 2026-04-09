package io.github.galihru.orbinex.core

import scala.math.{Pi, cos, max, pow, sin, sqrt}

object OrbitalFormulas:
  def gravitationalParameter(primaryMassKg: Double, g: Double = PhysicalConstants.G): Double =
    max(0.0, g * primaryMassKg)

  def gravitationalForceMagnitude(
      massAKg: Double,
      massBKg: Double,
      distanceMeters: Double,
      g: Double = PhysicalConstants.G
  ): Double =
    val d = max(distanceMeters, 1e-9)
    g * massAKg * massBKg / (d * d)

  def circularOrbitSpeed(primaryMassKg: Double, orbitalRadiusMeters: Double): Double =
    val r = max(orbitalRadiusMeters, 1.0)
    sqrt(gravitationalParameter(primaryMassKg) / r)

  def orbitalPeriodSeconds(primaryMassKg: Double, semiMajorAxisMeters: Double): Double =
    val a = max(semiMajorAxisMeters, 1.0)
    val mu = max(gravitationalParameter(primaryMassKg), 1e-12)
    2.0 * Pi * sqrt(pow(a, 3) / mu)

  def semiMajorAxisMeters(primaryMassKg: Double, periodSeconds: Double): Double =
    val t = max(periodSeconds, 1.0)
    val mu = max(gravitationalParameter(primaryMassKg), 1e-12)
    cbrt(mu * t * t / (4.0 * Pi * Pi))

  def raDecPcToCartesianMeters(raDeg: Double, decDeg: Double, distanceParsec: Double): Vector3 =
    val ra = raDeg * Pi / 180.0
    val dec = decDeg * Pi / 180.0
    val d = max(distanceParsec, 0.001) * PhysicalConstants.Parsec
    val cosDec = cos(dec)
    Vector3(
      d * cosDec * cos(ra),
      d * sin(dec),
      d * cosDec * sin(ra)
    )

  def estimatePlanetRadiusMeters(planetMassEarth: Double): Double =
    val normalizedMass = max(0.05, planetMassEarth)
    val scale = max(0.55, pow(normalizedMass, 0.29))
    scale * PhysicalConstants.EarthRadius

  private def cbrt(v: Double): Double = pow(v, 1.0 / 3.0)
