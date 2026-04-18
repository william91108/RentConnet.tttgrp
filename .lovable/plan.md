

# 🏠 RentConnect — Property Communication Portal

A professional property management communication platform for landlords managing multiple shared houses with room-by-room tenants.

---

## 1. Authentication & User Management
- Email + password login for all users (landlord, property manager, tenants)
- Password reset via email
- Two roles: **Admin** (you + property manager) and **Tenant**
- Profile fields collected at signup: full name, email, phone, gender, date of birth
- Tenants are invited or registered, then assigned by admin to a specific house and room

---

## 2. Property Structure Setup (Admin) — `/properties`
- Add/manage houses (e.g. House A, House B) with address, description
- Add rooms within each house (name, area, window type, rent amount, rent due day)
- Assign tenants to rooms (assignment date auto-recorded)
- Manage shared areas and "what's included in rent" per house

---

## 3. Admin Dashboard — `/dashboard` (`AdminDashboard`)
- Overview of houses, rooms, tenants
- Active issues summary with priority indicators
- Upcoming rent due dates
- Recent activity feed
- Quick actions: send notice, view issues

---

## 4. Tenant Management (Admin) — `/tenants` (`AdminTenants`)
- **Add Tenant** button — two flows:
  1. Link an **existing signed-up account** (by email) to tenant directory
  2. Create a tenant profile manually (name, email, phone, gender, DOB)
- Tenant directory with contact info, assigned house/room
- **Stay duration**: calculated from `room.assigned_at` (years + months). Stops counting once tenant is unassigned (uses `room_assignments` history table)
- **Per-tenant notes log** (admin-only): incidents like spare key requests, blocked sink/toilet, noise after 11pm, with category + timestamp

---

## 5. Notices & Announcements — `/notices` (`Notices`)
- Admin sends notices to all tenants in a house or to individual tenants
- Notice types: Rent reminder, Maintenance, Inspection, Policy change, Utility shutdown, General
- **Acknowledgement button** — tenants confirm "I have read and understood" with timestamp
- **Auto email to targeted tenants** when a notice is published — email contains the notice content + a link to open the notice in the app

---

## 6. Rent Reminders (Automated)
- Set rent amount and due date per room
- Automatic email reminders: 5 days before, due day, and overdue
- Polite, professional tone for overdue notices
- Tenants see rent info and next due date on their dashboard

---

## 7. Issue Reporting (Tenant) — `/report-issue` (`ReportIssue`)
**Step 1: Location** — My room, Kitchen, Bathroom, Laundry, Living area, Outdoor, Internet (house-wide)
**Step 2: Category** — Water, Power, Internet, Gas, Appliance, Property damage, Lock/key, Lockout, Blockage, Pest, Noise, Safety, Other
**Step 3: Priority** — 🚨 Emergency (with definition popup), Urgent, Normal
**Step 4: Details** — Description, photo upload, time noticed
- Auto confirmation to tenant on submission

---

## 8. Issue Tracking — `/issues` (admin) / `/my-issues` (tenant)
- Status pipeline: Submitted → Acknowledged → In Progress → Waiting for Contractor → Resolved
- Admin updates status with optional resolution notes
- **Two-way message thread** between tenant and admin per issue (`issue_messages`)
- **Auto email to tenant** when admin replies or status changes — email contains the reply/update + a link to open the issue thread
- Full audit trail visible to both sides (`issue_history`)

---

## 9. Emergency & Self-Help — `/emergency` (`EmergencyInfo`)
- Self-help guidance shown before submitting emergency tickets:
  - Internet: restart router
  - Power: check safety switch
  - Water leak: turn off main valve
  - Lockout: emergency contact info

---

## 10. House Rules — `/house-rules` (`HouseRules`)
- Admin sets house rules per house (quiet hours, guests, cleaning, internet, etc.)
- Tenants tick "I have read and understood" with timestamp recorded (`house_rules_acknowledgements`)
- Rules viewable anytime from tenant sidebar

---

## 11. Document Centre — `/documents` (`Documents`) / `/info-centre` (tenant view `InformationCenter`)
- Upload and store key documents per house: lease, rules, emergency contacts, appliance manuals, bin schedule, entry condition
- Tenants view/download documents for their assigned house

---

## 12. Useful Contacts — `/contacts` (`UsefulContacts`)
- Categorised directory: Air Con, Plumber, Electrician, Handyman, House Owner, Cleaner, Other
- Per house, with phone + email click-to-action
- Admin can add/remove; tenants view only

---

## 13. Tenant Dashboard — `/dashboard` (`TenantDashboard`)
- My rent info and next due date
- My active issues + status
- Recent notices with acknowledgement status
- House rules & documents quick links
- Big "Report Issue" and "Emergency" buttons

---

## 14. Admin Preview Mode
- Admin sidebar toggle to preview the app as a tenant without logging out (banner indicates preview state)

---

## 15. Email Notifications (Automated)
- New notice published → email to targeted tenants (content + deep link)
- Issue status update or admin reply → email to reporter (message + deep link)
- Rent reminders (5 days before, due day, overdue)
- Emergency ticket submitted → email to admin
- Sender: Lovable default sender (no custom domain required)

---

## Tech & Design
- **Backend**: Lovable Cloud (Supabase) — DB, Auth, Storage, Edge Functions (`notify-issue-update`)
- **Design**: Corporate, neutral palette, Inter + Source Sans 3 typography, mobile-first
- **File storage**: Supabase Storage for photos and documents
- **Security**: RLS everywhere; `user_roles` table with `has_role()` function; tenants only see their own data
