import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  InputGroup,
  Form,
  Card,
  Badge
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminOrders = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/admin/orders",
        {
          params: { search, status, page, limit: 8 },
          withCredentials: true
        }
      );

      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status, page]);

  
  const changeStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/admin/orders/status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      fetchOrders();

    } catch (err) {
      alert("Failed to update status");
    }
  };



  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <Row className="g-4">

        
          <Col md={3} lg={2}>
            <AdminSidebar />
          </Col>

      
          <Col>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-semibold mb-1">Orders</h3>
                <div className="text-muted small">
                  Dashboard › Order List
                </div>
              </div>
            </div>

            <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
              <Form.Control
                placeholder="Search order id or customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <Button variant="light" onClick={() => setSearch("")}>
                  ❌
                </Button>
              )}
            </InputGroup>

            <div className="d-flex gap-2 mb-4">
              {["all","Placed","Packaging","Shipped","Delivered"].map(s => (
                <Button
                  key={s}
                  variant={status === s ? "primary" : "light"}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>

            <Card className="shadow-sm">
              <Table responsive className="mb-0 align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Requests</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map(order => {

                    const hasCancelRequest = order.items?.some(
                      i => i.cancelRequest === "Pending"
                    );

                    const hasReturnRequest = order.items?.some(
                      i => i.returnRequest === "Pending"
                    );

                    const needsAttention = hasCancelRequest || hasReturnRequest;

                    return (
                      <tr key={order._id}>

                        <td className="fw-semibold">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>

                        <td>{order.user?.username}</td>

                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>

                        <td>₹{order.grandTotal}</td>

                        <td>
                          <Badge bg={order.paymentMethod === "COD" ? "warning" : "success"}>
                            {order.paymentMethod}
                          </Badge>
                        </td>

                      <td>

  {["Cancelled", "Returned", "Delivered"].includes(order.status) ? (

    <Badge
      bg={
        order.status === "Cancelled"
          ? "danger"
          : order.status === "Returned"
          ? "dark"
          : "success"
      }
    >
      {order.status}
    </Badge>

  ) : (

    <Form.Select
      size="sm"
      value={order.status}
      onChange={(e) => changeStatus(order._id, e.target.value)}
    >
      <option>Placed</option>
      <option>Packaging</option>
      <option>Shipped</option>
      <option>Delivered</option>
    </Form.Select>

  )}

</td>

                        <td>

                          {hasCancelRequest && (
                            <Badge bg="warning" className="me-2">
                              Cancel Request
                            </Badge>
                          )}

                          {hasReturnRequest && (
                            <Badge bg="dark">
                              Return Request
                            </Badge>
                          )}

                          {!needsAttention && (
                            <span className="text-muted small">—</span>
                          )}

                        </td>

                      
                        <td className="text-end">
                          <Button
                            variant={needsAttention ? "warning" : "link"}
                            onClick={()=>navigate(`/admin/orders/${order._id}`)}
                          >
                            {needsAttention ? "Review Request" : "View"}
                          </Button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </Table>

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

            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminOrders;
