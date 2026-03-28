import { supabase } from "../supabaseClient";

/* =====================================
   PLACE ORDER (✅ FIXED)
===================================== */
export const placeOrder = async (
  userId,
  cart,
  totalAmount,
  addressOrId = null,
  paymentMethod = "COD"
) => {

  if (!userId) throw new Error("User ID is required to place an order.");
  if (!cart || cart.length === 0) throw new Error("Cart is empty.");

  /* ✅ GROUP ITEMS BY RESTAURANT */
  const grouped = {};

  cart.forEach((item) => {
    const rId = item.restaurant_id || item.restaurantId;

    if (!grouped[rId]) {
      grouped[rId] = [];
    }

    grouped[rId].push(item);
  });

  const createdOrders = [];

  /* ✅ CREATE SEPARATE ORDER FOR EACH RESTAURANT */
  for (const restaurantId in grouped) {

    const items = grouped[restaurantId];

    const orderTotal = items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
      0
    );

    const orderRow = {
      user_id: userId,
      restaurant_id: restaurantId,
      total: orderTotal,
      status: "Pending",
      payment_method: paymentMethod,
      payment_status: paymentMethod === "UPI" ? "Paid" : "Pending",
      delivery_partner_id: null,
      delivery_partner_name: null,
      delivery_partner_phone: null,
      created_at: new Date().toISOString()
    };

    /* ADDRESS */
    if (addressOrId && typeof addressOrId === "object") {
      orderRow.delivery_name = addressOrId.name || null;
      orderRow.delivery_phone = addressOrId.phone || null;
      orderRow.delivery_house = addressOrId.house || null;
      orderRow.delivery_street = addressOrId.street || null;
      orderRow.delivery_city = addressOrId.city || null;
      orderRow.delivery_state = addressOrId.state || null;
      orderRow.delivery_pincode = addressOrId.pincode || null;
    }

    console.log("Attempting to insert order:", orderRow);

    /* INSERT ORDER */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([orderRow])
      .select()
      .single();

    if (orderError) {
      console.error("Supabase Order Insert Error:", orderError);
      throw new Error(orderError.message);
    }

    if (!order) throw new Error("Order inserted but no data returned.");

    console.log("Order inserted successfully:", order);

    /* INSERT ORDER ITEMS */
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id ?? item.id,
      item_name: item.name,
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
      restaurant_id: restaurantId
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemError) {
      console.error("Order items error:", itemError);
      throw itemError;
    }

    createdOrders.push(order);
  }

  return createdOrders;
};


/* =====================================
   GET ORDERS BY USER
===================================== */
export const getOrdersByUser = async () => {

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch orders error:", error);
    throw error;
  }

  if (!data || data.length === 0) return [];

  const orders = await Promise.all(
    data.map(async (order) => {

      const { data: items, error: itemError } = await supabase
        .from("order_items")
        .select(`
          item_name,
          quantity,
          menu_items(name)
        `)
        .eq("order_id", order.id);

      if (itemError) console.error("Items fetch error:", itemError);

      const { data: restaurant } = await supabase
  .from("restaurants")
  .select("name, address, rating")   // ✅ FIX
  .eq("id", order.restaurant_id)
  .maybeSingle();

      const address = order.delivery_house
        ? {
            name: order.delivery_name,
            phone: order.delivery_phone,
            house: order.delivery_house,
            street: order.delivery_street,
            city: order.delivery_city,
            state: order.delivery_state,
            pincode: order.delivery_pincode,
          }
        : null;

      return {
        ...order,
        created_at: order.created_at,
       restaurantName: restaurant?.name || "Unknown Restaurant",
restaurantAddress: restaurant?.address || "Address not available",   // ✅ ADD
restaurantRating: restaurant?.rating || "4.2",                        // ✅ ADD
        address,
        items: (items || []).map((item) => ({
          name: item.item_name || item.menu_items?.name || "Item",
          quantity: item.quantity
        }))
      };
    })
  );

  return orders;
};


/* =====================================
   ADDRESS FUNCTIONS
===================================== */
export const getUserAddress = async (userId) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const saveUserAddress = async (addressData) => {
  const { data, error } = await supabase
    .from("addresses")
    .insert(addressData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateUserAddress = async (userId, addressData) => {
  const { data, error } = await supabase
    .from("addresses")
    .update(addressData)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};


/* =====================================
   UPDATE ORDER STATUS (TRACKING)
===================================== */
export const updateOrderStatus = async (orderId, newStatus) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("order_id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
};