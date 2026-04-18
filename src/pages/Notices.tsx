import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

type Notice = {
  id: string;
  title: string;
  content: string;
  notice_type: string;
  target_all_house: boolean;
  target_user_id: string | null;
  house_id: string | null;
  created_at: string;
  created_by: string;
};

export default function Notices() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [notices, setNotices] = useState<Notice[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noticeType, setNoticeType] = useState("general");
  const [targetHouse, setTargetHouse] = useState("all");

  const fetchNotices = async () => {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    setNotices(data ?? []);
  };

  const fetchAcknowledgements = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notice_acknowledgements")
      .select("notice_id")
      .eq("user_id", user.id);
    setAcknowledged(new Set(data?.map((a) => a.notice_id) ?? []));
  };

  useEffect(() => {
    fetchNotices();
    fetchAcknowledgements();
    if (isAdmin) {
      supabase.from("houses").select("id, name").then(({ data }) => setHouses(data ?? []));
    }
  }, [user, isAdmin]);

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("notices").insert({
      title: title.trim(),
      content: content.trim(),
      notice_type: noticeType as any,
      created_by: user.id,
      target_all_house: targetHouse === "all",
      house_id: targetHouse !== "all" ? targetHouse : null,
    });
    if (error) {
      setLoading(false);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Email tenants of the targeted house(s)
    try {
      let tenantQuery = supabase.from("rooms").select("tenant_id, house_id").not("tenant_id", "is", null);
      if (targetHouse !== "all") tenantQuery = tenantQuery.eq("house_id", targetHouse);
      const { data: rooms } = await tenantQuery;
      const tenantIds = Array.from(new Set((rooms ?? []).map((r) => r.tenant_id))).filter(Boolean) as string[];

      if (tenantIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email")
          .in("user_id", tenantIds);
        await Promise.all(
          (profiles ?? []).map((p) =>
            supabase.functions.invoke("notify-issue-update", {
              body: {
                type: "new_notice",
                recipientEmail: p.email,
                noticeTitle: title.trim(),
                noticeContent: content.trim(),
              },
            }),
          ),
        );
      }
    } catch (e) {
      console.error("Failed to send notice emails", e);
    }

    setLoading(false);
    toast({ title: "Notice sent", description: "Tenants will be emailed." });
    setTitle("");
    setContent("");
    setNoticeType("general");
    setTargetHouse("all");
    setDialogOpen(false);
    fetchNotices();
  };

  const handleAcknowledge = async (noticeId: string) => {
    if (!user) return;
    await supabase.from("notice_acknowledgements").insert({
      notice_id: noticeId,
      user_id: user.id,
    });
    setAcknowledged((prev) => new Set(prev).add(noticeId));
    toast({ title: "Acknowledged" });
  };

  const typeColor = (t: string) => {
    if (t === "maintenance" || t === "utility_shutdown") return "destructive";
    if (t === "rent_reminder" || t === "inspection") return "secondary";
    return "outline";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notices</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Create and manage announcements for tenants" : "Announcements from your property manager"}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> New Notice</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Notice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement..." rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={noticeType} onValueChange={setNoticeType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Constants.public.Enums.notice_type.map((t) => (
                            <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Select value={targetHouse} onValueChange={setTargetHouse}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Properties</SelectItem>
                          {houses.map((h) => (
                            <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreate} disabled={loading || !title.trim()} className="w-full">
                    {loading ? "Sending..." : "Send Notice"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {notices.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No notices yet.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{notice.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notice.created_at).toLocaleDateString()} at{" "}
                      {new Date(notice.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Badge variant={typeColor(notice.notice_type)}>
                    {notice.notice_type.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">{notice.content}</p>
                {!isAdmin && !acknowledged.has(notice.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleAcknowledge(notice.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Acknowledge
                  </Button>
                )}
                {!isAdmin && acknowledged.has(notice.id) && (
                  <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledged
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
