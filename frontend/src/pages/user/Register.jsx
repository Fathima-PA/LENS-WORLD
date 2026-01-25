import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, reset } from "../../features/userAuth/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

import { Toast, ToastContainer } from "react-bootstrap"; 

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userId, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );
console.log("REGISTER PAGE STATE:", { isSuccess, userId, isError, message });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const { username, email, password, confirmPassword, phone } = formData;

 
  const [errors, setErrors] = useState({});

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };


  const validateForm = () => {
    let newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    else if (username.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email";

    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!password.trim()) newErrors.password = "Password is required";
    // else if (password.length < 6)
    //   newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword.trim())
      newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      showMessage("Please fix the errors ❗", "danger");
      return;
    }

    dispatch(registerUser({ username, email, password, phone }));
  };
useEffect(() => {
  dispatch(reset());
}, [dispatch]);

  useEffect(() => {
    if (isSuccess && userId) {
      showMessage("Signup successful ✅", "success");

      // localStorage.setItem("verifyUserId", userId);

      setTimeout(() => {
        navigate("/verify-otp", {
           replace: true ,
          state: {
            email: email.toLowerCase(),
            purpose: "VERIFY_EMAIL",
          },
        });
      }, 1000);
    }

    if (isError) {
      showMessage(message || "Signup failed ❌", "danger");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, userId, navigate, email]);

  return (
    <>
      <div className="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="card shadow-sm p-4" style={{ width: "420px" }}>
          <h4 className="text-muted mb-4">Signup</h4>

          <form onSubmit={onSubmit} noValidate>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="username"
                name="username"
                value={username}
                onChange={onChange}
              />
              {errors.username && (
                <small className="text-danger">{errors.username}</small>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="example@email.com"
                name="email"
                value={email}
                onChange={onChange}
              />
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={onChange}
              />
              {errors.password && (
                <small className="text-danger">{errors.password}</small>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
              />
              {errors.confirmPassword && (
                <small className="text-danger">{errors.confirmPassword}</small>
              )}
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your phone number"
                name="phone"
                value={phone}
                onChange={onChange}
              />
              {errors.phone && (
                <small className="text-danger">{errors.phone}</small>
              )}
            </div>

            <button
              type="submit"
              className="btn w-100 text-white"
              style={{ backgroundColor: "#c8baba" }}
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Signup"}
            </button>
          </form>

          <p className="text-center mt-3">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-decoration-underline"
              style={{ cursor: "pointer", color: "#000" }}
            >
              Login Now
            </Link>
          </p>

          <button className="btn btn-light w-100 mt-2 rounded-pill">
            Continue with Google
          </button>
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
            minWidth: "350px",
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

export default Register;
