import { Card, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="p-3">
        <div className="text-muted small mb-2" style={{ letterSpacing: "1px" }}>
          MENU
        </div>

        <div className="d-grid gap-2">
          <Button
            variant="light"
            className={`text-start rounded-3 ${isActive("/admin/dashboard") ? "fw-semibold" : ""}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </Button>

          <Button variant="light" className="text-start rounded-3">
            Products
          </Button>

          <Button variant="light" className="text-start rounded-3">
            Category
          </Button>

          <Button variant="light" className="text-start rounded-3">
            Orders
          </Button>

          <Button variant="light" className="text-start rounded-3">
            Banner
          </Button>
        </div>

        <div className="text-muted small mt-4 mb-2" style={{ letterSpacing: "1px" }}>
          USER MANAGEMENT
        </div>

        <div className="d-grid gap-2">
          <Button
            variant="light"
            className={`text-start rounded-3 ${isActive("/admin/customers") ? "fw-semibold" : ""}`}
            onClick={() => navigate("/admin/customers")}
          >
            Customers
          </Button>
        </div>

        <div className="text-muted small mt-4 mb-2" style={{ letterSpacing: "1px" }}>
          OTHERS
        </div>

        <div className="d-grid gap-2">
          <Button variant="light" className="text-start rounded-3 text-danger">
            Logout
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdminSidebar;
