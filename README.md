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
restore parameters. 

It sets the date and time and calls `getSun()` from `settings.inc` to get sunrise, sunset,
and twilight times. These times are accessed via the `sun` object properties.

Runs `cleanup()` from `settings.inc` at the end to reset default settings.

### `settings.inc`

Defines a few colors, `setup()` and `cleanup()` functions to initialize and reset settings,
a `getSun()` function to calculate sunrise, sunset, and twilight times, and a few utility functions.

`setup()`: sets the environment and display for the simulation:

- saves the current state as "RestoreState"
- clears the display to "natural" mode
- deletes all markers, labels, and images
- hides sky layers
- sets colors for grid lines
- sets font sizes for solar system objects, stars, and constellations
- configures star and constellation settings
- sets observer location and landscape
- hides the GUI
- saves the state as "defaultState"

`cleanup()`: resets the environment and display to the default state:

- restores the state saved as "RestoreState"
- deletes all markers, labels, and images
- shows the GUI

`setupConstellations()`: configures environment for a constellation tour.

- Clears the current display to "deepspace" mode.
  (Eq mount, no atmosphere, landscape etc. No planets, lines, labels or markers)
- Adjusts font size, art intensity, and colors for lines, labels, and boundaries.
- Enables the display of constellation lines, art, and boundaries.
- Saves the current state under the name "constellationState".

`getSun()`: calculates sunrise, sunset, and twilight times for the current date
and observer location. Returns an object with the calculated times.

- `sun.sunset`
- `sun.sunrise`
- `sun.civTwilightMorn`
- `sun.civTwilightEven`
- `sun.nautTwilightMorn`
- `sun.nautTwilightEven`
- `sun.astTwilightMorn`
- `sun.astTwilightEven`

`fastForward(rate, wait, spec)`: speeds up the simulation time by a specified rate
until a certain condition is met. The `wait` parameter can be a specific time,
a relative time, or "L" to wait for user input. The optional  `spec` parameter
'local' or 'utc' defaults to 'local'.

`pauseKey()`: pauses the simulation until the user presses the "L" key. It sets
the simulation to a very slow rate and waits for the rate to change which is what
happens when the user presses "L".

`showEqGrid()`, `showAzGrid()`: shows the equatorial and azimuthal grids and dims
the colors after a three second delay.

`loadImage()`: loads a sky image with the parameters defined in `images.inc`. The
image is not displayed until `StelSkyLayerMgr.showLayer("image_id", true)` is called.
set the second parameter to false to hide the image.

### `images.inc`

Sets parameters for loading sky images. Each image is a js object that has an ID, file path,
ra, dec, size, and rotation. This is the easiest way to load images into Stellarium.
It works well for smaller, square images. Other methods may be needed for some use cases.

### `common_objects.inc`

Imports some common celestial objects like Messier objects, Herschel objects, constellations, etc.
Put whatever common objects you want to use in your scripts here.

### `save_state.inc`

Provides functions to save and restore the current state of the Stellarium simulation.
This is updated to work with the latest Stellarium API.

### `solar_calc.js`
Provides functions to perform solar calculations like calculating sunrise, sunset,
and twilight times. It works, that's all I can say.