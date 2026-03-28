import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { getOrdersByUser } from "../services/orderService";
import "../styles/orders.css";

function Orders() {

const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const navigate = useNavigate();

useEffect(() => {

let isMounted = true;

const fetchOrders = async () => {

  try {

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      if (isMounted) setOrders([]);
      return;
    }

    const data = await getOrdersByUser(user.id);

    const sortedData = (data || []).sort((a, b) => {
      const timeA = new Date(
        a.created_at || a.order_time || a.createdAt || 0
      ).getTime();

      const timeB = new Date(
        b.created_at || b.order_time || b.createdAt || 0
      ).getTime();

      return timeB - timeA;
    });

    const formattedOrders = (sortedData || []).map(order => ({
      ...order,

      restaurantName:
        order.restaurantName ||
        order.restaurants?.name ||
        "Restaurant",

      restaurantAddress:
        order.restaurantAddress ||
        order.restaurants?.address ||
        order.restaurant_address ||
        "Address not available",

      restaurantRating:
        order.restaurantRating ||
        order.restaurants?.rating ||
        order.restaurant_rating ||
        "4.2",

      items:
        order.items ||
        order.order_items?.map(i => ({
          name: i.menu_items?.name || i.item_name,
          quantity: i.quantity
        })) ||
        [],

      address:
        order.address || {
          house: order.delivery_house,
          street: order.delivery_street,
          city: order.delivery_city,
          state: order.delivery_state,
          pincode: order.delivery_pincode
        },

      orderTime:
        order.created_at ||
        order.order_time ||
        order.createdAt
    }));

    if (isMounted) setOrders(formattedOrders);

  } catch (err) {
    console.error("Failed to load orders:", err);
    if (isMounted) setError(err?.message || "Failed to load orders");
  } finally {
    if (isMounted) setLoading(false);
  }
};

fetchOrders();

return () => {
  isMounted = false;
};

}, []);

const formatDateIST = (dateStr) => {
if (!dateStr) return "Time not available";

try {
  return new Date(dateStr).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
} catch {
  return dateStr;
}
};

const formatAddress = (addr) => {
if (!addr) return null;
return `${addr.house}, ${addr.street} - ${addr.city}, ${addr.state} - ${addr.pincode}`;
};

const getStatusText = (status) => {
  if (!status) return "Pending";
  const s = status.toLowerCase();

  if (s === "pending") return "🕒 Pending";
  if (s === "ready") return "🍽️ Ready";
  if (s === "delivered") return "✅ Delivered";

  return status;
};

const getStatusClass = (status) => {
  if (!status) return "pending";
  const s = status.toLowerCase();

  if (s === "pending") return "pending";
  if (s === "ready") return "ready";
  if (s === "delivered") return "delivered";

  return "pending";
};

const getPaymentClass = (payment) => {
  if (payment === "Paid") return "online";
  return "cod";
};

if (loading) {
return (
<div style={{ padding: "30px" }}>
<h2 className="page-title">Your Orders</h2>
<p>Loading orders...</p>
</div>
);
}

if (error) {
return (
<div style={{ padding: "30px" }}>
<h2 className="page-title">Your Orders</h2>
<p style={{ color: "#c00" }}>{error}</p>
</div>
);
}

return (
<div className="orders-container">

<h2 className="page-title">Your Orders</h2>

{orders.length === 0 ? (
<p>No orders yet. Place an order from a restaurant to see it here.</p>
) : (

<div className="orders-grid">

{orders.map((order) => (

<div key={order.id} className="order-card">

{/* HEADER */}
<div className="order-header">
<strong>Order #{order.id.slice(0, 8)}</strong>
<span className="order-price">₹{order.total}</span>
</div>

{/* NAME + RATING */}
<div className="restaurant-row">
<p className="restaurant-name" title={order.restaurantName}>
  {order.restaurantName}
</p>
<span className="restaurant-rating">
⭐ {order.restaurantRating}
</span>
</div>

{/* ADDRESS */}
<p className="restaurant-address">
📍 {order.restaurantAddress}
</p>

{/* ITEMS */}
<div className="items-box">
{(order.items || []).map((item, index) => (
<div key={index}>
{item.name} × {item.quantity}
</div>
))}
</div>

{/* DELIVERY */}
{order.address && (
<p className="order-address">
🚚 {formatAddress(order.address)}
</p>
)}

{/* ✅ PAYMENT IMPROVED */}
<p className={`payment-badge ${getPaymentClass(order.payment_status)}`}>
{order.payment_status === "Paid" ? "💳 Paid Online" : "💵 Cash on Delivery"}
</p>

{/* STATUS */}
<p className={`status-badge ${getStatusClass(order.status)}`}>
{getStatusText(order.status)}
</p>

{/* TIME */}
<p className="order-status">
{formatDateIST(order.orderTime)}
</p>

<button
className="track-btn"
onClick={() => navigate(`/tracking/${order.id}`)}
>
Track Order
</button>

</div>

))}

</div>

)}

</div>
);
}

export default Orders;