import { Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { supabase } from "./supabaseClient";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Address from "./pages/Address";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import RestaurantDetails from "./pages/RestaurantDetails";

const Restaurants = lazy(() => import("./pages/Restaurants"));
const MenuItem = lazy(() => import("./components/MenuItem"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const Profile = lazy(() => import("./pages/profile"));

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <Suspense fallback={<h2>Loading...</h2>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div>
      <Navbar />

      <Suspense fallback={<h2>Loading...</h2>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />

          {/* ✅ FIXED: Navbar Menu → Mixed Menu Page */}
          <Route path="/menu" element={<MenuItem />} />

          {/* ✅ Restaurant specific menu */}
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />

          {/* (optional keep if needed) */}
          <Route path="/menu/:id" element={<MenuItem />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/tracking/:id" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address" element={<Address />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;