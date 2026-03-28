import { useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { clearCart } = useContext(CartContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {

      clearCart();
      localStorage.removeItem("cart");
      localStorage.removeItem("restaurant_offer");

      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <div className="login-navbar"></div>

      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" type="submit">Login</button>
        </form>

        <br />

        <Link className="login-link" to="/signup">Create Account</Link>
      </div>
    </div>
  );
}

export default Login;