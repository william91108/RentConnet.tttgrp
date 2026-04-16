import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bus, Landmark, Car, Wrench, Shield, Heart, Printer, Sun,
  Smartphone, Plane, Fuel, TrafficCone, ShoppingCart, Droplets,
  Bug, Recycle, MapPin,
} from "lucide-react";

const sections = [
  {
    id: "transport",
    icon: Bus,
    title: "Public Transport",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Perth has a reliable public transport system run by <strong>Transperth</strong>. Use the Transperth Journey Planner app to find routes.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Curtin → City:</strong> Take the bus from Curtin Bus Station to Elizabeth Quay Bus Station (~25 min). Route 100 is the most frequent.</li>
          <li><strong>Curtin → Airport:</strong> Take a bus to the train station then catch the Airport Line train to Terminal 1 or Terminal 2. Alternatively, bus Route 380 goes to the airport area. A taxi/rideshare costs ~$30–40.</li>
          <li><strong>SmartRider card:</strong> Get a SmartRider for cheaper fares (concession if you're a student). Top up at train stations or online.</li>
          <li><strong>Free Transit Zone:</strong> All buses and trains within the Perth CBD Free Transit Zone are free.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "bank",
    icon: Landmark,
    title: "Bank Account Opening",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>You'll need a bank account for rent payments and daily expenses. Here's a comparison:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Commonwealth Bank (CBA):</strong> Has a monthly account fee (~$4/month) but you can waive it if you deposit at least $2,000 AUD per month. Largest ATM network in Australia.</li>
          <li><strong>NAB:</strong> No monthly account fee — great for students and those starting out. Good mobile app.</li>
          <li><strong>ANZ:</strong> Has a monthly account fee (~$5/month). Can be waived with certain conditions. Good international transfer options.</li>
          <li><strong>Tip:</strong> Bring your passport, visa, and proof of address to open an account. Most banks let you pre-apply online before arriving in Australia.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "cars",
    icon: Car,
    title: "Second-Hand Car Buying",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Buying a used car in Perth? Here's what you need to know:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Facebook Marketplace:</strong> ⚠ Worst option — many scams and hidden issues. You MUST bring an experienced mechanic for inspection. No buyer protection.</li>
          <li><strong>Carsales.com.au:</strong> ✅ Most reliable platform for used cars. Dealers and private sellers are generally more accountable. Look for cars with service history.</li>
          <li><strong>Gumtree:</strong> ⚠ Not reliable — similar to Facebook. Always take a mechanic with you for inspection before purchasing.</li>
          <li><strong>Car Dealers:</strong> Don't buy cheap cars with no warranty. <strong>Warranty is a must</strong> — you can negotiate with the dealer. <strong>John Hughes in Vic Park</strong> is the biggest and most reliable dealer in Perth.</li>
          <li><strong>Tip:</strong> Always check the car's history via a PPSR (Personal Property Securities Register) search before buying to ensure it's not stolen, written off, or has money owing.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "mechanics",
    icon: Wrench,
    title: "Mechanics Shop",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>C4 Auto</strong> is a reliable mechanics shop in Perth. They're honest, reasonably priced, and do quality work.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Good for regular servicing, pre-purchase inspections, and repairs.</li>
          <li><strong>Tip:</strong> Always get a pre-purchase inspection (~$150–250) before buying any used car.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "insurance",
    icon: Shield,
    title: "Car Insurance",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Car insurance is highly recommended. <strong>RAC</strong> offers the best value coverage in WA.</p>
        <p className="font-semibold text-foreground">Key terms explained:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Excess:</strong> The initial amount YOU pay out of pocket when making a claim. For example, if your excess is $500 and damage costs $2,000, you pay $500 and insurance covers $1,500.</li>
          <li><strong>Age excess:</strong> Drivers under 21 pay an extra excess on top of the standard excess (usually $400–$800 extra). This is because younger drivers are statistically higher risk.</li>
          <li><strong>Third Party Property:</strong> Covers damage you cause to OTHER people's vehicles/property only. Does NOT cover your own car. This is the minimum recommended cover.</li>
          <li><strong>Third Party Fire & Theft:</strong> Same as above, plus covers your car if it's stolen or damaged by fire.</li>
          <li><strong>Comprehensive:</strong> Covers everything — damage to others AND your own car, plus theft, fire, weather damage, etc. Most expensive but best protection.</li>
          <li><strong>No Claim Bonus (NCB):</strong> A discount you earn for each year you don't make a claim. Can save you up to 65% on premiums over time.</li>
          <li><strong>Agreed vs Market Value:</strong> Agreed value = you and the insurer agree on a set payout amount. Market value = insurer decides what your car is worth at the time of the claim.</li>
        </ul>
        <p className="text-xs italic">💡 If you're under 25 with a cheap car, Third Party Property may be enough. For newer/expensive cars, go Comprehensive.</p>
      </div>
    ),
  },
  {
    id: "health",
    icon: Heart,
    title: "Health & GP Visits",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>If you feel sick, <strong>go to a GP (General Practitioner)</strong> first — not the hospital (unless it's an emergency).</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the HealthDirect website to find bulk-billing GPs (free with Medicare/OSHC).</li>
          <li><strong>Uni exams during illness:</strong> If you're sick during exams and need to defer, ask the GP for a <strong>medical certificate</strong>. Submit it to Curtin's student services for a deferred exam.</li>
          <li><strong>After hours:</strong> Call Health Direct on <strong>1800 022 222</strong> for free medical advice 24/7.</li>
          <li><strong>Mental health:</strong> Curtin offers free counselling services for students. Book through Curtin Connect.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "printing",
    icon: Printer,
    title: "Printing & Copying",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Curtin University — Building 103:</strong> ✅ Best printing shop. Affordable, high quality, and convenient for students.</li>
          <li><strong>Kmart:</strong> Has a self-service printing section. Good for photos and basic documents.</li>
          <li><strong>Big W:</strong> Similar to Kmart with self-service printing kiosks.</li>
          <li><strong>Officeworks:</strong> Good for binding, large format printing, and business documents.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "weather",
    icon: Sun,
    title: "Perth Weather",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Summer (Dec–Feb):</strong> Extremely hot — up to 40°C+. Almost no rain. Stay hydrated, wear sunscreen (SPF 50+), and avoid prolonged sun exposure.</li>
          <li><strong>Winter (Jun–Aug):</strong> Cool and rainy — around 10°C. Bring a warm jacket and waterproof layer.</li>
          <li><strong>UV Index:</strong> Perth has some of the highest UV levels in the world. Always wear sunscreen, even on cloudy days.</li>
          <li><strong>Tip:</strong> Keep a water bottle with you at all times in summer. Air conditioning is essential — make sure your room's AC works before summer starts.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Plans",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Lycamobile & Amaysim:</strong> 💰 Cheapest options. Both use the Optus network. Good in the city but <strong>bad signal in the countryside/regional areas</strong>. Fine if you mostly stay in Perth metro.</li>
          <li><strong>Vodafone:</strong> Good student plans with 24-month contracts that include a phone (iPhone/Samsung). Decent coverage and value for money.</li>
          <li><strong>Telstra:</strong> 📶 Best network coverage and service across Australia, including regional areas. But the most expensive. Worth it if you travel or live in outer suburbs.</li>
          <li><strong>Tip:</strong> If you just need data and calls, a prepaid plan from Amaysim or Boost (Telstra network) is often the best value.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "travel",
    icon: Plane,
    title: "Travelling in WA",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Western Australia has incredible destinations. Plan trips through tourism websites and travel forums.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Monkey Mia:</strong> Famous for wild dolphin encounters (~830 km north of Perth).</li>
          <li><strong>Pink Lake (Hutt Lagoon):</strong> Stunning pink-coloured lake near Geraldton. Best seen from above or on a clear day.</li>
          <li><strong>Albany:</strong> Beautiful coastal town with natural bridges, the Gap, and stunning beaches (~420 km south).</li>
          <li><strong>Margaret River:</strong> Wine region with caves, breweries, and beautiful coastline (~270 km south).</li>
          <li><strong>Rottnest Island:</strong> Home of the quokka! Take a ferry from Fremantle. Great for cycling and snorkelling.</li>
          <li><strong>Pinnacles Desert:</strong> Unique limestone formations in Nambung National Park (~190 km north).</li>
          <li><strong>Tip:</strong> Use <strong>WikiCamps</strong> app to find free/cheap campsites. Always carry extra water when driving in regional WA.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "fuel",
    icon: Fuel,
    title: "Finding Cheap Fuel",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Fuel prices in Perth cycle weekly (cheapest usually Tuesday/Wednesday, most expensive on Thursday/Friday).</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>FuelWatch WA:</strong> Official WA Government website (<strong>fuelwatch.wa.gov.au</strong>) shows tomorrow's fuel prices so you can plan ahead.</li>
          <li><strong>Tip:</strong> Fill up on the cheapest day. Costco fuel is consistently the cheapest if you have a membership. United and Liberty are often cheaper than BP/Shell/Caltex.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "traffic",
    icon: TrafficCone,
    title: "Traffic Rules & Speed Cameras",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">⚠ WA has strict traffic enforcement — no leniency!</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Speed limits:</strong> There is <strong>NO 10% tolerance</strong>. Doing 102 km/h in a 100 zone WILL get you a fine. Keep your speedometer at or below the limit.</li>
          <li><strong>Mobile speed cameras:</strong> Unmarked police vehicles park on roadsides. Use the <strong>Waze app</strong> — other drivers report camera locations in real time.</li>
          <li><strong>Fixed cameras on traffic lights:</strong> These cameras can detect <strong>phone use while driving</strong>. If caught, a ticket will be sent to your address. Fine is $1,000+ and 4 demerit points.</li>
          <li><strong>Roundabouts:</strong> Always <strong>give way to vehicles already in the roundabout</strong> (coming from your right). Signal left when exiting.</li>
          <li><strong>School zones:</strong> 40 km/h during school hours — double demerit penalties apply.</li>
          <li><strong>Double demerits:</strong> Apply on long weekends and public holidays. Fines and points are doubled for speeding, seatbelt, and phone offences.</li>
          <li><strong>Blood Alcohol Limit:</strong> 0.05 BAC for full licence holders, <strong>0.00 for P-platers</strong>. Random breath tests are very common.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "grocery",
    icon: ShoppingCart,
    title: "Grocery Shopping",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Coles & Woolworths:</strong> The two main supermarkets. Check their apps for weekly specials and digital coupons.</li>
          <li><strong>ALDI:</strong> Significantly cheaper for staples. Great quality own-brand products.</li>
          <li><strong>Spudshed:</strong> Local WA chain with very cheap fruits, vegetables, and bulk items.</li>
          <li><strong>Asian groceries:</strong> Try stores in Northbridge, Cannington, or Victoria Park for authentic Asian ingredients at lower prices.</li>
          <li><strong>Tip:</strong> Shop at closing time for marked-down items. Tuesday is usually the start of new specials at Coles and Woolworths.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "water",
    icon: Droplets,
    title: "Water & Utilities",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Tap water:</strong> Perth tap water is safe to drink — no need to buy bottled water.</li>
          <li><strong>Water restrictions:</strong> Perth has permanent water restrictions. You can only water your garden on certain days depending on your suburb (check Water Corporation website).</li>
          <li><strong>Electricity:</strong> Synergy is the main electricity provider. Set up your account when you move in. Use fans before AC to save on bills.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "pests",
    icon: Bug,
    title: "Pests & Wildlife",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Spiders:</strong> Redback spiders are common in garages and outdoor areas. Don't panic but don't touch — seek medical help if bitten.</li>
          <li><strong>Snakes:</strong> Dugite and tiger snakes are found in bushland and sometimes backyards. Never approach — call <strong>DPAW Wildlife Helpline 9474 9055</strong>.</li>
          <li><strong>Cockroaches:</strong> Very common in Perth. Keep food sealed, take rubbish out regularly, and use surface spray around entry points.</li>
          <li><strong>Tip:</strong> Shake out shoes left outside before wearing them. Check under outdoor furniture before sitting.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "recycling",
    icon: Recycle,
    title: "Recycling & Bin Days",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Red bin:</strong> General waste (weekly collection).</li>
          <li><strong>Yellow bin:</strong> Recycling — paper, cardboard, plastic bottles, glass, aluminium cans. No soft plastics!</li>
          <li><strong>Green bin (FOGO):</strong> Food organics and garden waste.</li>
          <li><strong>Containers for Change:</strong> Return eligible bottles and cans at Containers for Change depots to get 10c per container.</li>
          <li><strong>Tip:</strong> Check your local council website for your bin collection schedule.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "emergency",
    icon: MapPin,
    title: "Emergency Numbers",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>000:</strong> Police, Fire, Ambulance (life-threatening emergencies only).</li>
          <li><strong>131 444:</strong> Police non-emergency (e.g. noise complaints, suspicious activity).</li>
          <li><strong>1800 022 222:</strong> Health Direct — 24/7 free medical advice.</li>
          <li><strong>13 11 14:</strong> Lifeline — 24/7 crisis support and suicide prevention.</li>
          <li><strong>132 500:</strong> SES — for storm damage, flooding, fallen trees.</li>
        </ul>
      </div>
    ),
  },
];

export default function InformationCenter() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Information Centre — Perth
          </h1>
          <p className="text-muted-foreground mt-1">
            Everything you need to know about living in Perth as a tenant. Tap any section to expand.
          </p>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {sections.map((s) => (
            <AccordionItem key={s.id} value={s.id} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-base font-semibold text-foreground">{s.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>{s.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AppLayout>
  );
}
