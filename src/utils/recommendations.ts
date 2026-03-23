import { WeatherData, getWeatherAdvice } from "./weatherService";

interface AnalysisInput {
  cropType: string;
  soilPh: number;
  nLevel: string;
  pLevel: string;
  kLevel: string;
  moisture: string;
  location: string;
  weather?: WeatherData | null;
}

interface Recommendation {
  seedAdvice: string;
  fertilizerAdvice: string;
  irrigationAdvice: string;
  weatherAdvice?: string;
}

export const generateRecommendations = (input: AnalysisInput): Recommendation => {
  const { cropType, soilPh, nLevel, pLevel, kLevel, moisture, weather } = input;
  
  let seedAdvice = "";
  let fertilizerAdvice = "";
  let irrigationAdvice = "";

  // Seed recommendations based on crop type
  switch (cropType) {
    case "Coffee":
      seedAdvice = "Recommended variety: Ruiru 11 (disease-resistant, compact). Plant at 2.7m × 2.7m spacing (~550 trees/acre). Expected yield: 8-12 kg clean coffee per tree after 3-4 years. For high altitudes (>1600m), consider SL28/SL34 for superior cup quality.";
      break;
    case "Tea":
      seedAdvice = "Recommended clone: TRFK 6/8 (purple tea, high yielding) or TRFK 303/577 for green leaf. Plant at 1.2m × 0.6m spacing (~5,500 plants/acre). Expect first harvest at 3 years. Minimum altitude: 1500m for quality production.";
      break;
    case "Rice":
      if (input.location.includes("Mwea")) {
        seedAdvice = "Recommended variety: Basmati 370 or BW 196 (lowland paddy). Use 60-80 kg seed/acre. Transplant at 20cm × 20cm spacing. Expected yield: 30-40 bags/acre. IR 2793-80-1 is also excellent for Mwea irrigation scheme.";
      } else {
        seedAdvice = "Recommended variety: NERICA (upland rice) for rainfed areas. Plant at 20cm × 20cm. Expected yield: 15-25 bags/acre. For Ahero/Bunyala lowlands, use Basmati 217 or ITA 310.";
      }
      break;
    case "Tomatoes":
      seedAdvice = "Recommended variety: Anna F1 (determinate, high-yielding) or Tylka F1 (TY virus resistant). Plant at 60cm × 45cm spacing. Expected yield: 20-30 tons/acre. Stake or trellis for support. Use grafted seedlings for better disease resistance.";
      break;
    default:
      seedAdvice = "Consult with local agricultural extension officer for specific variety recommendations.";
  }

  // Fertilizer recommendations
  const fertilizerPlan: string[] = [];
  
  if (soilPh < 5.5) {
    fertilizerPlan.push("⚠️ ACIDIC SOIL: Apply 2-3 tons agricultural lime per hectare to raise pH to 5.5-7.0. Apply lime 2-3 months before planting for best results.");
  } else if (soilPh > 7.5) {
    fertilizerPlan.push("⚠️ ALKALINE SOIL: Apply sulfur or well-decomposed organic matter (5-10 tons/hectare) to lower pH gradually.");
  }

  if (nLevel === "Low") {
    fertilizerPlan.push("NITROGEN: Apply DAP (18-46-0) at planting: 2 bags (50kg)/acre. Top-dress with CAN (26-0-0) after 3-4 weeks: 1.5 bags/acre.");
  } else if (nLevel === "Medium") {
    fertilizerPlan.push("NITROGEN: Apply 1 bag DAP (50kg)/acre at planting. Top-dress with 1 bag CAN/acre after 3-4 weeks.");
  } else {
    fertilizerPlan.push("NITROGEN: Adequate levels. Maintenance dose: 0.5 bag CAN/acre as top-dressing.");
  }

  if (pLevel === "Low") {
    fertilizerPlan.push("PHOSPHORUS: Boost with additional TSP (triple superphosphate): 1-2 bags/acre at planting.");
  }
  if (kLevel === "Low") {
    fertilizerPlan.push("POTASSIUM: Apply Muriate of Potash (MOP): 1 bag (50kg)/acre at planting or early vegetative stage.");
  }

  // Crop-specific fertilizer
  if (cropType === "Coffee") {
    fertilizerPlan.push("COFFEE SPECIFIC: Apply NPK 17-17-17 at 200g/tree twice yearly (March & October). Supplement with foliar feeds containing zinc and boron.");
  } else if (cropType === "Tea") {
    fertilizerPlan.push("TEA SPECIFIC: Apply NPKS 26:5:5:5 at 150-200 kg/hectare in two splits (April & August). Avoid lime on tea soils.");
  }

  fertilizerPlan.push("Supplement with 5-10 tons well-decomposed farmyard manure per acre annually.");
  
  // Weather-adjusted fertilizer advice
  if (weather) {
    if (weather.forecast && weather.forecast.totalRainMm > 30) {
      fertilizerPlan.push("🌧️ WEATHER ALERT: Heavy rain forecast — delay fertilizer application to avoid nutrient leaching and runoff.");
    }
    if (weather.temperature > 32) {
      fertilizerPlan.push("🌡️ HEAT ALERT: Apply fertilizers early morning or late evening to reduce volatilization losses.");
    }
  }

  fertilizerAdvice = fertilizerPlan.join(" ");

  // Irrigation recommendations
  if (moisture === "Low") {
    irrigationAdvice = "🚨 CRITICAL: Soil moisture is low. Irrigate immediately with 25-30mm water. Maintain 2-3 times/week schedule. Use drip irrigation for efficiency.";
  } else if (moisture === "Medium") {
    irrigationAdvice = `Irrigate ${cropType} 1-2 times/week with 20-25mm water per session. Increase during flowering/fruiting. Use mulching to retain moisture.`;
  } else {
    irrigationAdvice = "Soil moisture is adequate. Reduce irrigation to once/week. Ensure proper drainage to prevent waterlogging.";
  }

  // Crop-specific irrigation
  if (cropType === "Rice") {
    irrigationAdvice += " 🌾 RICE: Maintain 5-10cm standing water during vegetative and reproductive stages. Drain fields 2 weeks before harvest.";
  } else if (cropType === "Coffee") {
    irrigationAdvice += " ☕ COFFEE: Deep watering with good drainage. Water deeply once/week during dry season. Allow soil to partially dry between waterings.";
  } else if (cropType === "Tomatoes") {
    irrigationAdvice += " 🍅 TOMATOES: Consistent moisture is critical. Drip irrigation highly recommended. Water deeply 2-3 times/week, keeping foliage dry.";
  } else if (cropType === "Tea") {
    irrigationAdvice += " 🍵 TEA: Requires 1200-1400mm rainfall annually. Supplement with irrigation during dry spells — 25mm/week minimum.";
  }

  // Weather-adjusted irrigation
  if (weather) {
    const weatherIrrigation = getWeatherAdvice(weather);
    irrigationAdvice += ` 📡 LIVE WEATHER: ${weatherIrrigation}`;
  }

  return {
    seedAdvice,
    fertilizerAdvice,
    irrigationAdvice,
    weatherAdvice: weather ? getWeatherAdvice(weather) : undefined,
  };
};
