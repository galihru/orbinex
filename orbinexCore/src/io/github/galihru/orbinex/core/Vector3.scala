package io.github.galihru.orbinex.core

import scala.math.sqrt

final case class Vector3(x: Double, y: Double, z: Double):
  def +(other: Vector3): Vector3 = Vector3(x + other.x, y + other.y, z + other.z)
  def -(other: Vector3): Vector3 = Vector3(x - other.x, y - other.y, z - other.z)
  def *(scalar: Double): Vector3 = Vector3(x * scalar, y * scalar, z * scalar)
  def /(scalar: Double): Vector3 = Vector3(x / scalar, y / scalar, z / scalar)

  def dot(other: Vector3): Double = x * other.x + y * other.y + z * other.z

  def cross(other: Vector3): Vector3 =
    Vector3(
      y * other.z - z * other.y,
      z * other.x - x * other.z,
      x * other.y - y * other.x
    )

  def magnitudeSquared: Double = x * x + y * y + z * z
  def magnitude: Double = sqrt(magnitudeSquared)

  def normalized: Vector3 =
    val m = magnitude
    if m <= 1e-15 then Vector3.Zero else this / m

object Vector3:
  val Zero: Vector3 = Vector3(0.0, 0.0, 0.0)
