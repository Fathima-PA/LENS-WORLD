import { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import api from "../../api"; 

const AddressCard = ({ setActiveTab }) => {
  const [addresses, setAddresses] = useState([]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/address/my");
      setAddresses(res.data || []);
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const defaultAddress =
    addresses.find((a) => a.isDefault === true) || addresses[0];

  return (
    <Card className="shadow-sm border-0 rounded">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fw-semibold mb-0">ADDRESS</Card.Title>

          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setActiveTab("add-address")}
            >
              Add Address
            </Button>

            <Button
              variant="info"
              size="sm"
              onClick={() => setActiveTab("manage-address")}
            >
              Manage ({addresses.length})
            </Button>
          </div>
        </div>

        {!defaultAddress ? (
          <div className="text-muted" style={{ fontSize: 14 }}>
            No address found
          </div>
        ) : (
          <Card className="border p-3">
            <div className="mb-2">
              <span className="badge bg-success">Default</span>
            </div>
            <div>
              <b>Name:</b> {defaultAddress.name}
            </div>
            <div>
              <b>Address:</b> {defaultAddress.address}
            </div>
            <div>
              <b>Phone:</b> {defaultAddress.phone}
            </div>
            <div>
              <b>City:</b> {defaultAddress.city}
            </div>
            <div>
              <b>State:</b> {defaultAddress.state}
            </div>
            <div>
              <b>Pincode:</b> {defaultAddress.pincode}
            </div>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
};

export default AddressCard;
