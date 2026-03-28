import { get, post, put } from './apiService';

// Place Order
export const placeOrder = async (
  userId,
  cart,
  totalAmount,
  addressOrId = null,
  paymentMethod = "COD"
) => {
  try {
    const data = await post('/orders', {
      userId,
      cart,
      totalAmount,
      addressOrId,
      paymentMethod
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Get Orders by User
export const getOrdersByUser = async (userId) => {
  try {
    const data = await get('/orders', { userId });
    return data;
  } catch (error) {
    throw error;
  }
};

// Get User Address
export const getUserAddress = async (userId) => {
  try {
    const data = await get('/address', { userId });
    return data;
  } catch (error) {
    throw error;
  }
};

// Save User Address
export const saveUserAddress = async (addressData) => {
  try {
    const data = await post('/address', addressData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Update User Address
export const updateUserAddress = async (userId, addressData) => {
  try {
    const data = await put(`/address/${userId}`, addressData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Update Order Status (Tracking)
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const data = await put(`/orders/${orderId}/status`, { newStatus });
    return data;
  } catch (error) {
    throw error;
  }
};
