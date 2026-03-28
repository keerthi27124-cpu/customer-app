import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/address.css";

function Address() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setHasSavedAddress(true);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          house: data.house || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || ""
        });
        return;
      }

      setHasSavedAddress(false);
      const saved = JSON.parse(localStorage.getItem("address"));
      if (saved) {
        setForm((prev) => ({ ...prev, ...saved }));
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const saveAddressAndCheckout = async (e) => {

    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    await supabase
      .from("addresses")
      .delete()
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("addresses")
      .insert([
        {
          user_id: user.id,
          ...form
        }
      ]);

    if (!error) {
      localStorage.setItem("address", JSON.stringify(form));
      setHasSavedAddress(true);
      window.dispatchEvent(new Event("addressSaved"));
      navigate("/checkout");
    }
  };

  return (
    <div className="address-page">

      <h2 className="address-title">
        {hasSavedAddress ? "Change delivery address" : "Add delivery address"}
      </h2>

      <form className="address-form" onSubmit={saveAddressAndCheckout}>

        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
        <input name="house" placeholder="House / Flat No" value={form.house} onChange={handleChange} />
        <input name="street" placeholder="Street / Area" value={form.street} onChange={handleChange} />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />

        <div className="address-buttons">

          <button
            type="button"
            className="back-cart-btn"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>

          <button
            type="submit"
            className="checkout-btn"
          >
            Save & Checkout
          </button>

        </div>

      </form>

    </div>
  );
}

export default Address;