-- App settings table for branding (logo, app name)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.app_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed defaults
INSERT INTO public.app_settings (key, value) VALUES
  ('app_name', 'Feet & Freakk'),
  ('logo_url', '')
ON CONFLICT (key) DO NOTHING;

-- Public storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view branding"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

CREATE POLICY "Admins can upload branding"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'branding' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update branding"
ON storage.objects FOR UPDATE
USING (bucket_id = 'branding' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete branding"
ON storage.objects FOR DELETE
USING (bucket_id = 'branding' AND has_role(auth.uid(), 'admin'::app_role));