import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../styles/profile.css";

function Profile() {

  const [user, setUser] = useState(null);
  const [savedAddress, setSavedAddress] = useState(null);
  const navigate = useNavigate();

  const { clearCart } = useContext(CartContext);

  useEffect(() => {

    const getUser = async () => {

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.log(error.message);
        return;
      }

      const currentUser = data.user;

      setUser(currentUser);

      const { data: addr } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      setSavedAddress(addr ?? null);
    };

    getUser();

  }, []);

  const handleLogout = async () => {

    await supabase.auth.signOut();

    clearCart();

    localStorage.removeItem("cart");
    localStorage.removeItem("restaurant_offer");

    navigate("/login");
  };

  return (
    <div className="profile-container">

      <div className="profile-navbar">
        {/* Navbar left empty intentionally */}
      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          {user?.user_metadata?.name?.charAt(0).toUpperCase()}
        </div>

        <h2 className="profile-title">My Profile</h2>

        {user ? (
          <div>

            <div className="profile-info-box">
              <span className="profile-label">Name</span>
              <p className="profile-text">{user.user_metadata?.name}</p>
            </div>

            <div className="profile-info-box">
              <span className="profile-label">Email</span>
              <p className="profile-text">{user.email}</p>
            </div>

            <div className="profile-info-box">
              <span className="profile-label">Phone</span>
              <p className="profile-text">{user.user_metadata?.phone}</p>
            </div>

            <div className="profile-info-box">
              <span className="profile-label">Delivery address</span>
              {savedAddress ? (
                <>
                  <p className="profile-text">
                    {savedAddress.name} ({savedAddress.phone})
                  </p>
                  <p className="profile-text">
                    {savedAddress.house}, {savedAddress.street}
                  </p>
                  <p className="profile-text">
                    {savedAddress.city}, {savedAddress.state} — {savedAddress.pincode}
                  </p>
                  <button
                    type="button"
                    className="profile-change-address-btn"
                    onClick={() => navigate("/address")}
                  >
                    Change delivery address
                  </button>
                </>
              ) : (
                <>
                  <p className="profile-text" style={{ color: "#888" }}>
                    No address saved yet.
                  </p>
                  <button
                    type="button"
                    className="profile-change-address-btn"
                    onClick={() => navigate("/address")}
                  >
                    Add delivery address
                  </button>
                </>
              )}
            </div>

            <button className="profile-logout-btn" onClick={handleLogout}>
              Logout
            </button>

          </div>
        ) : (
          <p>Loading profile...</p>
        )}

      </div>

    </div>
  );
}

export default Profile;