import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Leaf, Droplets, Sprout, Package, Download, Beaker, Calendar } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { getHarvestTimeline } from "@/utils/harvestTimeline";

const NPK_VALUE_MAP: Record<string, number> = { Low: 25, Medium: 55, High: 85 };

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchResults(); }, [id]);

  const fetchResults = async () => {
    try {
      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses").select("*").eq("id", id).single();
      if (analysisError) throw analysisError;

      const { data: recData, error: recError } = await supabase
        .from("recommendations").select("*").eq("analysis_id", id).single();
      if (recError) throw recError;

      setAnalysis(analysisData);
      setRecommendation(recData);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to load results");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysis || !recommendation) return;
    try {
      toast.info("Generating PDF report...");
      await generatePDF(analysis, recommendation);
      toast.success("Report downloaded!");
    } catch { toast.error("Failed to generate report"); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!analysis || !recommendation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Results not found</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const phPercent = Math.min((analysis.soil_ph / 14) * 100, 100);
  const phColor = analysis.soil_ph < 5.5 ? "text-destructive" : analysis.soil_ph > 7.5 ? "text-destructive" : "text-primary";

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
              <h1 className="text-xl font-display font-bold text-foreground">Advisory Report</h1>
              <p className="text-sm text-muted-foreground">{analysis.crop_type} — {analysis.location}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Summary */}
        <Card className="shadow-card animate-fade-in border-2 border-primary/20 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-2xl">Analysis Summary</CardTitle>
                <CardDescription>
                  Generated {new Date(analysis.created_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">{analysis.crop_type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="font-semibold text-foreground text-sm">{analysis.location}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Farm Size</p>
                <p className="font-semibold text-foreground text-sm">{analysis.farm_size} acres</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Soil pH</p>
                <p className={`font-bold text-lg ${phColor}`}>{analysis.soil_ph}</p>
              </div>
            </div>

            {/* NPK Progress Bars */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Soil Nutrient Levels</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">pH Level</span>
                    <span className={`font-medium ${phColor}`}>{analysis.soil_ph} / 14</span>
                  </div>
                  <Progress value={phPercent} className="h-2.5" />
                </div>
                {[
                  { label: "Nitrogen (N)", level: analysis.n_level },
                  { label: "Phosphorus (P)", level: analysis.p_level },
                  { label: "Potassium (K)", level: analysis.k_level },
                ].map(({ label, level }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <Badge variant={level === "Low" ? "destructive" : level === "High" ? "default" : "secondary"} className="text-xs">
                        {level}
                      </Badge>
                    </div>
                    <Progress value={NPK_VALUE_MAP[level] || 50} className="h-2.5" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="space-y-4">
          {[
            { icon: Sprout, title: "Seed Recommendation", text: recommendation.seed_advice, accent: "border-l-primary" },
            { icon: Package, title: "Fertilizer Advice", text: recommendation.fertilizer_advice, accent: "border-l-accent" },
            { icon: Droplets, title: "Irrigation Schedule", text: recommendation.irrigation_advice, accent: "border-l-secondary" },
            { icon: Calendar, title: "Harvest Timeline", text: getHarvestTimeline(analysis.crop_type, analysis.created_at).harvestAdvice, accent: "border-l-primary" },
          ].map(({ icon: Icon, title, text, accent }, i) => (
            <Card key={title} className={`shadow-card border-l-4 ${accent} animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="w-5 h-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <Button onClick={handleDownloadReport} variant="outline" className="flex-1 h-12">
            <Download className="w-4 h-4 mr-2" /> Download Report
          </Button>
          <Button onClick={() => navigate("/advisor")} className="flex-1 h-12">
            New Analysis
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
