import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Leaf, Droplets, Sprout, Package, Download } from "lucide-react";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();

      if (analysisError) throw analysisError;

      const { data: recData, error: recError } = await supabase
        .from("recommendations")
        .select("*")
        .eq("analysis_id", id)
        .single();

      if (recError) throw recError;

      setAnalysis(analysisData);
      setRecommendation(recData);
    } catch (error: any) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load results");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    toast.success("Report download feature coming soon!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
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
                Advisory Report
              </h1>
              <p className="text-sm text-muted-foreground">
                {analysis.crop_type} - {analysis.location}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary Card */}
        <Card className="mb-6 shadow-card animate-fade-in bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Analysis Summary</CardTitle>
                <CardDescription>
                  Generated on {new Date(analysis.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {analysis.crop_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold text-foreground">{analysis.location}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Farm Size</p>
                <p className="font-semibold text-foreground">{analysis.farm_size} acres</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Soil pH</p>
                <p className="font-semibold text-foreground">{analysis.soil_ph}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-card p-3 rounded-lg border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Nitrogen</p>
                <Badge variant={analysis.n_level === "Low" ? "destructive" : "secondary"}>
                  {analysis.n_level}
                </Badge>
              </div>
              <div className="bg-card p-3 rounded-lg border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Phosphorus</p>
                <Badge variant={analysis.p_level === "Low" ? "destructive" : "secondary"}>
                  {analysis.p_level}
                </Badge>
              </div>
              <div className="bg-card p-3 rounded-lg border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Potassium</p>
                <Badge variant={analysis.k_level === "Low" ? "destructive" : "secondary"}>
                  {analysis.k_level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="space-y-4 animate-slide-up">
          <Card className="shadow-card border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                Seed Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{recommendation.seed_advice}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Fertilizer Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{recommendation.fertilizer_advice}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-secondary-foreground" />
                Irrigation Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{recommendation.irrigation_advice}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button onClick={handleDownloadReport} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={() => navigate("/advisor")} className="flex-1">
            New Analysis
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
