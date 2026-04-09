export interface EquatorialCoordinateInput {
  rightAscensionDeg: number;
  declinationDeg: number;
  distanceParsec: number;
}

export interface CartesianCoordinate {
  xMeters: number;
  yMeters: number;
  zMeters: number;
}

export interface OrbitSample {
  primaryMassKg: number;
  orbitalRadiusMeters: number;
  circularSpeedMps: number;
  orbitalPeriodSeconds: number;
  orbitalPeriodDays: number;
}

export const constants = Object.freeze({
  gravitationalConstant: 6.6743e-11,
  solarMassKg: 1.98847e30,
  earthMassKg: 5.97219e24,
  earthRadiusMeters: 6.371e6,
  auMeters: 1.495978707e11,
  parsecMeters: 3.085677581491367e16,
  lightYearMeters: 9.4607304725808e15,
  speedOfLightMps: 299792458,
});

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function gravitationalParameter(
  primaryMassKg: number,
  g = constants.gravitationalConstant,
): number {
  assertFinite(primaryMassKg, "primaryMassKg");
  assertFinite(g, "g");
  return Math.max(0, g * primaryMassKg);
}

export function gravitationalForceMagnitude(
  mass1Kg: number,
  mass2Kg: number,
  distanceMeters: number,
): number {
  assertPositiveFinite(mass1Kg, "mass1Kg");
  assertPositiveFinite(mass2Kg, "mass2Kg");
  assertPositiveFinite(distanceMeters, "distanceMeters");

  return (
    (constants.gravitationalConstant * mass1Kg * mass2Kg) /
    (distanceMeters * distanceMeters)
  );
}

export function circularOrbitSpeed(
  primaryMassKg: number,
  orbitalRadiusMeters: number,
): number {
  assertPositiveFinite(primaryMassKg, "primaryMassKg");
  assertPositiveFinite(orbitalRadiusMeters, "orbitalRadiusMeters");

  return Math.sqrt(
    (constants.gravitationalConstant * primaryMassKg) / orbitalRadiusMeters,
  );
}

export function orbitalPeriodFromSemiMajorAxis(
  semiMajorAxisMeters: number,
  primaryMassKg: number,
): number {
  assertPositiveFinite(semiMajorAxisMeters, "semiMajorAxisMeters");
  assertPositiveFinite(primaryMassKg, "primaryMassKg");

  const mu = constants.gravitationalConstant * primaryMassKg;
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisMeters, 3) / mu);
}

export function semiMajorAxisFromOrbitalPeriod(
  orbitalPeriodSeconds: number,
  primaryMassKg: number,
): number {
  assertPositiveFinite(orbitalPeriodSeconds, "orbitalPeriodSeconds");
  assertPositiveFinite(primaryMassKg, "primaryMassKg");

  const mu = constants.gravitationalConstant * primaryMassKg;
  const ratio = (mu * Math.pow(orbitalPeriodSeconds, 2)) / (4 * Math.PI * Math.PI);
  return Math.cbrt(ratio);
}

export function equatorialToCartesian(
  input: EquatorialCoordinateInput,
): CartesianCoordinate {
  assertPositiveFinite(input.distanceParsec, "distanceParsec");

  const raRad = degreesToRadians(input.rightAscensionDeg);
  const decRad = degreesToRadians(input.declinationDeg);
  const distanceMeters = input.distanceParsec * constants.parsecMeters;

  const xMeters = distanceMeters * Math.cos(decRad) * Math.cos(raRad);
  const yMeters = distanceMeters * Math.sin(decRad);
  const zMeters = distanceMeters * Math.cos(decRad) * Math.sin(raRad);

  return {
    xMeters,
    yMeters,
    zMeters,
  };
}

export function estimatePlanetRadiusFallback(
  planetMassEarthUnits: number,
): number {
  assertPositiveFinite(planetMassEarthUnits, "planetMassEarthUnits");

  const scale = Math.max(0.55, Math.pow(planetMassEarthUnits, 0.29));
  return scale * constants.earthRadiusMeters;
}

export function createOrbitSample(
  primaryMassKg: number,
  orbitalRadiusMeters: number,
): OrbitSample {
  const circularSpeedMps = circularOrbitSpeed(primaryMassKg, orbitalRadiusMeters);
  const orbitalPeriodSeconds = orbitalPeriodFromSemiMajorAxis(
    orbitalRadiusMeters,
    primaryMassKg,
  );

  return {
    primaryMassKg,
    orbitalRadiusMeters,
    circularSpeedMps,
    orbitalPeriodSeconds,
    orbitalPeriodDays: orbitalPeriodSeconds / 86400,
  };
}

export function generateSimulationReport(sample: OrbitSample): string {
  return [
    "Orbinex NPM Simulation Report",
    `primaryMassKg=${sample.primaryMassKg.toExponential(6)}`,
    `orbitalRadiusMeters=${sample.orbitalRadiusMeters.toExponential(6)}`,
    `circularSpeedMps=${sample.circularSpeedMps.toFixed(5)}`,
    `orbitalPeriodSeconds=${sample.orbitalPeriodSeconds.toFixed(5)}`,
    `orbitalPeriodDays=${sample.orbitalPeriodDays.toFixed(6)}`,
  ].join("\n");
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type UniverseBodyKind =
  | "star"
  | "planet"
  | "moon"
  | "dwarf"
  | "asteroid"
  | "kuiper"
  | "comet"
  | "meteor"
  | "black-hole"
  | "star-context"
  | "galaxy"
  | "group"
  | "supercluster"
  | "filament"
  | "dark-matter"
  | "dark-energy"
  | "boundary"
  | "oort-marker"
  | "cluster"
  | "nebula"
  | "snr"
  | "hypothesis"
  | "star-online"
  | "exoplanet-online"
  | "other";

export type UniverseBodyStatus =
  | "observed"
  | "inferred"
  | "hypothesis"
  | "observed-online";

export interface UniverseBody {
  name: string;
  kind: UniverseBodyKind;
  massKg: number;
  radiusMeters: number;
  drawRadiusBase: number;
  colorHex: string;
  position: Vector3;
  velocity: Vector3;
  trail: Vector3[];
  trailLimit: number;
  rotationHours: number;
  revolutionDays: number;
  status: UniverseBodyStatus;
  parentName: string | null;
  isHypothesis: boolean;
  compressedVisual: boolean;
  alive: boolean;
  spinAngleRad: number;
}

export interface UniverseSimulationEvent {
  id: number;
  kind: string;
  message: string;
  timeYears: number;
  location: Vector3;
  bodyA: string;
  bodyB: string;
  relSpeedMps: number;
}

export interface UniverseForecast {
  kind: string;
  message: string;
  etaYears: number;
  bodyA: string;
  bodyB: string;
  confidence: number;
}

export interface UniverseRecommendation {
  priority: "critical" | "high" | "medium";
  title: string;
  action: string;
  rationale: string;
  relatedBodies: string[];
}

export interface ExplosionParticle {
  position: Vector3;
  velocity: Vector3;
  lifeSec: number;
  maxLifeSec: number;
  colorHex: string;
}

export interface UniverseCounts {
  majorBodies: number;
  smallBodies: number;
  contextBodies: number;
  allBodies: number;
  terrestrial: number;
  jovian: number;
  dwarf: number;
  moon: number;
  asteroid: number;
  kuiper: number;
  comet: number;
  meteor: number;
  blackHole: number;
  nebula: number;
  galaxy: number;
  onlineCatalog: number;
}

export interface UniverseStepSummary {
  performedSteps: number;
  simulatedSeconds: number;
  yearsElapsed: number;
  bodyCount: number;
  collisionCount: number;
  eventCount: number;
  forecastCount: number;
}

export interface UniverseStateSnapshot {
  yearsElapsed: number;
  simulatedSeconds: number;
  paused: boolean;
  baseDtSeconds: number;
  timeScale: number;
  speedOfLightSimulationMps: number;
  collisionCount: number;
  counts: UniverseCounts;
  latestEvents: UniverseSimulationEvent[];
  latestForecasts: UniverseForecast[];
}

export interface UniverseEngineOptions {
  cUniverse?: number;
  lockPhysicsToRealC?: boolean;
  initialAsteroids?: number;
  initialKuiperObjects?: number;
  initialComets?: number;
  includePlanetNine?: boolean;
  includeHypothesisObjects?: boolean;
  baseDtSeconds?: number;
  timeScale?: number;
  forecastIntervalSeconds?: number;
  seed?: number;
  autoSpawnMeteors?: boolean;
  autoSpawnComets?: boolean;
}

export interface ExoplanetCatalogRow {
  planetName: string;
  hostName: string;
  raDeg: number;
  decDeg: number;
  distPc: number;
  semimajorAxisAU: number;
  orbitalPeriodDays: number;
  planetMassEarth?: number;
  planetRadiusEarth?: number;
  hostMassSolar?: number;
  hostRadiusSolar?: number;
}

interface OnlineOrbitState {
  parentName: string;
  radiusMeters: number;
  omegaRadPerSec: number;
  inclinationRad: number;
  phaseRad: number;
}

const VEC3_ZERO: Vector3 = Object.freeze({ x: 0, y: 0, z: 0 });
const ONE_DAY_SECONDS = 86400;
const ONE_YEAR_SECONDS = 365.25 * ONE_DAY_SECONDS;

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number`);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function vec3(x = 0, y = 0, z = 0): Vector3 {
  return { x, y, z };
}

function cloneVec3(v: Vector3): Vector3 {
  return { x: v.x, y: v.y, z: v.z };
}

function addVec3(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subVec3(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scaleVec3(v: Vector3, k: number): Vector3 {
  return { x: v.x * k, y: v.y * k, z: v.z * k };
}

function dotVec3(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function mag2Vec3(v: Vector3): number {
  return dotVec3(v, v);
}

function magVec3(v: Vector3): number {
  return Math.sqrt(mag2Vec3(v));
}

function normalizeVec3(v: Vector3): Vector3 {
  const m = magVec3(v);
  if (m <= 1e-15) {
    return vec3(0, 0, 0);
  }
  return scaleVec3(v, 1 / m);
}

function cbrtSafe(value: number): number {
  if (value >= 0) {
    return Math.cbrt(value);
  }
  return -Math.cbrt(-value);
}

function toHex(value: number): string {
  const clamped = clamp(Math.round(value), 0, 255);
  return clamped.toString(16).padStart(2, "0");
}

function rgbHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function cloneBody(body: UniverseBody): UniverseBody {
  return {
    ...body,
    position: cloneVec3(body.position),
    velocity: cloneVec3(body.velocity),
    trail: body.trail.map(cloneVec3),
  };
}

class SeededRandom {
  private state: number;

  constructor(seed: number) {
    const normalized = Math.floor(Math.abs(seed)) >>> 0;
    this.state = normalized === 0 ? 0x6d2b79f5 : normalized;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return (this.state + 0.5) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
}

interface OrbitalBodySpec {
  name: string;
  parent: UniverseBody;
  massKg: number;
  radiusMeters: number;
  orbitalRadiusMeters: number;
  orbitalSpeedMps: number;
  phaseRad: number;
  inclinationDeg: number;
  drawRadiusBase: number;
  colorHex: string;
  kind: UniverseBodyKind;
  trailLimit: number;
  rotationHours: number;
  revolutionDays: number;
  status: UniverseBodyStatus;
  parentName: string | null;
  isHypothesis: boolean;
  compressedVisual: boolean;
}

interface MutableUniverseBody extends UniverseBody { }

export class UniverseEngine {
  readonly G = constants.gravitationalConstant;
  readonly AU = constants.auMeters;
  readonly LY = constants.lightYearMeters;
  readonly solarMassKg = constants.solarMassKg;
  readonly earthMassKg = constants.earthMassKg;
  readonly earthRadiusMeters = constants.earthRadiusMeters;
  readonly solarRadiusMeters = 6.9634e8;
  readonly speedOfLightRealMps = constants.speedOfLightMps;

  readonly speedOfLightSimulationMps: number;

  private readonly random: SeededRandom;
  private readonly options: Required<UniverseEngineOptions>;

  private readonly majorBodies: MutableUniverseBody[] = [];
  private readonly smallBodies: MutableUniverseBody[] = [];
  private readonly contextBodies: MutableUniverseBody[] = [];
  private readonly events: UniverseSimulationEvent[] = [];
  private readonly forecasts: UniverseForecast[] = [];
  private readonly explosionParticles: ExplosionParticle[] = [];

  private readonly onlineOrbitStates = new Map<string, OnlineOrbitState>();
  private readonly onlineHostBodies = new Map<string, MutableUniverseBody>();

  private paused = false;
  private simTimeSec = 0;
  private baseDtSec: number;
  private timeScale: number;

  private collisions = 0;
  private meteorCounter = 0;
  private cometCounter = 0;
  private nextEventId = 1;

  private lastForecastUpdateSec = -1;
  private onlineCatalogObjects = 0;
  private readonly supernovaTriggered = new Set<string>();

  constructor(options: UniverseEngineOptions = {}) {
    this.options = {
      cUniverse: options.cUniverse ?? this.speedOfLightRealMps,
      lockPhysicsToRealC: options.lockPhysicsToRealC ?? false,
      initialAsteroids: options.initialAsteroids ?? 280,
      initialKuiperObjects: options.initialKuiperObjects ?? 180,
      initialComets: options.initialComets ?? 32,
      includePlanetNine: options.includePlanetNine ?? true,
      includeHypothesisObjects: options.includeHypothesisObjects ?? true,
      baseDtSeconds: options.baseDtSeconds ?? 22,
      timeScale: options.timeScale ?? 1200,
      forecastIntervalSeconds: options.forecastIntervalSeconds ?? 48 * 3600,
      seed: options.seed ?? 77,
      autoSpawnMeteors: options.autoSpawnMeteors ?? true,
      autoSpawnComets: options.autoSpawnComets ?? true,
    };

    assertPositiveFinite(this.options.cUniverse, "cUniverse");
    assertPositiveFinite(this.options.baseDtSeconds, "baseDtSeconds");
    assertPositiveFinite(this.options.timeScale, "timeScale");
    assertPositiveFinite(this.options.forecastIntervalSeconds, "forecastIntervalSeconds");

    this.speedOfLightSimulationMps = this.options.lockPhysicsToRealC
      ? this.speedOfLightRealMps
      : this.options.cUniverse;
    this.baseDtSec = this.options.baseDtSeconds;
    this.timeScale = this.options.timeScale;
    this.random = new SeededRandom(this.options.seed);

    this.initializeBodies();
    this.initAsteroidBelt(this.options.initialAsteroids);
    this.initKuiperBelt(this.options.initialKuiperObjects);
    this.initComets(this.options.initialComets);

    this.addEvent(
      "info",
      "Universe engine ready. Scientific simulation kernel initialized.",
      vec3(0, 0, 0),
      "system",
      "",
      0,
    );
    this.addEvent(
      "info",
      "Forecast AI active. Collision and accretion monitoring enabled.",
      vec3(0, 0, 0),
      "system",
      "",
      0,
    );
    this.updateForecasts();
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get baseDtSeconds(): number {
    return this.baseDtSec;
  }

  get currentTimeScale(): number {
    return this.timeScale;
  }

  get simulatedSeconds(): number {
    return this.simTimeSec;
  }

  get yearsElapsed(): number {
    return this.simTimeSec / ONE_YEAR_SECONDS;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  togglePaused(): void {
    this.paused = !this.paused;
  }

  setTimeScale(timeScale: number): void {
    assertPositiveFinite(timeScale, "timeScale");
    this.timeScale = timeScale;
  }

  setBaseDtSeconds(baseDtSeconds: number): void {
    assertPositiveFinite(baseDtSeconds, "baseDtSeconds");
    this.baseDtSec = baseDtSeconds;
  }

  getBodies(): UniverseBody[] {
    return this.getAllBodiesMutable().map(cloneBody);
  }

  getMajorBodies(): UniverseBody[] {
    return this.majorBodies.map(cloneBody);
  }

  getSmallBodies(): UniverseBody[] {
    return this.smallBodies.map(cloneBody);
  }

  getContextBodies(): UniverseBody[] {
    return this.contextBodies.map(cloneBody);
  }

  findBodyByName(name: string): UniverseBody | undefined {
    const body = this.findBodyMutable(name);
    return body ? cloneBody(body) : undefined;
  }

  getEvents(limit = 20): UniverseSimulationEvent[] {
    const count = Math.max(0, Math.floor(limit));
    return this.events
      .slice(Math.max(0, this.events.length - count))
      .reverse()
      .map((event) => ({ ...event, location: cloneVec3(event.location) }));
  }

  getForecasts(limit = 14): UniverseForecast[] {
    const count = Math.max(0, Math.floor(limit));
    return this.forecasts.slice(0, count).map((forecast) => ({ ...forecast }));
  }

  getAiRecommendations(limit = 5): UniverseRecommendation[] {
    const recommendations: UniverseRecommendation[] = [];
    const forecastList = this.getForecasts(Math.max(limit * 2, 10));

    for (const forecast of forecastList) {
      const severe =
        forecast.kind.includes("collision") ||
        forecast.kind.includes("accretion") ||
        forecast.kind.includes("supernova") ||
        forecast.kind.includes("impact");
      const priority: UniverseRecommendation["priority"] = severe
        ? forecast.confidence >= 0.75
          ? "critical"
          : "high"
        : "medium";

      let title = "Stability watch";
      let action = "Increase observation cadence for the flagged system pair.";
      if (forecast.kind.includes("supernova")) {
        title = "Supernova contingency";
        action =
          "Advance shielding and trajectory planning for nearby probes before stellar phase change.";
      } else if (forecast.kind.includes("accretion")) {
        title = "Accretion risk";
        action =
          "Apply delta-v windows to move low-mass objects outside predicted capture radii.";
      } else if (forecast.kind.includes("collision") || forecast.kind.includes("impact")) {
        title = "Collision corridor";
        action =
          "Prioritize orbital correction burns along relative-velocity vectors to widen close-approach distance.";
      } else if (forecast.kind.includes("close-pass")) {
        title = "Close pass monitoring";
        action =
          "Monitor encounter geometry and prepare adaptive time-step refinement for the approach interval.";
      }

      recommendations.push({
        priority,
        title,
        action,
        rationale: `${forecast.message} (eta=${forecast.etaYears.toFixed(
          3,
        )} years, confidence=${(forecast.confidence * 100).toFixed(1)}%).`,
        relatedBodies: [forecast.bodyA, forecast.bodyB].filter(Boolean),
      });

      if (recommendations.length >= limit) {
        break;
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: "medium",
        title: "Nominal operation",
        action: "Continue standard simulation cadence and update catalogs periodically.",
        rationale: "No high-risk forecast currently detected.",
        relatedBodies: [],
      });
    }

    return recommendations;
  }

  getCounts(): UniverseCounts {
    const terrestrialSet = new Set(["Merkurius", "Venus", "Bumi", "Mars"]);
    const jovianSet = new Set(["Jupiter", "Saturnus", "Uranus", "Neptunus"]);
    const allBodies = this.getAllBodiesMutable();
    return {
      majorBodies: this.majorBodies.length,
      smallBodies: this.smallBodies.length,
      contextBodies: this.contextBodies.length,
      allBodies: allBodies.length,
      terrestrial: this.majorBodies.filter((body) => terrestrialSet.has(body.name)).length,
      jovian: this.majorBodies.filter((body) => jovianSet.has(body.name)).length,
      dwarf: this.majorBodies.filter((body) => body.kind === "dwarf").length,
      moon: this.majorBodies.filter((body) => body.kind === "moon").length,
      asteroid: this.smallBodies.filter((body) => body.kind === "asteroid").length,
      kuiper: this.smallBodies.filter((body) => body.kind === "kuiper").length,
      comet: this.smallBodies.filter((body) => body.kind === "comet").length,
      meteor: this.smallBodies.filter((body) => body.kind === "meteor").length,
      blackHole: allBodies.filter((body) => body.kind === "black-hole").length,
      nebula: allBodies.filter((body) => body.kind === "nebula" || body.kind === "snr").length,
      galaxy: allBodies.filter((body) => body.kind === "galaxy").length,
      onlineCatalog: this.onlineCatalogObjects,
    };
  }

  getStateSnapshot(): UniverseStateSnapshot {
    return {
      yearsElapsed: this.yearsElapsed,
      simulatedSeconds: this.simTimeSec,
      paused: this.paused,
      baseDtSeconds: this.baseDtSec,
      timeScale: this.timeScale,
      speedOfLightSimulationMps: this.speedOfLightSimulationMps,
      collisionCount: this.collisions,
      counts: this.getCounts(),
      latestEvents: this.getEvents(8),
      latestForecasts: this.getForecasts(8),
    };
  }

  communicationDelaySeconds(nameA: string, nameB: string): number | null {
    const bodyA = this.findBodyMutable(nameA);
    const bodyB = this.findBodyMutable(nameB);
    if (!bodyA || !bodyB) {
      return null;
    }
    return magVec3(subVec3(bodyA.position, bodyB.position)) / this.speedOfLightSimulationMps;
  }

  ingestExoplanetRows(rows: ExoplanetCatalogRow[]): { hostsAdded: number; planetsAdded: number } {
    if (rows.length === 0) {
      this.addEvent(
        "warning",
        "Exoplanet ingestion returned no rows.",
        this.getSun().position,
        "NASA Exoplanet Archive",
        "",
        0,
      );
      return { hostsAdded: 0, planetsAdded: 0 };
    }

    const sortedRows = [...rows]
      .filter((row) =>
        Number.isFinite(row.raDeg) &&
        Number.isFinite(row.decDeg) &&
        Number.isFinite(row.distPc) &&
        Number.isFinite(row.semimajorAxisAU),
      )
      .sort((a, b) => a.distPc - b.distPc)
      .slice(0, 120);

    let hostsAdded = 0;
    let planetsAdded = 0;

    for (const row of sortedRows) {
      const host = this.onlineHostBodies.get(row.hostName) ?? this.createOnlineHostStar(row);
      if (!this.onlineHostBodies.has(row.hostName)) {
        this.onlineHostBodies.set(row.hostName, host);
      }

      if (!this.contextBodies.some((body) => body.name === host.name)) {
        this.contextBodies.push(host);
        hostsAdded += 1;
      }

      if (!this.contextBodies.some((body) => body.name === row.planetName)) {
        this.contextBodies.push(this.createOnlineExoplanet(row, host));
        planetsAdded += 1;
      }
    }

    this.onlineCatalogObjects =
      this.contextBodies.filter((body) => body.kind === "star-online").length +
      this.contextBodies.filter((body) => body.kind === "exoplanet-online").length;

    this.addEvent(
      "ingest",
      `Catalog ingest: hosts added=${hostsAdded}, planets added=${planetsAdded}.`,
      this.getSun().position,
      "NASA Exoplanet Archive",
      "simulation catalog",
      0,
    );
    this.updateForecasts();

    return { hostsAdded, planetsAdded };
  }

  spawnMeteorShower(count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i += 1) {
      this.meteorCounter += 1;
      this.smallBodies.push(this.createMeteor(this.meteorCounter));
    }
    if (safeCount > 0) {
      this.addEvent(
        "meteor-shower",
        `Meteor shower injected (${safeCount} bodies).`,
        this.requireBody("Bumi").position,
        "Meteoroid stream",
        "Solar System",
        0,
      );
    }
  }

  spawnCometWave(count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i += 1) {
      this.cometCounter += 1;
      this.smallBodies.push(this.createComet(this.cometCounter));
    }
    if (safeCount > 0) {
      this.addEvent(
        "comet-wave",
        `Comet wave injected (${safeCount} bodies).`,
        this.getSun().position,
        "Comet reservoir",
        "Inner Solar System",
        0,
      );
    }
  }

  triggerSupernova(name: string): boolean {
    const target = this.findBodyMutable(name);
    if (!target || target.massKg < 8 * this.solarMassKg || this.supernovaTriggered.has(target.name)) {
      return false;
    }

    this.supernovaTriggered.add(target.name);
    this.createExplosion(target.position, rgbHex(255, 180, 120), 6, 460);
    this.spawnDebrisFromImpact(target.position, 40000, 26);
    this.addEvent(
      "supernova",
      `${target.name} entered a supernova phase in the model.`,
      target.position,
      target.name,
      "stellar core",
      0,
    );
    this.updateForecasts();
    return true;
  }

  step(subSteps = 1): UniverseStepSummary {
    const safeSubSteps = Math.max(0, Math.floor(subSteps));
    if (safeSubSteps === 0 || this.paused) {
      return {
        performedSteps: 0,
        simulatedSeconds: this.simTimeSec,
        yearsElapsed: this.yearsElapsed,
        bodyCount: this.getAllBodiesMutable().length,
        collisionCount: this.collisions,
        eventCount: this.events.length,
        forecastCount: this.forecasts.length,
      };
    }

    for (let i = 0; i < safeSubSteps; i += 1) {
      const h = this.baseDtSec * this.timeScale;

      this.integrateMajorBodies(h);
      this.handleMajorBodyCollisions();
      this.integrateSmallBodies(h);
      this.updateContextBodies(h);
      this.updateSpin(h);
      this.handleSmallBodyCollisions();
      this.updateExplosionParticles(h);

      if (this.options.autoSpawnMeteors && this.random.next() < 0.020) {
        this.spawnMeteorShower(1);
      }
      if (this.options.autoSpawnComets && this.random.next() < 0.006) {
        this.spawnCometWave(1);
      }
      if (this.yearsElapsed > 2 && this.random.next() < 0.0002) {
        this.triggerSupernova("Betelgeuse");
      }

      this.simTimeSec += h;
      if (
        this.lastForecastUpdateSec < 0 ||
        this.simTimeSec - this.lastForecastUpdateSec >= this.options.forecastIntervalSeconds
      ) {
        this.updateForecasts();
        this.lastForecastUpdateSec = this.simTimeSec;
      }
    }

    return {
      performedSteps: safeSubSteps,
      simulatedSeconds: this.simTimeSec,
      yearsElapsed: this.yearsElapsed,
      bodyCount: this.getAllBodiesMutable().length,
      collisionCount: this.collisions,
      eventCount: this.events.length,
      forecastCount: this.forecasts.length,
    };
  }

  private initializeBodies(): void {
    const sun = this.makeBody({
      name: "Matahari",
      massKg: 1.98847e30,
      radiusMeters: 6.9634e8,
      drawRadiusBase: 34,
      colorHex: rgbHex(255, 196, 72),
      position: vec3(0, 0, 0),
      velocity: vec3(0, 0, 0),
      kind: "star",
      trailLimit: 3,
      rotationHours: 609.12,
      revolutionDays: 0,
      status: "observed",
      parentName: null,
      isHypothesis: false,
      compressedVisual: false,
    });

    const mercury = this.createOrbitalBody({
      name: "Merkurius",
      parent: sun,
      massKg: 3.3011e23,
      radiusMeters: 2.4397e6,
      orbitalRadiusMeters: 0.3871 * this.AU,
      orbitalSpeedMps: 47360,
      phaseRad: 0.2,
      inclinationDeg: 7,
      drawRadiusBase: 4.5,
      colorHex: rgbHex(169, 168, 162),
      kind: "planet",
      trailLimit: 420,
      rotationHours: 1407.6,
      revolutionDays: 87.97,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const venus = this.createOrbitalBody({
      name: "Venus",
      parent: sun,
      massKg: 4.8675e24,
      radiusMeters: 6.0518e6,
      orbitalRadiusMeters: 0.7233 * this.AU,
      orbitalSpeedMps: 35020,
      phaseRad: 1.5,
      inclinationDeg: 3.4,
      drawRadiusBase: 6,
      colorHex: rgbHex(234, 195, 132),
      kind: "planet",
      trailLimit: 520,
      rotationHours: -5832.5,
      revolutionDays: 224.7,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const earth = this.createOrbitalBody({
      name: "Bumi",
      parent: sun,
      massKg: 5.9722e24,
      radiusMeters: 6.371e6,
      orbitalRadiusMeters: this.AU,
      orbitalSpeedMps: 29780,
      phaseRad: 0,
      inclinationDeg: 0,
      drawRadiusBase: 7,
      colorHex: rgbHex(70, 170, 255),
      kind: "planet",
      trailLimit: 760,
      rotationHours: 23.934,
      revolutionDays: 365.256,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const moon = this.createOrbitalBody({
      name: "Bulan",
      parent: earth,
      massKg: 7.34767309e22,
      radiusMeters: 1.7374e6,
      orbitalRadiusMeters: 384400000,
      orbitalSpeedMps: 1022,
      phaseRad: 0.6,
      inclinationDeg: 5.1,
      drawRadiusBase: 3.2,
      colorHex: rgbHex(228, 228, 228),
      kind: "moon",
      trailLimit: 240,
      rotationHours: 655.7,
      revolutionDays: 27.32,
      status: "observed",
      parentName: "Bumi",
      isHypothesis: false,
      compressedVisual: false,
    });

    const mars = this.createOrbitalBody({
      name: "Mars",
      parent: sun,
      massKg: 6.4171e23,
      radiusMeters: 3.3895e6,
      orbitalRadiusMeters: 1.5237 * this.AU,
      orbitalSpeedMps: 24077,
      phaseRad: 2.2,
      inclinationDeg: 1.85,
      drawRadiusBase: 5.8,
      colorHex: rgbHex(255, 117, 84),
      kind: "planet",
      trailLimit: 900,
      rotationHours: 24.623,
      revolutionDays: 686.98,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const jupiter = this.createOrbitalBody({
      name: "Jupiter",
      parent: sun,
      massKg: 1.89813e27,
      radiusMeters: 6.9911e7,
      orbitalRadiusMeters: 5.2044 * this.AU,
      orbitalSpeedMps: 13070,
      phaseRad: 0.6,
      inclinationDeg: 1.3,
      drawRadiusBase: 12,
      colorHex: rgbHex(215, 176, 127),
      kind: "planet",
      trailLimit: 1250,
      rotationHours: 9.925,
      revolutionDays: 4332.59,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const saturn = this.createOrbitalBody({
      name: "Saturnus",
      parent: sun,
      massKg: 5.6834e26,
      radiusMeters: 5.8232e7,
      orbitalRadiusMeters: 9.5826 * this.AU,
      orbitalSpeedMps: 9680,
      phaseRad: 1.8,
      inclinationDeg: 2.5,
      drawRadiusBase: 10,
      colorHex: rgbHex(224, 199, 135),
      kind: "planet",
      trailLimit: 1450,
      rotationHours: 10.7,
      revolutionDays: 10759.2,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const uranus = this.createOrbitalBody({
      name: "Uranus",
      parent: sun,
      massKg: 8.681e25,
      radiusMeters: 2.5362e7,
      orbitalRadiusMeters: 19.201 * this.AU,
      orbitalSpeedMps: 6800,
      phaseRad: 2.7,
      inclinationDeg: 0.8,
      drawRadiusBase: 8,
      colorHex: rgbHex(150, 220, 220),
      kind: "planet",
      trailLimit: 1600,
      rotationHours: -17.24,
      revolutionDays: 30688.5,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const neptune = this.createOrbitalBody({
      name: "Neptunus",
      parent: sun,
      massKg: 1.02413e26,
      radiusMeters: 2.4622e7,
      orbitalRadiusMeters: 30.047 * this.AU,
      orbitalSpeedMps: 5430,
      phaseRad: 3,
      inclinationDeg: 1.8,
      drawRadiusBase: 8,
      colorHex: rgbHex(90, 135, 255),
      kind: "planet",
      trailLimit: 1800,
      rotationHours: 16.11,
      revolutionDays: 60182,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const io = this.createOrbitalBody({
      name: "Io",
      parent: jupiter,
      massKg: 8.9319e22,
      radiusMeters: 1.8216e6,
      orbitalRadiusMeters: 4.217e8,
      orbitalSpeedMps: 17330,
      phaseRad: 0.3,
      inclinationDeg: 0.04,
      drawRadiusBase: 2.2,
      colorHex: rgbHex(240, 215, 130),
      kind: "moon",
      trailLimit: 220,
      rotationHours: 42.46,
      revolutionDays: 1.769,
      status: "observed",
      parentName: "Jupiter",
      isHypothesis: false,
      compressedVisual: false,
    });

    const europa = this.createOrbitalBody({
      name: "Europa",
      parent: jupiter,
      massKg: 4.7998e22,
      radiusMeters: 1.5608e6,
      orbitalRadiusMeters: 6.711e8,
      orbitalSpeedMps: 13740,
      phaseRad: 1,
      inclinationDeg: 0.47,
      drawRadiusBase: 2,
      colorHex: rgbHex(220, 214, 192),
      kind: "moon",
      trailLimit: 220,
      rotationHours: 85.2,
      revolutionDays: 3.55,
      status: "observed",
      parentName: "Jupiter",
      isHypothesis: false,
      compressedVisual: false,
    });

    const ganymede = this.createOrbitalBody({
      name: "Ganymede",
      parent: jupiter,
      massKg: 1.4819e23,
      radiusMeters: 2.6341e6,
      orbitalRadiusMeters: 1.0704e9,
      orbitalSpeedMps: 10880,
      phaseRad: 1.8,
      inclinationDeg: 0.2,
      drawRadiusBase: 2.4,
      colorHex: rgbHex(202, 191, 170),
      kind: "moon",
      trailLimit: 260,
      rotationHours: 171.7,
      revolutionDays: 7.15,
      status: "observed",
      parentName: "Jupiter",
      isHypothesis: false,
      compressedVisual: false,
    });

    const callisto = this.createOrbitalBody({
      name: "Callisto",
      parent: jupiter,
      massKg: 1.0759e23,
      radiusMeters: 2.4103e6,
      orbitalRadiusMeters: 1.8827e9,
      orbitalSpeedMps: 8200,
      phaseRad: 2.6,
      inclinationDeg: 0.28,
      drawRadiusBase: 2.2,
      colorHex: rgbHex(181, 170, 158),
      kind: "moon",
      trailLimit: 260,
      rotationHours: 400.5,
      revolutionDays: 16.69,
      status: "observed",
      parentName: "Jupiter",
      isHypothesis: false,
      compressedVisual: false,
    });

    const titan = this.createOrbitalBody({
      name: "Titan",
      parent: saturn,
      massKg: 1.3452e23,
      radiusMeters: 2.5747e6,
      orbitalRadiusMeters: 1.2219e9,
      orbitalSpeedMps: 5570,
      phaseRad: 0.9,
      inclinationDeg: 0.35,
      drawRadiusBase: 2.4,
      colorHex: rgbHex(229, 193, 130),
      kind: "moon",
      trailLimit: 290,
      rotationHours: 382.7,
      revolutionDays: 15.95,
      status: "observed",
      parentName: "Saturnus",
      isHypothesis: false,
      compressedVisual: false,
    });

    const rhea = this.createOrbitalBody({
      name: "Rhea",
      parent: saturn,
      massKg: 2.3065e21,
      radiusMeters: 7.638e5,
      orbitalRadiusMeters: 5.271e8,
      orbitalSpeedMps: 8480,
      phaseRad: 1.7,
      inclinationDeg: 0.35,
      drawRadiusBase: 1.8,
      colorHex: rgbHex(215, 210, 205),
      kind: "moon",
      trailLimit: 210,
      rotationHours: 108,
      revolutionDays: 4.52,
      status: "observed",
      parentName: "Saturnus",
      isHypothesis: false,
      compressedVisual: false,
    });

    const iapetus = this.createOrbitalBody({
      name: "Iapetus",
      parent: saturn,
      massKg: 1.8056e21,
      radiusMeters: 7.345e5,
      orbitalRadiusMeters: 3.5608e9,
      orbitalSpeedMps: 3260,
      phaseRad: 2.2,
      inclinationDeg: 15.5,
      drawRadiusBase: 1.8,
      colorHex: rgbHex(182, 165, 145),
      kind: "moon",
      trailLimit: 250,
      rotationHours: 1903,
      revolutionDays: 79.32,
      status: "observed",
      parentName: "Saturnus",
      isHypothesis: false,
      compressedVisual: false,
    });

    const enceladus = this.createOrbitalBody({
      name: "Enceladus",
      parent: saturn,
      massKg: 1.0802e20,
      radiusMeters: 2.521e5,
      orbitalRadiusMeters: 2.3802e8,
      orbitalSpeedMps: 12640,
      phaseRad: 2.8,
      inclinationDeg: 0.02,
      drawRadiusBase: 1.6,
      colorHex: rgbHex(235, 235, 240),
      kind: "moon",
      trailLimit: 180,
      rotationHours: 32.9,
      revolutionDays: 1.37,
      status: "observed",
      parentName: "Saturnus",
      isHypothesis: false,
      compressedVisual: false,
    });

    const ceres = this.createOrbitalBody({
      name: "Ceres",
      parent: sun,
      massKg: 9.393e20,
      radiusMeters: 4.73e5,
      orbitalRadiusMeters: 2.77 * this.AU,
      orbitalSpeedMps: 17900,
      phaseRad: 2,
      inclinationDeg: 10.6,
      drawRadiusBase: 2.4,
      colorHex: rgbHex(190, 192, 195),
      kind: "dwarf",
      trailLimit: 900,
      rotationHours: 9.07,
      revolutionDays: 1680,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const pluto = this.createOrbitalBody({
      name: "Pluto",
      parent: sun,
      massKg: 1.303e22,
      radiusMeters: 1.1883e6,
      orbitalRadiusMeters: 39.48 * this.AU,
      orbitalSpeedMps: 4740,
      phaseRad: 0.7,
      inclinationDeg: 17.2,
      drawRadiusBase: 3,
      colorHex: rgbHex(206, 186, 171),
      kind: "dwarf",
      trailLimit: 1950,
      rotationHours: -153.3,
      revolutionDays: 90560,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const eris = this.createOrbitalBody({
      name: "Eris",
      parent: sun,
      massKg: 1.6466e22,
      radiusMeters: 1.163e6,
      orbitalRadiusMeters: 67.67 * this.AU,
      orbitalSpeedMps: 3430,
      phaseRad: 1.9,
      inclinationDeg: 44,
      drawRadiusBase: 3,
      colorHex: rgbHex(210, 210, 210),
      kind: "dwarf",
      trailLimit: 2150,
      rotationHours: 25.9,
      revolutionDays: 203830,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const haumea = this.createOrbitalBody({
      name: "Haumea",
      parent: sun,
      massKg: 4.006e21,
      radiusMeters: 8.2e5,
      orbitalRadiusMeters: 43.13 * this.AU,
      orbitalSpeedMps: 4520,
      phaseRad: 2.7,
      inclinationDeg: 28.2,
      drawRadiusBase: 2.8,
      colorHex: rgbHex(196, 215, 232),
      kind: "dwarf",
      trailLimit: 2050,
      rotationHours: 3.9,
      revolutionDays: 103410,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const makemake = this.createOrbitalBody({
      name: "Makemake",
      parent: sun,
      massKg: 3.1e21,
      radiusMeters: 7.15e5,
      orbitalRadiusMeters: 45.79 * this.AU,
      orbitalSpeedMps: 4400,
      phaseRad: 1.2,
      inclinationDeg: 29,
      drawRadiusBase: 2.7,
      colorHex: rgbHex(223, 196, 154),
      kind: "dwarf",
      trailLimit: 2050,
      rotationHours: 22.8,
      revolutionDays: 112900,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });

    const major = [
      sun,
      mercury,
      venus,
      earth,
      moon,
      mars,
      jupiter,
      saturn,
      uranus,
      neptune,
      io,
      europa,
      ganymede,
      callisto,
      titan,
      rhea,
      iapetus,
      enceladus,
      ceres,
      pluto,
      eris,
      haumea,
      makemake,
    ];

    if (this.options.includePlanetNine) {
      major.push(
        this.createOrbitalBody({
          name: "Planet Nine?",
          parent: sun,
          massKg: 5 * constants.earthMassKg,
          radiusMeters: 2.8e7,
          orbitalRadiusMeters: 500 * this.AU,
          orbitalSpeedMps: 1260,
          phaseRad: 2.4,
          inclinationDeg: 20,
          drawRadiusBase: 6.3,
          colorHex: rgbHex(170, 130, 255),
          kind: "hypothesis",
          trailLimit: 1500,
          rotationHours: 15,
          revolutionDays: 365 * 10000,
          status: "hypothesis",
          parentName: "Matahari",
          isHypothesis: true,
          compressedVisual: true,
        }),
      );
    }

    this.majorBodies.push(...major);

    const context: MutableUniverseBody[] = [
      this.makeBody({
        name: "Sirius A",
        massKg: 2.063 * this.solarMassKg,
        radiusMeters: 1.711 * this.solarRadiusMeters,
        drawRadiusBase: 10,
        colorHex: rgbHex(205, 230, 255),
        position: vec3(8.6 * this.LY, 0.4 * this.LY, -0.6 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "star-context",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Proxima Centauri",
        massKg: 0.1221 * this.solarMassKg,
        radiusMeters: 0.1542 * this.solarRadiusMeters,
        drawRadiusBase: 8,
        colorHex: rgbHex(255, 160, 120),
        position: vec3(4.2465 * this.LY, -0.2 * this.LY, 0.15 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "star-context",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Betelgeuse",
        massKg: 16.5 * this.solarMassKg,
        radiusMeters: 764 * this.solarRadiusMeters,
        drawRadiusBase: 11,
        colorHex: rgbHex(255, 128, 100),
        position: vec3(548 * this.LY, 6 * this.LY, 11 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "star-context",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Andromeda (M31)",
        massKg: 1.5e12 * this.solarMassKg,
        radiusMeters: 1e21,
        drawRadiusBase: 24,
        colorHex: rgbHex(168, 198, 255),
        position: vec3(-2.537e6 * this.LY, 0.1e6 * this.LY, 0.22e6 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "galaxy",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Grup Lokal",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Bima Sakti",
        massKg: 1.1e12 * this.solarMassKg,
        radiusMeters: 5e20,
        drawRadiusBase: 34,
        colorHex: rgbHex(140, 170, 245),
        position: vec3(-26670 * this.LY, 0, 0),
        velocity: vec3(0, 0, 0),
        kind: "galaxy",
        trailLimit: 0,
        rotationHours: 5.28e8,
        revolutionDays: 0,
        status: "observed",
        parentName: null,
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Sagittarius A*",
        massKg: 4.154e6 * this.solarMassKg,
        radiusMeters: 1.227e10,
        drawRadiusBase: 13,
        colorHex: rgbHex(30, 30, 35),
        position: vec3(-26670 * this.LY, 0, 0),
        velocity: vec3(0, 0, 0),
        kind: "black-hole",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "M87*",
        massKg: 6.5e9 * this.solarMassKg,
        radiusMeters: 1.9e13,
        drawRadiusBase: 11,
        colorHex: rgbHex(25, 22, 30),
        position: vec3(5.38e7 * this.LY, 1.01e7 * this.LY, -0.81e7 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "black-hole",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "M87 Galaxy",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Cygnus X-1",
        massKg: 21.2 * this.solarMassKg,
        radiusMeters: 6.3e4,
        drawRadiusBase: 9,
        colorHex: rgbHex(20, 20, 24),
        position: vec3(6070 * this.LY, 340 * this.LY, -120 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "black-hole",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "TON 618",
        massKg: 6.6e10 * this.solarMassKg,
        radiusMeters: 2e14,
        drawRadiusBase: 12,
        colorHex: rgbHex(35, 24, 40),
        position: vec3(1.04e10 * this.LY, 1.5e9 * this.LY, -2e9 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "black-hole",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Quasar host",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Orion Nebula (M42)",
        massKg: 0,
        radiusMeters: 1.2e17,
        drawRadiusBase: 10,
        colorHex: rgbHex(130, 220, 245),
        position: vec3(1344 * this.LY, 80 * this.LY, -35 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "nebula",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Pleiades (M45)",
        massKg: 0,
        radiusMeters: 2e17,
        drawRadiusBase: 9,
        colorHex: rgbHex(190, 220, 255),
        position: vec3(444 * this.LY, 40 * this.LY, -28 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "cluster",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Bima Sakti",
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Grup Lokal",
        massKg: 0,
        radiusMeters: 1.5e22,
        drawRadiusBase: 23,
        colorHex: rgbHex(160, 210, 255),
        position: vec3(-2.6e6 * this.LY, 0.2e6 * this.LY, -0.1e6 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "group",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: null,
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Laniakea",
        massKg: 0,
        radiusMeters: 1.6e24,
        drawRadiusBase: 18,
        colorHex: rgbHex(255, 170, 120),
        position: vec3(-2.5e8 * this.LY, 4.5e7 * this.LY, 8e7 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "supercluster",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: null,
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Filamen Kosmik",
        massKg: 0,
        radiusMeters: 0,
        drawRadiusBase: 15,
        colorHex: rgbHex(210, 195, 255),
        position: vec3(1.2e9 * this.LY, -1e8 * this.LY, -2e8 * this.LY),
        velocity: vec3(0, 0, 0),
        kind: "filament",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: null,
        isHypothesis: false,
        compressedVisual: true,
      }),
      this.makeBody({
        name: "Heliosfer",
        massKg: 0,
        radiusMeters: 0,
        drawRadiusBase: 5,
        colorHex: rgbHex(95, 175, 255),
        position: vec3(120 * this.AU, 0, 0),
        velocity: vec3(0, 0, 0),
        kind: "boundary",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Matahari",
        isHypothesis: false,
        compressedVisual: false,
      }),
      this.makeBody({
        name: "Heliopause",
        massKg: 0,
        radiusMeters: 0,
        drawRadiusBase: 5,
        colorHex: rgbHex(255, 178, 118),
        position: vec3(150 * this.AU, 0, 0),
        velocity: vec3(0, 0, 0),
        kind: "boundary",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "observed",
        parentName: "Matahari",
        isHypothesis: false,
        compressedVisual: false,
      }),
      this.makeBody({
        name: "Awan Oort",
        massKg: 0,
        radiusMeters: 0,
        drawRadiusBase: 6,
        colorHex: rgbHex(210, 232, 255),
        position: vec3(6000 * this.AU, 0, 0),
        velocity: vec3(0, 0, 0),
        kind: "oort-marker",
        trailLimit: 0,
        rotationHours: 0,
        revolutionDays: 0,
        status: "hypothesis",
        parentName: "Matahari",
        isHypothesis: true,
        compressedVisual: true,
      }),
    ];

    if (this.options.includeHypothesisObjects) {
      context.push(
        this.makeBody({
          name: "Halo Materi Gelap",
          massKg: 0,
          radiusMeters: 0,
          drawRadiusBase: 19,
          colorHex: rgbHex(110, 120, 180),
          position: vec3(-26670 * this.LY, 0, 0),
          velocity: vec3(0, 0, 0),
          kind: "dark-matter",
          trailLimit: 0,
          rotationHours: 0,
          revolutionDays: 0,
          status: "inferred",
          parentName: "Bima Sakti",
          isHypothesis: true,
          compressedVisual: true,
        }),
      );
      context.push(
        this.makeBody({
          name: "Latar Energi Gelap",
          massKg: 0,
          radiusMeters: 0,
          drawRadiusBase: 16,
          colorHex: rgbHex(206, 140, 255),
          position: vec3(-2.2e9 * this.LY, 0.5e9 * this.LY, 0.7e9 * this.LY),
          velocity: vec3(0, 0, 0),
          kind: "dark-energy",
          trailLimit: 0,
          rotationHours: 0,
          revolutionDays: 0,
          status: "inferred",
          parentName: null,
          isHypothesis: true,
          compressedVisual: true,
        }),
      );
    }

    this.contextBodies.push(...context);
  }

  private makeBody(body: Omit<UniverseBody, "trail" | "alive" | "spinAngleRad">): MutableUniverseBody {
    return {
      ...body,
      trail: [],
      alive: true,
      spinAngleRad: 0,
    };
  }

  private createOrbitalBody(spec: OrbitalBodySpec): MutableUniverseBody {
    const incl = degreesToRadians(spec.inclinationDeg);
    const cp = Math.cos(spec.phaseRad);
    const sp = Math.sin(spec.phaseRad);
    const ci = Math.cos(incl);
    const si = Math.sin(incl);

    const relPos = vec3(
      spec.orbitalRadiusMeters * cp,
      spec.orbitalRadiusMeters * sp * ci,
      spec.orbitalRadiusMeters * sp * si,
    );
    const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
    const relVel = scaleVec3(tangent, spec.orbitalSpeedMps);

    return this.makeBody({
      name: spec.name,
      massKg: spec.massKg,
      radiusMeters: spec.radiusMeters,
      drawRadiusBase: spec.drawRadiusBase,
      colorHex: spec.colorHex,
      position: addVec3(spec.parent.position, relPos),
      velocity: addVec3(spec.parent.velocity, relVel),
      kind: spec.kind,
      trailLimit: spec.trailLimit,
      rotationHours: spec.rotationHours,
      revolutionDays: spec.revolutionDays,
      status: spec.status,
      parentName: spec.parentName,
      isHypothesis: spec.isHypothesis,
      compressedVisual: spec.compressedVisual,
    });
  }

  private getAllBodiesMutable(): MutableUniverseBody[] {
    return [...this.majorBodies, ...this.smallBodies, ...this.contextBodies];
  }

  private findBodyMutable(name: string): MutableUniverseBody | undefined {
    const all = this.getAllBodiesMutable();
    return all.find((body) => body.name === name);
  }

  private requireBody(name: string): MutableUniverseBody {
    const body = this.findBodyMutable(name);
    if (!body) {
      throw new Error(`Body not found: ${name}`);
    }
    return body;
  }

  private getSun(): MutableUniverseBody {
    return this.requireBody("Matahari");
  }

  private pushTrail(body: MutableUniverseBody): void {
    if (body.trailLimit <= 0) {
      return;
    }
    body.trail.push(cloneVec3(body.position));
    if (body.trail.length > body.trailLimit) {
      body.trail.splice(0, body.trail.length - body.trailLimit);
    }
  }

  private clampVelocity(body: MutableUniverseBody): void {
    const speed = magVec3(body.velocity);
    const vmax = 0.985 * this.speedOfLightSimulationMps;
    if (speed > vmax) {
      body.velocity = scaleVec3(body.velocity, vmax / speed);
    }
  }

  private integrateMajorBodies(h: number): void {
    const n = this.majorBodies.length;
    const acc: Vector3[] = Array.from({ length: n }, () => vec3(0, 0, 0));

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const bodyI = this.majorBodies[i];
        const bodyJ = this.majorBodies[j];
        const r = subVec3(bodyJ.position, bodyI.position);
        const d = Math.max(magVec3(r), 10000);
        const invD3 = 1 / (d * d * d);
        const ai = scaleVec3(r, this.G * bodyJ.massKg * invD3);
        const aj = scaleVec3(r, -this.G * bodyI.massKg * invD3);
        acc[i] = addVec3(acc[i], ai);
        acc[j] = addVec3(acc[j], aj);
      }
    }

    for (let i = 0; i < n; i += 1) {
      const body = this.majorBodies[i];
      body.velocity = addVec3(body.velocity, scaleVec3(acc[i], h));
      this.clampVelocity(body);
      body.position = addVec3(body.position, scaleVec3(body.velocity, h));
      this.pushTrail(body);
    }
  }

  private integrateSmallBodies(h: number): void {
    for (const body of this.smallBodies) {
      if (!body.alive) {
        continue;
      }

      let acceleration = vec3(0, 0, 0);
      for (const major of this.majorBodies) {
        const r = subVec3(major.position, body.position);
        const d = Math.max(magVec3(r), major.radiusMeters * 0.4);
        acceleration = addVec3(acceleration, scaleVec3(r, this.G * major.massKg / (d * d * d)));
      }

      body.velocity = addVec3(body.velocity, scaleVec3(acceleration, h));
      this.clampVelocity(body);
      body.position = addVec3(body.position, scaleVec3(body.velocity, h));
      this.pushTrail(body);

      if (magVec3(body.position) > 2400 * this.AU) {
        body.alive = false;
      }
    }

    for (let i = this.smallBodies.length - 1; i >= 0; i -= 1) {
      if (!this.smallBodies[i].alive) {
        this.smallBodies.splice(i, 1);
      }
    }
  }

  private handleMajorBodyCollisions(): void {
    const toRemove = new Set<number>();

    for (let i = 0; i < this.majorBodies.length; i += 1) {
      if (toRemove.has(i)) {
        continue;
      }

      for (let j = i + 1; j < this.majorBodies.length; j += 1) {
        if (toRemove.has(j)) {
          continue;
        }

        const a = this.majorBodies[i];
        const b = this.majorBodies[j];
        const d = magVec3(subVec3(a.position, b.position));
        const baseThreshold = (a.radiusMeters + b.radiusMeters) * 0.92;
        const isBHPair = a.kind === "black-hole" || b.kind === "black-hole";
        const threshold = isBHPair ? Math.max(baseThreshold, 0.03 * this.AU) : baseThreshold;

        if (d > threshold) {
          continue;
        }

        const relV = magVec3(subVec3(a.velocity, b.velocity));
        const keepIndex = a.massKg >= b.massKg ? i : j;
        const loseIndex = keepIndex === i ? j : i;
        const keep = this.majorBodies[keepIndex];
        const lose = this.majorBodies[loseIndex];

        const totalMass = keep.massKg + lose.massKg;
        keep.velocity = scaleVec3(
          addVec3(scaleVec3(keep.velocity, keep.massKg), scaleVec3(lose.velocity, lose.massKg)),
          1 / Math.max(totalMass, 1),
        );
        keep.massKg = totalMass;
        keep.radiusMeters = cbrtSafe(
          keep.radiusMeters * keep.radiusMeters * keep.radiusMeters +
          lose.radiusMeters * lose.radiusMeters * lose.radiusMeters,
        );

        const center = scaleVec3(addVec3(keep.position, lose.position), 0.5);
        if (relV > 7500) {
          this.createExplosion(center, rgbHex(255, 190, 120), Math.min(2.8, 0.6 + relV / 9000), 180);
          this.spawnDebrisFromImpact(center, relV, 7);
          this.addEvent(
            isBHPair ? "bh-impact" : "major-impact",
            isBHPair
              ? `${a.name} and ${b.name} entered high-energy black-hole accretion.`
              : `${a.name} and ${b.name} reached an energetic collision corridor.`,
            center,
            a.name,
            b.name,
            relV,
          );
        } else {
          this.addEvent(
            isBHPair ? "bh-accretion" : "merge",
            isBHPair
              ? `${a.name} and ${b.name} accreted into a heavier compact object.`
              : `${a.name} and ${b.name} merged under gravitational capture.`,
            center,
            a.name,
            b.name,
            relV,
          );
        }

        this.collisions += 1;
        toRemove.add(loseIndex);
      }
    }

    if (toRemove.size > 0) {
      const kept = this.majorBodies.filter((_, index) => !toRemove.has(index));
      this.majorBodies.length = 0;
      this.majorBodies.push(...kept);
    }
  }

  private spawnDebrisFromImpact(center: Vector3, relV: number, count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i += 1) {
      this.meteorCounter += 1;
      const theta = this.random.range(0, 2 * Math.PI);
      const u = this.random.range(-1, 1);
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      const dir = normalizeVec3(vec3(s * Math.cos(theta), u, s * Math.sin(theta)));
      const speed = 300 + this.random.next() * (0.25 * relV);

      this.smallBodies.push(
        this.makeBody({
          name: `Debris-${this.meteorCounter}`,
          massKg: 2e8 + this.random.next() * 4e10,
          radiusMeters: 600 + this.random.next() * 6000,
          drawRadiusBase: 1.4,
          colorHex: rgbHex(255, 155, 110),
          position: addVec3(center, scaleVec3(dir, 1e7 + this.random.next() * 7e7)),
          velocity: scaleVec3(dir, speed),
          kind: "meteor",
          trailLimit: 45,
          rotationHours: 0,
          revolutionDays: 0,
          status: "observed",
          parentName: "impact",
          isHypothesis: false,
          compressedVisual: false,
        }),
      );
    }
  }

  private createExplosion(center: Vector3, baseColorHex: string, intensity: number, count: number): void {
    const n = Math.max(30, Math.floor(count * intensity));
    for (let i = 0; i < n; i += 1) {
      const theta = this.random.range(0, 2 * Math.PI);
      const u = this.random.range(-1, 1);
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      const dir = normalizeVec3(vec3(s * Math.cos(theta), u, s * Math.sin(theta)));
      const speed = 300 + this.random.next() * (2100 * intensity);
      const life = 0.45 + this.random.next() * 1.6;

      const tintRoll = this.random.next();
      let colorHex = rgbHex(255, 120, 80);
      if (tintRoll < 0.2) {
        colorHex = rgbHex(255, 245, 190);
      } else if (tintRoll < 0.6) {
        colorHex = baseColorHex;
      }

      this.explosionParticles.push({
        position: cloneVec3(center),
        velocity: scaleVec3(dir, speed),
        lifeSec: life,
        maxLifeSec: life,
        colorHex,
      });
    }
  }

  private updateExplosionParticles(h: number): void {
    const dtSec = Math.max(0, h);
    for (const particle of this.explosionParticles) {
      particle.position = addVec3(particle.position, scaleVec3(particle.velocity, dtSec));
      particle.velocity = scaleVec3(particle.velocity, Math.pow(0.9992, dtSec));
      particle.lifeSec -= dtSec / ONE_DAY_SECONDS;
    }

    for (let i = this.explosionParticles.length - 1; i >= 0; i -= 1) {
      if (this.explosionParticles[i].lifeSec <= 0) {
        this.explosionParticles.splice(i, 1);
      }
    }
  }

  private updateContextBodies(h: number): void {
    const tYears = h / ONE_YEAR_SECONDS;
    const dtSec = Math.max(0, h);

    for (const body of this.contextBodies) {
      if (body.kind === "group" || body.kind === "supercluster" || body.kind === "filament") {
        const omega = (2 * Math.PI) / (8e8 * 365.25);
        const angle = omega * tYears;
        const cp = Math.cos(angle);
        const sp = Math.sin(angle);
        const p = body.position;
        body.position = vec3(p.x * cp - p.z * sp, p.y, p.x * sp + p.z * cp);
      } else if (body.kind === "exoplanet-online") {
        const orbitState = this.onlineOrbitStates.get(body.name);
        if (!orbitState) {
          continue;
        }

        const host = this.findBodyMutable(orbitState.parentName);
        if (!host) {
          continue;
        }

        orbitState.phaseRad += orbitState.omegaRadPerSec * dtSec;
        const cp = Math.cos(orbitState.phaseRad);
        const sp = Math.sin(orbitState.phaseRad);
        const ci = Math.cos(orbitState.inclinationRad);
        const si = Math.sin(orbitState.inclinationRad);

        const relPos = vec3(
          orbitState.radiusMeters * cp,
          orbitState.radiusMeters * sp * ci,
          orbitState.radiusMeters * sp * si,
        );
        const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
        const relVel = scaleVec3(tangent, orbitState.radiusMeters * orbitState.omegaRadPerSec);

        body.position = addVec3(host.position, relPos);
        body.velocity = addVec3(host.velocity, relVel);
        this.pushTrail(body);
      }
    }
  }

  private updateSpin(h: number): void {
    for (const body of this.getAllBodiesMutable()) {
      if (Math.abs(body.rotationHours) > 1e-9) {
        body.spinAngleRad += (2 * Math.PI * h) / (body.rotationHours * 3600);
      }
    }
  }

  private handleSmallBodyCollisions(): void {
    for (const small of this.smallBodies) {
      if (!small.alive) {
        continue;
      }

      for (const major of this.majorBodies) {
        if (!small.alive) {
          break;
        }

        const d = magVec3(subVec3(small.position, major.position));
        const threshold = (small.radiusMeters + major.radiusMeters) * 1.15;
        const blackHoleCaptureRadius =
          major.kind === "black-hole" ? Math.max(threshold, 0.02 * this.AU) : threshold;

        if (major.kind === "black-hole" && d <= blackHoleCaptureRadius) {
          const relV = magVec3(subVec3(small.velocity, major.velocity));
          this.createExplosion(small.position, rgbHex(255, 205, 130), Math.min(2, 0.8 + relV / 16000), 90);
          this.addEvent(
            "accretion",
            `${small.name} crossed the capture radius of ${major.name}.`,
            small.position,
            small.name,
            major.name,
            relV,
          );
          small.alive = false;
          this.collisions += 1;
          continue;
        }

        if (d > threshold) {
          continue;
        }

        const relV = magVec3(subVec3(small.velocity, major.velocity));
        const energetic = relV > 18000;
        const totalMass = major.massKg + small.massKg;

        major.velocity = scaleVec3(
          addVec3(scaleVec3(major.velocity, major.massKg), scaleVec3(small.velocity, small.massKg)),
          1 / Math.max(totalMass, 1),
        );
        major.massKg = totalMass;
        major.radiusMeters = cbrtSafe(
          major.radiusMeters * major.radiusMeters * major.radiusMeters +
          small.radiusMeters * small.radiusMeters * small.radiusMeters,
        );

        const impactCenter = scaleVec3(addVec3(small.position, major.position), 0.5);
        if (energetic) {
          this.createExplosion(impactCenter, rgbHex(255, 170, 120), Math.min(2.2, 0.7 + relV / 18000), 120);
          this.spawnDebrisFromImpact(impactCenter, relV, 4);
          this.addEvent(
            "explosion",
            `${small.name} experienced an energetic impact with ${major.name}.`,
            impactCenter,
            small.name,
            major.name,
            relV,
          );
        } else {
          this.addEvent(
            "impact",
            `${small.name} impacted ${major.name} and was absorbed.`,
            impactCenter,
            small.name,
            major.name,
            relV,
          );
        }

        small.alive = false;
        this.collisions += 1;
      }
    }

    for (let i = this.smallBodies.length - 1; i >= 0; i -= 1) {
      if (!this.smallBodies[i].alive) {
        this.smallBodies.splice(i, 1);
      }
    }
  }

  private initAsteroidBelt(count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i += 1) {
      this.smallBodies.push(this.createAsteroid(i));
    }
  }

  private initKuiperBelt(count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i += 1) {
      this.smallBodies.push(this.createKuiper(i));
    }
  }

  private initComets(count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i += 1) {
      this.cometCounter += 1;
      this.smallBodies.push(this.createComet(this.cometCounter));
    }
  }

  private createAsteroid(index: number): MutableUniverseBody {
    const sun = this.getSun();
    const orbit = (2.1 + this.random.next() * 1.3) * this.AU;
    const phase = this.random.next() * 2 * Math.PI;
    const incl = degreesToRadians(this.random.next() * 18 - 9);
    const speed = Math.sqrt((this.G * sun.massKg) / orbit) * (0.93 + this.random.next() * 0.14);

    const cp = Math.cos(phase);
    const sp = Math.sin(phase);
    const ci = Math.cos(incl);
    const si = Math.sin(incl);

    const pos = vec3(orbit * cp, orbit * sp * ci, orbit * sp * si);
    const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
    const vel = scaleVec3(tangent, speed);

    return this.makeBody({
      name: `Ast-${index}`,
      massKg: 5e11 + this.random.next() * 3e14,
      radiusMeters: 30000 + this.random.next() * 220000,
      drawRadiusBase: 1.2,
      colorHex: rgbHex(170, 180, 182),
      position: pos,
      velocity: vel,
      kind: "asteroid",
      trailLimit: 0,
      rotationHours: 0,
      revolutionDays: 0,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });
  }

  private createKuiper(index: number): MutableUniverseBody {
    const sun = this.getSun();
    const orbit = (30.5 + this.random.next() * 24) * this.AU;
    const phase = this.random.next() * 2 * Math.PI;
    const incl = degreesToRadians(this.random.next() * 30 - 15);
    const speed = Math.sqrt((this.G * sun.massKg) / orbit) * (0.85 + this.random.next() * 0.3);

    const cp = Math.cos(phase);
    const sp = Math.sin(phase);
    const ci = Math.cos(incl);
    const si = Math.sin(incl);

    const pos = vec3(orbit * cp, orbit * sp * ci, orbit * sp * si);
    const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
    const vel = scaleVec3(tangent, speed);

    return this.makeBody({
      name: `KBO-${index}`,
      massKg: 8e11 + this.random.next() * 7e15,
      radiusMeters: 25000 + this.random.next() * 260000,
      drawRadiusBase: 1.4,
      colorHex: rgbHex(130, 190, 250),
      position: pos,
      velocity: vel,
      kind: "kuiper",
      trailLimit: 0,
      rotationHours: 0,
      revolutionDays: 0,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });
  }

  private createComet(id: number): MutableUniverseBody {
    const sun = this.getSun();
    const phase = this.random.next() * 2 * Math.PI;
    const incl = degreesToRadians(this.random.next() * 110 - 55);
    const r0 = (38 + this.random.next() * 420) * this.AU;

    const cp = Math.cos(phase);
    const sp = Math.sin(phase);
    const ci = Math.cos(incl);
    const si = Math.sin(incl);
    const pos = vec3(r0 * cp, r0 * sp * ci, r0 * sp * si);

    const inward = normalizeVec3(subVec3(sun.position, pos));
    const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
    const base = Math.sqrt((this.G * sun.massKg) / r0);
    const vel = addVec3(
      scaleVec3(inward, 1200 + this.random.next() * 7000),
      scaleVec3(tangent, base * (0.35 + this.random.next() * 0.9)),
    );

    return this.makeBody({
      name: `Comet-${id}`,
      massKg: 5e12 + this.random.next() * 8e14,
      radiusMeters: 2500 + this.random.next() * 35000,
      drawRadiusBase: 2,
      colorHex: rgbHex(190, 246, 255),
      position: pos,
      velocity: vel,
      kind: "comet",
      trailLimit: 120,
      rotationHours: 0,
      revolutionDays: 0,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });
  }

  private createMeteor(id: number): MutableUniverseBody {
    const sun = this.getSun();
    const phase = this.random.next() * 2 * Math.PI;
    const incl = degreesToRadians(this.random.next() * 30 - 15);
    const r0 = (1.7 + this.random.next() * 5.5) * this.AU;

    const cp = Math.cos(phase);
    const sp = Math.sin(phase);
    const ci = Math.cos(incl);
    const si = Math.sin(incl);
    const pos = vec3(r0 * cp, r0 * sp * ci, r0 * sp * si);

    const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
    const radial = normalizeVec3(subVec3(sun.position, pos));
    const vCirc = Math.sqrt((this.G * sun.massKg) / r0);
    const vel = addVec3(
      scaleVec3(tangent, vCirc * (0.7 + this.random.next() * 0.5)),
      scaleVec3(radial, 2000 + this.random.next() * 8000),
    );

    return this.makeBody({
      name: `M-${id}`,
      massKg: 5e9 + this.random.next() * 9e12,
      radiusMeters: 2000 + this.random.next() * 30000,
      drawRadiusBase: 1.7,
      colorHex: rgbHex(255, 200, 130),
      position: pos,
      velocity: vel,
      kind: "meteor",
      trailLimit: 55,
      rotationHours: 0,
      revolutionDays: 0,
      status: "observed",
      parentName: "Matahari",
      isHypothesis: false,
      compressedVisual: false,
    });
  }

  private createOnlineHostStar(row: ExoplanetCatalogRow): MutableUniverseBody {
    const mass = (row.hostMassSolar ?? 1) * this.solarMassKg;
    const radius = (row.hostRadiusSolar ?? 1) * this.solarRadiusMeters;
    const position = this.raDecPcToVector(row.raDeg, row.decDeg, row.distPc);
    return this.makeBody({
      name: row.hostName,
      massKg: mass,
      radiusMeters: radius,
      drawRadiusBase: 7.8,
      colorHex: this.hashedColor(row.hostName, 170, 185, 205, 70),
      position,
      velocity: vec3(0, 0, 0),
      kind: "star-online",
      trailLimit: 0,
      rotationHours: 0,
      revolutionDays: 0,
      status: "observed-online",
      parentName: null,
      isHypothesis: false,
      compressedVisual: true,
    });
  }

  private createOnlineExoplanet(
    row: ExoplanetCatalogRow,
    host: MutableUniverseBody,
  ): MutableUniverseBody {
    const orbitRadius = Math.max(0.002, row.semimajorAxisAU) * this.AU;
    const periodDays =
      row.orbitalPeriodDays > 0
        ? row.orbitalPeriodDays
        : orbitalPeriodFromSemiMajorAxis(orbitRadius, Math.max(0.08 * this.solarMassKg, host.massKg)) /
        ONE_DAY_SECONDS;

    const omega = (2 * Math.PI) / Math.max(3600, periodDays * ONE_DAY_SECONDS);
    const seed = Math.abs(this.hashNumber(row.planetName));
    const phase = ((seed % 3600) / 3600) * 2 * Math.PI;
    const incl = (((Math.floor(seed / 17) % 2200) / 2200) * 20 * Math.PI) / 180;

    const cp = Math.cos(phase);
    const sp = Math.sin(phase);
    const ci = Math.cos(incl);
    const si = Math.sin(incl);

    const relPos = vec3(orbitRadius * cp, orbitRadius * sp * ci, orbitRadius * sp * si);
    const tangent = normalizeVec3(vec3(-sp, cp * ci, cp * si));
    const relVel = scaleVec3(tangent, orbitRadius * omega);

    const massEarthUnits = row.planetMassEarth ?? 0.45;
    const massKg = massEarthUnits * this.earthMassKg;
    const radiusMeters =
      row.planetRadiusEarth !== undefined
        ? row.planetRadiusEarth * this.earthRadiusMeters
        : estimatePlanetRadiusFallback(massEarthUnits);

    const body = this.makeBody({
      name: row.planetName,
      massKg,
      radiusMeters,
      drawRadiusBase: 3.2,
      colorHex: this.hashedColor(row.planetName, 120, 170, 235, 95),
      position: addVec3(host.position, relPos),
      velocity: addVec3(host.velocity, relVel),
      kind: "exoplanet-online",
      trailLimit: 140,
      rotationHours: 0,
      revolutionDays: periodDays,
      status: "observed-online",
      parentName: host.name,
      isHypothesis: false,
      compressedVisual: true,
    });

    this.onlineOrbitStates.set(body.name, {
      parentName: host.name,
      radiusMeters: orbitRadius,
      omegaRadPerSec: omega,
      inclinationRad: incl,
      phaseRad: phase,
    });

    return body;
  }

  private raDecPcToVector(raDeg: number, decDeg: number, distPc: number): Vector3 {
    const cart = equatorialToCartesian({
      rightAscensionDeg: raDeg,
      declinationDeg: decDeg,
      distanceParsec: distPc,
    });
    return { x: cart.xMeters, y: cart.yMeters, z: cart.zMeters };
  }

  private hashNumber(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private hashedColor(seedText: string, baseR: number, baseG: number, baseB: number, span: number): string {
    const h = Math.abs(this.hashNumber(seedText));
    const r = Math.min(255, baseR + (h % span));
    const g = Math.min(255, baseG + (Math.floor(h / 3) % span));
    const b = Math.min(255, baseB + (Math.floor(h / 7) % span));
    return rgbHex(r, g, b);
  }

  private updateForecasts(): void {
    const next: UniverseForecast[] = [];

    const clamp01 = (value: number): number => clamp(value, 0, 1);
    const weightedConfidence = (proximity: number, velocityRatio: number, gravityScore: number): number => {
      const p = clamp01(proximity);
      const v = clamp01(velocityRatio);
      const g = clamp01(gravityScore);
      const raw = 0.58 * p + 0.27 * v + 0.15 * g;
      return clamp(0.08 + 0.88 * raw, 0.05, 0.99);
    };

    const push = (
      kind: string,
      message: string,
      etaSec: number,
      bodyA: string,
      bodyB: string,
      confidence: number,
    ): void => {
      if (!Number.isFinite(etaSec) || etaSec <= 0) {
        return;
      }
      next.push({
        kind,
        message,
        etaYears: etaSec / ONE_YEAR_SECONDS,
        bodyA,
        bodyB,
        confidence: clamp(confidence, 0.05, 0.99),
      });
    };

    const horizonSec = 260 * ONE_DAY_SECONDS;
    const massive = this.majorBodies.filter((body) => body.massKg > 0);

    for (let i = 0; i < massive.length; i += 1) {
      for (let j = i + 1; j < massive.length; j += 1) {
        const a = massive[i];
        const b = massive[j];
        const r = subVec3(b.position, a.position);
        const v = subVec3(b.velocity, a.velocity);
        const vv = mag2Vec3(v);

        if (vv <= 1e-9) {
          continue;
        }

        const tClosest = clamp(-dotVec3(r, v) / vv, 0, horizonSec);
        if (tClosest <= 60) {
          continue;
        }

        const relV = magVec3(v);
        const dMin = magVec3(addVec3(r, scaleVec3(v, tClosest)));
        const isBH = a.kind === "black-hole" || b.kind === "black-hole";
        const baseContact = Math.max(1e5, (a.radiusMeters + b.radiusMeters) * 0.92);
        const contact = isBH ? Math.max(baseContact, 0.03 * this.AU) : baseContact;
        const totalMass = a.massKg + b.massKg;
        const vEsc = Math.sqrt((2 * this.G * totalMass) / Math.max(contact, 1));
        const gravityScore = clamp01(Math.log10(1 + totalMass / this.solarMassKg) / 3.5);

        if (dMin <= contact) {
          const kind = isBH
            ? "bh-accretion-forecast"
            : relV > 7000
              ? "explosion-forecast"
              : "collision-forecast";
          const message = isBH
            ? `Potential accretion between ${a.name} and ${b.name}.`
            : relV > 7000
              ? `Potential energetic impact between ${a.name} and ${b.name}.`
              : `Potential merge between ${a.name} and ${b.name}.`;
          const proximity = 1 - dMin / Math.max(contact, 1);
          const velocityScore = relV / Math.max(vEsc, 1);
          push(kind, message, tClosest, a.name, b.name, weightedConfidence(proximity, velocityScore, gravityScore));
        } else if (dMin <= contact * 2.8) {
          const kind = relV > 9000 ? "explosion-watch" : "close-pass";
          const message =
            relV > 9000
              ? `High-energy close pass expected between ${a.name} and ${b.name}.`
              : `Close pass expected between ${a.name} and ${b.name}.`;
          const proximity = 1 - dMin / Math.max(contact * 2.8, 1);
          const velocityScore = relV / Math.max(vEsc, 1);
          push(
            kind,
            message,
            tClosest,
            a.name,
            b.name,
            weightedConfidence(proximity * 0.85, velocityScore, gravityScore),
          );
        }
      }
    }

    const activeSmall = this.smallBodies.filter((body) => body.alive);
    for (const small of activeSmall) {
      if (this.majorBodies.length === 0) {
        continue;
      }

      let nearest = this.majorBodies[0];
      let nearestDistance = magVec3(subVec3(small.position, nearest.position));

      for (let i = 1; i < this.majorBodies.length; i += 1) {
        const candidate = this.majorBodies[i];
        const d = magVec3(subVec3(small.position, candidate.position));
        if (d < nearestDistance) {
          nearestDistance = d;
          nearest = candidate;
        }
      }

      const rel = subVec3(small.velocity, nearest.velocity);
      const inward = -dotVec3(normalizeVec3(subVec3(small.position, nearest.position)), rel);
      const captureR =
        nearest.kind === "black-hole"
          ? Math.max(nearest.radiusMeters * 6000, 0.02 * this.AU)
          : Math.max((nearest.radiusMeters + small.radiusMeters) * 1.2, 1e5);
      const vEsc = Math.sqrt((2 * this.G * Math.max(1, nearest.massKg + small.massKg)) / Math.max(captureR, 1));
      const gravityScore = clamp01(Math.log10(1 + nearest.massKg / this.solarMassKg) / 3.5);

      if (inward > 10 && nearestDistance > captureR) {
        const etaSec = (nearestDistance - captureR) / inward;
        if (etaSec > 60 && etaSec <= 40 * ONE_DAY_SECONDS) {
          const kind = nearest.kind === "black-hole" ? "accretion-forecast" : "ingress-forecast";
          const message =
            nearest.kind === "black-hole"
              ? `${small.name} may enter accretion radius of ${nearest.name}.`
              : `${small.name} may ingress toward ${nearest.name}.`;
          const proximity = 1 - (nearestDistance - captureR) / Math.max(captureR * 12, 1);
          const velocityScore = magVec3(rel) / Math.max(vEsc, 1);
          const confidenceBase = weightedConfidence(proximity, velocityScore, gravityScore);
          const confidence = nearest.kind === "black-hole" ? Math.min(0.99, confidenceBase + 0.1) : confidenceBase;
          push(kind, message, etaSec, small.name, nearest.name, confidence);
        }
      }
    }

    for (const star of this.majorBodies
      .filter((body) => body.massKg >= 8 * this.solarMassKg && !this.supernovaTriggered.has(body.name))
      .slice(0, 4)) {
      const massRatio = Math.max(8, star.massKg / this.solarMassKg);
      const etaYears = clamp(30 / Math.pow(massRatio, 2.15), 0.03, 8);
      const etaSec = etaYears * ONE_YEAR_SECONDS;
      const coreScore = clamp01((massRatio - 8) / 30);
      const confidence = weightedConfidence(0.55, 0.45 + coreScore * 0.4, coreScore);
      push(
        "supernova-watch",
        `Massive star ${star.name} is a supernova candidate in this model.`,
        etaSec,
        star.name,
        "stellar core",
        confidence,
      );
    }

    const dedupMap = new Map<string, UniverseForecast>();
    for (const forecast of next) {
      const key = `${forecast.kind}:${forecast.bodyA}->${forecast.bodyB}`;
      const current = dedupMap.get(key);
      if (!current || forecast.etaYears < current.etaYears) {
        dedupMap.set(key, forecast);
      }
    }

    const sorted = [...dedupMap.values()]
      .sort((a, b) => a.etaYears - b.etaYears || b.confidence - a.confidence)
      .slice(0, 14);

    this.forecasts.length = 0;
    this.forecasts.push(...sorted);
  }

  private addEvent(
    kind: string,
    message: string,
    location: Vector3,
    bodyA: string,
    bodyB: string,
    relSpeedMps: number,
  ): void {
    this.events.push({
      id: this.nextEventId,
      kind,
      message,
      timeYears: this.yearsElapsed,
      location: cloneVec3(location),
      bodyA,
      bodyB,
      relSpeedMps,
    });
    this.nextEventId += 1;

    if (this.events.length > 220) {
      this.events.splice(0, this.events.length - 220);
    }
  }
}

export function createUniverseEngine(options: UniverseEngineOptions = {}): UniverseEngine {
  return new UniverseEngine(options);
}

export function generateUniverseStateReport(state: UniverseStateSnapshot): string {
  const lines = [
    "Orbinex Universe Engine Report",
    `yearsElapsed=${state.yearsElapsed.toFixed(6)}`,
    `simulatedSeconds=${state.simulatedSeconds.toFixed(3)}`,
    `paused=${state.paused}`,
    `baseDtSeconds=${state.baseDtSeconds.toFixed(3)}`,
    `timeScale=${state.timeScale.toFixed(3)}`,
    `speedOfLightSimulationMps=${state.speedOfLightSimulationMps.toFixed(3)}`,
    `collisionCount=${state.collisionCount}`,
    `majorBodies=${state.counts.majorBodies}`,
    `smallBodies=${state.counts.smallBodies}`,
    `contextBodies=${state.counts.contextBodies}`,
    `allBodies=${state.counts.allBodies}`,
    `forecasts=${state.latestForecasts.length}`,
    `events=${state.latestEvents.length}`,
  ];

  if (state.latestForecasts.length > 0) {
    lines.push("topForecasts:");
    for (const forecast of state.latestForecasts.slice(0, 3)) {
      lines.push(
        `  - [${forecast.kind}] etaYears=${forecast.etaYears.toFixed(4)} confidence=${(
          forecast.confidence * 100
        ).toFixed(1)}% ${forecast.bodyA}->${forecast.bodyB}`,
      );
    }
  }

  return lines.join("\n");
}

export function generateRecommendationReport(recommendations: UniverseRecommendation[]): string {
  if (recommendations.length === 0) {
    return "No recommendations";
  }

  return recommendations
    .map((recommendation, index) => {
      return [
        `${index + 1}. [${recommendation.priority.toUpperCase()}] ${recommendation.title}`,
        `   action: ${recommendation.action}`,
        `   rationale: ${recommendation.rationale}`,
        `   related: ${recommendation.relatedBodies.join(", ") || "-"}`,
      ].join("\n");
    })
    .join("\n");
}

const OrbinexNpm = {
  constants,
  gravitationalParameter,
  gravitationalForceMagnitude,
  circularOrbitSpeed,
  orbitalPeriodFromSemiMajorAxis,
  semiMajorAxisFromOrbitalPeriod,
  equatorialToCartesian,
  estimatePlanetRadiusFallback,
  createOrbitSample,
  generateSimulationReport,
  UniverseEngine,
  createUniverseEngine,
  generateUniverseStateReport,
  generateRecommendationReport,
};

export default OrbinexNpm;
