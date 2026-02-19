import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputGroup, Form, Button } from "react-bootstrap";
import api from "../../api";

const OrderHistory = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [search, setSearch] = useState("");

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/order/my");

      const data = res.data.map(o => ({
        ...o,
        orderId: String(o.orderId)
      }));

      setOrders(data);
      setAllOrders(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {

    if (!search.trim()) {
      setOrders(allOrders);
      return;
    }

    const filtered = allOrders.filter(order =>
      order.orderId.toLowerCase().includes(search.toLowerCase())
    );

    setOrders(filtered);

  }, [search, allOrders]);

  const getStatusColor = (status) => {
    if (status === "Placed") return "orange";
    if (status === "Packaging") return "#2196f3";
    if (status === "Shipped") return "#673ab7";
    if (status === "Delivered") return "green";
    if (status === "Cancelled") return "red";
    if (status === "Returned") return "#795548";
    return "gray";
  };


  return (
    <div className="container py-5">

      <h4 className="mb-4">ORDER HISTORY</h4>

      <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          placeholder="Search order id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <Button variant="light" onClick={() => setSearch("")}>
            ❌
          </Button>
        )}
      </InputGroup>

      <div className="border rounded">

        {/* HEADER */}
        <div className="row fw-semibold border-bottom py-3 px-2 bg-light small">
          <div className="col-3">ORDER ID</div>
          <div className="col-2">STATUS</div>
          <div className="col-3">DATE</div>
          <div className="col-2">TOTAL</div>
          <div className="col-2 text-end">ACTION</div>
        </div>

        {/* BODY */}
        {orders.length === 0 ? (
          <div className="p-4 text-center text-muted">No orders found</div>
        ) : (
          orders.map(order => (

            <div key={order.orderId} className="row align-items-center py-3 px-2 border-bottom small">

              <div className="col-3">
                #{order.orderId.slice(-6).toUpperCase()}
              </div>

              <div className="col-2">
                <span style={{ color: getStatusColor(order.status), fontWeight: 600 }}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="col-3 text-muted">
                {new Date(order.date).toLocaleString()}
              </div>

              <div className="col-2">
                ₹{order.total} ({order.items} items)
              </div>

              <div className="col-2 text-end">
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate(`/profile/order/${order.orderId}`)}
                >
                  View Details →
                </button>
              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
};

export default OrderHistory;
