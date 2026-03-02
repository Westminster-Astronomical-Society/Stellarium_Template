# Stellarium Demo Script

This repository contains a basic template and setup for a Stellarium script.

## Files Included

The repository has `settings.inc` for configuration settings,
`common_objects.inc` to import some common celestial objects, and `images.inc`
with parameters for loading image resources. Two additional scripts
`save_state.inc` and `solar_calc.js` are included to provide functionality for
saving the current state of the simulation and performing solar calculations.

### `template.ssc`

The main script file `template.ssc` imports `settings.inc`, `common_objects.inc`,
and `images.inc`. It calls `setup()` from `settings.inc` to initialize settings and set
restore parameters. There are some color definitions and helper functions as well.

It sets the date and time and calls `getSun()` from `settings.inc` to get sunrise, sunset, and twilight times. These times are accessed via the `sun` object properties.

- sun.sunset
- sun.sunrise
- sun.civTwilightMorn
- sun.civTwilightEven
- sun.nautTwilightMorn
- sun.nautTwilightEven
- sun.astTwilightMorn
- sun.astTwilightEven
