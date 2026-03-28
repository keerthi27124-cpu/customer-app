import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ✅ ADDED
import "../styles/cart.css";

function Cart() {

  const [cartItems, setCartItems] = useState([]);
  const [offer, setOffer] = useState(null);
  const [address, setAddress] = useState(null); // ✅ ADDED
  const navigate = useNavigate();

  // ✅ NORMALIZE FUNCTION (reusable)
  const normalizeCart = (cart) => {
    return cart.map(item => ({
      ...item,
      restaurant_name: item.restaurant_name || "Restaurant",
      restaurant_location: item.restaurant_location || "Location not available",
      description: item.description || "No description available"
    }));
  };

  useEffect(() => {

    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(normalizeCart(cart));
    };

    loadCart();

    window.addEventListener("storage", loadCart);

    const storedOffer = JSON.parse(localStorage.getItem("restaurant_offer"));
    if (storedOffer) setOffer(storedOffer);

    fetchAddress(); // ✅ ADDED

    return () => {
      window.removeEventListener("storage", loadCart);
    };

  }, []);

  // ✅ FETCH ADDRESS
  const fetchAddress = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setAddress(data);
    }
  };

  const updateCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(normalizeCart(cart));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updated);
  };

  const decreaseQty = (id) => {
    let updated = cartItems
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let discount = 0;

  if (offer && subtotal >= 500) {
    discount = 100;
  }

  const total = subtotal - discount;

  return (
    <div className="cart-container">

      <h2 className="page-title">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center" }}>No items yet</p>
      ) : (

        <>
        <div className="cart-grid">

          {cartItems.map((item) => (

            <div key={item.id} className="cart-card">

              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="cart-img"
                />
              )}

              <div className="cart-restaurant-info">
                <h4>{item.restaurant_name}</h4>
                <p>{item.restaurant_location}</p>
              </div>

              <h3 className="item-title">{item.name}</h3>

              <p className="item-desc">
                {item.description}
              </p>

              <p className="price">₹{item.price}</p>

              <div className="qty-controls">
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQty(item.id)}>+</button>
              </div>

              <p className="item-subtotal">
                Subtotal: ₹{item.price * item.quantity}
              </p>

              <button
                className="remove-btn"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>

            </div>

          ))}

        </div>

        {/* ✅ ADDRESS SECTION */}
        {address && (
          <div className="cart-address-box">
            <h3>Delivery Address</h3>
            <p>{address.name} ({address.phone})</p>
            <p>{address.house}, {address.street}</p>
            <p>{address.city}, {address.state} - {address.pincode}</p>
          </div>
        )}

        <div className="cart-total">

          <h3>Subtotal: ₹{subtotal}</h3>

          {discount > 0 && (
            <h4 style={{ color: "green" }}>
              Offer Discount: -₹{discount}
            </h4>
          )}

          <h2>Total: ₹{total}</h2>

          {/* ✅ 3 BUTTONS */}
          <div className="cart-buttons">

            <button
              className="back-menu-btn"
              onClick={() =>
                navigate(`/restaurant/${cartItems[0].restaurant_id}`)
              }
            >
              ← Back to Menu
            </button>

            <button
              className="address-btn"
              onClick={() => navigate("/address")}
            >
              Change Address
            </button>

            <button
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Save & Checkout
            </button>

          </div>

        </div>

        </>
      )}

    </div>
  );
}

export default Cart;