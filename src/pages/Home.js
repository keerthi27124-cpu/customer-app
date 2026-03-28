import { useEffect, useState } from "react";
import { getRestaurants } from "../services/restaurantService";
import { getCategories } from "../services/categoryService";
import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await getRestaurants();
      const categoryData = await getCategories();

      setRestaurants(data);
      setCategories(categoryData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {

    const matchesSearch = restaurant.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "" ||
      restaurant.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="home">

      {/* ===== TOP BAR ===== */}

      <div className="hero-container">

        {/* Row 1 */}
        <div className="hero-row">

          <div className="hero-text">
            <h1>🍔 Welcome to Foodie Hub</h1>
          </div>

          <input
            type="text"
            placeholder="🔍 Search restaurants..."
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Row 2 Categories */}

        <div className="category-row">

          <div
            className={`category ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            🍽 All
          </div>

          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category ${
                selectedCategory === cat.name ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon} {cat.name}
            </div>
          ))}

        </div>

      </div>

      {/* ===== RESTAURANTS ===== */}

      <div className="restaurants">

        <h2>Restaurants Near You</h2>

        {loading ? (
          <p>Loading restaurants...</p>
        ) : filteredRestaurants.length === 0 ? (
          <p>No restaurants found</p>
        ) : (

          <div className="restaurant-grid">

            {filteredRestaurants.map((restaurant) => (

              <div key={restaurant.id} className="restaurant-card">

                <img
                  src={restaurant.image_url || "/logo192.png"}
                  alt={restaurant.name}
                  className="restaurant-image"
                />

                <h3>{restaurant.name}</h3>

                <p>📍 {restaurant.address}</p>

                <p>⭐ {restaurant.rating || "4.0"}</p>

                <p>
                  🕒 {restaurant.opening_time} - {restaurant.closing_time}
                </p>

                <Link to={`/restaurant/${restaurant.id}`}>
                  <button>View Menu</button>
                </Link>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Home;