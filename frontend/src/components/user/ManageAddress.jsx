import { useEffect, useState } from "react";
import { Card, Button, Row, Col, Form, Toast, ToastContainer } from "react-bootstrap";
import api from "../../api"; // ✅ interceptor axios

const ManageAddress = ({ setActiveTab }) => {
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    address: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ✅ Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // success | danger | warning

  const showPopup = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

  // ✅ Fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/address/my");
      setAddresses(res.data || []);
    } catch (error) {
      showPopup(error.response?.data?.message || error.message, "danger");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ✅ Delete address
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      await api.delete(`/api/address/${id}`);
      showPopup("✅ Address deleted", "success");
      fetchAddresses();
    } catch (error) {
      showPopup(error.response?.data?.message || error.message, "danger");
    }
  };

  // ✅ Start editing
  const handleEditClick = (item) => {
    setEditingId(item._id);
    setEditForm({
      address: item.address || "",
      phone: item.phone || "",
      city: item.city || "",
      state: item.state || "",
      pincode: item.pincode || "",
    });
  };

  // ✅ Edit form change
  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Update address
  const handleUpdate = async (id) => {
    try {
      await api.put(`/api/address/${id}`, editForm);

      showPopup("✅ Address updated", "success");
      setEditingId(null);
      fetchAddresses();
    } catch (error) {
      showPopup(error.response?.data?.message || error.message, "danger");
    }
  };

  return (
    <>
      {/* ✅ TOAST POPUP */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastType}
        >
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card className="shadow-sm border-0 rounded">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="fw-semibold mb-0">MANAGE ADDRESSES</Card.Title>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setActiveTab("dashboard")}
            >
              Back
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-muted">No address found</div>
          ) : (
            <Row className="g-3">
              {addresses.map((item) => (
                <Col md={12} key={item._id}>
                  <Card className="border p-3">
                    {editingId === item._id ? (
                      <>
                        <Row className="g-2">
                          <Col md={12}>
                            <Form.Label className="fw-semibold">Address</Form.Label>
                            <Form.Control
                              name="address"
                              value={editForm.address}
                              onChange={handleEditChange}
                            />
                          </Col>

                          <Col md={6}>
                            <Form.Label className="fw-semibold">Phone</Form.Label>
                            <Form.Control
                              name="phone"
                              value={editForm.phone}
                              onChange={handleEditChange}
                            />
                          </Col>

                          <Col md={6}>
                            <Form.Label className="fw-semibold">City</Form.Label>
                            <Form.Control
                              name="city"
                              value={editForm.city}
                              onChange={handleEditChange}
                            />
                          </Col>

                          <Col md={6}>
                            <Form.Label className="fw-semibold">State</Form.Label>
                            <Form.Control
                              name="state"
                              value={editForm.state}
                              onChange={handleEditChange}
                            />
                          </Col>

                          <Col md={6}>
                            <Form.Label className="fw-semibold">Pincode</Form.Label>
                            <Form.Control
                              name="pincode"
                              value={editForm.pincode}
                              onChange={handleEditChange}
                            />
                          </Col>
                        </Row>

                        <div className="d-flex gap-2 mt-3">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdate(item._id)}
                          >
                            Save
                          </Button>

                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <b>Address:</b> {item.address}
                        </div>
                        <div>
                          <b>Phone:</b> {item.phone}
                        </div>
                        <div>
                          <b>City:</b> {item.city}
                        </div>
                        <div>
                          <b>State:</b> {item.state}
                        </div>
                        <div>
                          <b>Pincode:</b> {item.pincode}
                        </div>

                        <div className="d-flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default ManageAddress;
