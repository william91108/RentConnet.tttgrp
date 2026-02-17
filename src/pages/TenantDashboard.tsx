import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, Bell, Shield, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [roomRes, issuesRes, noticesRes] = await Promise.all([
        supabase.from("rooms").select("*, houses(name)").eq("tenant_id", user.id).maybeSingle(),
        supabase.from("issues").select("*").eq("reported_by", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setRoom(roomRes.data);
      setIssues(issuesRes.data ?? []);
      setNotices(noticesRes.data ?? []);
    };

    fetchData();
  }, [user]);

  const daysUntilRent = () => {
    if (!room?.rent_due_day) return null;
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), room.rent_due_day);
    if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = daysUntilRent();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            {room ? `${(room as any).houses?.name} — ${room.name}` : "Loading your property info..."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/report-issue")}
            className="h-20 text-lg gap-3"
            size="lg"
          >
            <AlertTriangle className="h-6 w-6" />
            Report Issue
          </Button>
          <Button
            onClick={() => navigate("/emergency")}
            variant="destructive"
            className="h-20 text-lg gap-3"
            size="lg"
          >
            <LifeBuoy className="h-6 w-6" />
            Emergency Info
          </Button>
        </div>

        {room && (
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Rent: ${room.rent_amount}/month</p>
                  <p className="text-xs text-muted-foreground">Due on the {room.rent_due_day}th of each month</p>
                </div>
              </div>
              {days !== null && (
                <Badge variant={days <= 5 ? "destructive" : "outline"}>
                  {days === 0 ? "Due today" : `${days} days`}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> My Issues
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/my-issues")}>
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues reported.</p>}
              {issues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{issue.category}</p>
                    <p className="text-xs text-muted-foreground">{issue.location}</p>
                  </div>
                  <Badge variant="outline">{issue.status.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Recent Notices
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/notices")}>
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notices.length === 0 && <p className="text-sm text-muted-foreground">No notices yet.</p>}
              {notices.map((notice) => (
                <div key={notice.id} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-medium">{notice.title}</p>
                  <span className="text-xs text-muted-foreground">{new Date(notice.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
