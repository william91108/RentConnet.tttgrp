import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

type TenantProfile = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  room_name?: string;
  house_name?: string;
};

export default function AdminTenants() {
  const [tenants, setTenants] = useState<TenantProfile[]>([]);

  useEffect(() => {
    const fetchTenants = async () => {
      // Get all tenant role users
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tenant");

      if (!roles?.length) return;

      const tenantIds = roles.map((r) => r.user_id);

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", tenantIds);

      // Get room assignments
      const { data: rooms } = await supabase
        .from("rooms")
        .select("tenant_id, name, houses(name)")
        .in("tenant_id", tenantIds);

      const roomMap = new Map(
        rooms?.map((r) => [r.tenant_id, { room_name: r.name, house_name: (r as any).houses?.name }]) ?? []
      );

      const merged = (profiles ?? []).map((p) => ({
        ...p,
        ...(roomMap.get(p.user_id) ?? {}),
      })) as TenantProfile[];

      setTenants(merged);
    };

    fetchTenants();
  }, []);

  const formatDOB = (dob: string | null) => {
    if (!dob) return "—";
    return new Date(dob).toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">Manage tenant contact details</p>
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
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Property / Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t) => (
                      <TableRow key={t.user_id}>
                        <TableCell className="font-medium">{t.full_name || "—"}</TableCell>
                        <TableCell>{t.email}</TableCell>
                        <TableCell>{t.phone || "—"}</TableCell>
                        <TableCell className="capitalize">{t.gender || "—"}</TableCell>
                        <TableCell>{formatDOB(t.date_of_birth)}</TableCell>
                        <TableCell>
                          {t.house_name && t.room_name ? (
                            <Badge variant="outline">{t.house_name} — {t.room_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unassigned</span>
                          )}
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
    </AppLayout>
  );
}
