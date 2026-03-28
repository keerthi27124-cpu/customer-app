import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // ✅ ONLY listener (FIXED)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted && !session?.user) {
          setCart([]);
        }
      }
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };

  }, []);

  const addToCart = (item) => {
    const existing = cart.find((i) => i.id === item.id);

    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);

      if (!item) return prev;

      if (item.quantity === 1) {
        return prev.filter((i) => i.id !== id);
      }

      return prev.map((i) =>
        i.id === id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        increaseQty,
        decreaseQty
      }}
    >
      {children}
    </CartContext.Provider>
  );
};