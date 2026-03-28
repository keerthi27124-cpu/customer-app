import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import CartBar from "./CartBar";

function MenuItem() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  const loadMenu = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("menu_items")
      .select("*, restaurants(name, address, rating)");

    if (!error) setMenu(data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const addItem = (item) => {
    let updated = [...cart];
    const existing = updated.find(i => i.id === item.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({
        ...item,
        quantity: 1,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurants?.name,
        restaurant_location: item.restaurants?.address,
        restaurant_rating: item.restaurants?.rating,
        description: item.description,
        image_url: item.image_url
      });
    }

    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("storage"));
  };

  const increaseQty = (item) => {
    let updated = cart.map(i =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    );

    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("storage"));
  };

  const decreaseQty = (item) => {
    let updated = [...cart];
    const existing = updated.find(i => i.id === item.id);

    if (existing.quantity > 1) {
      updated = updated.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      updated = updated.filter(i => i.id !== item.id);
    }

    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("storage"));
  };

  const getQty = (id) => {
    return cart.find(i => i.id === id)?.quantity || 0;
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: cart.length > 0 ? "90px" : "20px" // ✅ FIXED SPACE (clean & dynamic)
      }}
    >

      {/* TITLE */}
      <h2 style={{
        textAlign: "center",
        marginBottom: "25px",
        fontSize: "26px",
        fontWeight: "700"
      }}>
        🍽️ Menu
      </h2>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "20px"
      }}>

        {menu.map((item) => {
          const qty = getQty(item.id);

          return (
            <div
              key={item.id}
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "14px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // ✅ EVEN SPACING
                minHeight: "360px"
              }}
            >

              <div>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px"
                    }}
                  />
                )}

                <h3 style={{ margin: "8px 0 4px", fontSize: "18px" }}>
                  🍔 {item.name}
                </h3>

                <p style={{ fontSize: "13px", color: "#666" }}>
                  🏪 {item.restaurants?.name}
                </p>

                {item.description && (
                  <p style={{ fontSize: "13px", color: "#555" }}>
                    📝 {item.description}
                  </p>
                )}

                <p style={{ fontSize: "12px", color: "#888" }}>
                  📍 {item.restaurants?.address}
                </p>

                <p style={{ fontSize: "12px", color: "#888" }}>
                  ⭐ {item.restaurants?.rating || "4.2"}
                </p>

                <p style={{
                  fontWeight: "bold",
                  color: "#ff4d4d",
                  fontSize: "16px",
                  marginTop: "6px"
                }}>
                  ₹{item.price}
                </p>
              </div>

              {/* BUTTON */}
              {qty === 0 ? (
                <button
                  onClick={() => addItem(item)}
                  style={addBtnStyle}
                >
                  ADD
                </button>
              ) : (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "10px"
                }}>
                  <button style={btnStyle} onClick={() => decreaseQty(item)}>
                    −
                  </button>

                  <span style={{ fontWeight: "600", fontSize: "16px" }}>
                    {qty}
                  </span>

                  <button style={btnStyle} onClick={() => increaseQty(item)}>
                    +
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <CartBar color="green" />
    </div>
  );
}

/* BUTTONS */
const btnStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  border: "none",
  background: "#ff4d4d",
  color: "#fff",
  fontSize: "18px",
  cursor: "pointer"
};

const addBtnStyle = {
  background: "#ff4d4d",
  color: "#fff",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "10px"
};

export default MenuItem;