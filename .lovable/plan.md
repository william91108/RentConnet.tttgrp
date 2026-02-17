

# 🏠 RentConnect — Property Communication Portal

A professional property management communication platform for landlords managing multiple shared houses with room-by-room tenants.

---

## 1. Authentication & User Management
- Email + password login for all users (landlord, property manager, tenants)
- Password reset via email
- Two roles: **Admin** (you + property manager) and **Tenant**
- Tenants are invited by admin and assigned to a specific house and room

---

## 2. Property Structure Setup (Admin)
- Add/manage houses (e.g. House A, House B)
- Add rooms within each house
- Assign tenants to rooms
- Manage shared areas per house
- "What's included in rent" info per house

---

## 3. Admin Dashboard
- Overview of all properties, rooms, and tenants
- Active issues summary with priority indicators
- Upcoming rent due dates
- Recent activity feed
- Quick actions: send notice, view issues

---

## 4. Notices & Announcements (Admin → Tenants)
- Send notices to all tenants in a house or individual tenants
- Notice types: Rent reminder, Maintenance schedule, Inspection, Policy change, Utility shutdown, General
- **Acknowledgement button** — tenants must confirm "I have read and understood" with timestamp
- Auto email notification sent with each notice

---

## 5. Rent Reminders (Automated)
- Set rent amount and due date per room
- Automatic email reminders: 5 days before, due day, and overdue
- Polite, professional tone for overdue notices
- Tenants see their rent info and upcoming due date on their dashboard

---

## 6. Issue Reporting (Tenant → Admin)
**Step 1: Select Location**
- My room, Kitchen, Bathroom, Laundry, Living area, Outdoor, Internet (house-wide)

**Step 2: Select Issue Category**
- Water, Power, Internet, Gas, Appliance, Property damage, Lock/key, Lockout, Blockage, Pest, Noise, Safety concern, Other

**Step 3: Set Priority**
- 🚨 Emergency (with clear definition popup), Urgent, Normal

**Step 4: Details**
- Description text, Photo upload, Time noticed

- Auto confirmation sent to tenant on submission

---

## 7. Issue Tracking & Status Updates
- Status pipeline: Submitted → Acknowledged → In Progress → Waiting for Contractor → Resolved
- Admin updates status with optional resolution notes
- Tenant receives email notification on every status change
- Full history visible to both sides (audit trail)

---

## 8. Emergency & Self-Help Page
- Before submitting an emergency ticket, show self-help guidance:
  - Internet: restart router instructions
  - Power: check safety switch
  - Water leak: turn off main valve location
  - Lockout: emergency contact info
- Reduces unnecessary tickets significantly

---

## 9. House Rules (Per House)
- Admin sets house rules (quiet hours, guests, cleaning, internet usage, etc.)
- Tenants must tick "I have read and understood" with timestamp recorded
- Rules viewable anytime from tenant dashboard

---

## 10. Document Centre
- Upload and store key documents per house:
  - Lease agreement, House rules, Emergency contacts, Appliance manuals, Bin collection schedule, Entry condition report
- Tenants can view/download documents for their assigned house

---

## 11. Contact Directory
- Emergency contacts list per house
- Landlord/agent, Emergency plumber, Electrician, Strata contact, After-hours number
- "How to Contact Us" page with communication expectations

---

## 12. Tenant Dashboard
- My rent info and next due date
- My active issues and their status
- Recent notices with acknowledgement status
- House rules and documents
- Emergency info quick access
- Big, clear "Report Issue" and "Emergency" buttons

---

## 13. Email Notifications (Automated)
- Rent reminders (5 days before, due day, overdue)
- New notice published
- Issue status updated
- Emergency ticket submitted (to admin)

---

## Tech & Design
- **Backend**: Lovable Cloud (Supabase) for database, auth, storage, and edge functions for email
- **Design**: Professional & corporate — structured layouts, neutral color palette, clear typography, minimal decoration
- **Mobile-friendly**: Responsive design, works well on phone (tenants will primarily use mobile)
- **File storage**: Supabase Storage for photos and documents (not in database)

