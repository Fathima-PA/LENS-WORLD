import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { completeRegister, reset } from "../../features/userAuth/auth/authSlice";
import api from "../../api";
const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { tempRegister } = useSelector((state) => state.auth);
  const { email, purpose } = location.state || {};

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

  /* ================= TIMER ================= */

  useEffect(() => {
    if (secondsLeft === 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  /* ================= VERIFY OTP ================= */

  const handleVerify = async () => {
    if (!otp.trim()) {
      showMessage("Please enter OTP ", "danger");
      return;
    }

    try {
      // 1️⃣ VERIFY OTP FIRST
      const res = await api.post(
        "/api/auth/verify-otp",
        { email, otp, purpose }
      );

      showMessage(res.data.message || "OTP verified ", "success");

      // 2️⃣ REGISTER USER ONLY AFTER OTP 
      if (purpose === "REGISTER") {
        if (!tempRegister) {
          showMessage("Session expired. Please register again ", "danger");
          return;
        }

        await dispatch(
          completeRegister({
            ...tempRegister,
            otp,
          })
        ).unwrap();
        dispatch(reset());

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1200);
      }
      if (purpose === "VERIFY_NEW_EMAIL") {
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1200);
      }

      if (purpose === "FORGOT_PASSWORD") {
        setTimeout(() => {
          navigate("/reset-password", {
            replace: true,
            state: { email },
          });
        }, 1200);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "OTP verification failed ",
        "danger"
      );
    }
  };

  /* ================= RESEND OTP (UNCHANGED) ================= */

  const resendOtp = async () => {
    if (!canResend) return;

    try {
      await api.post("/api/auth/send-otp", {
        email,
        purpose,
      });

      showMessage("OTP resent successfully ", "success");

      setSecondsLeft(60);
      setCanResend(false);
    } catch (error) {
    showMessage(
    error.response?.data?.message || "Failed to resend OTP ",
    "danger"
  );
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

          {!canResend ? (
            <p className="text-muted mb-2">
              Resend OTP in <b>{secondsLeft}s</b>
            </p>
          ) : (
            <p className="text-muted mb-2">You can resend OTP now </p>
          )}

          <button
            className="btn btn-outline-secondary w-100"
            onClick={resendOtp}
            disabled={!canResend}
          >
            Resend code
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000}
          autohide
          bg={toastType}
        >
          <Toast.Body className="text-white fw-semibold text-center">
            {toastMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default VerifyOtp;
