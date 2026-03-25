interface HarvestInfo {
  harvestAdvice: string;
  estimatedHarvestDate: string;
}

export const getHarvestTimeline = (cropType: string, analysisDate: string): HarvestInfo => {
  const plantDate = new Date(analysisDate);
  let daysToHarvest = 0;
  let harvestAdvice = "";

  switch (cropType) {
    case "Coffee":
      daysToHarvest = 270; // ~9 months after flowering
      harvestAdvice =
        "🌿 HARVEST WINDOW: Coffee cherries are ready 8–11 months after flowering (typically October–December in Kenya). " +
        "Pick only ripe, red cherries for best quality. Selective hand-picking is recommended over strip harvesting. " +
        "Expect 2–3 picking rounds per season. Dry processing within 12 hours of picking.";
      break;
    case "Tea":
      daysToHarvest = 90; // continuous plucking cycles
      harvestAdvice =
        "🍵 HARVEST WINDOW: Tea is harvested continuously every 7–14 days during the growing season. " +
        "Pluck the bud and two youngest leaves (\"two leaves and a bud\") for premium quality. " +
        "Peak seasons: January–March and July–September in Kenya highlands. " +
        "Maintain a plucking table and avoid over-pruning.";
      break;
    case "Rice":
      daysToHarvest = 135; // 120–150 days
      harvestAdvice =
        "🌾 HARVEST WINDOW: Rice is ready 120–150 days after transplanting (or 90–120 days for direct seeding). " +
        "Harvest when 80–85% of grains turn golden-yellow and moisture content is 20–25%. " +
        "Drain paddies 2 weeks before harvest. Thresh within 24 hours to minimize losses. " +
        "Dry grain to 14% moisture for safe storage.";
      break;
    case "Tomatoes":
      daysToHarvest = 75; // 60–85 days after transplanting
      harvestAdvice =
        "🍅 HARVEST WINDOW: Tomatoes mature 60–85 days after transplanting depending on variety. " +
        "Harvest at the breaker stage (first colour change) for distant markets or fully ripe for local sale. " +
        "Pick every 2–3 days during peak production. Handle gently to avoid bruising. " +
        "Expect 8–12 weeks of continuous harvest from determinate varieties.";
      break;
    default:
      daysToHarvest = 120;
      harvestAdvice = "Consult local extension officers for harvest timing specific to your crop and variety.";
  }

  const harvestDate = new Date(plantDate);
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);

  const estimatedHarvestDate = harvestDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    harvestAdvice: `${harvestAdvice} 📅 ESTIMATED EARLIEST HARVEST: ${estimatedHarvestDate} (based on analysis date).`,
    estimatedHarvestDate,
  };
};
