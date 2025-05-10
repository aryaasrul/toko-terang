// supabase.js FINAL
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const SUPABASE_URL = 'https://jbvfjehpgvadponxkvsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidmZqZWhwZ3ZhZHBvbnhrdnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODg3NzUsImV4cCI6MjA2MjM2NDc3NX0.YLXNLhpodvmhRa5RfPlHQhiVPvoqmnOZb7b-HFcFo8k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);