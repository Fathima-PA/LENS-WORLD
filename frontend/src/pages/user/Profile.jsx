import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { useEffect } from "react";
import api from "../../api";
import ProfileSidebar from "../../components/user/ProfileSidebar";
import AccountInfoCard from "../../components/user/AccountInfoCard";
import AddressCard from "../../components/user/AddressCard";
import InviteEarnCard from "../../components/user/InviteEarnCard";
import AccountDetails from "../../components/user/AccountDetails";
import AddAddress from "../../components/user/AddAddress";
import ManageAddress from "../../components/user/ManageAddress";
import OrderHistory from "../../components/user/OrderHistory";
import Cart from "../../components/user/Cart";
import Wishlist from "../../components/user/Wishlist";

import Wallet from "../../components/user/Wallet";


const Profile = () => {
  const location = useLocation();
const params = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState(params.get("tab") || "dashboard");
  const { user } = useSelector((state) => state.auth);



  return (
    <Container fluid className="py-4" style={{ background: "#fafafa" }}>
      <h5 className="text-center fw-semibold mb-4">
        Hello, {user?.username}
      </h5>

      <Container>
        <Row>
          <Col md={3}>
            <ProfileSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Col>
       <Col md={9}>
  {activeTab === "dashboard" && (
    <>
      <Row className="g-4">
        <Col md={6}>
          <AccountInfoCard setActiveTab={setActiveTab} />
        </Col>
       
      </Row>

      <Row className="mt-4">
        <Col md={12}>
          <InviteEarnCard />
        </Col>
      </Row>
    </>
  )}

  {activeTab === "address" && (
    <AddressCard setActiveTab={setActiveTab} />
  )}

  {activeTab === "add-address" && (
    <AddAddress setActiveTab={setActiveTab} />
  )}
    {activeTab === "manage-address" && (   
              <ManageAddress setActiveTab={setActiveTab} />
            )}

  {activeTab === "account" && <AccountDetails />}
  {activeTab === "orders" && <OrderHistory />}

  {activeTab === "cart" && <Cart />}

  {activeTab === "wishlist" && <Wishlist />}

{activeTab === "wallet" && <Wallet />}
</Col>

        </Row>
      </Container>
    </Container>
  );
};

export default Profile;
