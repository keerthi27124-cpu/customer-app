import { get } from './apiService';

let categoryCache = null;

export const getCategories = async () => {
  if (categoryCache) {
    return categoryCache;
  }

  try {
    const data = await get('/categories');
    categoryCache = data;
    return data;
  } catch (error) {
    throw error;
  }
};
