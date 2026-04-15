
DROP POLICY "Anyone can view media" ON storage.objects;
CREATE POLICY "Anyone can view media by path" ON storage.objects
  FOR SELECT USING (bucket_id = 'media' AND auth.role() = 'authenticated');
