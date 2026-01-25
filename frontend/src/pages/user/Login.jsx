import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  reset,
  googleLogin,
} from "../../features/userAuth/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { Toast, ToastContainer } from "react-bootstrap";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); 


  const [errors, setErrors] = useState({});


  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };
    const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

 const validate = () => {
  let newErrors = {};

  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    newErrors.email = "Enter a valid email";
  }

  if (!password.trim()) {
    newErrors.password = "Password is required";
  }
  //  else if (password.length < 6) {
  //   newErrors.password = "Password must be at least 6 characters";
  // }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0; 
};


useEffect(() => {
  const msg = localStorage.getItem("blockedMsg");
  if (msg) {
    showMessage(msg, "danger");
    localStorage.removeItem("blockedMsg");
  }
}, []);



    //  HANDLE LOGIN RESULT
  
  useEffect(() => {
    if (isError) {
      showMessage(message || "Login failed ❌", "danger");
      dispatch(reset());
    }

    if (isSuccess && user) {
      showMessage("Login successful ✅", "success");

      setTimeout(() => {
       navigate("/home", { replace: true });
        dispatch(reset());
      }, 1000);
    }
  }, [isError, isSuccess, user, message, navigate, dispatch]);

  
    //  FORM HANDLERS
  
  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
      if (!validate()) return;
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  
    //  FORGOT PASSWORD
  
  const forgotPasswordHandler = async () => {
    if (!email.trim()) {
      showMessage("Please enter your email first ❗", "danger");
      return;
    }

    if (!isValidEmail(email.trim())) {
      showMessage("Enter a valid email to continue ❗", "danger");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/send-otp", {
        email: email.toLowerCase().trim(),
        purpose: "RESET_PASSWORD",
      });

      showMessage(res.data.message || "OTP sent ✅", "success");

      setTimeout(() => {
        navigate("/verify-otp", {
          replace: true,
          state: {
            email: email.toLowerCase().trim(),
            purpose: "RESET_PASSWORD",
          },
        });
      }, 1000);
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      showMessage(error.response?.data?.message || "Something went wrong ❌", "danger");
    }
  };
  return (
    <>
      <div className="container d-flex justify-content-center align-items-center py-5">
        <div
          className="card p-4 border-0"
          style={{
            width: "420px",
            backgroundColor: "#f7f3ed",
            borderRadius: "14px",
          }}
        >
          <h4 className="fw-semibold mb-4">Login</h4>

          <form onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label text-muted">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  onChange={onChange}
                />
              </div>
              {errors.email && <small className="text-danger">{errors.email}</small>}

            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="form-label text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  name="password"
                  value={password}
                  onChange={onChange}
                />
              </div>
              {errors.password && <small className="text-danger">{errors.password}</small>}

            </div>

            {/* Forgot password */}
            <div className="text-end mb-3">
              <small
                className="text-muted"
                style={{ cursor: "pointer" }}
                onClick={forgotPasswordHandler}
              >
                Forgot password?
              </small>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="btn w-100 text-white mb-4"
              style={{ backgroundColor: "#cbbbbb" }}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* OR */}
          <div className="text-center text-muted mb-3">OR</div>

          {/* Google */}
          <button
            className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              width="18"
            />
            Continue with Google
          </button>

          {/* Signup */}
          <div className="text-center mt-4">
            <small>
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="fw-semibold text-decoration-none"
                style={{ color: "#b79c9c" }}
                replace
              >
                Sign up now
              </Link>
            </small>
          </div>
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
            minWidth: "360px",
            fontSize: "18px",
            borderRadius: "14px",
            textAlign: "center",
            padding: "10px",
          }}
        >
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default Login;
