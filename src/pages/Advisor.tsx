import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Leaf, Loader2, Sprout, Droplets, FlaskConical } from "lucide-react";
import { generateRecommendations } from "@/utils/recommendations";
import { CROPS, getCountiesForCrop, isValidCropCounty } from "@/utils/cropLocationMapping";
import { fetchWeather, WeatherData } from "@/utils/weatherService";
import { COUNTY_WEATHER_CITY } from "@/utils/cropLocationMapping";

const STEP_ICONS = [Sprout, Leaf, FlaskConical];
const STEP_LABELS = ["Farm Details", "Crop & Location", "Soil Data"];

const Advisor = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  
  const [farmSize, setFarmSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [location, setLocation] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [nLevel, setNLevel] = useState("");
  const [pLevel, setPLevel] = useState("");
  const [kLevel, setKLevel] = useState("");
  const [moisture, setMoisture] = useState("");

  const availableCounties = cropType ? getCountiesForCrop(cropType) : [];

  const handleCropChange = (value: string) => {
    setCropType(value);
    // Reset location if not valid for new crop
    if (location && !isValidCropCounty(value, location)) {
      setLocation("");
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!farmSize || parseFloat(farmSize) <= 0) {
        toast.error("Please enter a valid farm size");
        return;
      }
    } else if (step === 2) {
      if (!cropType) { toast.error("Please select a crop"); return; }
      if (!location) { toast.error("Please select a county"); return; }
      if (!isValidCropCounty(cropType, location)) {
        toast.error(`${cropType} is not viable in ${location}`);
        return;
      }
    }
    setAnimDir("forward");
    setStep(step + 1);
  };

  const handleBack = () => {
    setAnimDir("back");
    setStep(step - 1);
  };

  const handleAnalyze = async () => {
    if (!soilPh || !nLevel || !pLevel || !kLevel || !moisture) {
      toast.error("Please fill in all soil data fields");
      return;
    }
    const phValue = parseFloat(soilPh);
    if (phValue < 0 || phValue > 14) {
      toast.error("pH must be between 0 and 14");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in first"); navigate("/auth"); return; }

      // Fetch live weather
      const weatherCity = COUNTY_WEATHER_CITY[location] || location;
      let weather: WeatherData | null = null;
      try {
        weather = await fetchWeather(weatherCity);
      } catch { /* continue without weather */ }

      const recommendations = generateRecommendations({
        cropType, soilPh: phValue, nLevel, pLevel, kLevel, moisture, location, weather,
      });

      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          crop_type: cropType,
          soil_ph: phValue,
          n_level: nLevel,
          p_level: pLevel,
          k_level: kLevel,
          location,
          farm_size: parseFloat(farmSize),
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      const { error: recError } = await supabase
        .from("recommendations")
        .insert({
          analysis_id: analysisData.id,
          seed_advice: recommendations.seedAdvice,
          fertilizer_advice: recommendations.fertilizerAdvice,
          irrigation_advice: recommendations.irrigationAdvice,
        });

      if (recError) throw recError;

      toast.success("Analysis complete!");
      navigate(`/results/${analysisData.id}`);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to save analysis: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const slideClass = animDir === "forward"
    ? "animate-slide-in-right"
    : "animate-slide-in-left";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Input Advisor Wizard</h1>
              <p className="text-sm text-muted-foreground">Step {step} of 3</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8">
          {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            const stepNum = i + 1;
            const active = step >= stepNum;
            return (
              <div key={label} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  active ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>{label}</span>
                {i < 2 && (
                  <div className={`hidden sm:block absolute h-0.5 w-full max-w-[100px] ${
                    step > stepNum ? "bg-primary" : "bg-muted"
                  }`} style={{ position: "relative" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Leaf className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-display font-bold text-foreground">Analyzing Soil & Weather Data...</p>
                <p className="text-sm text-muted-foreground mt-1">Generating personalized recommendations</p>
              </div>
            </div>
          </div>
        )}

        <div key={step} className={slideClass}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Farm Details"}
                {step === 2 && "Crop & Location"}
                {step === 3 && "Soil Data"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Enter your farm size in acres"}
                {step === 2 && "Select a crop and its viable Kenyan county"}
                {step === 3 && "Provide soil test results for accurate recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="farm-size">Farm Size (Acres) *</Label>
                    <Input
                      id="farm-size"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g., 5.0"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <Button onClick={handleNext} className="w-full h-12 text-base">
                    Next: Crop & Location <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Select Crop *</Label>
                    <Select value={cropType} onValueChange={handleCropChange}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Choose a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>County / Region *</Label>
                    <Select value={location} onValueChange={setLocation} disabled={!cropType}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={cropType ? "Choose county" : "Select a crop first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCounties.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {cropType && (
                      <p className="text-xs text-muted-foreground">
                        Showing counties where {cropType} is commercially viable in Kenya
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleBack} variant="outline" className="flex-1 h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1 h-12">
                      Next: Soil Data <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ph">Soil pH *</Label>
                      <Input
                        id="ph" type="number" step="0.1" min="0" max="14"
                        placeholder="e.g., 6.5"
                        value={soilPh}
                        onChange={(e) => setSoilPh(e.target.value)}
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground">Scale: 0-14</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Moisture *</Label>
                      <Select value={moisture} onValueChange={setMoisture}>
                        <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>NPK Levels *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "n", label: "Nitrogen (N)", value: nLevel, setter: setNLevel },
                        { id: "p", label: "Phosphorus (P)", value: pLevel, setter: setPLevel },
                        { id: "k", label: "Potassium (K)", value: kLevel, setter: setKLevel },
                      ].map(({ id, label, value, setter }) => (
                        <div key={id} className="space-y-1">
                          <Label className="text-xs">{label}</Label>
                          <Select value={value} onValueChange={setter}>
                            <SelectTrigger className="h-12"><SelectValue placeholder={id.toUpperCase()} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleBack} variant="outline" className="flex-1 h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleAnalyze} className="flex-1 h-12" disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                      ) : "🔬 Analyze"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Advisor;
