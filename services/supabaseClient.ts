
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wvlqtilgdqjazecenyft.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bHF0aWxnZHFqYXplY2VueWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTMzMzUsImV4cCI6MjA4MTk4OTMzNX0.dJoh-u18kvSgPp9TnKuZdA2-bsRqkPLgAKfxnxJS1dI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
