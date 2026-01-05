/**
 * Prayer Times Service
 * Uses adhan-js library for accurate prayer times calculation
 * Same algorithm used by Muslim Pro and other accurate apps
 * No external API needed - all calculations done locally
 */

import { Coordinates, CalculationMethod, CalculationParameters, PrayerTimes as AdhanPrayerTimes, SunnahTimes, Qibla } from 'adhan';

// Custom Sri Lanka method (matches Muslim Pro settings exactly)
const getSriLankaMethod = () => {
    const params = CalculationMethod.Singapore();
    params.fajrAngle = 19.5; // Adjusted to match Muslim Pro Fajr time
    params.ishaAngle = 17.5;
    // Minute adjustments to match Muslim Pro exactly
    params.adjustments = {
        fajr: 0,      // base is 4:56 (correct)
        sunrise: 0,
        dhuhr: 0,
        asr: 0,       // 3:32 (correct)
        maghrib: 0,   // 6:02 (correct)
        isha: 2       // 7:16 -> 7:17
    };
    return params;
};

// Calculation methods matching common apps
export const CALCULATION_METHODS = {
    SRI_LANKA: { id: 'SriLanka', name: 'Sri Lanka', method: getSriLankaMethod },
    MUSLIM_WORLD_LEAGUE: { id: 'MuslimWorldLeague', name: 'Muslim World League', method: CalculationMethod.MuslimWorldLeague },
    ISNA: { id: 'NorthAmerica', name: 'Islamic Society of North America (ISNA)', method: CalculationMethod.NorthAmerica },
    EGYPT: { id: 'Egyptian', name: 'Egyptian General Authority of Survey', method: CalculationMethod.Egyptian },
    MAKKAH: { id: 'UmmAlQura', name: 'Umm Al-Qura University, Makkah', method: CalculationMethod.UmmAlQura },
    KARACHI: { id: 'Karachi', name: 'University of Islamic Sciences, Karachi', method: CalculationMethod.Karachi },
    TEHRAN: { id: 'Tehran', name: 'Institute of Geophysics, Tehran', method: CalculationMethod.Tehran },
    SINGAPORE: { id: 'Singapore', name: 'Singapore', method: CalculationMethod.Singapore },
    TURKEY: { id: 'Turkey', name: 'Diyanet İşleri Başkanlığı, Turkey', method: CalculationMethod.Turkey },
    DUBAI: { id: 'Dubai', name: 'Dubai', method: CalculationMethod.Dubai },
    QATAR: { id: 'Qatar', name: 'Qatar', method: CalculationMethod.Qatar },
    KUWAIT: { id: 'Kuwait', name: 'Kuwait', method: CalculationMethod.Kuwait },
    MOONSIGHTING: { id: 'MoonsightingCommittee', name: 'Moonsighting Committee', method: CalculationMethod.MoonsightingCommittee }
};

// Default calculation method
const DEFAULT_METHOD = 'SriLanka'; // Matches Muslim Pro settings for Sri Lanka

// Cache for location
let locationCache = null;

/**
 * Get user's location using GPS or IP fallback
 */
export const getUserLocation = async () => {
    // Return cached location if available
    if (locationCache) {
        console.log('📍 Using cached location');
        return locationCache;
    }

    // Try GPS first
    if ('geolocation' in navigator) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                });
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocode to get city name
            try {
                const geoResponse = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const geoData = await geoResponse.json();

                locationCache = {
                    latitude,
                    longitude,
                    city: geoData.city || geoData.locality || 'Unknown',
                    country: geoData.countryName || 'Unknown',
                    source: 'GPS'
                };
                return locationCache;
            } catch {
                locationCache = {
                    latitude,
                    longitude,
                    city: 'Unknown',
                    country: 'Unknown',
                    source: 'GPS'
                };
                return locationCache;
            }
        } catch (gpsError) {
            console.warn('GPS failed, falling back to IP:', gpsError.message);
        }
    }

    // Fallback to IP-based location
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        locationCache = {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            source: 'IP'
        };
        return locationCache;
    } catch (ipError) {
        console.error('IP location failed:', ipError);
        // Default to Colombo, Sri Lanka
        locationCache = {
            latitude: 6.9271,
            longitude: 79.8612,
            city: 'Colombo',
            country: 'Sri Lanka',
            source: 'Default'
        };
        return locationCache;
    }
};

/**
 * Get Hijri date
 */
const getHijriDate = (date) => {
    // Simple Hijri calculation (approximate)
    const gregorianDate = new Date(date);
    const jd = Math.floor((gregorianDate.getTime() / 86400000) + 2440587.5);
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    const hijriMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
        'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
    ];

    const hijriMonthsArabic = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
        day: day.toString(),
        month: hijriMonths[month - 1] || 'Unknown',
        monthArabic: hijriMonthsArabic[month - 1] || '',
        year: year.toString(),
        weekday: weekdays[gregorianDate.getDay()],
        designation: 'AH'
    };
};

/**
 * Format time to HH:MM
 */
const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Get prayer times for a specific date and location
 */
export const getPrayerTimes = async (
    latitude,
    longitude,
    date = new Date(),
    methodId = DEFAULT_METHOD
) => {
    try {
        console.log(`📿 Calculating prayer times for ${latitude}, ${longitude}`);

        // Find the calculation method
        const methodConfig = Object.values(CALCULATION_METHODS).find(m => m.id === methodId);
        const calculationParams = methodConfig ? methodConfig.method() : CalculationMethod.Karachi();

        // Create coordinates
        const coordinates = new Coordinates(latitude, longitude);

        // Calculate prayer times
        const prayerTimes = new AdhanPrayerTimes(coordinates, date, calculationParams);
        const sunnahTimes = new SunnahTimes(prayerTimes);

        // Get Qibla direction
        const qiblaDirection = Qibla(coordinates);

        const result = {
            timings: {
                Fajr: formatTime(prayerTimes.fajr),
                Sunrise: formatTime(prayerTimes.sunrise),
                Dhuhr: formatTime(prayerTimes.dhuhr),
                Asr: formatTime(prayerTimes.asr),
                Maghrib: formatTime(prayerTimes.maghrib),
                Isha: formatTime(prayerTimes.isha),
                Midnight: formatTime(sunnahTimes.middleOfTheNight),
                Imsak: formatTime(new Date(prayerTimes.fajr.getTime() - 10 * 60000)) // 10 min before Fajr
            },
            date: {
                hijri: getHijriDate(date),
                gregorian: {
                    day: date.getDate().toString(),
                    month: date.toLocaleString('en', { month: 'long' }),
                    year: date.getFullYear().toString(),
                    weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
                    date: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
                }
            },
            meta: {
                method: methodConfig ? methodConfig.name : 'Karachi',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                qiblaDirection: Math.round(qiblaDirection * 100) / 100
            },
            isCalculated: true
        };

        console.log('📿 Prayer times calculated:', result.timings);
        return result;
    } catch (error) {
        console.error('❌ Error calculating prayer times:', error);
        throw error;
    }
};

/**
 * Get the next prayer time
 */
export const getNextPrayer = (timings) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const prayer of prayers) {
        const [hours, minutes] = timings[prayer].split(':').map(Number);
        const prayerTime = hours * 60 + minutes;

        if (prayerTime > currentTime) {
            const remainingMinutes = prayerTime - currentTime;
            const remainingHours = Math.floor(remainingMinutes / 60);
            const remainingMins = remainingMinutes % 60;

            return {
                name: prayer,
                time: timings[prayer],
                remaining: {
                    hours: remainingHours,
                    minutes: remainingMins,
                    total: remainingMinutes
                },
                isPast: false
            };
        }
    }

    // If all prayers have passed, next is tomorrow's Fajr
    const [fajrHours, fajrMinutes] = timings.Fajr.split(':').map(Number);
    const fajrTime = fajrHours * 60 + fajrMinutes;
    const remainingMinutes = (24 * 60 - currentTime) + fajrTime;

    return {
        name: 'Fajr',
        time: timings.Fajr,
        remaining: {
            hours: Math.floor(remainingMinutes / 60),
            minutes: remainingMinutes % 60,
            total: remainingMinutes
        },
        isPast: false,
        isTomorrow: true
    };
};

/**
 * Get current prayer (the one that is active now)
 */
export const getCurrentPrayer = (timings) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
        { name: 'Isha', start: 'Isha' },
        { name: 'Maghrib', start: 'Maghrib' },
        { name: 'Asr', start: 'Asr' },
        { name: 'Dhuhr', start: 'Dhuhr' },
        { name: 'Fajr', start: 'Fajr' }
    ];

    const prayerTimes = prayers.map(p => {
        const [hours, minutes] = timings[p.start].split(':').map(Number);
        return { ...p, time: hours * 60 + minutes };
    }).sort((a, b) => b.time - a.time);

    for (const prayer of prayerTimes) {
        if (currentTime >= prayer.time) {
            return prayer.name;
        }
    }

    return 'Night';
};

/**
 * Format time for display (12-hour or 24-hour)
 */
export const formatPrayerTime = (time24, use24Hour = false) => {
    if (use24Hour) return time24;

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Export default method for convenience
export const getDefaultMethod = () => DEFAULT_METHOD;
