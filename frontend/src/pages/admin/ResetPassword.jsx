import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // ✅ Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // success | danger

  // ✅ Toast function
  const showMessage = (message, type = "success") => {
    setToastMsg(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      showMessage("Please fill all fields ❗", "danger");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match ❗", "danger");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/reset-password",
        { email, password, role: "admin" }, // ✅ add role for admin
        { withCredentials: true }
      );

      showMessage(res.data.message || "Password reset successful ✅", "success");

      // ✅ wait 1 sec then redirect
      setTimeout(() => {
        navigate("/admin/login");
      }, 1200);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Password reset failed ❌",
        "danger"
      );
    }
  };

  return (
    <>
      <div style={{ backgroundColor: "#f6f5f3", minHeight: "100vh" }}>
        {/* HEADER SPACE */}
        <div style={{ height: "80px" }} />

        {/* CARD */}
        <div className="container d-flex justify-content-center">
          <div
            className="p-4 border"
            style={{
              width: "420px",
              backgroundColor: "#f7f7f7",
              borderRadius: "16px",
            }}
          >
            <h4 className="fw-semibold mb-4">Reset password</h4>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label text-muted">Email</label>
              <input
                type="email"
                className="form-control"
                value={email || ""}
                disabled
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label text-muted">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label text-muted">Confirm password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Reset Button */}
            <button
              className="btn w-100 text-white mb-4"
              style={{
                backgroundColor: "#cbbbbb",
                borderRadius: "10px",
              }}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Toast popup center + big */}
      <ToastContainer position="top-center" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000}
          autohide
          bg={toastType}
          style={{
            minWidth: "360px",
            fontSize: "18px",
            borderRadius: "14px",
            textAlign: "center",
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

export default ResetPassword;
