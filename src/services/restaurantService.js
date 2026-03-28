import { supabase } from "../supabaseClient";

let restaurantCache = null;

export const getRestaurants = async () => {

  if (restaurantCache) {
    return restaurantCache;
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("*");

  if (error) throw error;

  restaurantCache = data;

  return data;
};

export const getRestaurantById = async (id) => {

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export const getMenuByRestaurant = async (restaurantId) => {

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId);

  if (error) throw error;

  return data;
};