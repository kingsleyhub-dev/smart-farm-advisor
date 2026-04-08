import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { city, lat, lon } = body;

    const WEATHER_API_KEY = Deno.env.get("WEATHER_API_KEY");
    if (!WEATHER_API_KEY) {
      return new Response(
        JSON.stringify({
          temperature: 24,
          humidity: 65,
          windSpeed: 12,
          condition: "Partly Cloudy",
          icon: "⛅",
          location: city?.replace(",KE", "") || "Unknown",
          forecast: { avgTemp: 23, avgHumidity: 68, totalRainMm: 8 },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use lat,lon if provided, otherwise fall back to city
    let query: string;
    if (typeof lat === "number" && typeof lon === "number") {
      query = `${lat},${lon}`;
    } else if (city && typeof city === "string" && city.length <= 100) {
      query = city;
    } else {
      return new Response(
        JSON.stringify({ error: "Provide lat/lon or a valid city" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=3&aqi=no`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const errBody = await resp.text();
      throw new Error(`WeatherAPI error [${resp.status}]: ${errBody}`);
    }

    const w = await resp.json();
    const current = w.current;
    const forecastDays = w.forecast?.forecastday || [];

    let totalRain = 0, totalTemp = 0, totalHumidity = 0;
    forecastDays.forEach((d: any) => {
      totalRain += d.day.totalprecip_mm || 0;
      totalTemp += d.day.avgtemp_c || 0;
      totalHumidity += d.day.avghumidity || 0;
    });

    const result = {
      temperature: Math.round(current.temp_c),
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      condition: current.condition.text,
      icon: current.condition.icon,
      location: w.location.name,
      forecast: {
        avgTemp: Math.round(totalTemp / Math.max(forecastDays.length, 1)),
        avgHumidity: Math.round(totalHumidity / Math.max(forecastDays.length, 1)),
        totalRainMm: Math.round(totalRain * 10) / 10,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weather function error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch weather data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
