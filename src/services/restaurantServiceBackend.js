import { get } from './apiService';

let restaurantCache = null;

export const getRestaurants = async () => {
  if (restaurantCache) {
    return restaurantCache;
  }

  try {
    const data = await get('/restaurants');
    restaurantCache = data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getRestaurantById = async (id) => {
  try {
    const data = await get(`/restaurants/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getMenuByRestaurant = async (restaurantId) => {
  try {
    const data = await get(`/restaurants/${restaurantId}/menu`);
    return data;
  } catch (error) {
    throw error;
  }
};
