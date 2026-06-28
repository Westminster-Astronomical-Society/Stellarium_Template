// Name: solar_calc.js
// License: Public Domain
// Author: Chris Bennett
// Version: 1.0
// Description: Script for Solar calculations. Mostly stolen from
// http://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html


/* Solar position calculation functions */
/*************************************************************/

const MINUTES_PER_DAY = 1440;
const JULIAN_CENTURY = 36525.0;
const JD_J2000 = 2451545.0;

/**
 * Converts an angle from radians to degrees.
 *
 * @param {number} angleRad - The angle in radians.
 * @returns {number} The angle in degrees.
 */
function radToDeg(angleRad) {
    return (180.0 * angleRad / Math.PI);
}

/**
 * Converts an angle from degrees to radians.
 *
 * @param {number} angleDeg - The angle in degrees.
 * @returns {number} The angle in radians.
 */
function degToRad(angleDeg) {
    return (Math.PI * angleDeg / 180.0);
}

/**
 * Calculates the Julian Century from the Julian Date.
 *
 * @param {number} jd - The Julian Date.
 * @returns {number} The Julian Century.
 */
function calcTimeJulianCent(jd) {
    const T = (jd - JD_J2000) / JULIAN_CENTURY;
    return T;
}

/**
 * Calculates the Julian Date (JD) from Julian Centuries (t).
 *
 * @param {number} t - The number of Julian Centuries since J2000.0.
 * @returns {number} The Julian Date corresponding to the given Julian Centuries.
 */
function calcJDFromJulianCent(t) {
    const JD = t * JULIAN_CENTURY + JD_J2000;
    return JD;
}

/**
 * Determines if a given year is a leap year.
 *
 * A leap year is exactly divisible by 4 except for end-of-century years, which must be divisible by 400.
 * This means that the year 2000 was a leap year, although 1900 was not.
 *
 * @param {number} yr - The year to be checked.
 * @returns {boolean} - Returns true if the year is a leap year, otherwise false.
 */
function isLeapYear(yr) {
    return ((yr % 4 == 0 && yr % 100 != 0) || yr % 400 == 0);
}

/**
 * Converts a Julian Date (JD) to a calendar date.
 *
 * @param {number} jd - The Julian Date to convert.
 * @returns {Object} An object containing the year, month, and day corresponding to the given Julian Date.
 * @returns {number} return.year - The year of the calendar date.
 * @returns {number} return.month - The month of the calendar date (1-12).
 * @returns {number} return.day - The day of the calendar date.
 */
function calcDateFromJD(jd) {
    const z = Math.floor(jd + 0.5);
    const f = (jd + 0.5) - z;
    let A;
    if (z < 2299161) {
        A = z;
    } else {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        A = z + 1 + alpha - Math.floor(alpha / 4);
    }
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E) + f;
    const month = (E < 14) ? E - 1 : E - 13;
    const year = (month > 2) ? C - 4716 : C - 4715;

    return { year: year, month: month, day: day };
}

/**
 * Calculates the day of the year (DOY) from a given Julian Date (JD).
 *
 * @param {number} jd - The Julian Date.
 * @returns {number} The day of the year (1-366).
 */
function calcDoyFromJD(jd) {
    const date = calcDateFromJD(jd)

    const k = (isLeapYear(date.year) ? 1 : 2);
    const doy = Math.floor((275 * date.month) / 9) - k * Math.floor((date.month + 9) / 12) + date.day - 30;

    return doy;
}

/**
 * Calculates the Julian Date (JD) for a given Gregorian calendar date.
 *
 * @param {number} year - The year of the date.
 * @param {number} month - The month of the date (1-12).
 * @param {number} day - The day of the date (1-31).
 * @returns {number} The Julian Date corresponding to the given date.
 */
function getJD(year, month, day) {
    if (month <= 2) {
        year -= 1
        month += 12
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    return JD;
}

/**
 * Calculates the geometric mean longitude of the sun.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The geometric mean longitude of the sun in degrees.
 */
function calcGeomMeanLongSun(t) {
    let L0 = 280.46646 + t * (36000.76983 + t * (0.0003032))
    while (L0 > 360.0) {
        L0 -= 360.0
    }
    while (L0 < 0.0) {
        L0 += 360.0
    }
    return L0;
}

/**
 * Calculate the geometric mean anomaly of the Sun.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The geometric mean anomaly of the Sun in degrees.
 */
function calcGeomMeanAnomalySun(t) {
    const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    return M;
}

/**
 * Calculates the eccentricity of Earth's orbit.
 *
 * The eccentricity of Earth's orbit changes over time due to gravitational interactions with other bodies in the solar system.
 *
 * @param {number} t - Time in Julian centuries since J2000.0.
 * @returns {number} The eccentricity of Earth's orbit (unitless).
 */
function calcEccentricityEarthOrbit(t) {
    const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    return e;
}

/**
 * Calculate the Sun's equation of center.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The Sun's equation of center in degrees.
 */
function calcSunEqOfCenter(t) {
    const m = calcGeomMeanAnomalySun(t);
    const mrad = degToRad(m);
    const sinm = Math.sin(mrad);
    const sin2m = Math.sin(mrad + mrad);
    const sin3m = Math.sin(mrad + mrad + mrad);
    const C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
    return C;
}

/**
 * Calculates the true longitude of the sun.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The true longitude of the sun in degrees.
 */
function calcSunTrueLong(t) {
    const l0 = calcGeomMeanLongSun(t);
    const c = calcSunEqOfCenter(t);
    const O = l0 + c;
    return O;
}

/**
 * Calculates the Sun's true anomaly.
 *
 * @param {number} t - The time in Julian centuries since J2000.0.
 * @returns {number} The Sun's true anomaly in degrees.
 */
function calcSunTrueAnomaly(t) {
    const m = calcGeomMeanAnomalySun(t);
    const c = calcSunEqOfCenter(t);
    const v = m + c;
    return v;
}

/**
 * Calculates the Sun's radius vector (distance from the Earth to the Sun) in astronomical units (AU).
 *
 * @param {number} t - The time in Julian centuries since J2000.0.
 * @returns {number} The Sun's radius vector in astronomical units (AU).
 */
function calcSunRadVector(t) {
    const v = calcSunTrueAnomaly(t);
    const e = calcEccentricityEarthOrbit(t);
    const R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(degToRad(v)));
    return R;
}

/**
 * Calculates the apparent longitude of the Sun.
 *
 * @param {number} t - Julian century since J2000.0.
 * @returns {number} The apparent longitude of the Sun in degrees.
 */
function calcSunApparentLong(t) {
    const o = calcSunTrueLong(t);
    const omega = 125.04 - 1934.136 * t;
    const lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
    return lambda;
}

/**
 * Calculates the mean obliquity of the ecliptic.
 *
 * The obliquity of the ecliptic is the angle between the plane of the Earth's orbit and the plane of the Earth's equator.
 * This function uses a formula to approximate the mean obliquity of the ecliptic at a given time.
 *
 * @param {number} t - Julian centuries since J2000.0.
 * @returns {number} The mean obliquity of the ecliptic in degrees.
 */
function calcMeanObliquityOfEcliptic(t) {
    const seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * (0.001813)));
    const e0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
    return e0;
}

/**
 * Calculates the obliquity correction for a given time.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The corrected obliquity of the ecliptic in degrees.
 */
function calcObliquityCorrection(t) {
    const e0 = calcMeanObliquityOfEcliptic(t);
    const omega = 125.04 - 1934.136 * t;
    const e = e0 + 0.00256 * Math.cos(degToRad(omega));
    return e;
}

/**
 * Calculates the Right Ascension (RA) of the Sun.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The Right Ascension of the Sun in degrees.
 */
function calcSunRA(t) {
    const e = calcObliquityCorrection(t);
    const lambda = calcSunApparentLong(t);
    const tananum = (Math.cos(degToRad(e)) * Math.sin(degToRad(lambda)));
    const tanadenom = (Math.cos(degToRad(lambda)));
    const alpha = radToDeg(Math.atan2(tananum, tanadenom));
    return alpha;
}

/**
 * Calculates the declination of the Sun.
 *
 * @param {number} t - The number of Julian centuries since J2000.0.
 * @returns {number} The declination of the Sun in degrees.
 */
function calcSunDec(t) {
    const e = calcObliquityCorrection(t);
    const lambda = calcSunApparentLong(t);
    const sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
    const theta = radToDeg(Math.asin(sint));
    return theta;
}

/**
 * Calculates the equation of time for a given Julian century.
 * The equation of time is the difference between apparent solar time and mean solar time.
 *
 * @param {number} t - Julian centuries since J2000.0.
 * @returns {number} - The equation of time in minutes of time.
 */
function calcEquationOfTime(t) {
    const epsilon = calcObliquityCorrection(t);
    const l0 = calcGeomMeanLongSun(t);
    const e = calcEccentricityEarthOrbit(t);
    const m = calcGeomMeanAnomalySun(t);

    let y = Math.tan(degToRad(epsilon) / 2.0);
    y *= y;

    const sin2l0 = Math.sin(2.0 * degToRad(l0));
    const sinm = Math.sin(degToRad(m));
    const cos2l0 = Math.cos(2.0 * degToRad(l0));
    const sin4l0 = Math.sin(4.0 * degToRad(l0));
    const sin2m = Math.sin(2.0 * degToRad(m));

    const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
    return radToDeg(Etime) * 4.0;
}

/**
 * Calculates the hour angle of the sun at sunset or sunrise.
 * (for sunset, use -HA)
 *
 * @param {number} lat - The latitude in degrees.
 * @param {number} solarDec - The solar declination in degrees.
 * @param {number} ZSun - The zenith angle of the horizon in degrees.
 * @returns {number} The hour angle of the sun in radians.
 */
function calcHourAngleSun(lat, solarDec, ZSun) {
    const latRad = degToRad(lat);
    const sdRad = degToRad(solarDec);
    const HAarg = (Math.cos(degToRad(ZSun)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad));
    const HA = Math.acos(HAarg);
    return HA;
}

/**
 * Checks if the given input is a valid number.
 * The input can be a positive or negative number and can contain one decimal point.
 *
 * @param {string|number} inputVal - The value to be checked.
 * @returns {boolean} - Returns true if the input is a valid number, otherwise false.
 */
function isNumber(inputVal) {
    let oneDecimal = false;
    const inputStr = "" + inputVal;
    for (let i = 0; i < inputStr.length; i++) {
        const oneChar = inputStr.charAt(i);
        if (i == 0 && (oneChar == "-" || oneChar == "+")) {
            continue;
        }
        if (oneChar == "." && !oneDecimal) {
            oneDecimal = true;
            continue;
        }
        if (oneChar < "0" || oneChar > "9") {
            return false;
        }
    }
    return true;
}

/**
 * Calculates the atmospheric refraction correction for a given elevation angle.
 *
 * @param {number} elev - The elevation angle in degrees.
 * @returns {number} The refraction correction in degrees.
 */
function calcRefraction(elev) {
    let correction = 0.0;

    if (elev > 85.0) {
        correction = 0.0;
    } else {
        const te = Math.tan(degToRad(elev));
        if (elev > 5.0) {
            correction = 58.1 / te - 0.07 / (te * te * te) + 0.000086 / (te * te * te * te * te);
        } else if (elev > -0.575) {
            correction = 1735.0 + elev * (-518.2 + elev * (103.4 + elev * (-12.79 + elev * 0.711)));
        } else {
            correction = -20.774 / te;
        }
        correction = correction / 3600.0;
    }

    return correction;
}

/**
 * Calculates the azimuth and elevation of the sun for a given time and location.
 *
 * @param {number} T - Julian century since J2000.0.
 * @param {number} localtime - Local time in minutes from midnight.
 * @param {number} latitude - Latitude of the observer in degrees.
 * @param {number} longitude - Longitude of the observer in degrees.
 * @param {number} zone - Time zone offset from UTC in hours.
 * @returns {Object} An object containing the azimuth and elevation of the sun.
 * @returns {number} azimuth - The azimuth angle of the sun in degrees.
 * @returns {number} elevation - The elevation angle of the sun in degrees.
 */
function calcAzEl(T, localtime, latitude, longitude, zone) {

    const eqTime = calcEquationOfTime(T)
    const theta = calcSunDec(T)

    const solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone
    const earthRadVec = calcSunRadVector(T)
    let trueSolarTime = localtime + solarTimeFix
    while (trueSolarTime > MINUTES_PER_DAY) {
        trueSolarTime -= MINUTES_PER_DAY
    }
    let hourAngle = trueSolarTime / 4.0 - 180.0;
    if (hourAngle < -180) {
        hourAngle += 360.0
    }
    const haRad = degToRad(hourAngle)
    let csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad)
    if (csz > 1.0) {
        csz = 1.0
    } else if (csz < -1.0) {
        csz = -1.0
    }
    const zenith = radToDeg(Math.acos(csz))
    const azDenom = (Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)))
    let azimuth;
    if (Math.abs(azDenom) > 0.001) {
        let azRad = ((Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith))) - Math.sin(degToRad(theta))) / azDenom
        if (Math.abs(azRad) > 1.0) {
            azRad = (azRad < 0) ? -1.0 : 1.0;
        }
        azimuth = 180.0 - radToDeg(Math.acos(azRad))
        if (hourAngle > 0.0) {
            azimuth = -azimuth
        }
    } else {
        azimuth = (latitude > 0.0) ? 180.0 : 0.0;
    }
    if (azimuth < 0.0) {
        azimuth += 360.0
    }
    const exoatmElevation = 90.0 - zenith;

    // Atmospheric Refraction correction
    const refractionCorrection = calcRefraction(exoatmElevation);

    const solarZen = zenith - refractionCorrection;
    const elevation = 90.0 - solarZen;

    return { "azimuth": azimuth, "elevation": elevation };
}

/**
 * Calculates the solar noon (local apparent noon) for a given Julian date, longitude, and timezone.
 *
 * @param {number} jd - The Julian date.
 * @param {number} longitude - The longitude in degrees (positive for east, negative for west).
 * @param {number} timezone - The timezone offset from UTC in hours.
 * @returns {number} The solar noon in local time (minutes from midnight).
 */
function calcSolNoon(jd, longitude, timezone) {
    const tnoon = calcTimeJulianCent(jd - longitude / 360.0);
    let eqTime = calcEquationOfTime(tnoon);
    const solNoonOffset = 720.0 - (longitude * 4) - eqTime; // in minutes
    const newt = calcTimeJulianCent(jd - 0.5 + solNoonOffset / MINUTES_PER_DAY);
    eqTime = calcEquationOfTime(newt);
    let solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone * 60.0); // in minutes
    solNoonLocal = ((solNoonLocal % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

    return solNoonLocal;
}

/**
 * Calculates the Universal Time Coordinated (UTC) time of sunrise or sunset for a given date and location.
 *
 * @param {boolean} rise - If 1, calculates the time of sunrise; if 0, calculates the time of sunset.
 * @param {number} JD - The Julian Date for which the calculation is to be made.
 * @param {number} latitude - The latitude of the location in degrees.
 * @param {number} longitude - The longitude of the location in degrees.
 * @param {number} ZSun - The zenith angle of the horizon in degrees (e.g., 90.833 for the standard value of the sun's upper limb touching the horizon).
 * @returns {number} The time of sunrise or sunset in minutes from midnight UTC.
 */
function calcSunUTC(rise, JD, latitude, longitude, ZSun) {
    const t = calcTimeJulianCent(JD);
    const eqTime = calcEquationOfTime(t);
    const solarDec = calcSunDec(t);
    let hourAngle = calcHourAngleSun(latitude, solarDec, ZSun);
    if (!rise) hourAngle = -hourAngle;
    const delta = longitude + radToDeg(hourAngle);
    const timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes

    return timeUTC;
}

/**
 * Calculates the time and azimuth of sunrise or sunset.
 *
 * @param {boolean} rise - 1 for sunrise, 0 for sunset, morning twilight 1, evening 0.
 * @param {number} JD - Julian Date.
 * @param {number} latitude - Latitude in degrees.
 * @param {number} longitude - Longitude in degrees.
 * @param {number} ZSun - The zenith angle of the horizon in degrees
 * @param {number} timezone - Timezone offset from UTC in hours.
 * @returns {Object} An object containing:
 *   - {number} jday - Julian day of the event.
 *   - {number} timelocal - Local time of the event in minutes from midnight.
 *   - {number} azimuth - Azimuth of the sun at the event in degrees.
 */
function calcSun(rise, JD, latitude, longitude, ZSun, timezone) {
    let timeLocal;
    let azimuth;
    let jday;

    const timeUTC = calcSunUTC(rise, JD, latitude, longitude, ZSun);
    const newTimeUTC = calcSunUTC(rise, JD + timeUTC / MINUTES_PER_DAY, latitude, longitude, ZSun);
    if (isNumber(newTimeUTC)) {
        timeLocal = newTimeUTC + (timezone * 60.0)
        const riseT = calcTimeJulianCent(JD + newTimeUTC / MINUTES_PER_DAY)
        const riseAzEl = calcAzEl(riseT, timeLocal, latitude, longitude, timezone)
        azimuth = riseAzEl.azimuth
        jday = JD
        if ((timeLocal < 0.0) || (timeLocal >= MINUTES_PER_DAY)) {
            const increment = ((timeLocal < 0) ? 1 : -1)
            while ((timeLocal < 0.0) || (timeLocal >= MINUTES_PER_DAY)) {
                timeLocal += increment * MINUTES_PER_DAY
                jday -= increment
            }
        }

    } else { // no sunrise/set found

        azimuth = -1.0
        timeLocal = 0.0
        const doy = calcDoyFromJD(JD)
        if (((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
            ((latitude < -66.4) && ((doy < 83) || (doy > 263)))) {
            //previous sunrise/next sunset
            jday = calcJDofNextPrev(!rise, rise, JD, latitude, longitude, timezone)
        } else {   //previous sunset/next sunrise
            jday = calcJDofNextPrev(rise, rise, JD, latitude, longitude, timezone)
        }
    }

    return { jday: jday, timelocal: timeLocal, azimuth: azimuth };
}

/**
 * Calculates the Julian Date (JD) of the next or previous sunrise or sunset.
 *
 * @param {boolean} next - If true, calculates the next event; if false, calculates the previous event.
 * @param {boolean} rise - If true, calculates the sunrise; if false, calculates the sunset.
 * @param {number} JD - The initial Julian Date.
 * @param {number} latitude - The latitude of the observer in degrees.
 * @param {number} longitude - The longitude of the observer in degrees.
 * @param {number} ZSun - The zenith angle of the horizon in degrees.
 * @param {number} tz - The time zone offset from UTC in hours.
 * @returns {number} - The Julian Date of the next or previous sunrise or sunset.
 */
function calcJDofNextPrev(next, rise, JD, latitude, longitude, ZSun, tz) {

    let julianday = JD;
    const increment = ((next) ? 1.0 : -1.0);
    let time = calcSunUTC(rise, julianday, latitude, longitude, ZSun);

    while (!isNumber(time)) {
        julianday += increment;
        time = calcSunUTC(rise, julianday, latitude, longitude, ZSun);
    }
    let timeLocal = time + tz * 60.0
    while ((timeLocal < 0.0) || (timeLocal >= MINUTES_PER_DAY)) {
        const incr = ((timeLocal < 0) ? 1 : -1)
        timeLocal += (incr * MINUTES_PER_DAY)
        julianday -= incr
    }

    return julianday;
}

/******************************************************************/
/* Main functions that return a string in Stellarium date format. */
/******************************************************************/

/**
 * Calculates the local time of sunrise for a given Julian Date, latitude, longitude, and time zone.
 *
 * @param {number} JD - The Julian Date for which to calculate the sunrise time.
 * @param {number} lat - The observer latitude in degrees.
 * @param {number} lon - The observer longitude in degrees.
 * @param {number} tz - The time zone offset from UTC in hours.
 * @returns {string} The local time of sunrise (YYYY-MM-DDTHH:MM:SS).
 */
function sunRise(JD, lat, lon, tz) {
    const t = calcSun(1, JD, lat, lon, 90.8333, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the local time of sunset for a given Julian Date, latitude, longitude, and time zone.
 *
 * @param {number} JD - The Julian Date for which to calculate the sunset time.
 * @param {number} lat - The latitude of the location in degrees.
 * @param {number} lon - The longitude of the location in degrees.
 * @param {number} tz - The time zone offset from UTC in hours.
 * @returns {string} The local time of sunset (YYYY-MM-DDTHH:MM:SS).
 */
function sunSet(JD, lat, lon, tz) {
    const t = calcSun(0, JD, lat, lon, 90.8333, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the time of morning civil twilight.
 *
 * @param {number} JD - Julian Date.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} tz - Time zone offset from UTC in hours.
 * @returns {string} The local time of morning civil twilight (YYYY-MM-DDTHH:MM:SS).
 */
function civTwilightMorning(JD, lat, lon, tz) {
    const t = calcSun(1, JD, lat, lon, 96, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the time of evening civil twilight.
 *
 * @param {number} JD - Julian Date.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} tz - Time zone offset from UTC in hours.
 * @returns {string} The local time of evening civil twilight (YYYY-MM-DDTHH:MM:SS).
 */
function civTwilightEvening(JD, lat, lon, tz) {
    const t = calcSun(0, JD, lat, lon, 96, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the time of morning nautical twilight.
 *
 * @param {number} JD - Julian Date.
 * @param {number} lat - Latitude of the observer in degrees.
 * @param {number} lon - Longitude of the observer in degrees.
 * @param {number} tz - Time zone offset from UTC in hours.
 * @returns {string} The local time of morning nautical twilight (YYYY-MM-DDTHH:MM:SS).
 */
function nautTwilightMorning(JD, lat, lon, tz) {
    const t = calcSun(1, JD, lat, lon, 102, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the time of evening nautical twilight.
 *
 * @param {number} JD - Julian Date.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} tz - Time zone offset from UTC in hours.
 * @returns {string} The local time of evening nautical twilight (YYYY-MM-DDTHH:MM:SS).
 */
function nautTwilightEvening(JD, lat, lon, tz) {
    const t = calcSun(0, JD, lat, lon, 102, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the time of morning astronomical twilight.
 *
 * @param {number} JD - Julian Date.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} tz - Time zone offset from UTC in hours.
 * @returns {string} The local time of morning astronomical twilight (YYYY-MM-DDTHH:MM:SS).
 */
function astroTwilightMorning(JD, lat, lon, tz) {
    const t = calcSun(1, JD, lat, lon, 108, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/**
 * Calculates the time of evening astronomical twilight.
 *
 * @param {number} JD - Julian Date.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} tz - Time zone offset from UTC in hours.
 * @returns {string} The local time of evening astronomical twilight (YYYY-MM-DDTHH:MM:SS).
 */
function astroTwilightEvening(JD, lat, lon, tz) {
    const t = calcSun(0, JD, lat, lon, 108, tz);
    return timeDateString(t["jday"], t["timelocal"]);
}

/********************************************/
/* Some functions to deal with date strings */
/********************************************/

const monthList = [
    { name: "January", numdays: 31, abbr: "Jan" },
    { name: "February", numdays: 28, abbr: "Feb" },
    { name: "March", numdays: 31, abbr: "Mar" },
    { name: "April", numdays: 30, abbr: "Apr" },
    { name: "May", numdays: 31, abbr: "May" },
    { name: "June", numdays: 30, abbr: "Jun" },
    { name: "July", numdays: 31, abbr: "Jul" },
    { name: "August", numdays: 31, abbr: "Aug" },
    { name: "September", numdays: 30, abbr: "Sep" },
    { name: "October", numdays: 31, abbr: "Oct" },
    { name: "November", numdays: 30, abbr: "Nov" },
    { name: "December", numdays: 31, abbr: "Dec" },
];

/**
 * Converts Julian Date and minutes into a formatted date-time string.
 *
 * @param {number} JD - The Julian Date.
 * @param {number} minutes - The number of minutes past midnight.
 * @returns {string} A formatted date-time string.
 */
function timeDateString(JD, minutes) {
    const date = calcDateFromJD(JD);
    return getDateString({
        year: date.year,
        month: date.month,
        day: Math.floor(date.day),
        hour: Math.floor(minutes / 60),
        minute: Math.floor(minutes % 60),
        second: 0
    });
}

/**
 * Converts a given number of minutes into a formatted time string.
 *
 * @param {number} minutes - The number of minutes to convert. Should be between 0 and 1440 (MINUTES_PER_DAY).
 * @param {number} flag - Determines the format of the output string.
 *                        If flag > 2, the output includes seconds.
 *                        If flag == 2 and seconds are 30 or more, the minute is rounded up.
 * @returns {string} The formatted time string in "HH:MM" or "HH:MM:SS" format, or "error" if the input is out of range.
 */
function timeString(minutes, flag) {
    if ((minutes >= 0) && (minutes < MINUTES_PER_DAY)) {
        const floatHour = minutes / 60.0;
        let hour = Math.floor(floatHour);
        const floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
        let minute = Math.floor(floatMinute);
        const floatSec = 60.0 * (floatMinute - Math.floor(floatMinute));
        let second = Math.floor(floatSec + 0.5);
        if (second > 59) {
            second = 0
            minute += 1
        }
        if ((flag == 2) && (second >= 30)) minute++;
        if (minute > 59) {
            minute = 0
            hour += 1
        }
        let output = zeroPad(hour, 2) + ":" + zeroPad(minute, 2);
        if (flag > 2) output = output + ":" + zeroPad(second, 2);
    } else {
        const output = "error"
    }

    return output;
}

/**
 * Pads a number with leading zeros until it reaches the specified number of digits.
 *
 * @param {number|string} n - The number to be padded.
 * @param {number} digits - The desired length of the resulting string.
 * @returns {string} The padded number as a string.
 */
function zeroPad(n, digits) {

    n = n.toString();
    while (n.length < digits) {
        n = '0' + n;
    }
    return n;
}

//--------------------------------------------------------------
/**
 * Converts a date object to an ISO 8601 formatted string.
 *
 * @param {Object} date - The date object to format.
 * @param {number} date.year - The year.
 * @param {number} date.month - The month (1-12).
 * @param {number} date.day - The day of the month (1-31).
 * @param {number} date.hour - The hour (0-23).
 * @param {number} date.minute - The minute (0-59).
 * @param {number} date.second - The second (0-59).
 * @returns {string} The formatted date string in ISO 8601 format.
 */
function getDateString(date) {

    const s = date.year
        + '-'
        + zeroPad(date.month, 2)
        + '-'
        + zeroPad(date.day, 2)
        + 'T'
        + zeroPad(date.hour, 2)
        + ':'
        + zeroPad(date.minute, 2)
        + ':'
        + zeroPad(date.second, 2)

    return s;
}
