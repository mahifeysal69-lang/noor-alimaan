import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khghiyvahojawixjmlsv.supabase.co';
const supabaseKey = 'sb_publishable_hSjI1bQ7blJ1ZR5Iwq8cnA_HgV1uiUZ';

export const supabase = createClient(supabaseUrl, supabaseKey);
