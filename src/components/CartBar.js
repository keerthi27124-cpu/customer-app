import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CartBar.css"; // ✅ ADDED

function CartBar({ color = "red" }) {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, i) => sum + i.quantity, 0);
      setCount(total);
    };

    updateCart();

    window.addEventListener("storage", updateCart);

    return () => window.removeEventListener("storage", updateCart);
  }, []);

  if (count === 0) return null;

  return (
    <div className={`cart-bar ${color}`}> {/* ✅ CHANGED */}
      <span>{count} item(s)</span>

      <button onClick={() => navigate("/cart")}>
        View Cart
      </button>
    </div>
  );
}

export default CartBar;