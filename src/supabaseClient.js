import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fdzyzudqwzthjugbegcq.supabase.co";
const supabaseKey = "sb_publishable_MLjS8VUU7zGqaD1E_Hskag_zDdITXvG";

export const supabase = createClient(supabaseUrl, supabaseKey);