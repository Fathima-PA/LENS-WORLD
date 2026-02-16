import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  ////////////////////////////////////////////////////
  // FETCH CART
  ////////////////////////////////////////////////////
  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data);
    } catch (err) {
      console.log("Cart fetch failed");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  ////////////////////////////////////////////////////
  // REMOVE ITEM
  ////////////////////////////////////////////////////
  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      setCart(prev => prev.filter(i => i.itemId !== itemId));
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  ////////////////////////////////////////////////////
  // UPDATE QUANTITY
  ////////////////////////////////////////////////////
  const updateQty = async (itemId, action) => {
    try {
      await api.patch("/api/cart/quantity", { itemId, action });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  ////////////////////////////////////////////////////
  // CHECKOUT VALIDATION
  ////////////////////////////////////////////////////
  const handleCheckout = async () => {
    try {
      await api.post("/api/cart/checkout");
      navigate("/checkout");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  ////////////////////////////////////////////////////
  // TOTAL CALCULATION
  ////////////////////////////////////////////////////
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subTotal * 0.18);
  const grandTotal = subTotal + tax;

  ////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////
  return (
    <div className="container py-5">
      <h3 className="text-center mb-5">MY CART</h3>

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-lg-8">
          {cart.length === 0 ? (
            <h5>Your cart is empty</h5>
          ) : (
            cart.map(item => (
              <div key={item.itemId} className="d-flex align-items-center border-bottom pb-4 mb-4">

                <img
                  src={item.image}
                  alt=""
                  style={{ width: 120, height: 120, objectFit: "cover", background: "#f4f4f4" }}
                />

                <div className="ms-4 flex-grow-1">
                  <h6 className="text-uppercase">{item.brand}</h6>
                  <p className="text-muted small">{item.name}</p>
                  <p className="small">Color: {item.color}</p>

                  {/* QUANTITY */}
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => updateQty(item.itemId, "dec")}
                    >−</button>

                    <span>{item.quantity}</span>

                    <button
                      className="btn btn-light btn-sm"
                      disabled={item.stock === 0}
                      onClick={() => updateQty(item.itemId, "inc")}
                    >+</button>
                  </div>

                  {/* REMOVE */}
                  <button
                    className="btn btn-sm text-danger p-0 mt-2"
                    onClick={() => handleRemove(item.itemId)}
                  >
                    Remove
                  </button>

                  {item.stock === 0 && (
                    <div className="text-danger small">Out of stock</div>
                  )}
                </div>

                <div className="fw-semibold">
                  ₹{item.total}
                </div>

              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDE SUMMARY */}
        <div className="col-lg-4">
          <div className="border p-4">
            <h5 className="text-center mb-4">ORDER SUMMARY</h5>

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Tax (18%)</span>
              <span>₹{tax}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold mb-4">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-dark w-100"
              disabled={cart.some(i => i.stock === 0)}
              onClick={handleCheckout}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
