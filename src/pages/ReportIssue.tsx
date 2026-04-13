import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowLeft, ArrowRight, Check } from "lucide-react";

const LOCATIONS = ["My room", "Kitchen", "Bathroom", "Laundry", "Living area", "Outdoor", "Internet (house-wide)"];
const CATEGORIES = ["Water", "Power", "Internet", "Gas", "Appliance", "Property damage", "Lock/key", "Lockout", "Blockage", "Pest", "Noise", "Safety concern", "Other"];
const PRIORITIES = [
  { value: "normal", label: "Normal", desc: "Can wait a few days" },
  { value: "urgent", label: "Urgent", desc: "Needs attention within 24 hours" },
  { value: "emergency", label: "🚨 Emergency", desc: "Fire, gas smell, major water leak, total power outage" },
] as const;

export default function ReportIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent" | "emergency">("normal");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const canProceed = () => {
    if (step === 1) return !!location;
    if (step === 2) return !!category;
    if (step === 3) return !!priority;
    if (step === 4) return description.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    // Get the user's house
    const { data: room } = await supabase
      .from("rooms")
      .select("house_id")
      .eq("tenant_id", user.id)
      .maybeSingle();

    if (!room) {
      toast({ title: "Error", description: "You're not assigned to a room yet.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("issues").insert({
      house_id: room.house_id,
      reported_by: user.id,
      location,
      category,
      priority,
      title: `${category} — ${location}`,
      description,
      time_noticed: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Notify admin about new issue
      await supabase.functions.invoke("notify-issue-update", {
        body: {
          issueTitle: `${category} — ${location}`,
          recipientEmail: "", // admin will be looked up server-side
          message: description,
          type: "new_issue",
        },
      });
      toast({ title: "Issue reported", description: "We've received your report and will respond shortly." });
      navigate("/my-issues");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report an Issue</h1>
          <p className="text-muted-foreground">Step {step} of 4</p>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Where is the issue?</CardTitle>
              <CardDescription>Select the location of the problem</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {LOCATIONS.map((loc) => (
                <Button
                  key={loc}
                  variant={location === loc ? "default" : "outline"}
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => setLocation(loc)}
                >
                  {loc}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What type of issue?</CardTitle>
              <CardDescription>Select the category that best describes the problem</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How urgent is this?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRIORITIES.map((p) => (
                <Button
                  key={p.value}
                  variant={priority === p.value ? "default" : "outline"}
                  className="w-full h-auto py-4 flex-col items-start gap-1"
                  onClick={() => setPriority(p.value)}
                >
                  <span className="font-medium">{p.label}</span>
                  <span className="text-xs opacity-70">{p.desc}</span>
                </Button>
              ))}
              {priority === "emergency" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-3">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Emergency definition
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only use for: Fire, gas smell, major water leak, total power outage at night, or immediate safety threat.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Describe the issue</CardTitle>
              <CardDescription>Provide details to help us understand and fix the problem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">{location}</Badge>
                <Badge variant="outline">{category}</Badge>
                <Badge variant={priority === "emergency" ? "destructive" : "outline"}>{priority}</Badge>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what's happening, when it started, and any other relevant details..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : navigate("/dashboard")} disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
              <Check className="h-4 w-4 mr-1" /> {loading ? "Submitting..." : "Submit Issue"}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
