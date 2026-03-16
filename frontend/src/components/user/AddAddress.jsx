import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import api from "../../api";

const AddAddress = ({ setActiveTab, refreshAddresses, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name:"",
    address: "",
    phone: "",
    city: "",
    pincode: "",
    state: "",
  });

  const { name,address, phone, city, pincode, state } = formData;

  const [errors, setErrors] = useState({});


  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showPopup = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    else if (name.trim().length < 5)
      newErrors.address = "Name must be at least 5 characters";


    if (!address.trim()) newErrors.address = "Address is required";
    else if (address.trim().length < 5)
      newErrors.address = "Address must be at least 5 characters";

    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(phone.trim()))
      newErrors.phone = "Phone must be 10 digits";

    if (!city.trim()) newErrors.city = "City is required";

    if (!pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(pincode.trim()))
      newErrors.pincode = "Pincode must be 6 digits";

    if (!state.trim()) newErrors.state = "State is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const isValid = validateForm();
  if (!isValid) {
    showPopup("Please fix the errors ❗", "danger");
    return;
  }

  try {
    const res = await api.post("/api/address", formData);

    showPopup("✅ Address added successfully", "success");

    setFormData({
      name:"",
      address: "",
      phone: "",
      city: "",
      pincode: "",
      state: "",
    });

    if (onSuccess) {
      setTimeout(() => {
        onSuccess(res.data);
      }, 600);
      return;
    }

    if (typeof refreshAddresses === "function") {
      refreshAddresses();
    }

    if (setActiveTab) {
      setTimeout(() => {
        setActiveTab("address");
      }, 1000);
    }

  } catch (error) {
    showPopup(error.response?.data?.message || error.message, "danger");
  }
};

  return (
    <>
    
      <ToastContainer position="top-center" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2500}
          autohide
          bg={toastType}
        >
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Container>
        <Card className="border-0 shadow-sm p-4">
          <h6
            className="text-center fw-semibold mb-5"
            style={{ letterSpacing: "3px" }}
          >
            ADD SHIPPING ADDRESS
          </h6>

          <Form onSubmit={handleSubmit} autoComplete="off">
            <Row className="mb-4">
               <Col md={6}>
                <Form.Label className="text-muted">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  className="border-0 border-bottom rounded-0"
                  autoComplete="off"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted">Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={address}
                  onChange={handleChange}
                  className="border-0 border-bottom rounded-0"
                  autoComplete="off"
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="text-muted">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={phone}
                  onChange={handleChange}
                  className="border-0 border-bottom rounded-0"
                  autoComplete="off"
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Col>
            </Row>

            <Row className="mb-5">
              <Col md={6}>
                <Form.Label className="text-muted">City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={city}
                  onChange={handleChange}
                  className="border-0 border-bottom rounded-0"
                  autoComplete="off"
                  isInvalid={!!errors.city}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="text-muted">PIN Code</Form.Label>
                <Form.Control
                  type="text"
                  name="pincode"
                  value={pincode}
                  onChange={handleChange}
                  className="border-0 border-bottom rounded-0"
                  autoComplete="off"
                  isInvalid={!!errors.pincode}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pincode}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mt-4">
                <Form.Label className="text-muted">State</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={state}
                  onChange={handleChange}
                  className="border-0 border-bottom rounded-0"
                  autoComplete="off"
                  style={{ maxWidth: 220 }}
                  isInvalid={!!errors.state}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.state}
                </Form.Control.Feedback>
              </Col>
            </Row>

            <div className="text-center">
              <Button
                type="submit"
                variant="dark"
                className="px-5 py-2"
                style={{ letterSpacing: "2px" }}
              >
                ADD NOW
              </Button>
              {onCancel && (
  <div className="text-center mt-3">
    <Button variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
  </div>
)}
            </div>
          </Form>
        </Card>
      </Container>
    </>
  );
};

export default AddAddress;
