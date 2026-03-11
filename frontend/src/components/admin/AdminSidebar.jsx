import { Card, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Products", path: "/admin/products" },
    { label: "Category", path: "/admin/categories" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Coupons", path: "/admin/coupons" },
    { label: "Offers", path: "/admin/offers" },
    { label: "Sales Report", path: "/admin/sales-report" },
  ];

  const userMenu = [
    { label: "Customers", path: "/admin/customers" },
  ];

  return (
    <Card className="border-0 shadow-sm rounded-4" style={{ width: "220px" }}>
      <Card.Body className="p-3">

        {/* MENU */}
        <div className="text-muted small mb-2" style={{ letterSpacing: "1px" }}>
          MENU
        </div>

        <div className="d-grid gap-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "primary" : "light"}
              className="text-start rounded-3"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* USER MANAGEMENT */}
        <div
          className="text-muted small mt-4 mb-2"
          style={{ letterSpacing: "1px" }}
        >
          USER MANAGEMENT
        </div>

        <div className="d-grid gap-2">
          {userMenu.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "primary" : "light"}
              className="text-start rounded-3"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>

      </Card.Body>
    </Card>
  );
};

export default AdminSidebar;