import { useEffect, useState } from 'react';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast?latitude=16.0544&longitude=108.2022&daily=weather_code,precipitation_sum,precipitation_probability_max,temperature_2m_min,temperature_2m_max&timezone=Asia%2FHo_Chi_Minh&forecast_days=16';
const RAIN_CHANCE = 50;
const RAIN_MM = 1;

let request = null;

function toDays(daily) {
    return Object.fromEntries(daily.time.map((key, index) => [key, {
        code: daily.weather_code[index],
        rain: daily.precipitation_sum[index] ?? 0,
        chance: daily.precipitation_probability_max[index] ?? 0,
        min: daily.temperature_2m_min[index],
        max: daily.temperature_2m_max[index],
    }]));
}

function loadForecast() {
    if (!request) {
        request = fetch(FORECAST_URL)
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
            .then((body) => ({ status: 'ready', days: toDays(body.daily) }))
            .catch(() => {
                request = null;
                return { status: 'error', days: {} };
            });
    }
    return request;
}

/**
 * Daily Da Nang forecast for the next 16 days, keyed by YYYY-MM-DD.
 */
export function useForecast() {
    const [forecast, setForecast] = useState({ status: 'loading', days: {} });

    useEffect(() => {
        let active = true;
        loadForecast().then((result) => {
            if (active) {
                setForecast(result);
            }
        });
        return () => {
            active = false;
        };
    }, []);

    return forecast;
}

export function isRainy(day) {
    return day.chance >= RAIN_CHANCE || day.rain >= RAIN_MM;
}

export function weatherKind(code) {
    if (code === 0) {
        return 'clear';
    }
    if (code === 45 || code === 48) {
        return 'fog';
    }
    if (code >= 51 && code <= 57) {
        return 'drizzle';
    }
    if (code >= 80 && code <= 82) {
        return 'showers';
    }
    if (code >= 61 && code <= 67) {
        return 'rain';
    }
    if (code >= 95) {
        return 'storm';
    }
    return 'cloudy';
}
