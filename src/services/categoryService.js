import { supabase } from "../supabaseClient";

let categoryCache = null;

export const getCategories = async () => {

  if (categoryCache) {
    return categoryCache;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*");

  if (error) throw error;

  categoryCache = data;

  return data;
};