interface AnalysisInput {
  cropType: string;
  soilPh: number;
  nLevel: string;
  pLevel: string;
  kLevel: string;
  moisture: string;
  location: string;
}

interface Recommendation {
  seedAdvice: string;
  fertilizerAdvice: string;
  irrigationAdvice: string;
}

export const generateRecommendations = (input: AnalysisInput): Recommendation => {
  const { cropType, soilPh, nLevel, pLevel, kLevel, moisture } = input;
  
  let seedAdvice = "";
  let fertilizerAdvice = "";
  let irrigationAdvice = "";

  // Seed recommendations based on crop type
  switch (cropType) {
    case "Maize":
      if (soilPh >= 5.5 && soilPh <= 7.0) {
        seedAdvice = "Recommended seed variety: H614D (high-altitude hybrid). Plant at 75cm x 25cm spacing for optimal yields of 25-30 bags per acre. This variety is drought-tolerant and matures in 4-5 months.";
      } else {
        seedAdvice = "Recommended seed variety: DH04 (standard hybrid). Adjust soil pH to 5.5-7.0 range first for best results. Plant at 75cm x 25cm spacing.";
      }
      break;
    case "Beans":
      seedAdvice = "Recommended variety: KAT B1 (bush bean). Plant at 50cm x 10cm spacing. Expected yield: 8-12 bags per acre. Matures in 90-100 days. Ideal for intercropping with maize.";
      break;
    case "Rice":
      seedAdvice = "Recommended variety: NERICA (upland rice) or Basmati 370 (lowland). Plant at 20cm x 20cm spacing for upland or broadcast for lowland. Expected yield: 30-40 bags per acre.";
      break;
    case "Coffee":
      seedAdvice = "Recommended variety: Ruiru 11 (disease-resistant). Plant at 2.7m x 2.7m spacing (about 550 trees per acre). Expected yield: 8-12 kg of clean coffee per tree after 3-4 years.";
      break;
    case "Tomatoes":
      seedAdvice = "Recommended variety: Anna F1 (hybrid determinate). Plant at 60cm x 45cm spacing. Expected yield: 20-30 tons per acre with proper management. Stake or trellis for support.";
      break;
    case "Wheat":
      seedAdvice = "Recommended variety: Kenya Fahari (high-yielding). Plant at 20cm row spacing with 125-150 kg seed per hectare. Expected yield: 25-35 bags per acre. Matures in 4-5 months.";
      break;
    case "Potatoes":
      seedAdvice = "Recommended variety: Shangi or Dutch Robjin (certified seed). Plant at 75cm x 30cm spacing. Expected yield: 200-300 bags per acre with proper management. Use disease-free certified seed.";
      break;
    default:
      seedAdvice = "Consult with local agricultural extension officer for specific variety recommendations suited to your location.";
  }

  // Fertilizer recommendations
  let fertilizerPlan = [];
  
  // pH adjustment
  if (soilPh < 5.5) {
    fertilizerPlan.push("Apply 2-3 tons of agricultural lime per hectare to raise pH to optimal range (5.5-7.0). Apply lime 2-3 months before planting.");
  } else if (soilPh > 7.5) {
    fertilizerPlan.push("Apply sulfur or organic matter (compost) to lower pH. Use 500kg of sulfur per hectare or 5-10 tons of well-decomposed manure.");
  }

  // NPK recommendations
  if (nLevel === "Low") {
    fertilizerPlan.push(`Apply DAP (18-46-0) at planting: 2 bags (50kg) per acre. Top-dress with CAN (26-0-0) after 3-4 weeks: 1.5 bags per acre.`);
  } else if (nLevel === "Medium") {
    fertilizerPlan.push("Apply 1 bag of DAP (50kg) per acre at planting. Top-dress with CAN: 1 bag per acre after 3-4 weeks.");
  } else {
    fertilizerPlan.push("Nitrogen levels are adequate. Use maintenance dose: 0.5 bag CAN per acre as top-dressing.");
  }

  if (pLevel === "Low") {
    fertilizerPlan.push("Boost phosphorus with additional DAP or TSP (triple superphosphate). Apply 1-2 bags per acre.");
  }

  if (kLevel === "Low") {
    fertilizerPlan.push("Apply potassium-rich fertilizer like Muriate of Potash (MOP): 1 bag (50kg) per acre at planting or early vegetative stage.");
  }

  // Organic matter recommendation
  fertilizerPlan.push("Supplement with 5-10 tons of well-decomposed farmyard manure or compost per acre annually to improve soil structure and fertility.");

  fertilizerAdvice = fertilizerPlan.join(" ");

  // Irrigation recommendations
  if (moisture === "Low") {
    irrigationAdvice = "CRITICAL: Soil moisture is low. Irrigate immediately with 25-30mm of water. Maintain consistent irrigation schedule: 2-3 times per week depending on weather. Use drip irrigation for water efficiency or furrow irrigation if available. Monitor soil moisture regularly.";
  } else if (moisture === "Medium") {
    irrigationAdvice = `For ${cropType}, irrigate 1-2 times per week with 20-25mm of water per session. Increase frequency during flowering and grain-filling stages. Use mulching to retain moisture. Consider rainfall patterns and reduce irrigation during rainy season.`;
  } else {
    irrigationAdvice = "Soil moisture is adequate. Reduce irrigation frequency to once per week or as needed based on weather. Ensure proper drainage to prevent waterlogging. Monitor for signs of overwatering (yellowing leaves, fungal diseases).";
  }

  // Crop-specific irrigation notes
  if (cropType === "Rice") {
    irrigationAdvice += " For lowland rice, maintain 5-10cm standing water during vegetative and reproductive stages. Drain fields 2 weeks before harvest.";
  } else if (cropType === "Coffee") {
    irrigationAdvice += " Coffee requires deep watering but good drainage. Irrigate deeply once per week during dry season, allowing soil to partially dry between waterings.";
  } else if (cropType === "Tomatoes") {
    irrigationAdvice += " Tomatoes need consistent moisture. Drip irrigation is highly recommended. Water deeply 2-3 times per week, keeping foliage dry to prevent diseases.";
  }

  return {
    seedAdvice,
    fertilizerAdvice,
    irrigationAdvice,
  };
};
