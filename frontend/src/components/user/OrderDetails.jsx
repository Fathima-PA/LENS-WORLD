import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

const steps = ["Placed", "Packaging", "Shipped", "Delivered"];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [showReturn, setShowReturn] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/order/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!order) return <div className="p-5">Loading...</div>;

  const currentStep = Math.max(steps.indexOf(order.status), 0);
  const canCancel = ["Placed", "Packaging"].includes(order.status);
  const isDelivered = order.status === "Delivered";

  // CANCEL ORDER
  const cancelOrder = async () => {
    if (!window.confirm("Send cancel request?")) return;

    await api.patch(`/api/order/cancel/${order._id}`);
    fetchOrder();
  };

  // RETURN ORDER
  const submitReturn = async () => {
    await api.patch(`/api/order/return/${order._id}`, { reason });
    setShowReturn(false);
    fetchOrder();
  };

  // CANCEL ITEM
  const cancelItem = async (itemId) => {
    const reason = prompt("Reason (optional):");

    await api.patch(`/api/order/cancel-item/${order._id}`, {
      itemId,
      reason,
    });

    fetchOrder();
  };

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
  className="btn btn-sm btn-outline-secondary px-3 fw-semibold"
  onClick={() => navigate("/profile?tab=orders")}
>
  ← Back to Orders
</button>

        <h5>ORDER DETAILS</h5>

        <div>
          {canCancel && order.cancelRequest !== "Pending" && (
            <button
              className="btn btn-link text-danger"
              onClick={cancelOrder}
            >
              Request Cancel Order
            </button>
          )}

          {order.cancelRequest === "Pending" && (
            <span className="text-warning small">
              Cancel request pending
            </span>
          )}

          {order.items.some(i => i.returnRequest === "Pending") && (
            <span className="text-warning small ms-2">
              Return request pending
            </span>
          )}

          {isDelivered &&
            order.items.some(
              i =>
                i.status === "Active" &&
                i.returnRequest === "None"
            ) && (
              <button
                className="btn btn-link text-warning"
                onClick={() => setShowReturn(true)}
              >
                Request Return
              </button>
            )}
        </div>
      </div>

      {/* ORDER SUMMARY TOP */}
      <div className="border rounded p-3 mb-4 d-flex justify-content-between">
        <div>
          <h5>#{order._id.slice(-8)}</h5>
          <div className="text-muted small">
            {order.items.length} Products ·{" "}
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <h4>₹{order.grandTotal}</h4>
      </div>

      {/* ORDER TRACKING */}
      <div className="mb-5">
        <div className="d-flex justify-content-between mb-2">
          {steps.map((step, i) => (
            <div key={step} className="text-center flex-fill">
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  margin: "0 auto",
                  background: i <= currentStep ? "#5bc0de" : "#ddd",
                }}
              />
              <small className="d-block mt-2">{step}</small>
            </div>
          ))}
        </div>

        <div style={{ height: 4, background: "#ddd" }}>
          <div
            style={{
              height: 4,
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
              background: "#5bc0de",
            }}
          />
        </div>
      </div>

      {/* PRODUCTS */}
      <h6 className="mb-3">Products</h6>

      {order.items.map((item) => (
        <div
          key={item._id}
          className="d-flex align-items-center border-bottom py-3"
        >
          <img
            src={item.image}
            alt=""
            style={{
              width: 70,
              height: 70,
              objectFit: "cover",
              marginRight: 15,
            }}
          />

          <div className="flex-grow-1">
            <div className="fw-semibold">{item.name}</div>
            <div className="small text-muted">
              Qty: {item.quantity}
            </div>

            {/* CANCEL LOGIC */}
            {item.status === "Active" &&
              item.cancelRequest === "None" &&
              canCancel && (
                <button
                  className="btn btn-link text-danger p-0 small"
                  onClick={() => cancelItem(item._id)}
                >
                  Cancel Item
                </button>
              )}

            {item.cancelRequest === "Pending" && (
              <div className="text-warning small fw-semibold">
                Waiting for admin approval
              </div>
            )}

            {item.status === "Cancelled" && (
              <div className="text-danger small fw-semibold">
                Cancelled
              </div>
            )}

            {item.cancelRequest === "Rejected" && (
              <div className="text-danger small fw-semibold">
                Cancel request rejected
              </div>
            )}

            {/* RETURN LOGIC */}
            {item.returnRequest === "Pending" && (
              <div className="text-warning small fw-semibold">
                Waiting for admin approval (Return)
              </div>
            )}

            {item.status === "Returned" && (
              <div className="text-secondary small fw-semibold">
                Returned
              </div>
            )}

            {item.returnRequest === "Rejected" && (
              <div className="text-danger small fw-semibold">
                Return request rejected
              </div>
            )}
          </div>

          <div className="text-end">₹{item.price}</div>
        </div>
      ))}

      {/* ADDRESS */}
      <div className="mt-4">
        <h6>Shipping Address</h6>
        <div className="border rounded p-3 small">
          <div>{order.address.address}</div>
          <div>
            {order.address.city}, {order.address.state}
          </div>
          <div>{order.address.pincode}</div>
          <div>📞 {order.address.phone}</div>
        </div>
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="mt-4">
        <h6>Payment Summary</h6>

        <div className="border rounded p-3">

          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Tax (18%)</span>
            <span>₹{order.tax}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Shipping</span>
            <span>
              {order.shipping === 0
                ? "Free"
                : `₹${order.shipping}`}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Discount</span>
            <span className="text-success">
              - ₹{order.discount}
            </span>
          </div>

          <hr />

          <div className="d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>₹{order.grandTotal}</span>
          </div>

        </div>
      </div>

      {/* INVOICE */}
      <button
        className="btn btn-outline-dark btn-sm mt-3"
        onClick={() =>
          window.open(
            `http://localhost:3000/api/order/invoice/${order._id}`,
            "_blank"
          )
        }
      >
        Download Invoice
      </button>

      {/* RETURN MODAL */}
      {showReturn && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Return Order</h5>

              <textarea
                className="form-control my-3"
                placeholder="Enter return reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReturn(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-dark"
                  onClick={submitReturn}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;