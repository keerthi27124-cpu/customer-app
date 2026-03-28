import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/home.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showBackButton = location.pathname !== "/";

  return (
    <div className="menu-page-navbar">
      <div className="navbar-main">

        {/* LEFT */}
        <div className="navbar-left">
          <button
            className={`hamburger-menu ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {showBackButton && (
            <button
              className="back-btn-navbar"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
          )}
        </div>

        {/* CENTER */}
        <h2
          className="menu-page-title"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          🍽 FoodieHub
        </h2>

        {/* RIGHT (DESKTOP ONLY) */}
        <div className="navbar-icons desktop-menu">
          <button className="nav-icon-btn" onClick={() => navigate("/")}>
            Home
          </button>

          <button className="nav-icon-btn" onClick={() => navigate("/menu")}>
            Menu
          </button>

          <button className="nav-icon-btn" onClick={() => navigate("/cart")}>
            Cart
          </button>

          <button className="nav-icon-btn" onClick={() => navigate("/orders")}>
            Orders
          </button>

          <button
            className="nav-icon-btn profile-icon"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/menu")}>Menu</button>
        <button onClick={() => navigate("/cart")}>Cart</button>
        <button onClick={() => navigate("/orders")}>Orders</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </div>
    </div>
  );
}

export default Navbar;