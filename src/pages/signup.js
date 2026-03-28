import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import "../styles/signup.css";

function Signup() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          phone: phone,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {

      await supabase.auth.signOut();

      alert("Signup successful. Please login.");
      navigate("/login");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-navbar"></div> {/* Professional blue navbar */}

      <div className="signup-card">
        <h2 className="signup-title">Create Account</h2>

        <form onSubmit={handleSignup}>
          <input
            className="signup-input"
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="signup-input"
            type="email"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="signup-input"
            type="tel"
            placeholder="Phone Number"
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="signup-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="signup-btn" type="submit">Signup</button>
        </form>

        <br />

        <Link className="signup-link" to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}

export default Signup;