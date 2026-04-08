import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
  forecast?: {
    avgTemp: number;
    avgHumidity: number;
    totalRainMm: number;
  };
}

/** Try to get the user's coordinates via the browser Geolocation API. */
const getCoordinates = (): Promise<{ lat: number; lon: number } | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300000 }
    );
  });

export const fetchWeather = async (fallbackCity: string): Promise<WeatherData> => {
  try {
    const coords = await getCoordinates();

    const body = coords
      ? { lat: coords.lat, lon: coords.lon }
      : { city: `${fallbackCity},KE` };

    const { data, error } = await supabase.functions.invoke("get-weather", { body });

    if (error) throw error;
    return data as WeatherData;
  } catch (err) {
    console.error("Weather fetch failed, using fallback:", err);
    return {
      temperature: 24,
      humidity: 65,
      windSpeed: 12,
      condition: "Partly Cloudy",
      icon: "⛅",
      location: fallbackCity,
    };
  }
};

export const getWeatherAdvice = (weather: WeatherData): string => {
  const parts: string[] = [];

  if (weather.humidity > 80) {
    parts.push("High humidity detected — reduce irrigation frequency and monitor for fungal diseases.");
  } else if (weather.humidity < 40) {
    parts.push("Low humidity — increase irrigation and consider mulching to retain soil moisture.");
  }

  if (weather.temperature > 32) {
    parts.push("High temperatures expected — irrigate early morning or late evening to minimize evaporation. Provide shade for sensitive crops.");
  } else if (weather.temperature < 12) {
    parts.push("Low temperatures detected — delay fertilizer application as nutrient uptake slows in cold conditions.");
  }

  if (weather.forecast && weather.forecast.totalRainMm > 30) {
    parts.push(`Rain forecast (${weather.forecast.totalRainMm}mm expected) — skip irrigation and delay foliar fertilizer application to avoid wash-off.`);
  } else if (weather.forecast && weather.forecast.totalRainMm < 5) {
    parts.push("No significant rain expected — maintain regular irrigation schedule.");
  }

  if (weather.windSpeed > 25) {
    parts.push("Strong winds expected — avoid spraying pesticides or foliar fertilizers. Secure crop stakes.");
  }

  return parts.length > 0
    ? parts.join(" ")
    : "Weather conditions are favorable for standard farming operations.";
};
