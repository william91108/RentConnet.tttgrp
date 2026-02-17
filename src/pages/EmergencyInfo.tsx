import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Wifi, Zap, Droplets, Key } from "lucide-react";

const SELF_HELP = [
  {
    icon: Wifi,
    title: "Internet Not Working",
    steps: ["Restart your router (unplug for 30 seconds, plug back in)", "Check if other devices in the house have internet", "If whole house is affected, report as house-wide issue"],
  },
  {
    icon: Zap,
    title: "Power Outage",
    steps: ["Check your room's power switch/circuit breaker", "Check the house safety switch (usually in the meter box)", "If only your room is affected, check individual breakers", "If whole house, report immediately"],
  },
  {
    icon: Droplets,
    title: "Water Leak",
    steps: ["Turn off the water main valve (usually near the front of the property)", "Place towels or buckets to contain the leak", "Report immediately as emergency"],
  },
  {
    icon: Key,
    title: "Locked Out",
    steps: ["Check with other housemates if they can let you in", "Contact your property manager (number below)", "If after hours, use the emergency contact number"],
  },
];

export default function EmergencyInfo() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchContacts = async () => {
      const { data } = await supabase
        .from("emergency_contacts")
        .select("*")
        .order("sort_order");
      setContacts(data ?? []);
    };
    fetchContacts();
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emergency & Self-Help</h1>
          <p className="text-muted-foreground">Try these steps before reporting an issue</p>
        </div>

        <div className="grid gap-4">
          {SELF_HELP.map((item) => (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {item.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="text-sm text-primary hover:underline">{c.phone}</a>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
