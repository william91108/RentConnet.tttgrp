import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Droplets, Key, DoorOpen, Trash2, Car, UtensilsCrossed,
  Hammer, Moon, ShowerHead, Cigarette, Dog, Volume2, Users,
  Flame, AlertTriangle, Clock,
} from "lucide-react";

const rules = [
  {
    id: "utilities",
    icon: Droplets,
    title: "Water, Electricity & Gas Usage",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Utility bills (water, electricity, gas) are <strong>included in your rent</strong>. However, this is based on <strong>normal household usage</strong>.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Excessive usage:</strong> If your consumption significantly exceeds normal levels, additional charges will apply. This is calculated based on the average usage per room.</li>
          <li><strong>Tips to avoid extra charges:</strong> Turn off lights and appliances when not in use. Use fans before air conditioning. Take shorter showers. Don't leave heaters running overnight.</li>
          <li><strong>Monitoring:</strong> Usage is reviewed quarterly. If excess is detected, you'll be notified before any charge is applied.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "key-loss",
    icon: Key,
    title: "Lost Keys",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Each tenant is issued keys upon move-in. If you lose a key:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Replacement fee:</strong> $20 per key.</li>
          <li><strong>Process:</strong> Report the lost key by submitting an issue ticket immediately. A replacement will be arranged.</li>
          <li><strong>Security:</strong> If the lost key is a front door key, the lock may need to be changed for security reasons. The cost of rekeying will be charged to the responsible tenant.</li>
          <li><strong>Tip:</strong> Keep a spare key in a safe place. Do NOT duplicate keys without permission.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "room-lockout",
    icon: DoorOpen,
    title: "Room Lock-Out",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>If you're locked out of your room:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Backup key box:</strong> A backup key box is located in the <strong>living room</strong>.</li>
          <li><strong>To get the passcode:</strong> Submit an issue ticket with your <strong>room details</strong> (e.g., Unit 1 Room 2). The passcode will be provided to you.</li>
          <li><strong>Important:</strong> After using the backup key, return it to the key box immediately and re-lock the box.</li>
          <li><strong>Repeated lock-outs:</strong> Frequent lock-outs may result in a service fee. Please keep your key with you at all times.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "house-lockout",
    icon: DoorOpen,
    title: "House Door Lock-Out",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>If you're locked out of the house (front door):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Backup key box:</strong> Located at the <strong>Unit 3 meter box</strong>.</li>
          <li><strong>To get the passcode:</strong> Submit an issue ticket requesting the house door backup key passcode.</li>
          <li><strong>Return immediately:</strong> After unlocking, return the key to the key box and re-lock it straight away.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "bins",
    icon: Trash2,
    title: "Bin Collection & Waste",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Green bin (FOGO) & Yellow bin (Recycling):</strong> Collected <strong>every Tuesday</strong>. Place bins on the kerb the night before.</li>
          <li><strong>Red bin (General waste):</strong> Collected weekly — check your local council schedule.</li>
          <li><strong>Bulk household items:</strong> Available <strong>on booking only</strong>. Contact admin to arrange a bulk collection date with the council.</li>
          <li><strong>Rules:</strong> Do NOT put soft plastics in the yellow bin. Break down cardboard boxes. No hazardous waste in any bin.</li>
          <li><strong>Tip:</strong> Rinse containers before recycling. Use Containers for Change for 10c refunds on eligible bottles/cans.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "parking",
    icon: Car,
    title: "Parking",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Parking arrangement:</strong> All parking is <strong>street parking</strong> only. There are no dedicated parking spots.</li>
          <li><strong>Rules:</strong> Observe local council parking signs and time limits. Do not block driveways, footpaths, or other residents' access.</li>
          <li><strong>Visitors:</strong> Guests must also park on the street and follow the same rules.</li>
          <li><strong>No vehicle repairs:</strong> Do not perform car maintenance or repairs on the street or property grounds.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "kitchen",
    icon: UtensilsCrossed,
    title: "Kitchen & Fridge Storage",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Fridge space:</strong> Each room has a <strong>labelled section</strong> in the shared fridge. Only use your allocated space.</li>
          <li><strong>Kitchen storage:</strong> Cupboard and shelf space is labelled per room. Keep your items within your allocated area.</li>
          <li><strong>Shared items:</strong> Communal items (salt, oil, etc.) are optional and arranged between housemates — not provided by management.</li>
          <li><strong>Cleanliness:</strong> Clean up immediately after cooking. Wash your dishes — do NOT leave them in the sink. Wipe down stovetop and benches.</li>
          <li><strong>Expired food:</strong> Remove expired food promptly. Monthly fridge clean-outs may be conducted.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "damage",
    icon: Hammer,
    title: "Property Damage",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>All tenants are responsible for keeping the property in good condition. Damage beyond normal wear and tear will be charged to the responsible tenant.</p>
        <p className="font-semibold text-foreground">Common damage scenarios:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Doors:</strong> Do not slam doors. If a door is damaged (cracked panel, broken handle, hinge issue), report it immediately via an issue ticket. Repair cost: $50–$300+ depending on severity.</li>
          <li><strong>Locks:</strong> Do not force locks. If a lock jams, report it — do NOT attempt to fix it yourself. Replacement cost: $80–$200.</li>
          <li><strong>Windows:</strong> Do not lean on window screens or use excessive force on window latches. Broken glass or damaged frames will be charged. Repair cost: $100–$400+.</li>
          <li><strong>Walls:</strong> No nails, screws, or adhesive hooks that damage paint or plaster. Use removable hooks only. Patching & repainting cost: $50–$150 per area.</li>
          <li><strong>Flooring:</strong> Use furniture pads under heavy items. Report any water damage or stains immediately. Repair cost varies.</li>
          <li><strong>Appliances:</strong> Use appliances as intended. Do not overload washing machines. Report malfunctions immediately — do not attempt DIY repairs.</li>
        </ul>
        <p className="text-xs italic">💡 <strong>Report damage as soon as it happens.</strong> Unreported damage discovered during inspection will be charged at full repair cost plus an assessment fee.</p>
      </div>
    ),
  },
  {
    id: "quiet-hours",
    icon: Moon,
    title: "Quiet Hours & Noise",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Quiet hours:</strong> 10:00 PM – 7:00 AM on weekdays, 11:00 PM – 8:00 AM on weekends.</li>
          <li>Keep music, TV, and conversations at a reasonable volume during quiet hours.</li>
          <li>Use headphones for media after 10 PM.</li>
          <li><strong>Violations:</strong> Repeated noise complaints may result in a formal warning and potential lease termination.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "bathroom",
    icon: ShowerHead,
    title: "Bathroom & Laundry",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Shared bathrooms:</strong> Clean up after yourself. Wipe down surfaces and remove hair from drains.</li>
          <li><strong>Shower time:</strong> Keep showers under 10 minutes to conserve water and allow others to use the bathroom.</li>
          <li><strong>Laundry:</strong> Remove clothes from the washer/dryer promptly. Do not leave clothes sitting for hours.</li>
          <li><strong>Blockages:</strong> Do NOT flush anything other than toilet paper. Report blocked drains immediately.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "smoking",
    icon: Cigarette,
    title: "Smoking & Vaping",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Strictly no smoking or vaping indoors.</strong> This includes bedrooms, bathrooms, kitchen, and common areas.</li>
          <li><strong>Designated area:</strong> Smoke outside only, away from windows and doors.</li>
          <li><strong>Dispose properly:</strong> Use a proper ashtray or container. Do not throw cigarette butts on the ground or in garden beds.</li>
          <li><strong>Violation:</strong> Smoking indoors will result in a cleaning fee ($200+) and a formal warning.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "pets",
    icon: Dog,
    title: "Pets",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>No pets allowed</strong> unless prior written approval has been granted by management.</li>
          <li>This includes dogs, cats, birds, reptiles, and fish tanks over 20L.</li>
          <li><strong>Violation:</strong> Unauthorised pets will result in immediate removal and a cleaning/fumigation fee.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "guests",
    icon: Users,
    title: "Guests & Overnight Stays",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Day visitors:</strong> Welcome, but must leave by 10 PM on weekdays and 11 PM on weekends.</li>
          <li><strong>Overnight guests:</strong> Allowed for up to <strong>3 consecutive nights</strong>, maximum <strong>6 nights per month</strong>. Notify management if staying longer.</li>
          <li><strong>Guests must follow all house rules.</strong> The hosting tenant is responsible for their guest's behaviour.</li>
          <li><strong>No subletting:</strong> You may NOT rent out your room or bed to anyone else.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "fire-safety",
    icon: Flame,
    title: "Fire Safety",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Smoke alarms:</strong> Do NOT tamper with, remove, or cover smoke alarms. This is a legal requirement in WA.</li>
          <li><strong>Candles & incense:</strong> Open flames are <strong>not permitted</strong> indoors.</li>
          <li><strong>Cooking:</strong> Never leave cooking unattended. Keep flammable items away from the stove.</li>
          <li><strong>Fire extinguisher:</strong> Located in the kitchen. Familiarise yourself with its location and how to use it.</li>
          <li><strong>Emergency:</strong> In case of fire, evacuate immediately and call <strong>000</strong>.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "move-out",
    icon: AlertTriangle,
    title: "Move-Out & Bond",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Notice period:</strong> Provide at least <strong>2 weeks' written notice</strong> before moving out.</li>
          <li><strong>Room condition:</strong> Your room must be returned in the same condition as move-in (minus normal wear and tear). Clean thoroughly.</li>
          <li><strong>Bond return:</strong> Bond will be returned within 14 days after inspection. Any damage or unpaid rent will be deducted.</li>
          <li><strong>Key return:</strong> All keys must be returned on your last day. Unreturned keys will be charged at $20 each + potential rekeying costs.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "inspections",
    icon: Clock,
    title: "Room Inspections",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Routine inspections:</strong> Conducted <strong>quarterly</strong> with at least 7 days' notice.</li>
          <li><strong>What's checked:</strong> General cleanliness, property condition, smoke alarms, pest signs, and unauthorised modifications.</li>
          <li><strong>Your rights:</strong> You do NOT need to be home during the inspection, but you may be present if you wish.</li>
          <li><strong>Action items:</strong> If issues are found, you'll be given a reasonable timeframe to address them.</li>
        </ul>
      </div>
    ),
  },
];

export default function HouseRules() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            House Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            Please read and follow all house rules. Violations may result in warnings or charges.
          </p>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {rules.map((r) => (
            <AccordionItem key={r.id} value={r.id} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-base font-semibold text-foreground">{r.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>{r.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AppLayout>
  );
}
