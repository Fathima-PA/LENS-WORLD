import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputGroup, Form, Button } from "react-bootstrap";
import api from "../../api";

const OrderHistory = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  // const [allOrders, setAllOrders] = useState([]);
  const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);



  const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");

const showMessage = (msg) => {
  setToastMsg(msg);
  setShowToast(true);
  setTimeout(() => {
    setShowToast(false);
  }, 2000); 
};
  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/order/my",{
        params:{ page, limit: 5,search},
         withCredentials: true
      });

      const data = res.data.formatted.map(o => ({
        ...o,
        orderId: String(o.orderId)
      }));

      setOrders(data);
      // setAllOrders(data);
        setTotalPages(res.data.totalPages); 

    } catch (err) {
      if (err.response?.status === 401) {
      showMessage("Please login again");
      navigate("/login");
      return;
    }
    }
  };

  useEffect(() => {
    fetchOrders();
  },  [page,search]);

  

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
      {showToast && (
  <div
    style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#333",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "5px",
      zIndex: 9999
    }}
  >
    {toastMsg}
  </div>
)}

      <h4 className="mb-4">ORDER HISTORY</h4>

      <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          placeholder="Search order id..."
          value={search}
          
          onChange={(e) => {setSearch(e.target.value);
             setPage(1); 
          }}
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
                #{order.orderId}
              </div>

            <div className="col-2">
  <span
    style={{
      color:
        order.paymentMethod === "RAZORPAY" &&
        (order.paymentStatus === "Pending" ||
         order.paymentStatus === "Failed")
          ? "orange"
          : getStatusColor(order.status),
      fontWeight: 600
    }}
  >
    {order.paymentMethod === "RAZORPAY" &&
    (order.paymentStatus === "Pending" ||
     order.paymentStatus === "Failed")
      ? "PENDING"
      : order.status.toUpperCase()}
  </span>

  {/* optional small text */}
  {order.paymentStatus === "Failed" && (
    <div className="text-danger small">Payment Failed</div>
  )}
</div>

              <div className="col-3 text-muted">
                {new Date(order.date).toLocaleString()}
              </div>

              <div className="col-2">
                ₹{order.total} ({order.items} items)
              </div>

        

<div className="col-2 text-end">
  <button
    className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
    onClick={() => navigate(`/profile/order/${order.orderId}`)}
  >
    View Details
  </button>
</div>

            </div>

          ))
        )}

      </div>
     <div className="d-flex justify-content-between align-items-center p-3">
                   <small className="text-muted">
                     Page {page} of {totalPages}
                   </small>
   
                   <div className="d-flex gap-2">
                     <Button
                       disabled={page===1}
                       onClick={()=>setPage(p=>p-1)}
                     >←</Button>
   
                     <Button disabled>{page}</Button>
   
                     <Button
                       disabled={page===totalPages}
                       onClick={()=>setPage(p=>p+1)}
                     >→</Button>
                   </div>
                 </div>
    </div>
  );
};

export default OrderHistory;
