
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'tenant');

-- Issue status enum
CREATE TYPE public.issue_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'waiting_for_contractor', 'resolved');

-- Issue priority enum
CREATE TYPE public.issue_priority AS ENUM ('emergency', 'urgent', 'normal');

-- Notice type enum
CREATE TYPE public.notice_type AS ENUM ('rent_reminder', 'maintenance', 'inspection', 'policy_change', 'utility_shutdown', 'general');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Houses table
CREATE TABLE public.houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  rent_includes TEXT DEFAULT '',
  house_rules TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  rent_amount NUMERIC(10,2) DEFAULT 0,
  rent_due_day INTEGER DEFAULT 1 CHECK (rent_due_day >= 1 AND rent_due_day <= 28),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  priority issue_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status issue_status NOT NULL DEFAULT 'submitted',
  resolution_notes TEXT DEFAULT '',
  photo_urls TEXT[] DEFAULT '{}',
  time_noticed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issue history (audit trail)
CREATE TABLE public.issue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_status issue_status,
  new_status issue_status NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  notice_type notice_type NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  target_all_house BOOLEAN NOT NULL DEFAULT true,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notice acknowledgements
CREATE TABLE public.notice_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);

-- House rules acknowledgements
CREATE TABLE public.house_rules_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(house_id, user_id)
);

-- Documents table (metadata only, files in storage)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emergency contacts per house
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  is_after_hours BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- has_role function (security definer, no RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's house_id helper
CREATE OR REPLACE FUNCTION public.get_user_house_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT house_id FROM public.rooms WHERE tenant_id = _user_id LIMIT 1
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON public.houses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== RLS POLICIES ==============

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Houses
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage houses" ON public.houses FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view their house" ON public.houses FOR SELECT USING (
  id = public.get_user_house_id(auth.uid())
);

-- Rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view rooms in their house" ON public.rooms FOR SELECT USING (
  house_id = public.get_user_house_id(auth.uid())
);

-- Issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all issues" ON public.issues FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view own issues" ON public.issues FOR SELECT USING (reported_by = auth.uid());
CREATE POLICY "Tenants can create issues" ON public.issues FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Issue history
ALTER TABLE public.issue_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage issue history" ON public.issue_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view own issue history" ON public.issue_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.issues WHERE issues.id = issue_history.issue_id AND issues.reported_by = auth.uid())
);

-- Notices
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage notices" ON public.notices FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view notices for their house" ON public.notices FOR SELECT USING (
  house_id = public.get_user_house_id(auth.uid()) AND (target_all_house = true OR target_user_id = auth.uid())
);

-- Notice acknowledgements
ALTER TABLE public.notice_acknowledgements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own acknowledgements" ON public.notice_acknowledgements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all acknowledgements" ON public.notice_acknowledgements FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- House rules acknowledgements
ALTER TABLE public.house_rules_acknowledgements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own house rules ack" ON public.house_rules_acknowledgements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all house rules ack" ON public.house_rules_acknowledgements FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view documents for their house" ON public.documents FOR SELECT USING (
  house_id = public.get_user_house_id(auth.uid())
);

-- Emergency contacts
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage contacts" ON public.emergency_contacts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenants can view contacts for their house" ON public.emergency_contacts FOR SELECT USING (
  house_id = public.get_user_house_id(auth.uid())
);

-- Storage bucket for issue photos and documents
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('house-documents', 'house-documents', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload issue photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-photos');
CREATE POLICY "Anyone can view issue photos" ON storage.objects FOR SELECT USING (bucket_id = 'issue-photos');
CREATE POLICY "Admins can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'house-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can view documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'house-documents');
CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'house-documents' AND public.has_role(auth.uid(), 'admin'));
