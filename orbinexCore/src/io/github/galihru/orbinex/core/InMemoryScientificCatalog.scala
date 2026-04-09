package io.github.galihru.orbinex.core

final class InMemoryScientificCatalog private (
    profiles: Map[String, ObjectProfile],
    citations: Map[String, Citation],
    unknownProfile: ObjectProfile
) extends ScientificCatalog:
  override def profileFor(name: String): ObjectProfile =
    profiles.getOrElse(name, unknownProfile.copy(name = name))

  override def citationsFor(name: String): Seq[Citation] =
    val profile = profileFor(name)
    profile.citationIds.flatMap(citations.get)

  override def allCitations: Seq[Citation] =
    citations.values.toSeq.sortBy(c => (c.journal, c.year, c.id))

  override def profileCount: Int = profiles.size

  override def hasProfile(name: String): Boolean = profiles.contains(name)

object InMemoryScientificCatalog:
  def apply(
      profiles: Map[String, ObjectProfile],
      citations: Map[String, Citation],
      unknownProfile: ObjectProfile
  ): InMemoryScientificCatalog =
    new InMemoryScientificCatalog(profiles, citations, unknownProfile)
