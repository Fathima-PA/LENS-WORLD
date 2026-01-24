import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loadAdminThunk } from "../../features/adminAuth/adminAuthSlice";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";

import { Eye, EyeSlash } from "react-bootstrap-icons";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Toast function (FIXED ✅)
  const showMessage = (message, type = "success") => {
    setShowToast(false); // ✅ close first
    setTimeout(() => {
      setToastMsg(message);
      setToastType(type);
      setShowToast(true); // ✅ reopen
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/api/admin/login",
        { email, password },
        { withCredentials: true }
      );

      await dispatch(loadAdminThunk());

      // ✅ SHOW TOAST
      showMessage("Admin login successful ✅", "success");

      // ✅ WAIT THEN NAVIGATE
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2500);
    } catch (err) {
      const message = err.response?.data?.message || "Login failed ❌";
      showMessage(message, "danger");
    }
  };

  const forgotPasswordHandler = async () => {
    if (!email) {
      showMessage("Please enter your email first ❗", "danger");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/send-otp",
        {
          email,
          purpose: "RESET_PASSWORD",
          role: "admin",
        },
        { withCredentials: true }
      );

      showMessage(res.data.message || "OTP sent ✅", "success");

      // ✅ WAIT THEN NAVIGATE
      setTimeout(() => {
       navigate("/admin/verify-otp", {
  state: {
    email,
    purpose: "RESET_PASSWORD",
    role: "admin",
  },
});
      }, 2500);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong ❌";

      showMessage(message, "danger");
    }
  };

  return (
    <>
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "calc(100vh - 70px)" }}
      >
        <Card
          className="shadow-lg border-0 rounded-4"
          style={{ width: "600px" }}
        >
          <Card.Body className="p-5">
            <h3 className="fw-semibold text-secondary mb-4">Login</h3>

            <Form onSubmit={handleSubmit}>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary small">Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <i className="bi bi-person text-secondary"></i>
                  </InputGroup.Text>

                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small">
                  Password
                </Form.Label>

                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <i className="bi bi-lock text-secondary"></i>
                  </InputGroup.Text>

                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <InputGroup.Text
                    className="bg-white"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              {/* Button */}
              <Button
                type="submit"
                className="w-100 fw-semibold border-0 py-2"
                style={{ backgroundColor: "#c6b4b4" }}
              >
                Login
              </Button>
            </Form>

            {/* Forgot password */}
            <div
              className="text-center mt-3 fw-semibold"
              style={{ cursor: "pointer" }}
              onClick={forgotPasswordHandler}
            >
              Forgot password?
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* ✅ Toast popup CENTER + BIG */}
      <ToastContainer
        position="top-center"
        className="p-3"
        style={{
          zIndex: 9999,
        }}
      >
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000} // ✅ More time to show
          autohide
          bg={toastType}
          style={{
            minWidth: "420px",
            fontSize: "20px",
            borderRadius: "16px",
            textAlign: "center",
            padding: "12px",
          }}
        >
          <Toast.Body className="text-white fw-semibold">
            {toastMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default AdminLogin;
