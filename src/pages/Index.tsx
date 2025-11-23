import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Sprout, Droplets, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                Smart Farm Input Advisor
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Login
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Sprout className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Precision Farming Powered by AI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
            Optimize Your Crop Yields with{" "}
            <span className="text-gradient">Smart Recommendations</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get AI-driven recommendations for fertilizers, seeds, and irrigation based on your specific soil data and location weather patterns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Start Free Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
              View Demo
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Expert recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need for Precision Farming
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive analysis tools for modern farmers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-lg transition-all duration-300 animate-slide-up border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Sprout className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  Seed Selection
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get variety recommendations tailored to your soil conditions and climate. Maximize yields with proven seed varieties.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-all duration-300 animate-slide-up border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  Fertilizer Advice
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Precise NPK recommendations based on your soil test results. Optimize nutrient application for better crop health.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-all duration-300 animate-slide-up border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                  <Droplets className="w-7 h-7 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  Irrigation Plans
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Smart watering schedules based on soil moisture levels and weather patterns. Save water and improve crop quality.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to better farming decisions
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start animate-slide-up">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Create Your Profile
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sign up and tell us about your farm location and size. It takes less than a minute to get started.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start animate-slide-up">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Input Your Soil Data
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enter your soil test results including pH levels, NPK values, and moisture content. Don't have a soil test? We'll guide you.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start animate-slide-up">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Get Expert Advice
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive detailed recommendations for seeds, fertilizers, and irrigation. Save, download, and implement your personalized farm plan.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Start Your First Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to Boost Your Farm Productivity?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of farmers already using AI-powered recommendations to maximize their yields.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">
                Smart Farm Input Advisor
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Smart Farm Input Advisor. Precision farming powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
