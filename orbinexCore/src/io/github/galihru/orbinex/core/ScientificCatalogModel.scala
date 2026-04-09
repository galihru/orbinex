package io.github.galihru.orbinex.core

final case class Citation(
    id: String,
    authors: String,
    year: Int,
    title: String,
    journal: String,
    doi: String,
    q1: Boolean = true
)

final case class ObjectProfile(
    name: String,
    category: String,
    subtype: String,
    status: String,
    massKg: Option[Double],
    radiusM: Option[Double],
    meanTempK: Option[Double],
    rotationHours: Option[Double],
    revolutionDays: Option[Double],
    description: String,
    citationIds: Seq[String]
)

trait ScientificCatalog:
  def profileFor(name: String): ObjectProfile
  def citationsFor(name: String): Seq[Citation]
  def allCitations: Seq[Citation]
  def profileCount: Int
  def hasProfile(name: String): Boolean
