import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const Checkout = () => {

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [cart, setCart] = useState([]);

  const navigate = useNavigate();

  
  // LOAD DATA
  useEffect(() => {
    fetchAddresses();
    fetchCart();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/address/my");

      setAddresses(res.data);

      const def = res.data.find(a => a.isDefault);
      setSelectedAddress(def);

    } catch (err) {
      alert("Failed to load addresses");
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(Array.isArray(res.data) ? res.data : res.data.items);
    } catch (err) {
      alert("Failed to load cart");
    }
  };


  // PLACE ORDER
  const placeOrder = async () => {
    try {
      const res = await api.post("/api/order/place-cod");
      navigate(`/order-success/${res.data.orderId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Order failed");
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.18);
  const discount = subtotal > 5000 ? 500 : 0;
  const grandTotal = subtotal + tax - discount;

  return (
    <div className="container py-5">

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-lg-7">

          <h5 className="mb-3">Shipping Address</h5>

          {/* DEFAULT ADDRESS */}
          {selectedAddress && (
            <div className="border rounded p-3 mb-3">

              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{selectedAddress.address}</div>
                  <div className="text-muted small">
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </div>
                  <div className="small">📞 {selectedAddress.phone}</div>
                </div>

                <span className="badge bg-dark align-self-start">
                  DEFAULT
                </span>
              </div>

              <button
                className="btn btn-outline-dark btn-sm mt-3"
                 disabled={addresses.length <= 1}
                onClick={() => setShowSelector(true)}
              >
                Change
              </button>
            </div>
          )}
          {showSelector && (
  <div className="border rounded p-3 bg-light position-relative">

    <button
      className="btn btn-sm btn-outline-dark position-absolute"
      style={{ top: "10px", right: "10px" }}
      onClick={() => setShowSelector(false)}
    >
      ✕
    </button>

    <h6 className="mb-3">Select Delivery Address</h6>

    {addresses
      .filter(addr => addr._id !== selectedAddress?._id)
      .map(addr => (
        <div key={addr._id} className="form-check mb-3">

          <input
            type="radio"
            className="form-check-input"
            checked={selectedAddress?._id === addr._id}
            onChange={() => setSelectedAddress(addr)}
          />

          <label className="form-check-label">
            <div className="fw-semibold">{addr.address}</div>
            <div className="small text-muted">
              {addr.city}, {addr.state} - {addr.pincode}
            </div>
            <div className="small">📞 {addr.phone}</div>
          </label>

        </div>
    ))}
  </div>
)}


        </div>

        {/* RIGHT SIDE SUMMARY */}
        <div className="col-lg-5">

          <div className="border rounded p-4 position-sticky" style={{ top: "100px" }}>

            <h5 className="mb-4">Order Summary</h5>

          {cart.map(item => (
  <div key={item.itemId} className="d-flex align-items-center mb-3">

    <img
      src={item.image}
      alt={item.name}
      style={{
        width: "60px",
        height: "60px",
        objectFit: "cover",
        borderRadius: "6px",
        marginRight: "12px",
        background: "#f4f4f4"
      }}
    />

    <div className="flex-grow-1">
      <div className="fw-semibold small">{item.name}</div>
      <div className="text-muted small">Qty: {item.quantity}</div>
      <div className="d-flex align-items-center gap-2 small">
  <span>Color:</span>
  <div
    title={item.color}
    style={{
      width: 18,
      height: 18,
      borderRadius: "50%",
      backgroundColor: item.color,
      border: "1px solid #ccc"
    }}
  />
</div>


    </div>

    <div className="fw-semibold small">
      ₹{item.total}
    </div>

  </div>
))}


            <hr />

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Tax (18%)</span>
              <span>₹{tax}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold mb-4">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-dark w-100"
              disabled={!selectedAddress}
              onClick={placeOrder}
            >
              Place Order (Cash on Delivery)
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
