import { Container, Row, Col, Card, ProgressBar, Table, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import AdminSidebar from "../../components/admin/AdminSidebar";


const AdminDashboard = () => {
  const admin = useSelector((state) => state.adminAuth.admin);


  return (
    <Container fluid className="py-4" style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Row className="g-4">
     <Col md={3} lg={2}>
  <AdminSidebar />
</Col>
        <Col md={9} lg={10}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Dashboard</h3>
          </div>

          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="text-muted small">Today's Sales</div>
                  <div className="fs-3 fw-bold">₹100,999</div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="text-muted small">Today's Revenue</div>
                  <div className="fs-3 fw-bold">₹30,000</div>
                  <div className="text-muted small">Profit made so today so far</div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="text-muted small">Users Count</div>
                  <div className="fs-3 fw-bold">20390</div>
                  <div className="text-muted small">Total users signed up</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col md={8}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-semibold mb-0">Total Revenue</h5>
                    <div className="d-flex gap-3 text-muted small">
                      <span>● Profit</span>
                      <span>● Loss</span>
                    </div>
                  </div>

                  <div className="fs-3 fw-bold mt-2 mb-3">₹50,23780</div>

                  <div
                    className="rounded-4"
                    style={{
                      height: "280px",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontWeight: 600,
                    }}
                  >
                    Chart UI here ✅
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <h5 className="fw-semibold mb-3">Most Sold Items</h5>

                  {[
                    { name: "glass", value: 70 },
                    { name: "d&k", value: 40 },
                    { name: "classic", value: 60 },
                    { name: "round sunglass", value: 80 },
                    { name: "OldMoney", value: 20 },
                  ].map((item) => (
                    <div key={item.name} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">{item.name}</span>
                        <span className="text-muted">{item.value}%</span>
                      </div>
                      <ProgressBar now={item.value} style={{ height: "8px" }} />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h5 className="fw-semibold mb-3">Latest Orders</h5>

              <Table responsive className="align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {[1, 2, 3, 4].map((x) => (
                    <tr key={x}>
                      <td className="fw-semibold text-primary">302012</td>
                      <td>
                        <div className="fw-semibold">Black Ultron</div>
                        <div className="text-muted small">+3 Products</div>
                      </td>
                      <td className="text-muted">29 Dec 2025</td>
                      <td className="text-muted">Josh Wisley</td>
                      <td className="text-muted">₹59000</td>
                      <td className="text-muted">Card</td>
                      <td>
                        <span className="badge bg-light text-primary px-3 py-2 rounded-pill">
                          Processing
                        </span>
                      </td>
                      <td>
                        <Button size="sm" variant="light" className="me-2">
                          ✏️
                        </Button>
                        <Button size="sm" variant="light">
                          🗑️
                        </Button>
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
  );
};

export default AdminDashboard;
