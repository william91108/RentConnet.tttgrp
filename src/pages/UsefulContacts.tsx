import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Mail, Plus, Trash2, Wrench, Zap, Droplets, Snowflake, Hammer, Home, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "air_conditioning", label: "Air Conditioning", icon: Snowflake },
  { value: "plumber", label: "Plumber", icon: Droplets },
  { value: "electrician", label: "Electrician", icon: Zap },
  { value: "handyman", label: "Handyman", icon: Hammer },
  { value: "house_owner", label: "House Owner", icon: Home },
  { value: "cleaner", label: "Cleaner", icon: Sparkles },
  { value: "other", label: "Other", icon: Wrench },
];

const getCategory = (value: string) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

export default function UsefulContacts() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const [contacts, setContacts] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "plumber",
    phone: "",
    email: "",
    house_id: "",
  });

  const load = async () => {
    const [{ data: c }, { data: h }] = await Promise.all([
      supabase.from("emergency_contacts").select("*").order("role"),
      supabase.from("houses").select("id,name").order("name"),
    ]);
    setContacts(c ?? []);
    setHouses(h ?? []);
    if (h?.length && !form.house_id) setForm((f) => ({ ...f, house_id: h[0].id }));
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.house_id) {
      toast.error("Name, phone and house are required");
      return;
    }
    const { error } = await supabase.from("emergency_contacts").insert({
      name: form.name,
      role: form.role,
      phone: form.phone,
      email: form.email,
      house_id: form.house_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Contact added");
    setOpen(false);
    setForm({ ...form, name: "", phone: "", email: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Contact removed");
    load();
  };

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: contacts.filter((c) => c.role === cat.value),
  })).filter((g) => g.items.length > 0 || isAdmin);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Useful Contacts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trusted tradespeople and service providers for your properties.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Contact</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Useful Contact</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>House</Label>
                    <Select value={form.house_id} onValueChange={(v) => setForm({ ...form, house_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                      <SelectContent>
                        {houses.map((h) => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Name / Company</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <Button onClick={handleAdd} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.value}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" /> {group.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.length === 0 && (
                    <p className="text-xs text-muted-foreground">No contacts yet.</p>
                  )}
                  {group.items.map((c) => (
                    <div key={c.id} className="flex items-start justify-between border-b border-border pb-2 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{c.name}</p>
                        <a href={`tel:${c.phone}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary">
                          <Phone className="h-3 w-3" />{c.phone}
                        </a>
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary">
                            <Mail className="h-3 w-3" />{c.email}
                          </a>
                        )}
                      </div>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
