import { ListGroup } from "react-bootstrap";
import {
  House,
  Person,
  ClockHistory,
  Cart,
  Heart,
  GeoAlt,
  Wallet2,
} from "react-bootstrap-icons";

const itemStyle = {
  border: "none",
  padding: "14px 18px",
  fontSize: "14px",
};

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <ListGroup className="shadow-sm rounded">
      <ListGroup.Item
        style={{
          ...itemStyle,
          background: activeTab === "dashboard" ? "#d6caca" : "white",
        }}
        action
        onClick={() => setActiveTab("dashboard")}
      >
        <House className="me-2" /> Dashboard
      </ListGroup.Item>

    <ListGroup.Item
  style={{
    ...itemStyle,
    background: activeTab === "account" ? "#d6caca" : "white",
  }}
  action
  onClick={() => setActiveTab("account")}
>
  <Person className="me-2" /> Account Details
</ListGroup.Item>


      <ListGroup.Item style={itemStyle}>
        <ClockHistory className="me-2" /> Order History
      </ListGroup.Item>

      <ListGroup.Item style={itemStyle}>
        <Cart className="me-2" /> Shopping Cart
      </ListGroup.Item>

      <ListGroup.Item style={itemStyle}>
        <Heart className="me-2" /> Wishlist
      </ListGroup.Item>

      <ListGroup.Item
        style={itemStyle}
        action
        onClick={() => setActiveTab("address")}
      >
        <GeoAlt className="me-2" /> Address
      </ListGroup.Item>

      <ListGroup.Item style={itemStyle}>
        <Wallet2 className="me-2" /> Wallet
      </ListGroup.Item>
    </ListGroup>
  );
};

export default ProfileSidebar;
