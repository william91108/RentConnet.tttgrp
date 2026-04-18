import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Pencil, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TenantProfile = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  room_name?: string;
  house_name?: string;
  assigned_at?: string | null;
  ended_at?: string | null;
};

type TenantNote = {
  id: string;
  tenant_id: string;
  category: string;
  note: string;
  created_at: string;
};

const NOTE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "lockout", label: "Lockout / Spare key" },
  { value: "damage", label: "Damage" },
  { value: "noise", label: "Noise complaint" },
  { value: "plumbing", label: "Plumbing incident" },
  { value: "payment", label: "Payment issue" },
];

function computeStayDuration(start: string | null | undefined, end: string | null | undefined) {
  if (!start) return "—";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  if (endDate.getDate() < startDate.getDate()) months -= 1;
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts = [];
  if (years) parts.push(`${years}y`);
  parts.push(`${remMonths}m`);
  return parts.join(" ");
}

export default function AdminTenants() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [unlinkedAccounts, setUnlinkedAccounts] = useState<TenantProfile[]>([]);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");

  // Edit / details dialog
  const [editTenant, setEditTenant] = useState<TenantProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<TenantProfile>>({});
  const [tenantNotes, setTenantNotes] = useState<TenantNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("general");

  const fetchAll = async () => {
    // tenants with role = tenant
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "tenant");
    const tenantIds = (roles ?? []).map((r) => r.user_id);

    if (!tenantIds.length) {
      setTenants([]);
    } else {
      const [{ data: profiles }, { data: rooms }] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", tenantIds),
        supabase
          .from("rooms")
          .select("tenant_id, name, assigned_at, houses(name)")
          .in("tenant_id", tenantIds),
      ]);

      const roomMap = new Map(
        (rooms ?? []).map((r) => [
          r.tenant_id,
          { room_name: r.name, house_name: (r as any).houses?.name, assigned_at: r.assigned_at },
        ]),
      );

      // For unassigned tenants, fetch latest room_assignments to compute past stay
      const unassignedIds = tenantIds.filter((id) => !roomMap.has(id));
      let pastMap = new Map<string, { assigned_at: string; ended_at: string }>();
      if (unassignedIds.length) {
        const { data: pastAssignments } = await supabase
          .from("room_assignments")
          .select("tenant_id, started_at, ended_at")
          .in("tenant_id", unassignedIds)
          .not("ended_at", "is", null)
          .order("ended_at", { ascending: false });
        for (const a of pastAssignments ?? []) {
          if (!pastMap.has(a.tenant_id)) {
            pastMap.set(a.tenant_id, { assigned_at: a.started_at, ended_at: a.ended_at });
          }
        }
      }

      const merged = (profiles ?? []).map((p) => {
        const current = roomMap.get(p.user_id);
        const past = pastMap.get(p.user_id);
        return {
          ...p,
          ...(current ?? {}),
          ended_at: current ? null : past?.ended_at ?? null,
          assigned_at: current?.assigned_at ?? past?.assigned_at ?? null,
        } as TenantProfile;
      });
      setTenants(merged);
    }

    // Find profiles WITHOUT tenant or admin role (potential add candidates)
    const { data: allRoles } = await supabase.from("user_roles").select("user_id");
    const rolesSet = new Set((allRoles ?? []).map((r) => r.user_id));
    const { data: allProfiles } = await supabase.from("profiles").select("*");
    const candidates = (allProfiles ?? []).filter((p) => !rolesSet.has(p.user_id));
    setUnlinkedAccounts(candidates as TenantProfile[]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const linkAsTenant = async (profile: TenantProfile) => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: profile.user_id,
      role: "tenant",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tenant added", description: `${profile.email} is now a tenant.` });
      setAddOpen(false);
      setSearchEmail("");
      fetchAll();
    }
  };

  const openEdit = async (t: TenantProfile) => {
    setEditTenant(t);
    setEditForm({
      full_name: t.full_name,
      phone: t.phone,
      gender: t.gender,
      date_of_birth: t.date_of_birth,
    });
    const { data: notes } = await supabase
      .from("tenant_notes")
      .select("*")
      .eq("tenant_id", t.user_id)
      .order("created_at", { ascending: false });
    setTenantNotes(notes ?? []);
    setNewNote("");
    setNewNoteCategory("general");
  };

  const saveEdit = async () => {
    if (!editTenant) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name ?? "",
        phone: editForm.phone ?? "",
        gender: editForm.gender ?? "",
        date_of_birth: editForm.date_of_birth || null,
      })
      .eq("user_id", editTenant.user_id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      fetchAll();
    }
  };

  const addNote = async () => {
    if (!editTenant || !newNote.trim() || !user) return;
    const { error } = await supabase.from("tenant_notes").insert({
      tenant_id: editTenant.user_id,
      category: newNoteCategory,
      note: newNote.trim(),
      created_by: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewNote("");
      const { data: notes } = await supabase
        .from("tenant_notes")
        .select("*")
        .eq("tenant_id", editTenant.user_id)
        .order("created_at", { ascending: false });
      setTenantNotes(notes ?? []);
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from("tenant_notes").delete().eq("id", id);
    setTenantNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredCandidates = unlinkedAccounts.filter((p) =>
    !searchEmail || p.email?.toLowerCase().includes(searchEmail.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground">Manage tenant contact details and history</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Tenant
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> All Tenants ({tenants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tenants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tenants registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Property / Room</TableHead>
                      <TableHead>Stay</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t) => (
                      <TableRow key={t.user_id}>
                        <TableCell className="font-medium">{t.full_name || "—"}</TableCell>
                        <TableCell>{t.email}</TableCell>
                        <TableCell>{t.phone || "—"}</TableCell>
                        <TableCell className="capitalize">{t.gender || "—"}</TableCell>
                        <TableCell>{t.date_of_birth ? new Date(t.date_of_birth).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          {t.house_name && t.room_name ? (
                            <Badge variant="outline">{t.house_name} — {t.room_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {computeStayDuration(t.assigned_at, t.ended_at)}
                          {t.ended_at && <span className="text-muted-foreground"> (ended)</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Tenant Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose an existing signed-up account (other than admin) to mark as a tenant. Their signup details are preserved.
            </p>
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <div className="border rounded-md max-h-64 overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No unassigned accounts. Ask the user to sign up first, then come back here.
                </p>
              ) : (
                filteredCandidates.map((p) => (
                  <div
                    key={p.user_id}
                    className="flex items-center justify-between px-3 py-2 border-b last:border-0 hover:bg-accent/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.full_name || "(no name)"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    <Button size="sm" onClick={() => linkAsTenant(p)}>
                      Add as tenant
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit / Notes Dialog */}
      <Dialog open={!!editTenant} onOpenChange={(open) => !open && setEditTenant(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {editTenant && (
            <>
              <DialogHeader>
                <DialogTitle>{editTenant.full_name || editTenant.email}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details"><Pencil className="h-3.5 w-3.5 mr-1" />Details</TabsTrigger>
                  <TabsTrigger value="notes"><FileText className="h-3.5 w-3.5 mr-1" />Notes ({tenantNotes.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Full Name</Label>
                      <Input
                        value={editForm.full_name ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Phone</Label>
                      <Input
                        value={editForm.phone ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Gender</Label>
                      <Select
                        value={editForm.gender ?? ""}
                        onValueChange={(v) => setEditForm({ ...editForm, gender: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={editForm.date_of_birth ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Email: {editTenant.email}</p>
                    <p>
                      Property:{" "}
                      {editTenant.house_name && editTenant.room_name
                        ? `${editTenant.house_name} — ${editTenant.room_name}`
                        : "Unassigned"}
                    </p>
                    <p>
                      Stay duration: {computeStayDuration(editTenant.assigned_at, editTenant.ended_at)}
                      {editTenant.ended_at && " (ended)"}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button onClick={saveEdit}>Save Changes</Button>
                  </DialogFooter>
                </TabsContent>

                <TabsContent value="notes" className="space-y-3">
                  <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <Label className="text-xs">Add note</Label>
                    <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {NOTE_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Asked for spare key on 12 Mar — third time this month."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
                      Add Note
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {tenantNotes.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
                    )}
                    {tenantNotes.map((n) => (
                      <div key={n.id} className="border rounded-md p-3 text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs capitalize">
                            {NOTE_CATEGORIES.find((c) => c.value === n.category)?.label ?? n.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteNote(n.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{n.note}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
