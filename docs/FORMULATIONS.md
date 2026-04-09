# Formulations

This document summarizes the primary physical formulas currently implemented by Orbinex.

## 1. Gravitational force magnitude

For two masses $m_1$ and $m_2$ separated by distance $r$:

$$
F = G \frac{m_1 m_2}{r^2}
$$

Where:

- $G = 6.67430 \times 10^{-11} \; \mathrm{m^3\,kg^{-1}\,s^{-2}}$

## 2. Circular orbit speed

For a primary body with mass $M$ and orbital radius $r$:

$$
v = \sqrt{\frac{GM}{r}}
$$

## 3. Orbital period from semi-major axis

Using standard two-body approximation:

$$
T = 2\pi\sqrt{\frac{a^3}{\mu}}, \quad \mu = GM
$$

## 4. Semi-major axis from orbital period

Inverse relation:

$$
a = \sqrt[3]{\frac{\mu T^2}{4\pi^2}}
$$

## 5. Equatorial coordinate conversion

From right ascension (RA), declination (Dec), and distance $d$:

$$
x = d\cos(\delta)\cos(\alpha), \quad
y = d\sin(\delta), \quad
z = d\cos(\delta)\sin(\alpha)
$$

In Orbinex, input distance in parsec is converted to meters before Cartesian projection.

## 6. Planetary radius fallback model

When direct radius observations are unavailable, a deterministic fallback scaling law is used:

$$
R_{est} = \max(0.55, M_{\oplus}^{0.29}) \cdot R_{\oplus}
$$

This is a pragmatic simulation fallback, not a full interior-structure model.

## 7. Scope and limitations

- Current formulas assume Newtonian mechanics.
- Relativistic corrections are not applied in this module version.
- Uncertainty propagation is not yet implemented.
- For high-precision astrodynamics, use dedicated N-body or relativistic solvers.
