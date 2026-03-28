import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [partnerName, setPartnerName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [partnerPhone, setPartnerPhone] = useState("");

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [timestamps, setTimestamps] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      let { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurants(name, rating, description, address),
          order_items(quantity, menu_items(name))
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        const fallback = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error("Error fetching order:", error);
        return;
      }

      if (data) {

        if (data.delivery_partner_id) {
          const { data: partner } = await supabase
            .from("delivery_partners")
            .select("name, phone")
            .eq("id", data.delivery_partner_id)
            .single();

          if (partner) {
            setPartnerName(partner.name);
            setPartnerPhone(partner.phone);
          }
        }

        setOrder(data);
        setStatus(data.status || "Pending");
        setPartnerName(data.delivery_partner_name || "");
        setPartnerPhone(data.delivery_partner_phone || "");
        setTimestamps({
          pending: data.pending_at,
          preparing: data.preparing_at,
          ready: data.ready_at,
          outForDelivery: data.out_for_delivery_at,
          delivered: data.delivered_at,
        });
      }
    };

    fetchOrder();

    const channel = supabase
      .channel("order-tracking")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`
        },
        async (payload) => {
          const updated = payload.new;

          setStatus(updated.status || "");

          if (updated.delivery_partner_id) {
            const { data: partner } = await supabase
              .from("delivery_partners")
              .select("name, phone")
              .eq("id", updated.delivery_partner_id)
              .single();

            if (partner) {
              setPartnerName(partner.name);
              setPartnerPhone(partner.phone);
            }
          }

          setTimestamps({
            pending: updated.pending_at,
            preparing: updated.preparing_at,
            ready: updated.ready_at,
            outForDelivery: updated.out_for_delivery_at,
            delivered: updated.delivered_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (!order) {
    return (
      <div style={styles.container}>
        <h2 style={{ ...styles.heading, textAlign: "center" }}>Tracking Orders</h2>
        <p>Loading order...</p>
      </div>
    );
  }

  const formatDateTime = (time) =>
    time ? new Date(time).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : null;

  const prepTime = order.prep_time ? order.prep_time : null;

  return (
    <div style={styles.container}>
      <h2 style={{ ...styles.heading, textAlign: "center" }}>
        Tracking Order #{id.slice(0, 8)}
      </h2>

      <div style={styles.card}>
        <div style={styles.restaurantHeader}>
          <h3 style={styles.restaurantName}>
            {order.restaurants?.name || "Restaurant"}
          </h3>
          {order.restaurants?.rating != null && (
            <span style={styles.restaurantRating}>
              ⭐ {order.restaurants.rating.toFixed(1)}
            </span>
          )}
        </div>

        {order.restaurants?.address && (
          <p style={styles.restaurantPlace}>📍 {order.restaurants.address}</p>
        )}

        {order.restaurants?.description && (
          <p style={styles.restaurantDescription}>{order.restaurants.description}</p>
        )}

        <div style={styles.itemsList}>
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item, index) => (
              <p key={index} style={styles.item}>
                {item.menu_items?.name} × {item.quantity}
              </p>
            ))
          ) : (
            <p style={styles.item}>No items found</p>
          )}
        </div>

        <p style={styles.address}>
          📍 {order.delivery_house}, {order.delivery_street}, {order.delivery_city} - {order.delivery_state}, {order.delivery_pincode}
        </p>

        <div style={styles.summary}>
          <p><strong>Status:</strong> 🍽 {status}</p>

          {status === "preparing" && prepTime && (
            <p><strong>Preparation Time:</strong> {prepTime} minutes</p>
          )}

          <strong>Delivery Status:</strong>{" "}
          {status === "pending"
            ? "Waiting for restaurant"
            : status === "preparing"
            ? "Waiting for pickup"
            : status === "ready"
            ? "Waiting for delivery partner"
            : status === "out_for_delivery"
            ? "On the way"
            : status === "delivered"
            ? "Delivered"
            : "Pending"}

          {status === "out_for_delivery" && partnerName && partnerPhone && (
            <div style={styles.partnerBox}>
              <p style={styles.partnerRow}>
                👤 <strong>Name:</strong> {partnerName}
              </p>
              <p style={styles.partnerRow}>
                📞 <strong>Phone:</strong> {partnerPhone}
              </p>
            </div>
          )}

          <p><strong>Total:</strong> ₹{order.total || order.total_amount}</p>

          <p>
            <strong>Payment Status:</strong>{" "}
            {order.payment_method === "COD"
              ? status === "delivered"
                ? "💵 Cash on Delivery (Paid)"
                : "💵 Cash on Delivery (Pending)"
              : "💵 Paid"}
          </p>

          <p><strong>Date & Time (IST):</strong> {formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <button
          style={styles.backButton}
          onClick={() => navigate("/orders")}
        >
          ← Back to Orders
        </button>
      </div>
    </div>
  );
}

export default OrderTracking;

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  heading: { marginBottom: "25px", color: "#111", fontSize: "26px", fontWeight: "700" },
  backButton: {
    background: "#ff4d4d",
    color: "white",
    padding: "12px 22px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
    maxWidth: "650px",
    margin: "auto"
  },
  restaurantHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  restaurantName: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#111",
    margin: 0
  },
  restaurantRating: {
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#16a34a",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  restaurantPlace: { fontSize: "14px", color: "#555", marginBottom: "6px" },
  restaurantDescription: { fontSize: "15px", color: "#555", marginBottom: "12px" },
  itemsList: { marginBottom: "18px" },
  item: { marginBottom: "8px", fontSize: "16px", color: "#333" },
  address: { fontSize: "15px", color: "#555", marginBottom: "15px" },
  summary: {
    marginTop: "20px",
    padding: "15px",
    background: "#f9f9f9",
    borderRadius: "10px",
    lineHeight: "1.6"
  },

  partnerBox: {
    background: "#eef6ff",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
    marginBottom: "10px"
  },

  partnerRow: {
    margin: "5px 0",
    fontSize: "15px"
  }
};

