import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, DoorOpen, User, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type House = { id: string; name: string; address: string };
type Room = {
  id: string;
  name: string;
  house_id: string;
  area: number | null;
  window_type: string;
  rent_amount: number | null;
  rent_due_day: number | null;
  tenant_id: string | null;
};

export default function Properties() {
  const [houses, setHouses] = useState<House[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [assigningRoom, setAssigningRoom] = useState<Room | null>(null);

  // Room form
  const [houseName, setHouseName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [area, setArea] = useState("");
  const [windowType, setWindowType] = useState("window");
  const [rentAmount, setRentAmount] = useState("");
  const [rentDueDay, setRentDueDay] = useState("1");

  // Assign form
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");

  const fetchHouses = async () => {
    const { data } = await supabase.from("houses").select("id, name, address").order("name");
    setHouses(data ?? []);
    if (!selectedHouse && data && data.length > 0) setSelectedHouse(data[0].id);
  };

  const fetchRooms = async () => {
    if (!selectedHouse) return;
    const { data } = await supabase
      .from("rooms")
      .select("id, name, house_id, area, window_type, rent_amount, rent_due_day, tenant_id")
      .eq("house_id", selectedHouse)
      .order("name");
    setRooms((data as Room[]) ?? []);
  };

  useEffect(() => { fetchHouses(); }, []);
  useEffect(() => { fetchRooms(); }, [selectedHouse]);

  const currentHouse = houses.find((h) => h.id === selectedHouse);

  const openAddRoom = () => {
    setEditingRoom(null);
    setHouseName(currentHouse?.name ?? "");
    setRoomNumber("");
    setArea("");
    setWindowType("window");
    setRentAmount("");
    setRentDueDay("1");
    setRoomDialogOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setHouseName(currentHouse?.name ?? "");
    // Extract room number from name like "Unit 1 Room 3" → "3"
    const roomMatch = room.name.match(/Room\s+(.+)$/i);
    setRoomNumber(roomMatch ? roomMatch[1] : room.name);
    setArea(room.area?.toString() ?? "");
    setWindowType(room.window_type ?? "window");
    setRentAmount(room.rent_amount?.toString() ?? "");
    setRentDueDay(room.rent_due_day?.toString() ?? "1");
    setRoomDialogOpen(true);
  };

  const saveRoom = async () => {
    if (!roomNumber.trim()) {
      toast.error("Room number is required");
      return;
    }
    const roomName = `${houseName.trim()} Room ${roomNumber.trim()}`;
    const payload = {
      name: roomName,
      house_id: selectedHouse!,
      area: area ? parseFloat(area) : null,
      window_type: windowType,
      rent_amount: rentAmount ? parseFloat(rentAmount) : null,
      rent_due_day: rentDueDay ? parseInt(rentDueDay) : 1,
    };

    if (editingRoom) {
      const { error } = await supabase.from("rooms").update(payload).eq("id", editingRoom.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Room updated");
    } else {
      const { error } = await supabase.from("rooms").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Room added");
    }
    setRoomDialogOpen(false);
    fetchRooms();
  };

  const deleteRoom = async (id: string) => {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Room deleted");
    fetchRooms();
  };

  const openAssign = (room: Room) => {
    setAssigningRoom(room);
    setTenantName("");
    setTenantEmail("");
    setAssignDialogOpen(true);
  };

  const assignTenant = async () => {
    if (!tenantName.trim() || !tenantEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    // Check if a profile with this email exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", tenantEmail.trim().toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      // Assign existing user
      const { error } = await supabase
        .from("rooms")
        .update({ tenant_id: existingProfile.user_id })
        .eq("id", assigningRoom!.id);
      if (error) { toast.error(error.message); return; }
      toast.success(`Room assigned to ${tenantName}`);
    } else {
      // Invite new tenant via Supabase auth invite (admin action)
      // For now, create a placeholder — admin should invite the tenant separately
      toast.info(`No account found for ${tenantEmail}. Please invite the tenant to sign up first, then assign them.`);
      setAssignDialogOpen(false);
      return;
    }

    setAssignDialogOpen(false);
    fetchRooms();
  };

  const unassignTenant = async (roomId: string) => {
    const { error } = await supabase.from("rooms").update({ tenant_id: null }).eq("id", roomId);
    if (error) { toast.error(error.message); return; }
    toast.success("Tenant unassigned");
    fetchRooms();
  };

  // Fetch tenant profiles for display
  const [tenantProfiles, setTenantProfiles] = useState<Record<string, { full_name: string; email: string }>>({});
  useEffect(() => {
    const tenantIds = rooms.filter((r) => r.tenant_id).map((r) => r.tenant_id!);
    if (tenantIds.length === 0) { setTenantProfiles({}); return; }
    supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", tenantIds)
      .then(({ data }) => {
        const map: Record<string, { full_name: string; email: string }> = {};
        data?.forEach((p) => { map[p.user_id] = { full_name: p.full_name, email: p.email }; });
        setTenantProfiles(map);
      });
  }, [rooms]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground">Manage houses and rooms</p>
          </div>
        </div>

        {/* House selector */}
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Select Property:</Label>
          <Select value={selectedHouse ?? ""} onValueChange={setSelectedHouse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a house" />
            </SelectTrigger>
            <SelectContent>
              {houses.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name} — {h.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedHouse && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <DoorOpen className="h-5 w-5" /> Rooms in {currentHouse?.name}
              </h2>
              <Button size="sm" onClick={openAddRoom}>
                <Plus className="h-4 w-4 mr-1" /> Add Room
              </Button>
            </div>

            {rooms.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No rooms added yet. Click "Add Room" to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{room.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRoom(room)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRoom(room.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {room.area && <Badge variant="outline">{room.area} m²</Badge>}
                        <Badge variant="outline">{room.window_type === "door_window" ? "Door + Window" : "Window only"}</Badge>
                      </div>
                      {room.rent_amount != null && room.rent_amount > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Rent: ${room.rent_amount}/mo — Due day {room.rent_due_day}
                        </p>
                      )}
                      <div className="pt-2 border-t border-border">
                        {room.tenant_id && tenantProfiles[room.tenant_id] ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{tenantProfiles[room.tenant_id].full_name || "Tenant"}</p>
                                <p className="text-xs text-muted-foreground">{tenantProfiles[room.tenant_id].email}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => unassignTenant(room.id)}>
                              Unassign
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => openAssign(room)}>
                            <User className="h-3.5 w-3.5 mr-1" /> Assign Tenant
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Room Dialog */}
      <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>House / Unit Name</Label>
                <Input value={houseName} onChange={(e) => setHouseName(e.target.value)} placeholder="e.g. Unit 1" />
              </div>
              <div>
                <Label>Room Number</Label>
                <Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. Room 1" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Room name: <strong>{houseName.trim()} Room {roomNumber.trim()}</strong>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Area (m²)</Label>
                <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 9" />
              </div>
              <div>
                <Label>Window Type</Label>
                <Select value={windowType} onValueChange={setWindowType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="window">Window only</SelectItem>
                    <SelectItem value="door_window">Door + Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rent Amount</Label>
                <Input type="number" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Rent Due Day</Label>
                <Input type="number" min="1" max="28" value={rentDueDay} onChange={(e) => setRentDueDay(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveRoom}>{editingRoom ? "Update" : "Add Room"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tenant to {assigningRoom?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tenant Name</Label>
              <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label>Tenant Email</Label>
              <Input type="email" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <p className="text-xs text-muted-foreground">
              The tenant must have an existing account. If they don't, invite them to sign up first.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={assignTenant}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
