import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://stbbhjjlsavhpbwmutyi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmJoampsc2F2aHBid211dHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE5NjEsImV4cCI6MjA3ODQ0Nzk2MX0.hu_ghhfJfKQQeT75pPM1VYWaMX1L9VEz-5UOiv7RsyA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
