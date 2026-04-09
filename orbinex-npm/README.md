# @galihru/orbinex

Orbinex is a TypeScript scientific toolkit for:

1. Fundamental orbital mechanics formulas.
2. Coordinate conversion (equatorial to Cartesian).
3. A configurable universe simulation engine with collisions, accretion logic, event logs, and forecast-driven recommendations.

The package targets browser and Node.js runtimes, and ships ESM, CJS, and TypeScript declarations.

## 1. Installation

### 1.1 npmjs (recommended)

```bash
npm install @galihru/orbinex
```

## 2. Physical Constants

Exported as `constants`.

| Field | Meaning | Unit |
| --- | --- | --- |
| gravitationalConstant | Newtonian gravitational constant | m^3 kg^-1 s^-2 |
| solarMassKg | Solar mass | kg |
| earthMassKg | Earth mass | kg |
| earthRadiusMeters | Mean Earth radius | m |
| auMeters | Astronomical Unit | m |
| parsecMeters | Parsec | m |
| lightYearMeters | Light-year | m |
| speedOfLightMps | Speed of light in vacuum | m s^-1 |

## 3. Core Formulations

### 3.0 Gravitational parameter helper

Function: `gravitationalParameter(primaryMassKg, g?)`

Formula:

mu = max(0, g * M)

Default g uses the package gravitational constant.

### 3.1 Newtonian gravitational force magnitude

Function: `gravitationalForceMagnitude(mass1Kg, mass2Kg, distanceMeters)`

Formula:

F = G * m1 * m2 / r^2

Returns force magnitude in Newton.

### 3.2 Circular orbital speed

Function: `circularOrbitSpeed(primaryMassKg, orbitalRadiusMeters)`

Formula:

v = sqrt(G * M / r)

Returns orbital speed in m s^-1.

### 3.3 Orbital period from semi-major axis (Kepler + Newton)

Function: `orbitalPeriodFromSemiMajorAxis(semiMajorAxisMeters, primaryMassKg)`

Formula:

T = 2 * pi * sqrt(a^3 / (G * M))

Returns period in seconds.

### 3.4 Semi-major axis from orbital period (inverse form)

Function: `semiMajorAxisFromOrbitalPeriod(orbitalPeriodSeconds, primaryMassKg)`

Formula:

a = cbrt((G * M * T^2) / (4 * pi^2))

Returns semi-major axis in meters.

### 3.5 Equatorial to Cartesian conversion

Function: `equatorialToCartesian({ rightAscensionDeg, declinationDeg, distanceParsec })`

With d = distanceParsec * parsecMeters:

x = d * cos(dec) * cos(ra)  
y = d * sin(dec)  
z = d * cos(dec) * sin(ra)

Returns position in meters.

### 3.6 Radius fallback estimator for exoplanets

Function: `estimatePlanetRadiusFallback(planetMassEarthUnits)`

Heuristic relation used by the package:

R = max(0.55, M^0.29) * R_earth

where M is in Earth-mass units and R is in meters.

## 4. Minimal Formula Usage Example

```ts
import {
	constants,
	circularOrbitSpeed,
	createOrbitSample,
	generateSimulationReport,
} from "@galihru/orbinex";

const vEarth = circularOrbitSpeed(constants.solarMassKg, constants.auMeters);
const sample = createOrbitSample(constants.solarMassKg, constants.auMeters);

console.log("Earth-like circular speed (m/s):", vEarth);
console.log(generateSimulationReport(sample));
```

## 5. Universe Engine

### 5.1 Constructor entry point

Use `createUniverseEngine(options?)` or instantiate `new UniverseEngine(options?)`.

### 5.2 Options and defaults

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| cUniverse | number | speedOfLightMps | Simulation reference light-speed |
| lockPhysicsToRealC | boolean | false | Force simulation c to physical c |
| initialAsteroids | number | 280 | Initial asteroid count |
| initialKuiperObjects | number | 180 | Initial Kuiper-belt-like object count |
| initialComets | number | 32 | Initial comet count |
| includePlanetNine | boolean | true | Include hypothetical Planet Nine |
| includeHypothesisObjects | boolean | true | Include inferred/hypothesis context objects |
| baseDtSeconds | number | 22 | Base integration time step (seconds) |
| timeScale | number | 1200 | Time acceleration multiplier |
| forecastIntervalSeconds | number | 172800 | Forecast refresh cadence |
| seed | number | 77 | RNG seed for reproducibility |
| autoSpawnMeteors | boolean | true | Enable stochastic meteor injections |
| autoSpawnComets | boolean | true | Enable stochastic comet injections |

### 5.3 Main operational methods

| Method | Purpose |
| --- | --- |
| step(subSteps?) | Advance simulation and return step summary |
| setPaused(paused) / togglePaused() | Control simulation pause state |
| setTimeScale(value) | Change temporal acceleration |
| setBaseDtSeconds(value) | Change base integration step |
| getStateSnapshot() | Return current state summary |
| getBodies() / getMajorBodies() / getSmallBodies() / getContextBodies() | Snapshot current bodies |
| getEvents(limit?) | Retrieve latest simulation events |
| getForecasts(limit?) | Retrieve latest forecasts |
| getAiRecommendations(limit?) | Retrieve prioritized recommendations |
| ingestExoplanetRows(rows) | Add online host stars and exoplanets |
| spawnMeteorShower(count) | Inject meteor objects |
| spawnCometWave(count) | Inject comet objects |
| triggerSupernova(name) | Trigger modeled supernova event for eligible star |
| communicationDelaySeconds(nameA, nameB) | One-way delay = distance / cUniverse |

### 5.4 Engine usage example

```ts
import {
	createUniverseEngine,
	generateUniverseStateReport,
	generateRecommendationReport,
} from "@galihru/orbinex";

const engine = createUniverseEngine({
	includePlanetNine: true,
	initialAsteroids: 120,
	initialKuiperObjects: 90,
	baseDtSeconds: 20,
	timeScale: 1800,
	seed: 123,
});

engine.step(8);

const state = engine.getStateSnapshot();
const recommendations = engine.getAiRecommendations(4);

console.log(generateUniverseStateReport(state));
console.log(generateRecommendationReport(recommendations));
```

## 6. Forecast and Recommendation Logic

The forecast pipeline evaluates:

1. Close approaches and potential collisions among massive bodies.
2. High-energy interaction corridors.
3. Accretion candidates near black-hole capture zones.
4. Ingress forecasts for small-body to major-body trajectories.
5. Supernova watch candidates for sufficiently massive stars.

Recommendation outputs are derived from forecast type, ETA, and confidence score. They are heuristic planning aids, not certified mission-control guarantees.

## 7. Exoplanet Ingestion Schema

`ingestExoplanetRows` accepts rows shaped like:

```ts
{
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
```

Internally, this data is converted to Cartesian host coordinates and orbital states around host stars.

## 8. Reporting Utilities

| Utility | Output |
| --- | --- |
| generateSimulationReport(sample) | Text report for formula-based orbit sample |
| generateUniverseStateReport(snapshot) | Text summary of current engine state |
| generateRecommendationReport(recommendations) | Text summary of recommendation list |

## 9. Numerical Model Notes and Limitations

1. Gravity model is Newtonian; relativistic corrections are not applied.
2. Time integration uses fixed-step explicit updates (semi-implicit style velocity-position stepping).
3. Collision and accretion events are phenomenological approximations.
4. Forecast confidence values are heuristic scores from geometric/dynamic features, not Bayesian posterior probabilities.
5. Context-scale objects (galaxies/superclusters/filaments) are included for scientific context and visualization logic, not full cosmological N-body fidelity.

## 10. Reproducibility

For deterministic pseudo-random behavior across runs, fix:

1. `seed`
2. `baseDtSeconds`
3. `timeScale`
4. `subSteps` pattern used in `step(...)`

## 11. References

1. Newton, I. (1687). Philosophiae Naturalis Principia Mathematica.
2. Kepler, J. (1619). Harmonices Mundi.
3. Murray, C. D., and Dermott, S. F. (1999). Solar System Dynamics. Cambridge University Press.
4. Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications (4th ed.).
5. IAU system of astronomical constants and SI conventions.
6. NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/

## 12. License

MIT
