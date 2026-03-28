import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">

      <img
  src={restaurant.image_url}
  alt={restaurant.name}
  className="restaurant-image"
  onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800";}}
/>

      <h3>{restaurant.name}</h3>

      <p>⭐ {restaurant.rating || "4.0"}</p>

      <p>📍 {restaurant.address}</p>

      <Link to={`/restaurant/${restaurant.id}`}>
        <button>View Menu</button>
      </Link>

    </div>
  );
}

export default RestaurantCard;