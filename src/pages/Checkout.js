import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder as placeOrderService } from "../services/orderService";
import { supabase } from "../supabaseClient";

function Checkout() {

// -------------------
const [cartItems, setCartItems] = useState([]);
const [placing, setPlacing] = useState(false);

const [addresses, setAddresses] = useState([]);
const [selectedAddress, setSelectedAddress] = useState(null);

const [paymentMethod, setPaymentMethod] = useState("COD");
const [upiId, setUpiId] = useState("");

// ❌ REMOVED (unused)
// const [restaurant, setRestaurant] = useState(null);

const [restaurants, setRestaurants] = useState([]);

const [offer, setOffer] = useState(null);

// ❌ REMOVED (unused)
// const [orderPlaced, setOrderPlaced] = useState(false);

const navigate = useNavigate();

// -------------------
useEffect(() => {

const cart = JSON.parse(localStorage.getItem("cart")) || [];
setCartItems(cart);

const storedOffer = JSON.parse(localStorage.getItem("restaurant_offer"));
if(storedOffer){
  setOffer(storedOffer);
}

fetchAddresses();

if (cart.length > 0) {
  fetchRestaurants(cart);
}

// ❌ REMOVED (unused)
// const placed = localStorage.getItem("orderPlaced") === "true";
// setOrderPlaced(placed);

}, []);

// -------------------
const fetchRestaurants = async (cart) => {

const ids = [...new Set(cart.map(i => i.restaurant_id))];

const { data, error } = await supabase
  .from("restaurants")
  .select("*")
  .in("id", ids);

if(!error && data){
  setRestaurants(data);
}

};

// -------------------
const fetchAddresses = async () => {

const { data: userData } = await supabase.auth.getUser();
const user = userData?.user;

if (!user) return;

const { data, error } = await supabase
  .from("addresses")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1);

if (!error) {

  setAddresses(data || []);

  if (data && data.length > 0) {
    setSelectedAddress(data[0]);
  }

}

};

// -------------------
const subtotal = cartItems.reduce(
(sum, item) => sum + (item.price || 0) * (item.quantity || 1),
0
);

let discount = 0;

if (offer && subtotal >= 500) {
  discount += 100;
}

if (offer && offer.type === "BOGO") {
  cartItems.forEach((item) => {
    if (item.quantity >= 2) {
      const freeItems = Math.floor(item.quantity / 2);
      discount += freeItems * item.price;
    }
  });
}

const total = subtotal - discount;

// -------------------
const groupedItems = cartItems.reduce((acc, item) => {
if(!acc[item.restaurant_id]){
  acc[item.restaurant_id] = [];
}
acc[item.restaurant_id].push(item);
return acc;
}, {});

// -------------------
const placeOrder = async () => {

if (!selectedAddress) {
  alert("Please select delivery address");
  return;
}

if (paymentMethod === "UPI" && !upiId) {
  alert("Please enter UPI ID");
  return;
}

setPlacing(true);

try {

const { data } = await supabase.auth.getUser();
const user = data?.user;

await placeOrderService(
user.id,
cartItems,
total,
selectedAddress,
paymentMethod,
upiId
);

alert("Order placed successfully");

// ✅ CLEAR CART
localStorage.removeItem("cart");
setCartItems([]);

// ✅ CLEAR ADDRESS
localStorage.removeItem("address");

await supabase
  .from("addresses")
  .delete()
  .eq("user_id", user.id);

// ✅ RESET STATE
setSelectedAddress(null);
setAddresses([]);

// ✅ NAVIGATE
navigate("/orders");

} catch (err) {
alert("Order failed");
} finally {
setPlacing(false);
}

};

// -------------------
if (cartItems.length === 0) {

return (
<div style={{ padding: "40px", textAlign: "center" }}>
<h2>Checkout</h2>
<p>Your cart is empty.</p>

<button
onClick={() => navigate("/restaurants")}
style={{
background: "#333",
color: "white",
padding: "10px 20px",
border: "none",
borderRadius: "8px",
cursor: "pointer"
}}
>
Browse Restaurants
</button>
</div>
);
}

// -------------------
return (
/* ✅ NO CHANGES BELOW — YOUR ORIGINAL UI */
<div style={{
  minHeight: "100vh",
  background: "#f5f7fb",
  display: "flex",
  justifyContent: "center",
  padding: "30px 15px"
}}>
<div style={{
  width: "100%",
  maxWidth: "750px",
  fontFamily: "Segoe UI"
}}>
<h2 style={{ textAlign: "center", marginBottom: "25px" }}>Checkout</h2>

{restaurants.map((res) => (
<section key={res.id} style={{
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  marginBottom: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
}}>
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
<div>
<h3 style={{ margin: 0 }}>{res.name}</h3>
<p style={{ color: "#555" }}>{res.category}</p>
<p style={{ fontSize: "13px", color: "#777" }}>{res.address}</p>
</div>

<div style={{
  background: "#16a34a",
  color: "white",
  padding: "6px 10px",
  borderRadius: "8px"
}}>
⭐ {res.rating || "4.2"}
</div>
</div>

<table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
<thead>
<tr style={{ background: "#f1f5f9" }}>
<th style={{ padding: "8px", textAlign: "left" }}>Item</th>
<th style={{ padding: "8px" }}>Qty</th>
<th style={{ padding: "8px" }}>Price</th>
<th style={{ padding: "8px" }}>Total</th>
</tr>
</thead>
<tbody>
{groupedItems[res.id]?.map((item)=>(
<tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
<td style={{ padding: "8px" }}>{item.name}</td>
<td style={{ padding: "8px", textAlign: "center" }}>{item.quantity}</td>
<td style={{ padding: "8px", textAlign: "center" }}>₹{item.price}</td>
<td style={{ padding: "8px", textAlign: "center" }}>
₹{item.price * item.quantity}
</td>
</tr>
))}
</tbody>
</table>
</section>
))}

<section style={{ background: "white", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
<p>Subtotal: ₹{subtotal}</p>
{discount > 0 && <p style={{color:"green"}}>Discount: -₹{discount}</p>}
<h3>Total: ₹{total}</h3>
</section>

<section style={{ background: "white", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
<h3>Payment Method</h3>

<label><input type="radio" value="COD" checked={paymentMethod==="COD"} onChange={(e)=>setPaymentMethod(e.target.value)}/> COD</label><br/>
<label><input type="radio" value="UPI" checked={paymentMethod==="UPI"} onChange={(e)=>setPaymentMethod(e.target.value)}/> UPI</label>

{paymentMethod === "UPI" && (
<input
type="text"
placeholder="Enter UPI ID"
value={upiId}
onChange={(e)=>setUpiId(e.target.value)}
style={{
marginTop:"10px",
padding:"10px",
width:"98%",
borderRadius:"8px",
border:"1px solid #ddd"
}}
/>
)}
</section>

<section style={{ background: "white", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
<h3>Delivery Address</h3>

{addresses.map((addr)=>(
<div
key={addr.id}
onClick={()=>setSelectedAddress(addr)}
style={{
border:selectedAddress?.id===addr.id?"2px solid #16a34a":"1px solid #ddd",
padding:"12px",
borderRadius:"10px",
marginBottom:"10px",
cursor:"pointer",
background:selectedAddress?.id===addr.id?"#f0fdf4":"white"
}}
>
<p>{addr.name} ({addr.phone})</p>
<p>{addr.house}, {addr.street}</p>
<p>{addr.city}, {addr.state} - {addr.pincode}</p>
</div>
))}
</section>

<div style={{display:"flex",gap:"15px"}}>
<button
onClick={()=>navigate("/address")}
style={{
flex:1,
background:"#6b7280",
color:"white",
padding:"12px",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}}>
Back
</button>

<button
onClick={placeOrder}
disabled={placing}
style={{
flex:1,
background:"#16a34a",
color:"white",
padding:"12px",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}}>
{placing ? "Placing..." : "Place Order"}
</button>
</div>

</div>
</div>
);
}

export default Checkout;