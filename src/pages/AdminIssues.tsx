import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, MessageSquare, Clock, CheckCircle } from "lucide-react";

type Issue = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  description: string;
  created_at: string;
  reported_by: string;
  house_id: string;
};

type IssueMessage = {
  id: string;
  issue_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  created_at: string;
};

const STATUS_MAP = {
  new: ["submitted"],
  ongoing: ["acknowledged", "in_progress", "waiting_for_contractor"],
  closed: ["resolved"],
};

const STATUS_OPTIONS = [
  { value: "submitted", label: "New" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting_for_contractor", label: "Waiting for Contractor" },
  { value: "resolved", label: "Resolved" },
];

export default function AdminIssues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<IssueMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [reporterEmail, setReporterEmail] = useState("");

  const fetchIssues = async () => {
    const { data } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });
    setIssues(data ?? []);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const openIssue = async (issue: Issue) => {
    setSelectedIssue(issue);
    setReply("");
    const [messagesRes, profileRes] = await Promise.all([
      supabase
        .from("issue_messages")
        .select("*")
        .eq("issue_id", issue.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", issue.reported_by)
        .maybeSingle(),
    ]);
    setMessages(messagesRes.data ?? []);
    setReporterEmail(profileRes.data?.email ?? "");
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedIssue || !user) return;
    setLoading(true);

    const { error } = await supabase.from("issue_messages").insert({
      issue_id: selectedIssue.id,
      sender_id: user.id,
      sender_role: "admin",
      message: reply.trim(),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Send email notification to tenant
      await supabase.functions.invoke("notify-issue-update", {
        body: {
          issueId: selectedIssue.id,
          issueTitle: selectedIssue.title,
          recipientEmail: reporterEmail,
          message: reply.trim(),
          type: "admin_reply",
        },
      });

      toast({ title: "Reply sent" });
      setReply("");
      openIssue(selectedIssue);
    }
    setLoading(false);
  };

  const updateStatus = async (issueId: string, newStatus: string) => {
    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", issueId);

    if (!error) {
      toast({ title: "Status updated" });
      fetchIssues();
      if (selectedIssue?.id === issueId) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    }
  };

  const priorityColor = (p: string) => {
    if (p === "emergency") return "destructive";
    if (p === "urgent") return "secondary";
    return "outline";
  };

  const getTabIssues = (tab: string) => {
    const statuses = STATUS_MAP[tab as keyof typeof STATUS_MAP] ?? [];
    return issues.filter((i) => statuses.includes(i.status));
  };

  const IssueList = ({ items }: { items: Issue[] }) => (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No issues in this category.</p>
      )}
      {items.map((issue) => (
        <Card
          key={issue.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => openIssue(issue)}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm">{issue.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(issue.created_at).toLocaleDateString()} • {issue.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={priorityColor(issue.priority)}>{issue.priority}</Badge>
                <Select
                  value={issue.status}
                  onValueChange={(v) => {
                    updateStatus(issue.id, v);
                  }}
                >
                  <SelectTrigger
                    className="h-7 text-xs w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issues</h1>
          <p className="text-muted-foreground">Manage reported issues from tenants</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{getTabIssues("new").length}</p>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{getTabIssues("ongoing").length}</p>
                <p className="text-xs text-muted-foreground">Ongoing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getTabIssues("closed").length}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New ({getTabIssues("new").length})</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing ({getTabIssues("ongoing").length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({getTabIssues("closed").length})</TabsTrigger>
          </TabsList>
          <TabsContent value="new"><IssueList items={getTabIssues("new")} /></TabsContent>
          <TabsContent value="ongoing"><IssueList items={getTabIssues("ongoing")} /></TabsContent>
          <TabsContent value="closed"><IssueList items={getTabIssues("closed")} /></TabsContent>
        </Tabs>
      </div>

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedIssue.title}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant={priorityColor(selectedIssue.priority)}>{selectedIssue.priority}</Badge>
                <Badge variant="outline">{selectedIssue.status.replace(/_/g, " ")}</Badge>
                <Badge variant="outline">{selectedIssue.location}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(selectedIssue.created_at).toLocaleString()}
                </span>
              </div>

              {/* Conversation thread */}
              <div className="space-y-3 mt-4">
                {/* Original issue as first message */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Tenant • {reporterEmail}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedIssue.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                {/* Reply messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 ${
                      msg.sender_role === "admin"
                        ? "bg-primary/10 ml-6"
                        : "bg-muted mr-6"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {msg.sender_role === "admin" ? "Admin" : "Tenant"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <div className="space-y-2 mt-4">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <Select
                    value={selectedIssue.status}
                    onValueChange={(v) => updateStatus(selectedIssue.id, v)}
                  >
                    <SelectTrigger className="w-48 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleReply} disabled={!reply.trim() || loading}>
                    {loading ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
