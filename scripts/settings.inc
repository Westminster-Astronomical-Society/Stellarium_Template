// Name: settings.inc
// License: Public Domain
// Author: Christopher Bennett
// Version: 1.0, 2025-01-22
// Description: This file contains settings and utility functions for Stellarium scripts

include("save_state.inc");
include("solar_calc.js");

// Define some colors
White = core.vec3f(1.0, 1.0, 1.0)                     // #FFFFFF
Gray20 = core.vec3f(0.8, 0.8, 0.8)                    // #CCCCCC
Gray40 = core.vec3f(0.6, 0.6, 0.6)                    // #999999  
Gray60 = core.vec3f(0.4, 0.4, 0.4)                    // #666666
Gray80 = core.vec3f(0.2, 0.2, 0.2)                    // #333333
Black = core.vec3f(0.0, 0.0, 0.0)                     // #000000

BrightRed = core.vec3f(0.8314, 0.1647, 0.1647)        // #D42A2A
TrueGreen = core.vec3f(0.00000, 0.56863, 0.00000)     // #009100
Cobalt = core.vec3f(0.00000, 0.28627, 0.56863)        // #004991
BarneyPurple = core.vec3f(0.56863, 0.00000, 0.56863)  // #910091

BloodRed = core.vec3f(0.56863, 0.00000, 0.00392)      // #910001
DarkGreen = core.vec3f(0.12549, 0.37647, 0.12549)     // #206020
DarkBlue = core.vec3f(0.14118, 0.28627, 0.42745)      // #204160
DeepViolet = core.vec3f(0.37647, 0.12549, 0.37647)    // #602060

DarkRed = core.vec3f(0.37647, 0.12549, 0.12941)       // #602021
VeryDarkGreen = core.vec3f(0.17647, 0.28235, 0.17647) // #2D482D
DarkSlate = core.vec3f(0.17647, 0.23137, 0.28235)     // #2D3B48
DirtyPurple = core.vec3f(0.28235, 0.17647, 0.28235)   // #482D48


/**
 * Sets up the default display settings for the script. The current environment is
 * is saved under the name "RestoreState" before the settings are applied.
 * 
 * The settings applied are:
 * - Clears the current display to "natural" mode.
 *   (az mount, atmosphere, landscape, no lines, labels or markers)
 * - Configures grid lines colors.
 * - Sets font sizes for solar system objects and stars.
 * - Configures star and constellation settings.
 * - Sets observer location and landscape.
 * - Hides the GUI.
 * - Saves the state with the name "defaultState".
 */
function setup() {
    core.debug("Setting up environment");

    // reset view to home and save state.
    core.goHome();
    saveState("RestoreState");

    // az mount, atmosphere, landscape, no lines, labels or markers
    core.clear("natural");

    GridLinesMgr.setColorEquatorGrid(DirtyPurple);
    GridLinesMgr.setColorAzimuthalGrid(VeryDarkGreen);

    StelSkyLayerMgr.setFlagShow(false)

    SolarSystem.setFontSize(15); // default size is 13

    StarMgr.setFontSize(15); // default size is 13
    StarMgr.setLabelsAmount(3); // default is 3

    StelSkyDrawer.setAbsoluteStarScale(1.0);
    StelSkyDrawer.setRelativeStarScale(1.0);
    ZodiacalLight.setFlagShow(false);

    StelMovementMgr.setAutoMoveDuration(5);

    ConstellationMgr.setFontSize(18); // default size is 15
    ConstellationMgr.setArtIntensity(0.4);
    ConstellationMgr.setLinesColor(Gray40);
    ConstellationMgr.setLabelsColor(Gray40);
    ConstellationMgr.setBoundariesColor(Gray80);
    ConstellationMgr.setConstellationLineThickness(1);
    ConstellationMgr.setFlagConstellationPick(true);
    ConstellationMgr.setFlagIsolateSelected(true);
    ConstellationMgr.deselectConstellations();

    core.wait(2);
    // core.setObserverLocation("Bear Branch", "Earth");
    core.setObserverLocation(-76.986769, 39.647307, 210, 2, "BBNC", "Earth");
    LandscapeMgr.setCurrentLandscapeName("Bear Branch");

    core.setGuiVisible(false);

    saveState("defaultState");
}

/**
 * Sets up the display settings for a constellation tour.
 * 
 * The settings applied are:
 * - Clears the current display to "deepspace" mode.
 *   (Eq mount, no atmosphere, landscape etc. No planets, lines, labels or markers)
 * - Adjusts font size, art intensity, and colors for lines, labels, and boundaries.
 * - Enables the display of constellation lines, art, and boundaries.
 * - Saves the current state under the name "constellationState".
 */
function setupConstellations() {
    core.clear("deepspace");

    ConstellationMgr.setFontSize(18); // default size is 15
    ConstellationMgr.setArtIntensity(0.2);
    ConstellationMgr.setLinesColor(Gray40);
    ConstellationMgr.setLabelsColor(Gray40);
    ConstellationMgr.setBoundariesColor(Gray80);
    ConstellationMgr.setConstellationLineThickness(1);
    ConstellationMgr.setFlagIsolateSelected(true);
    ConstellationMgr.setFlagConstellationPick(true);
    ConstellationMgr.deselectConstellations();

    ConstellationMgr.setFlagLines(true);
    ConstellationMgr.setFlagArt(true);
    ConstellationMgr.setFlagBoundaries(true);

    saveState("constellationState");
}

/**
 * Cleans up the application state by restoring the previously saved state.
 * It also: 
 * - Manually resets the Solar System and Star font size (default 13).
 * - Deletes all markers and labels.
 * - Makes the GUI visible.
 */
function cleanup() {
    restoreState("RestoreState");

    // There is no getter for SolarSystem and StarMgr font size, restore them manually.
    StarMgr.setFontSize(13); // default size is 13
    SolarSystem.setFontSize(13); // default size is 13

    MarkerMgr.deleteAllMarkers();
    LabelMgr.deleteAllLabels();

    core.setGuiVisible(true);
}

/**
 * Returns the sunrise, sunset, and twilight times for a given date and
 * the current observer location.
 * 
 * @param {string} dtg - The date and time in the format "YYYY-MM-DD HH:MM:SS".
 * @param {number} tz - The timezone offset in hours. Default is -5 (EST).
 * @returns {object} - An object containing the sunrise, sunset, and twilight times.
 */
function getSun(dtg, tz = -5) {
    var loc = core.getObserverLocationInfo();
    var lat = loc.latitude;
    var lon = loc.longitude;
    var JD = core.jdFromDateString(dtg, spec = "utc");
    var sunrise = sunRise(JD, lat, lon, tz);
    var sunset = sunSet(JD, lat, lon, tz);

    var civTwilightMorn = civTwilightMorning(JD, lat, lon, tz);
    var civTwilightEven = civTwilightEvening(JD, lat, lon, tz);

    var nautTwilightMorn = nautTwilightMorning(JD, lat, lon, tz);
    var nautTwilightEven = nautTwilightEvening(JD, lat, lon, tz);

    var astTwilightMorn = astroTwilightMorning(JD, lat, lon, tz);
    var astTwilightEven = astroTwilightEvening(JD, lat, lon, tz);

    return {
        "sunrise": sunrise,
        "sunset": sunset,
        "civTwilightMorn": civTwilightMorn,
        "civTwilightEven": civTwilightEven,
        "nautTwilightMorn": nautTwilightMorn,
        "nautTwilightEven": nautTwilightEven,
        "astTwilightMorn": astTwilightMorn,
        "astTwilightEven": astTwilightEven
    };
};

/**
 * Toggles the visibility of the equatorial grid and dims the 
 * colors after a three second delay.
 */
function showEqGrid() {
    GridLinesMgr.setFlagEquatorGrid(false);

    GridLinesMgr.setColorEquatorGrid(BarneyPurple);
    GridLinesMgr.setFlagEquatorGrid(true);
    core.wait(3);

    GridLinesMgr.setFlagEquatorGrid(false);
    core.wait(0.5);

    GridLinesMgr.setColorEquatorGrid(DirtyPurple);
    GridLinesMgr.setFlagEquatorGrid(true);
}

/**
 * Toggles the visibility of the azimuthal grid and dims the 
 * colors after a three second delay.
 */
function showAzGrid() {
    GridLinesMgr.setFlagAzimuthalGrid(false);

    GridLinesMgr.setColorAzimuthalGrid(TrueGreen);
    GridLinesMgr.setFlagAzimuthalGrid(true);
    core.wait(3);

    GridLinesMgr.setFlagAzimuthalGrid(false);
    core.wait(0.5);

    GridLinesMgr.setColorAzimuthalGrid(VeryDarkGreen);
    GridLinesMgr.setFlagAzimuthalGrid(true);
}

/**
 * Pans the view by a specified distance in altitude. This is used in the
 * AltAz mount mode. For equatorial mode, use decPan.
 *
 * @param {number} distance - The distance as a fraction of the current fov.
 * @param {number} [duration=5] - The duration of the movement in seconds.
 */
function altPan(distance, duration = 5) {
    var az = core.getViewAzimuthAngle();
    var alt = core.getViewAltitudeAngle();
    var fov = StelMovementMgr.getCurrentFov();
    core.moveToAltAzi(alt + fov * distance, az, duration);
    core.wait(duration);
}

/**
 * Pans the view by a specified distance in declination. This is used in the
 * EQ mount mode. For azimuthal mode, use altPan.
 *
 * @param {number} distance - The distance as a fraction of the current fov.
 * @param {number} [duration=5] - The duration of the movement in seconds.
 */
function decPan(distance, duration = 5) {
    var ra = core.getViewRaJ2000Angle();
    var dec = core.getViewDecJ2000Angle();
    var fov = StelMovementMgr.getCurrentFov();
    core.moveToRaDecJ2000(ra, dec + fov * distance, duration);
    core.wait(duration);
}

/**
 * Fast forwards the time rate until a specified time or until key is pressed.
 *
 * @param {number} [rate=800] - The rate at which to fast forward the time.
 * @param {number} wait - The time at which the original time rate will be restored, a date string "2025-01-01T00:00",
 *                        or a relative time "+3 hours". If "L", waits for the user to press the "L" key.
 */
function fastForward(rate, wait = "L") {
    var timerate = core.getTimeRate();
    core.setTimeRate(rate);
    if (wait == "L") {
        L = LabelMgr.labelScreen("Rate = " + rate + (" press 'L' to resume"), 20, core.getScreenHeight() - 60,
            visible = true, fontSize = 18, fontColor = "#666666");
        i = 0;
        do {
            core.wait(1);
            i++;
        }
        while (core.getTimeRate() <= rate);
        core.setTimeRate(timerate);
        LabelMgr.deleteLabel(L);
    }
    else {
        core.waitFor(wait, spec = "local");
        core.setTimeRate(timerate);
    }
}

/**
 * Sets the time rate in the core system to a very slow rate (0.05) and waits for
 * the user to press the "L" key then restores the original time rate.
 *
 * Note: This function uses a blocking wait loop to effectively pause the script.
 */
function pauseKey(label = true) {
    var timerate = core.getTimeRate();
    core.setTimeRate(0.05);
    L = LabelMgr.labelScreen("Paused ('L' to continue)", 20, core.getScreenHeight() - 60,
        visible = false, fontSize = 18, fontColor = "#666666");
    if (label) {
        LabelMgr.setLabelShow(L, true);
    }
    i = 0;
    do {
        core.wait(1);
        i++;
    }
    while (core.getTimeRate() < 0.1);
    core.setTimeRate(timerate);
    LabelMgr.deleteLabel(L);
}

/**
 * Loads a sky image layer using a parameter dictionary.
 * Wraps `core.loadSkyImage` and forwards fields from `params`.
 *
 * Params:
 * - params.id: string — unique layer identifier.
 * - params.path: string — image path (relative or absolute).
 * - params.ra: string — RA center (e.g., "14h 29m 29.2s").
 * - params.dec: string — Dec center (e.g., "-62d 40m 25s").
 * - params.angSize: number — angular size in degrees.
 * - params.rotation: number — rotation angle in degrees.
 * - params.minRes: number — minimum resolution threshold.
 * - params.maxBright: number — maximum brightness scaling.
 * - params.visible: boolean — show layer immediately when loaded.
 *
 * Example usage:
 *  loadImage(proxima);
 * 
 * Note: Image params are in images.inc in root scripts folder.
 */
function loadImage(params) {
    core.loadSkyImage(
        params.id,
        params.path,
        params.ra,
        params.dec,
        params.angSize,
        params.rotation,
        params.minRes,
        params.maxBright,
        params.visible
    );
}
