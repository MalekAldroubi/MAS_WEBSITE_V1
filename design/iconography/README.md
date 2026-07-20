# Atelier Emblems

Atelier Emblems is a bespoke, brand-independent iconography study for the MAS website. It replaces the generic “one monoline set for everything” approach with two deliberate visual tiers.

## 1. Editorial emblems

Sixteen service and capability icons use a 48 × 48 drawing field. Each begins with an individual written concept and is reduced to one consistent 1.6 px stroke. Every line must describe the object, its action, or its meaning.

The system explicitly avoids ornamental dots, construction guides, decorative circles, secondary stroke weights, gradients, and effects. Circles remain only when they are intrinsic to the metaphor, such as a globe, coin, lens, clock, or location pin.

These emblems are intended for 40–112 px display. They should not be reduced to tiny navigation sizes.

## 2. Utility glyphs

Eight interface controls use a quieter 24 × 24 field with a consistent 1.5 px stroke. They are intended for 20–24 px display inside controls with at least a 44 × 44 px interactive target.

## Direction and accessibility

- Mirror directional arrows in RTL layouts.
- Do not mirror semantic objects such as documents, buildings, clocks, or locks.
- Decorative icons use `aria-hidden="true"`.
- Meaningful standalone icons need an accessible name.
- Do not use color as the only carrier of meaning.

## Status

The files under `design/iconography/` are a review proof only. The production website does not reference `atelier-icons.svg`.
