import React from "react";

function CartItem({ item, removeFromCart }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <div>
        <h4>{item.name}</h4>
        <p>₹ {item.price}</p>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        style={{
          backgroundColor: "red",
          color: "#fff",
          border: "none",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        Remove
      </button>
    </div>
  );
}

export default CartItem;
