import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import AddAddress from "../../components/user/AddAddress";
import { Modal, Button } from "react-bootstrap";

const Checkout = () => {

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [cart, setCart] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

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
    } catch {
      setErrorMsg("Failed to load addresses");
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(Array.isArray(res.data) ? res.data : res.data.items);
    } catch {
      setErrorMsg("Failed to load cart");
    }
  };

  const handleAddressAdded = (newAddress) => {
    setShowAddForm(false);
    setAddresses(prev => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    setShowSelector(false);
  };

  const placeOrder = async () => {
    try {

      if (!selectedAddress) {
        setErrorMsg("Please select address");
        return;
      }

      const res = await api.post("/api/order/place-cod", {
        addressId: selectedAddress._id
      });

      setShowSuccessModal(true);

      setTimeout(() => {
        navigate(`/order-success/${res.data.orderId}`);
      }, 2000);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Order failed");
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.18);
  const discount = subtotal > 5000 ? 500 : 0;
  const grandTotal = subtotal + tax - discount;

  return (
    <div className="container py-5">

      {/* SUCCESS MODAL */}
      <Modal
        show={showSuccessModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center p-5">
          <div style={{ fontSize: 60, color: "green" }}>✔</div>
          <h4 className="mt-3">Order Placed Successfully!</h4>
          <p className="text-muted">Redirecting to order details...</p>
        </Modal.Body>
      </Modal>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="alert alert-danger text-center">
          ✖ {errorMsg}
        </div>
      )}

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-lg-7">

          <h5 className="mb-3">Shipping Address</h5>

          {selectedAddress && (
            <div className="border rounded p-3 mb-3">
              <div className="fw-semibold">{selectedAddress.address}</div>
              <div className="text-muted small">
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </div>
              <div className="small">📞 {selectedAddress.phone}</div>

              <button
                className="btn btn-outline-dark btn-sm mt-3"
                onClick={() => setShowSelector(true)}
              >
                Change
              </button>
            </div>
          )}

          {showSelector && (
            <div className="border rounded p-3 bg-light">
              <h6>Select Delivery Address</h6>

              <button
                className="btn btn-dark btn-sm mb-3"
                onClick={() => setShowAddForm(true)}
              >
                + Add New Address
              </button>

              {addresses.map(addr => (
                <div key={addr._id} className="form-check mb-2">
                  <input
                    type="radio"
                    className="form-check-input"
                    checked={selectedAddress?._id === addr._id}
                    onChange={() => setSelectedAddress(addr)}
                  />
                  <label className="form-check-label">
                    {addr.address}, {addr.city}
                  </label>
                </div>
              ))}
            </div>
          )}

          {showAddForm && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{ background: "rgba(0,0,0,0.5)", zIndex: 2000 }}>
              <div className="bg-white p-3 rounded" style={{ width: "600px" }}>
                <AddAddress
                  onSuccess={handleAddressAdded}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-5">
          <div className="border rounded p-4">

            <h5>Order Summary</h5>

            {cart.map(item => (
              <div key={item.itemId} className="d-flex justify-content-between mb-2">
                <span>{item.name} (x{item.quantity})</span>
                <span>₹{item.total}</span>
              </div>
            ))}

            <hr />

            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>Tax (18%)</span>
              <span>₹{tax}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-dark w-100 mt-3"
              onClick={placeOrder}
              disabled={!selectedAddress}
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