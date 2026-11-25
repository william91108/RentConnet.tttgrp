import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Room = { id: string; name: string; house_id: string; houses?: { name: string } | null };
const WEEKS = Array.from({ length: 52 }, (_, i) => i + 1);
const key = (roomId: string, week: number) => `${roomId}:${week}`;

export default function RentTracker() {
  const { user, role } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("rooms").select("id,name,house_id,houses(name)").then(({ data }) => {
      const list = (data as Room[] | null) ?? [];
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setRooms(list);
    });
  }, []);

  useEffect(() => {
    supabase.from("rent_payments").select("room_id,week,amount").eq("year", year).then(({ data }) => {
      const v: Record<string, string> = {};
      (data ?? []).forEach((r) => { v[key(r.room_id, r.week)] = String(Number(r.amount)); });
      setValues(v);
    });
  }, [year]);

  const save = async (roomId: string, week: number, raw: string) => {
    const t = raw.trim();
    if (t === "") {
      const { error } = await supabase.from("rent_payments").delete().match({ room_id: roomId, year, week });
      if (error) toast.error(error.message);
      return;
    }
    const amount = Number(t);
    if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
      toast.error("Please enter a valid amount");
      return;
    }
    const { error } = await supabase.from("rent_payments").upsert(
      { room_id: roomId, year, week, amount, updated_by: user?.id },
      { onConflict: "room_id,year,week" }
    );
    if (error) toast.error(error.message);
  };

  const totals = useMemo(() => {
    const byRoom: Record<string, number> = {};
    const byWeek: Record<number, number> = {};
    let all = 0;
    Object.entries(values).forEach(([k, v]) => {
      const n = Number(v); if (!Number.isFinite(n)) return;
      const [r, w] = k.split(":");
      byRoom[r] = (byRoom[r] ?? 0) + n;
      byWeek[+w] = (byWeek[+w] ?? 0) + n;
      all += n;
    });
    return { byRoom, byWeek, all };
  }, [values]);

  if (role !== "admin") {
    return <AppLayout><p className="text-muted-foreground">Only admins can view this page.</p></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Rent Tracker</h1>
            <p className="text-sm text-muted-foreground">Type the amount paid in a cell. Leave it empty if not paid. Saves automatically.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setYear(year - 1)} aria-label="Previous year"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="w-16 text-center font-semibold">{year}</span>
            <Button variant="outline" size="icon" onClick={() => setYear(year + 1)} aria-label="Next year"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Total received in {year}: ${totals.all.toLocaleString()}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {rooms.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No rooms yet. Add rooms on the Properties page.</p>
            ) : (
              <div className="max-h-[70vh] overflow-auto">
                <table className="border-collapse text-sm">
                  <thead className="sticky top-0 z-20 bg-muted">
                    <tr>
                      <th className="sticky left-0 z-30 bg-muted border px-2 py-2 text-left">Week</th>
                      {rooms.map((r) => (
                        <th key={r.id} className="border px-2 py-2 whitespace-nowrap font-medium">{r.name}</th>
                      ))}
                      <th className="border px-2 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKS.map((w) => (
                      <tr key={w}>
                        <td className="sticky left-0 z-10 bg-card border px-2 py-1 whitespace-nowrap font-medium">Week {w}</td>
                        {rooms.map((r) => {
                          const k = key(r.id, w);
                          const v = values[k] ?? "";
                          return (
                            <td key={r.id} className={`border p-0 ${v ? "bg-primary/10" : ""}`}>
                              <input
                                inputMode="decimal"
                                aria-label={`${r.name} week ${w}`}
                                className="w-24 bg-transparent px-2 py-1 text-right outline-none focus:bg-accent"
                                value={v}
                                onChange={(e) => setValues((p) => ({ ...p, [k]: e.target.value.replace(/[^0-9.]/g, "") }))}
                                onBlur={(e) => save(r.id, w, e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              />
                            </td>
                          );
                        })}
                        <td className="border px-2 py-1 text-right font-medium">{totals.byWeek[w] ? `$${totals.byWeek[w]}` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-muted">
                    <tr>
                      <td className="sticky left-0 bg-muted border px-2 py-2 font-semibold">Total</td>
                      {rooms.map((r) => (
                        <td key={r.id} className="border px-2 py-2 text-right font-semibold">${(totals.byRoom[r.id] ?? 0).toLocaleString()}</td>
                      ))}
                      <td className="border px-2 py-2 text-right font-bold">${totals.all.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
