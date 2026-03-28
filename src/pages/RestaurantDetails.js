import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/home.css";
import "../styles/restaurant-details.css";
import "../styles/menu.css";
import CartBar from "../components/CartBar";

function RestaurantDetails() {
  const { id: restaurantId } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [offers, setOffers] = useState([]);

  const [quantities, setQuantities] = useState({});
  const [addedToCart, setAddedToCart] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH =================
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [
      { data: restaurantData },
      { data: menuData, error: menuErr },
      { data: offersData }
    ] = await Promise.all([
      supabase.from("restaurants").select("*").eq("id", restaurantId).single(),
      supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId),
      supabase.from("offers").select("*").eq("restaurant_id", restaurantId)
    ]);

    if (restaurantData) setRestaurant(restaurantData);
    if (offersData) setOffers(offersData);

    if (menuErr) {
      setError(menuErr.message || "Failed to load menu.");
      setMenuItems([]);
    } else {
      setMenuItems(menuData || []);
    }

    setLoading(false);
  }, [restaurantId]);

  // ================= LOAD CART =================
  useEffect(() => {
    fetchMenu();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const qty = {};
    const added = {};

    cart.forEach((item) => {
      qty[item.id] = item.quantity;
      added[item.id] = true;
    });

    setQuantities(qty);
    setAddedToCart(added);

  }, [fetchMenu]);

  // ================= ADD =================
  const addToCart = (item) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const quantity = quantities[item.id] || 1;
    const existing = cart.find((c) => c.id === item.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        ...item,
        quantity: 1,

        restaurant_id: restaurantId,

        restaurant_name:
          item.restaurant_name ||
          restaurant?.name ||
          "Restaurant",

        restaurant_location:
          item.restaurant_location ||
          restaurant?.address ||
          "Location not available",

        restaurant_rating:
          item.restaurant_rating ||
          restaurant?.rating ||
          "4.0",

        description: item.description,
        image_url: item.image_url
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    setAddedToCart((prev) => ({
      ...prev,
      [item.id]: true
    }));

    setQuantities((prev) => ({
      ...prev,
      [item.id]: 1
    }));
  };

  // ================= INCREASE =================
  const increaseQty = (id) => {
    const newQty = (quantities[id] || 1) + 1;

    setQuantities({ ...quantities, [id]: newQty });

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQty } : item
    );

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  };

  // ================= DECREASE =================
  const decreaseQty = (id) => {
    const current = quantities[id] || 1;

    if (current > 1) {
      const newQty = current - 1;

      setQuantities({ ...quantities, [id]: newQty });

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart = cart.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      );

      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart = cart.filter((item) => item.id !== id);

      localStorage.setItem("cart", JSON.stringify(cart));

      setAddedToCart((prev) => ({ ...prev, [id]: false }));

      // ✅ FIXED LINE HERE
      setQuantities((prev) => ({ ...prev, [id]: 1 }));
    }

    window.dispatchEvent(new Event("storage"));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="restaurant-details-page">

      {restaurant && (
        <div
          className="restaurant-hero"
          style={{
            backgroundImage: `url(${
              restaurant.background_image ||
              restaurant.image_url ||
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <h1 style={{ color: "#fff" }}>{restaurant.name}</h1>

          {restaurant.description && (
            <p style={{ color: "#fff" }}>{restaurant.description}</p>
          )}

          {offers.length > 0 && (
            <div className="offers-row">
              {offers.map((offer) => (
                <span key={offer.id} className="offer-chip">
                  🎉 {offer.title || offer.description}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="menu-container">
        <h2 className="menu-title">Menu</h2>

        <div className="menu-grid">
          {menuItems.map((item) => {
            const qty = quantities[item.id] || 1;

            return (
              <div key={item.id} className="menu-card">

                <img
                  src={item.image_url}
                  alt={item.name}
                  className="menu-img"
                />

                <h4>{item.name}</h4>

                {item.description && (
                  <p style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0"
                  }}>
                    {item.description}
                  </p>
                )}

                <p className="price">₹{item.price}</p>

                {!addedToCart[item.id] ? (
                  <button
                    className="add-btn"
                    onClick={() => addToCart(item)}
                  >
                    ADD
                  </button>
                ) : (
                  <div className="qty-controls">
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CartBar color="green" />
    </div>
  );
}

export default RestaurantDetails;