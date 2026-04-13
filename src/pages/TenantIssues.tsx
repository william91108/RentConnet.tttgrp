import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

export default function TenantIssues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("issues")
      .select("*")
      .eq("reported_by", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setIssues(data ?? []));
  }, [user]);

  const openIssue = async (issue: any) => {
    setSelectedIssue(issue);
    setReply("");
    const { data } = await supabase
      .from("issue_messages")
      .select("*")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedIssue || !user) return;
    setLoading(true);
    const { error } = await supabase.from("issue_messages").insert({
      issue_id: selectedIssue.id,
      sender_id: user.id,
      sender_role: "tenant",
      message: reply.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reply sent" });
      setReply("");
      openIssue(selectedIssue);
    }
    setLoading(false);
  };

  const priorityColor = (p: string) => {
    if (p === "emergency") return "destructive" as const;
    if (p === "urgent") return "secondary" as const;
    return "outline" as const;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Issues</h1>
          <p className="text-muted-foreground">Track your reported issues</p>
        </div>

        <div className="space-y-3">
          {issues.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No issues reported yet.</p>
          )}
          {issues.map((issue) => (
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
                    <Badge variant="outline">{issue.status.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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

              <div className="space-y-3 mt-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">You</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedIssue.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 ${
                      msg.sender_role === "admin" ? "bg-primary/10 ml-6" : "bg-muted mr-6"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {msg.sender_role === "admin" ? "Admin" : "You"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>

              {selectedIssue.status !== "resolved" && (
                <div className="space-y-2 mt-4">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add a reply..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleReply} disabled={!reply.trim() || loading}>
                      {loading ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
