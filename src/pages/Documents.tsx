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
import { FileText, Upload, Download, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["lease", "inspection", "insurance", "manual", "receipt", "general"];

export default function Documents() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const [docs, setDocs] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", category: "general", house_id: "", file: null as File | null });

  const load = async () => {
    const [{ data: d }, { data: h }] = await Promise.all([
      supabase.from("documents").select("*, houses(name)").order("created_at", { ascending: false }),
      supabase.from("houses").select("id,name").order("name"),
    ]);
    setDocs(d ?? []);
    setHouses(h ?? []);
    if (h?.length && !form.house_id) setForm((f) => ({ ...f, house_id: h[0].id }));
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleUpload = async () => {
    if (!form.file || !form.name || !form.house_id) {
      toast.error("Name, house and file are required");
      return;
    }
    setUploading(true);
    try {
      const ext = form.file.name.split(".").pop();
      const path = `${form.house_id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("house-documents").upload(path, form.file);
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("documents").insert({
        name: form.name,
        category: form.category,
        house_id: form.house_id,
        file_url: path,
        uploaded_by: user!.id,
      });
      if (dbErr) throw dbErr;
      toast.success("Document uploaded");
      setOpen(false);
      setForm({ ...form, name: "", file: null });
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("house-documents").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Download failed");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.click();
  };

  const handleDelete = async (doc: any) => {
    await supabase.storage.from("house-documents").remove([doc.file_url]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) return toast.error(error.message);
    toast.success("Document removed");
    load();
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin ? "Upload and share house documents with tenants." : "Documents shared by your landlord."}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Upload</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Document Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lease Agreement 2025" /></div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>House</Label>
                    <Select value={form.house_id} onValueChange={(v) => setForm({ ...form, house_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                      <SelectContent>
                        {houses.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>File (PDF, image, etc.)</Label><Input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} /></div>
                  <Button onClick={handleUpload} disabled={uploading} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />{uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">All Documents</CardTitle></CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No documents yet.</p>
            ) : (
              <div className="space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {d.category} • {d.houses?.name} • {new Date(d.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(d.file_url, d.name)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(d)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
