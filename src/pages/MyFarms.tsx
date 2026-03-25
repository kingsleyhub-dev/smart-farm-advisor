import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, MapPin, Trash2, Edit, Leaf, Ruler } from "lucide-react";

const KENYAN_COUNTIES = [
  "Kirinyaga", "Nyeri", "Murang'a", "Kiambu", "Meru", "Embu", "Machakos",
  "Kisii", "Kericho", "Bomet", "Nandi", "Kisumu", "Busia", "Kajiado", "Nakuru",
];

interface Farm {
  id: string;
  farm_name: string;
  location: string;
  size: number;
  created_at: string;
}

const MyFarms = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); toast.error("Failed to load farms"); }
    setFarms(data || []);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!farmName || !location || !size) {
      toast.error("Please fill in all fields");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editingFarm) {
      const { error } = await supabase
        .from("farms")
        .update({ farm_name: farmName, location, size: parseFloat(size) })
        .eq("id", editingFarm.id);
      if (error) { toast.error("Failed to update farm"); return; }
      toast.success("Farm updated!");
    } else {
      const { error } = await supabase
        .from("farms")
        .insert({ farm_name: farmName, location, size: parseFloat(size), user_id: session.user.id });
      if (error) { toast.error("Failed to add farm"); return; }
      toast.success("Farm added!");
    }

    resetForm();
    loadFarms();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("farms").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Farm removed");
    loadFarms();
  };

  const openEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmName(farm.farm_name);
    setLocation(farm.location);
    setSize(farm.size.toString());
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFarm(null);
    setFarmName("");
    setLocation("");
    setSize("");
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">My Farms</h1>
                <p className="text-sm text-muted-foreground">Manage your farm locations</p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) resetForm(); setDialogOpen(v); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Add Farm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFarm ? "Edit Farm" : "Add New Farm"}</DialogTitle>
                  <DialogDescription>Enter your farm details below</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Farm Name</Label>
                    <Input placeholder="e.g. Mwea Paddy Farm" value={farmName} onChange={e => setFarmName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location (County)</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                      <SelectContent>
                        {KENYAN_COUNTIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Size (acres)</Label>
                    <Input type="number" placeholder="e.g. 5" value={size} onChange={e => setSize(e.target.value)} min="0.1" step="0.1" />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    {editingFarm ? "Update Farm" : "Save Farm"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : farms.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-10 h-10 text-primary/50" />
            </div>
            <h3 className="font-display font-bold text-lg">No farms yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Add your first farm to start tracking locations and get localized advice
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Farm
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {farms.map((farm) => (
              <Card key={farm.id} className="shadow-card hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{farm.farm_name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {farm.location}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Ruler className="w-3 h-3" /> {farm.size} acres
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(farm)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(farm.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyFarms;
