import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Leaf, Loader2 } from "lucide-react";
import { generateRecommendations } from "@/utils/recommendations";

const Advisor = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form data
  const [location, setLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [nLevel, setNLevel] = useState("");
  const [pLevel, setPLevel] = useState("");
  const [kLevel, setKLevel] = useState("");
  const [moisture, setMoisture] = useState("");

  const handleNext = () => {
    if (step === 1) {
      if (!location || !farmSize) {
        toast.error("Please fill in all fields");
        return;
      }
      if (parseFloat(farmSize) <= 0) {
        toast.error("Farm size must be greater than 0");
        return;
      }
    } else if (step === 2) {
      if (!cropType) {
        toast.error("Please select a crop");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleAnalyze = async () => {
    if (!soilPh || !nLevel || !pLevel || !kLevel || !moisture) {
      toast.error("Please fill in all soil data fields");
      return;
    }

    const phValue = parseFloat(soilPh);
    if (phValue < 0 || phValue > 14) {
      toast.error("pH level must be between 0 and 14");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to analyze");
        navigate("/auth");
        return;
      }

      // Generate recommendations using our utility function
      const recommendations = generateRecommendations({
        cropType,
        soilPh: phValue,
        nLevel,
        pLevel,
        kLevel,
        moisture,
        location,
      });

      // Save analysis to database
      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          crop_type: cropType,
          soil_ph: phValue,
          n_level: nLevel,
          p_level: pLevel,
          k_level: kLevel,
          location: location,
          farm_size: parseFloat(farmSize),
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      // Save recommendations
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
      console.error("Error saving analysis:", error);
      toast.error("Failed to save analysis: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <h1 className="text-xl font-display font-bold text-foreground">
                Input Advisor Wizard
              </h1>
              <p className="text-sm text-muted-foreground">
                Step {step} of 3
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-card animate-slide-up">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Farm Details"}
              {step === 2 && "Crop Selection"}
              {step === 3 && "Soil Data"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your farm location and size"}
              {step === 2 && "Select the crop you want to analyze"}
              {step === 3 && "Provide your soil test results for accurate recommendations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location">Farm Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Kirinyaga, Kenya"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
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
                  />
                </div>
                <Button onClick={handleNext} className="w-full">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crop">Select Crop Type *</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger id="crop">
                      <SelectValue placeholder="Choose a crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maize">Maize</SelectItem>
                      <SelectItem value="Beans">Beans</SelectItem>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Coffee">Coffee</SelectItem>
                      <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Potatoes">Potatoes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ph">Soil pH Level *</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      placeholder="e.g., 6.5"
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Scale: 0-14</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moisture">Moisture Level *</Label>
                    <Select value={moisture} onValueChange={setMoisture}>
                      <SelectTrigger id="moisture">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>NPK Levels *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="n" className="text-sm">Nitrogen (N)</Label>
                      <Select value={nLevel} onValueChange={setNLevel}>
                        <SelectTrigger id="n">
                          <SelectValue placeholder="N" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p" className="text-sm">Phosphorus (P)</Label>
                      <Select value={pLevel} onValueChange={setPLevel}>
                        <SelectTrigger id="p">
                          <SelectValue placeholder="P" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="k" className="text-sm">Potassium (K)</Label>
                      <Select value={kLevel} onValueChange={setKLevel}>
                        <SelectTrigger id="k">
                          <SelectValue placeholder="K" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleAnalyze} className="flex-1" disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Advisor;
