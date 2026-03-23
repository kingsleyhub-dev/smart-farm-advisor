export const CROP_COUNTY_MAP: Record<string, string[]> = {
  Coffee: ["Kirinyaga", "Nyeri", "Murang'a", "Kiambu", "Meru", "Embu", "Machakos", "Kisii"],
  Tea: ["Kericho", "Bomet", "Nandi", "Kiambu", "Murang'a", "Nyeri", "Meru"],
  Rice: ["Kirinyaga (Mwea)", "Kisumu (Ahero)", "Busia (Bunyala)"],
  Tomatoes: ["Kajiado", "Nakuru", "Machakos", "Kiambu", "Kirinyaga"],
};

export const CROPS = Object.keys(CROP_COUNTY_MAP);

export const getAllCounties = (): string[] => {
  const allCounties = new Set<string>();
  Object.values(CROP_COUNTY_MAP).forEach((counties) =>
    counties.forEach((c) => allCounties.add(c))
  );
  return Array.from(allCounties).sort();
};

export const getCountiesForCrop = (crop: string): string[] => {
  return CROP_COUNTY_MAP[crop] || [];
};

export const getCropsForCounty = (county: string): string[] => {
  return CROPS.filter((crop) => CROP_COUNTY_MAP[crop].includes(county));
};

export const isValidCropCounty = (crop: string, county: string): boolean => {
  return CROP_COUNTY_MAP[crop]?.includes(county) ?? false;
};

// Map county display names to weather API city names
export const COUNTY_WEATHER_CITY: Record<string, string> = {
  Kirinyaga: "Kerugoya",
  "Kirinyaga (Mwea)": "Wanguru",
  Nyeri: "Nyeri",
  "Murang'a": "Murang'a",
  Kiambu: "Kiambu",
  Meru: "Meru",
  Embu: "Embu",
  Machakos: "Machakos",
  Kisii: "Kisii",
  Kericho: "Kericho",
  Bomet: "Bomet",
  Nandi: "Kapsabet",
  "Kisumu (Ahero)": "Ahero",
  "Busia (Bunyala)": "Busia",
  Kajiado: "Kajiado",
  Nakuru: "Nakuru",
};
