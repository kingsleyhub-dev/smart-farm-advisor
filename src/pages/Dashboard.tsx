import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Leaf, Plus, History, MapPin, LogOut, Sprout, Sun, Wind, Droplets, CloudRain } from "lucide-react";
import { fetchWeather, WeatherData } from "@/utils/weatherService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (!currentSession) navigate("/auth");
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (!currentSession) {
        navigate("/auth");
      } else {
        fetchRecentAnalyses(currentSession.user.id);
        loadWeather(currentSession.user.user_metadata?.location);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadWeather = async (userLocation?: string) => {
    setWeatherLoading(true);
    try {
      const city = userLocation || "Nairobi";
      const data = await fetchWeather(city);
      setWeather(data);
    } catch {
      // fallback handled inside fetchWeather
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchRecentAnalyses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select(`id, crop_type, location, created_at, recommendations (seed_advice, fertilizer_advice)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentAnalyses(data || []);
    } catch (error: any) {
      console.error("Error fetching analyses:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch { toast.error("Error logging out"); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Smart Farm Advisor</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.user_metadata?.full_name || "Farmer"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Weather Widget */}
        <Card className="shadow-card animate-fade-in bg-gradient-to-br from-card to-muted/20 overflow-hidden">
          <CardContent className="p-6">
            {weatherLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ) : weather ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    {weather.icon?.startsWith("//") ? (
                      <img src={`https:${weather.icon}`} alt={weather.condition} className="w-10 h-10" />
                    ) : (
                      <Sun className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{weather.temperature}°C</h3>
                    <p className="text-muted-foreground">{weather.condition} in {weather.location}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-primary" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-primary" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                  {weather.forecast && (
                    <div className="flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-primary" />
                      <span>{weather.forecast.totalRainMm}mm (3-day)</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 active:scale-[0.98]"
            onClick={() => navigate("/advisor")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Plus className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">New Analysis</h3>
              <p className="text-sm text-muted-foreground">AI-powered recommendations</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98]">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">My Farms</h3>
              <p className="text-sm text-muted-foreground">Manage farm locations</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98]">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <History className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">History</h3>
              <p className="text-sm text-muted-foreground">Past recommendations</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest crop analyses and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="relative w-28 h-28 mx-auto">
                  <div className="absolute inset-0 bg-primary/5 rounded-full" />
                  <div className="absolute inset-2 bg-primary/10 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout className="w-12 h-12 text-primary/60" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">No analyses yet</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    Start your first soil analysis to get personalized crop recommendations for your farm
                  </p>
                </div>
                <Button onClick={() => navigate("/advisor")} size="lg" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Your First Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border border-border rounded-xl p-4 hover:bg-muted/50 transition-all cursor-pointer active:scale-[0.99]"
                    onClick={() => navigate(`/results/${analysis.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{analysis.crop_type}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {analysis.location}
                        </p>
                        {analysis.recommendations?.[0] && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {analysis.recommendations[0].seed_advice}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
