import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Button } from "react-bootstrap";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

const statusColor = {
  Placed: "secondary",
  Packaging: "info",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "danger",
  Returned: "dark"
};

const AdminOrderDetails = () => {

  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const res = await axios.get(
      `http://localhost:3000/api/admin/orders/${id}`,
      { withCredentials: true }
    );
    setOrder(res.data);
  };

  // APPROVE CANCEL
  const approveCancel = async (itemId) => {
    await axios.patch(
      `http://localhost:3000/api/admin/orders/approve-cancel/${order._id}`,
      { itemId },
      { withCredentials: true }
    );
    fetchOrder();
  };

  const rejectCancel = async (itemId) => {
    await axios.patch(
      `http://localhost:3000/api/admin/orders/reject-cancel/${order._id}`,
      { itemId },
      { withCredentials: true }
    );
    fetchOrder();
  };

  // APPROVE RETURN

  const approveReturn = async (itemId) => {
    await axios.patch(
      `http://localhost:3000/api/admin/orders/approve-return/${order._id}`,
      { itemId },
      { withCredentials: true }
    );
    fetchOrder();
  };

  const rejectReturn = async (itemId) => {
    await axios.patch(
      `http://localhost:3000/api/admin/orders/reject-return/${order._id}`,
      { itemId },
      { withCredentials: true }
    );
    fetchOrder();
  };


  if (!order) return <div className="p-5">Loading...</div>;

  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <Row className="g-4">

          <Col md={3} lg={2}>
            <AdminSidebar />
          </Col>

          <Col>

            <h3 className="mb-4">Order Details</h3>

            {/* ORDER SUMMARY */}
            <Card className="p-3 shadow-sm mb-4">
              <h5>
                Order #{order._id.slice(-6)}
                <Badge bg={statusColor[order.status]} className="ms-2">
                  {order.status}
                </Badge>
              </h5>

              <div className="mt-3">
                <div><b>Customer:</b> {order.user?.username}</div>
                <div><b>Payment:</b> {order.paymentMethod}</div>
                <div><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </Card>

            {/* ITEMS */}
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Order Items</h5>

                <Table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {order.items.map(item => (
                      <tr key={item._id}>

                        <td className="d-flex align-items-center gap-3">
                          <img src={item.image} width="50" />
                          {item.name}
                        </td>

                        <td>{item.quantity}</td>
                        <td>₹{item.total}</td>

                      
                        <td>
                          {item.cancelRequest === "Pending" && (
                            <Badge bg="warning">Cancel Requested</Badge>
                          )}

                          {item.returnRequest === "Pending" && (
                            <Badge bg="dark">Return Requested</Badge>
                          )}

                          {item.status === "Cancelled" && (
                            <Badge bg="danger">Cancelled</Badge>
                          )}

                          {item.status === "Returned" && (
                            <Badge bg="secondary">Returned</Badge>
                          )}

                          {item.status === "Active" &&
                           item.cancelRequest === "None" &&
                           item.returnRequest === "None" &&
                           <Badge bg="success">Active</Badge>}
                        </td>

                    
                        <td>

                          {item.cancelRequest === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={()=>approveCancel(item._id)}
                              >
                                Approve
                              </Button>{" "}
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={()=>rejectCancel(item._id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {item.returnRequest === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={()=>approveReturn(item._id)}
                              >
                                Approve
                              </Button>{" "}
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={()=>rejectReturn(item._id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                        </td>

                      </tr>
                    ))}

                  </tbody>
                </Table>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminOrderDetails;
