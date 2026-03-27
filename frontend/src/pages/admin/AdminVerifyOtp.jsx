import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import api from "../../api";
const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { email, purpose, role } = location.state || {};

  console.log("VERIFY PAGE STATE:", { email, purpose, role });


  const finalRole = role || "admin";

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

  const handleVerify = async () => {
    if (!otp) {
      showMessage("Please enter OTP ", "danger");
      return;
    }

    try {
      const res = await api.post(
        "/api/auth/verify-otp",
        { email, otp, purpose, role: finalRole },
        { withCredentials: true }
      );

      showMessage(res.data.message || "OTP verified ", "success");

    
      setTimeout(() => {

        if (purpose === "FORGOT_PASSWORD") {
          navigate("/admin/reset-password", { state: { email, role: finalRole } });
        }
      }, 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || "OTP verification failed", "danger");
    }
  };

  const resendOtp = async () => {
    try {
      await api.post(
        "/api/auth/send-otp",
        { email, purpose, role: finalRole },
        { withCredentials: true }
      );

      showMessage("OTP resent successfully ", "success");
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to resend OTP", "danger");
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="p-5 text-center"
          style={{
            backgroundColor: "#e9ecef",
            width: "420px",
            borderRadius: "8px",
          }}
        >
          <h4 className="fw-bold mb-3">ENTER OTP</h4>

          <p className="text-muted mb-4">
            We have sent an OTP to <b>{email}</b>
          </p>

          <input
            type="text"
            className="form-control mb-4 text-center"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            className="btn w-100 text-white mb-3"
            style={{ backgroundColor: "#cbbbbb" }}
            onClick={handleVerify}
          >
            Verify
          </button>

          <p className="text-muted mb-1">Didn't receive the code?</p>

          <span
            className="fw-semibold"
            style={{ cursor: "pointer" }}
            onClick={resendOtp}
          >
            Resend code
          </span>
        </div>
      </div>

     
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000}
          autohide
          bg={toastType}
          style={{
            minWidth: "380px",
            fontSize: "18px",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default VerifyOtp;
