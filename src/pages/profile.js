import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../styles/profile.css";

function Profile() {

  const [user, setUser] = useState(null);
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

      console.log(currentUser.user_metadata.name);
      console.log(currentUser.user_metadata.phone);

      setUser(currentUser);
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