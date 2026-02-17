import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, AlertTriangle, Bell, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ houses: 0, rooms: 0, tenants: 0, activeIssues: 0, emergencies: 0 });
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [housesRes, roomsRes, issuesRes] = await Promise.all([
        supabase.from("houses").select("id", { count: "exact", head: true }),
        supabase.from("rooms").select("id, tenant_id", { count: "exact" }),
        supabase.from("issues").select("id, priority, status").neq("status", "resolved"),
      ]);

      const tenantCount = roomsRes.data?.filter((r) => r.tenant_id).length ?? 0;
      const emergencies = issuesRes.data?.filter((i) => i.priority === "emergency").length ?? 0;

      setStats({
        houses: housesRes.count ?? 0,
        rooms: roomsRes.count ?? 0,
        tenants: tenantCount,
        activeIssues: issuesRes.data?.length ?? 0,
        emergencies,
      });
    };

    const fetchRecent = async () => {
      const [issuesRes, noticesRes] = await Promise.all([
        supabase.from("issues").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setRecentIssues(issuesRes.data ?? []);
      setRecentNotices(noticesRes.data ?? []);
    };

    fetchStats();
    fetchRecent();
  }, []);

  const statCards = [
    { label: "Properties", value: stats.houses, icon: Building2, color: "text-primary" },
    { label: "Total Rooms", value: stats.rooms, icon: DollarSign, color: "text-primary" },
    { label: "Active Tenants", value: stats.tenants, icon: Users, color: "text-primary" },
    { label: "Active Issues", value: stats.activeIssues, icon: AlertTriangle, color: "text-destructive" },
    { label: "Emergencies", value: stats.emergencies, icon: AlertTriangle, color: "text-destructive" },
  ];

  const priorityColor = (p: string) => {
    if (p === "emergency") return "destructive";
    if (p === "urgent") return "secondary";
    return "outline";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your properties and tenants</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate("/notices")} size="sm">
            <Bell className="h-4 w-4 mr-1" /> Send Notice
          </Button>
          <Button onClick={() => navigate("/properties")} variant="outline" size="sm">
            <Building2 className="h-4 w-4 mr-1" /> Manage Properties
          </Button>
          <Button onClick={() => navigate("/issues")} variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" /> View Issues
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentIssues.length === 0 && <p className="text-sm text-muted-foreground">No issues reported yet.</p>}
              {recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{issue.category} — {issue.location}</p>
                    <p className="text-xs text-muted-foreground">{new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={priorityColor(issue.priority)}>{issue.priority}</Badge>
                    <Badge variant="outline">{issue.status.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Notices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotices.length === 0 && <p className="text-sm text-muted-foreground">No notices sent yet.</p>}
              {recentNotices.map((notice) => (
                <div key={notice.id} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-medium">{notice.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{notice.notice_type.replace(/_/g, " ")}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
