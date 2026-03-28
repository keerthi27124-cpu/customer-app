import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import RestaurantCard from "../components/RestaurantCard";
import "../styles/home.css";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);

  const loadRestaurants = async () => {
    const { data, error } = await supabase.from("restaurants").select("*");

    if (error) console.log(error);

    setRestaurants(data || []);
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  return (
    <div className="restaurants" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Restaurants</h2>

      <div className="restaurant-grid">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </div>
  );
}

export default Restaurants;