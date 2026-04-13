import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import AddAddress from "../../components/user/AddAddress";
import { Modal, Button } from "react-bootstrap";
import CustomToast from "../../components/common/CustomToast";


const Checkout = () => {

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [cart, setCart] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
const [paymentMethod, setPaymentMethod] = useState("COD");
const [coupon,setCoupon] = useState("");
const [discount,setDiscount] = useState(0);
const [appliedCoupon,setAppliedCoupon] = useState(null);
const [showCoupons,setShowCoupons] = useState(false);
const [availableCoupons,setAvailableCoupons] = useState([]);
const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("success");
  const navigate = useNavigate();




const showToastMessage = (msg, type = "success") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};
 const fetchAddresses = async () => {
  try {
    const res = await api.get("/api/address/my");

    const data = res.data || [];
    setAddresses(data);

    if (data.length > 0) {
      const def = data.find(a => a.isDefault);
      setSelectedAddress(def || data[0]); 
    } else {
      setSelectedAddress(null);
    }

  } catch {
    showToastMessage("Failed to load addresses");
  }
};

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(Array.isArray(res.data) ? res.data : res.data.items);
    } catch {
       showToastMessage("Failed to load cart");
    }
  };


  const fetchCoupons = async ()=>{

  try{

    const res = await api.get("/api/order/available-coupons");

    setAvailableCoupons(res.data);

  }catch(err){
    console.log(err);
  }

};


  useEffect(() => {
    fetchAddresses();
    fetchCart();
     fetchCoupons();
  }, []);
  const handleAddressAdded = (newAddress) => {
    setShowAddForm(false);
    setAddresses(prev => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    setShowSelector(false);
  };

 const placeOrder = async () => {
  try {

    if (!selectedAddress) {
      showToastMessage("Please select address", "danger");
      return;
    }

    const res = await api.post("/api/order/place-cod", {
      addressId: selectedAddress._id,
      paymentMethod,
      couponCode: appliedCoupon
    });
    // ---------- RAZORPAY ----------
    if (res.data.razorpay) {

      const { razorpayOrder, orderId } = res.data;

     const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: razorpayOrder.amount,
  currency: "INR",
  name: "LensWorld Opticals",
  description: "Order Payment",
  order_id: razorpayOrder.id,

 handler: async function (response) {

  try {
    const verify = await api.post("/api/order/verify-payment", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      orderId
    });

    if (verify.data.success) {
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate(`/order-success/${orderId}`);
      }, 2000);
    } else {
      await api.post("/api/order/payment-failed",{ orderId });
      navigate(`/payment-failed/${orderId}`);
    }

  } catch (err) {
    await api.post("/api/order/payment-failed",{ orderId });
    navigate(`/payment-failed/${orderId}`);
  }
},


  modal:{
  ondismiss: async function(){

    await api.post("/api/order/payment-failed",{
      orderId
    });

    navigate(`/payment-failed/${orderId}`);
  }
},

  theme: {
    color: "#3399cc"
  }
};

const rzp = new window.Razorpay(options);

rzp.on("payment.failed", async function (response) {

  await api.post("/api/order/payment-failed",{
    orderId
  });

  navigate(`/payment-failed/${orderId}`);

});

rzp.open();

      return;
    }

    // ---------- COD / WALLET ----------
    setShowSuccessModal(true);

    setTimeout(() => {
      navigate(`/order-success/${res.data.orderId}`);
    }, 2000);

  }catch (err) {
  const msg = err.response?.data?.message || "Order failed";
  setErrorMsg(msg);
}
};

const applyCoupon = async ()=>{

  if(appliedCoupon){
  showToastMessage("Coupon already applied", "warning");
    return;
  }

  try{

    const res = await api.post("/api/order/apply-coupon",{
      code:coupon,
      subtotal
    });

    setDiscount(res.data.discount);
    setAppliedCoupon(res.data.couponCode);

  }catch(err){

    showToastMessage(
  err.response?.data?.message || "Coupon error",
  "danger"
);

  }

};

const removeCoupon = ()=>{
  setAppliedCoupon(null);
  setDiscount(0);
  setCoupon("");
};

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.18);
  // const discount = subtotal > 5000 ? 500 : 0;
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

      
   <Modal show={showCoupons} onHide={()=>setShowCoupons(false)} centered>

  <Modal.Header closeButton>
    <Modal.Title>Available Coupons</Modal.Title>
  </Modal.Header>

  <Modal.Body>

    {availableCoupons.length === 0 ? (
      <div className="text-muted">No coupons available</div>
    ) : (

      availableCoupons.map(c => (

        <div
          key={c._id}
          className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center"
        >

          <div>

            <div className="fw-semibold">{c.code}</div>

            <div className="small text-muted">
              {c.discountType === "percentage"
                ? `${c.discountValue}% OFF`
                : `₹${c.discountValue} OFF`}
            </div>

            <div className="small text-muted">
              Min purchase ₹{c.minPurchase}
            </div>

          </div>

          <button
            className="btn btn-sm btn-dark"
            onClick={()=>{
              setCoupon(c.code);
              setShowCoupons(false);
            }}
          >
            Apply
          </button>

        </div>

      ))

    )}

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


{selectedAddress ? (
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
) : (

  /* If no address */

  <div className="border rounded p-3 mb-3 text-center">
    <div className="text-muted mb-2">No address found</div>

    <button
      className="btn btn-dark btn-sm"
      onClick={() => setShowAddForm(true)}
    >
      + Add Address
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

    {addresses.length === 0 ? (
      <div className="text-muted">No saved addresses</div>
    ) : (
      addresses.map((addr) => (
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
      ))
    )}
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

          <h5 className="mt-4">Payment Method</h5>

<div className="form-check">
  <input
    type="radio"
    className="form-check-input"
    value="COD"
    checked={paymentMethod === "COD"}
    onChange={(e) => setPaymentMethod(e.target.value)}
  />
  <label className="form-check-label">
    Cash on Delivery
  </label>
</div>

<div className="form-check">
  <input
    type="radio"
    className="form-check-input"
    value="RAZORPAY"
    checked={paymentMethod === "RAZORPAY"}
    onChange={(e) => setPaymentMethod(e.target.value)}
  />
  <label className="form-check-label">
    Razorpay
  </label>
</div>

<div className="form-check">
  <input
    type="radio"
    className="form-check-input"
    value="WALLET"
    checked={paymentMethod === "WALLET"}
    onChange={(e) => setPaymentMethod(e.target.value)}
  />
  <label className="form-check-label">
    Wallet
  </label>
</div>
        </div>
        

        {/* RIGHT SIDE */}
        <div className="col-lg-5">
        <div className="border rounded p-3 mb-3">

  <h6 className="fw-semibold mb-2">Apply Coupon</h6>

  <div className="input-group">

    <input
      type="text"
      className="form-control"
      placeholder="Enter coupon code"
      value={coupon}
      onChange={(e)=>setCoupon(e.target.value.toUpperCase())}
      disabled={appliedCoupon}
    />

    {!appliedCoupon ? (

      <button
        className="btn btn-dark"
        onClick={applyCoupon}
      >
        Apply
      </button>

    ) : (

      <button
        className="btn btn-danger"
        onClick={removeCoupon}
      >
        Remove
      </button>

    )}

  </div>

  {appliedCoupon && (
    <div className="text-success mt-2 small">
      ✔ Coupon <b>{appliedCoupon}</b> applied successfully
    </div>
  )}

 <button
  className="btn btn-sm mt-2 px-3 py-1"
  style={{
    border: "1px dashed #0d6efd",
    color: "#0d6efd",
    background: "#f5f9ff",
    fontWeight: "500"
  }}
  onClick={() => setShowCoupons(true)}
>
  🎟 View Available Coupons
</button>

</div>
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

            {appliedCoupon && (

<div className="d-flex justify-content-between text-success">
  <span>Coupon ({appliedCoupon})</span>
  <span>- ₹{discount}</span>
</div>

)}

            <hr />

            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-dark w-100 mt-3"
              onClick={placeOrder}
             
            >
              Place Order ({paymentMethod})
            </button>

          </div>
        </div>

      </div>
      <CustomToast
  show={showToast}
  setShow={setShowToast}
  message={toastMsg}
  type={toastType}
/>
    </div>
  );
};

export default Checkout;