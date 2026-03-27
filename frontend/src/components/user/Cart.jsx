import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // FETCH CART
  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
    let data = [];
      if (!Array.isArray(res.data)) {
        if (res.data.warning) {
          showMessage(res.data.warning, "warning");
          navigate("/product");
        }
        // setCart(res.data.items || []);
         data = res.data.items || [];
        // return;
      }else{
         data = res.data;
      }

      setCart(res.data);
      return data;

    } catch (error) {
      showMessage("Something went wrong", "danger");
      return [];
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // REMOVE ITEM
  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      setCart(prev => prev.filter(i => i.itemId !== itemId));
      showMessage("Item removed successfully", "success");
    } catch (err) {
      showMessage("Failed to remove item", "danger");
    }
  };

  // UPDATE QUANTITY
  const updateQty = async (itemId, action) => {
    try {
      await api.patch("/api/cart/quantity", { itemId, action });
      fetchCart();
    } catch (err) {
      showMessage(err.response?.data?.message || "Update failed", "danger");
    }
  };

  // CHECKOUT
  const handleCheckout = async () => {

    const latestCart = await fetchCart(); 
  const invalidItems = latestCart.filter(
    (item) => !item.isAvailable || !item.isActive
  );

  if (invalidItems.length > 0) {
    showMessage(
      "Remove unavailable or blocked products before checkout",
      "warning"
    );
    return;
  }

  // if (cart.length === 0) {
  //   showMessage("Cart is empty", "warning");
  //   setTimeout(() => {
  //     navigate("/product");
  //   }, 1000);
  //   return;
  // }/

   if (latestCart.length === 0) {
    showMessage("Cart is empty", "warning");
    navigate("/product");
    return;
  }

  navigate("/checkout");
};

  // TOTAL
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subTotal * 0.18);
  const grandTotal = subTotal + tax;

  return (
    <div className="container py-5">

      
      {showToast && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-${toastType} shadow`}
          style={{ zIndex: 3000, minWidth: "300px" }}
        >
          {toastType === "success" && "✔ "}
          {toastType === "danger" && "✖ "}
          {toastType === "warning" && "⚠ "}
          {toastMsg}
        </div>
      )}

      <h3 className="text-center mb-5">MY CART</h3>

      <div className="row">

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
                  <h6 className="text-uppercase">{item.name}</h6>
                  <p className="text-muted small">{item.brand}</p>

                  <div className="d-flex align-items-center gap-3 mt-2">
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => updateQty(item.itemId, "dec")}
                    >−</button>

                    <span>{item.quantity}</span>

                    <button
                      className="btn btn-light btn-sm"
                      disabled={!item.isAvailable}
                      onClick={() => updateQty(item.itemId, "inc")}
                    >+</button>
                  </div>

                  <button
                    className="btn btn-sm text-danger p-0 mt-2"
                    onClick={() => handleRemove(item.itemId)}
                  >
                    Remove
                  </button>

                  {!item.isActive ? (
  <div className="text-danger small fw-semibold mt-1">
    This product is currently unavailable
  </div>
) : !item.isAvailable ? (
  <div className="text-warning small fw-semibold mt-1">
    This product is out of stock
  </div>
) : null}
                </div>
<div className="text-end">

  {item.originalPrice && item.originalPrice > item.price ? (
    <>
      <div style={{ textDecoration: "line-through", color: "#888" }}>
        ₹{item.originalPrice * item.quantity}
      </div>

      <div className="fw-semibold text-danger">
        ₹{item.total}
      </div>

      <div className="text-success small">
        You saved ₹{(item.originalPrice - item.price) * item.quantity}
      </div>
    </>
  ) : (
    <div className="fw-semibold">
      ₹{item.total}
    </div>
  )}

</div>
              </div>
            ))
          )}
        </div>

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