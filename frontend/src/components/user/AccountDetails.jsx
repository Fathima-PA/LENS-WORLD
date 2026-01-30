import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  setPendingEmail,
  sendEmailOtp,
  verifyEmailOtp,
  confirmEmailChange,
  uploadProfilePhoto,
} from "../../services/user/accountService.js";

import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  updateProfileThunk,
  changePasswordThunk,
} from "../../features/userAuth/auth/authSlice";
import api from "../../api.js"; 

const AccountDetails = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  /* ---------------- STATES ---------------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); 

  const [otpTimer, setOtpTimer] = useState(60);
const [canResendOtp, setCanResendOtp] = useState(false);
const [otpRequestId, setOtpRequestId] = useState(0);


  useEffect(() => {
  if (!otpSent) return;

  setOtpTimer(60);
  setCanResendOtp(false);

  const interval = setInterval(() => {
    setOtpTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setCanResendOtp(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [otpSent,otpRequestId]);


  const showPopup = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

  /* ---------------- SYNC REDUX USER ---------------- */
  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  /* ---------------- HANDLERS ---------------- */

  //  PHOTO UPLOAD 
const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setProfilePreview(URL.createObjectURL(file));

  try {
    const formData = new FormData();
    formData.append("photo", file);

    await uploadProfilePhoto(formData);
    showPopup(" Profile photo updated", "success");
  } catch (error) {
    showPopup(error.response?.data?.message || error.message, "danger");
  }
};


  //  PROFILE UPDATE
  const handleSaveChanges = async () => {
    try {
      await dispatch(updateProfileThunk({ name, phone })).unwrap();
      showPopup(" Profile updated successfully", "success");
    } catch (error) {
      showPopup(error || " Profile update failed", "danger");
    }
  };

  //  SEND OTP TO NEW EMAIL (COOKIE)
const handleSendEmailOtp = async () => {
  try {
    await setPendingEmail(newEmail);
    await sendEmailOtp(newEmail);

    showPopup(" OTP sent to new email", "success");
    setOtpSent(true);
    setOtpRequestId((prev) => prev + 1);
  } catch (error) {
    showPopup(error.response?.data?.message || error.message, "danger");
  }
};



  //  VERIFY OTP + UPDATE EMAIL
const handleVerifyEmailOtp = async () => {
  try {
    console.log(emailOtp)
 await verifyEmailOtp(emailOtp, newEmail);

    const res = await confirmEmailChange();

    showPopup(" Email updated successfully", "success");
    setEmail(res.data.user.email);

    setNewEmail("");
    setEmailOtp("");
    setOtpSent(false);
  } catch (error) {
    showPopup(error.response?.data?.message || error.message, "danger");
  }
};



  //  CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showPopup(" Passwords do not match", "warning");
      return;
    }

    try {
      await dispatch(
        changePasswordThunk({
          currentPassword,
          newPassword,
        })
      ).unwrap();

      showPopup(
        " Password changed successfully. Please login again.",
        "success"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await api.post("/api/auth/logout", {});
      window.location.href = "/login";
    } catch (error) {
      showPopup(error || " Password change failed", "danger");
    }
  };

  return (
    <>
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

      {/*  ACCOUNT SETTING */}
      <Card className="shadow-sm border-0 rounded mb-4">
        <Card.Body>
          <Card.Title className="fw-semibold mb-4">ACCOUNT SETTING</Card.Title>

          <Row>
            <Col md={3} className="text-center">
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto mb-3 overflow-hidden"
                style={{ width: 120, height: 120 }}
              >
                {profilePreview || user?.profileImage ? (
                  <img
                    src={profilePreview || user?.profileImage}
                    alt="profile"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <i className="bi bi-person-fill text-white fs-1"></i>
                )}
              </div>

              <Form.Label className="btn btn-info btn-sm">
                Update photo
                <Form.Control
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Form.Label>
            </Col>

            <Col md={9}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={email} disabled />
                </Col>

                <Col md={6}>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Col>
              </Row>

              <Button
                variant="info"
                className="mt-4"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CHANGE EMAIL */}
      <Card className="shadow-sm border-0 rounded mb-4">
        <Card.Body>
          <Card.Title className="fw-semibold mb-3">CHANGE EMAIL</Card.Title>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Current Email</Form.Label>
            <Form.Control value={email} disabled />
          </Form.Group>

          <Row className="g-2 align-items-end">
            <Col md={8}>
              <Form.Group>
                <Form.Label className="fw-semibold">New Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your new email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-grid">
              <Button
                variant="warning"
                onClick={handleSendEmailOtp}
                disabled={!newEmail}
              >
                Send OTP
              </Button>
            </Col>
          </Row>

     {otpSent && (
  <>
    <hr />

    <Row className="g-2 align-items-end">
      <Col md={8}>
        <Form.Group>
          <Form.Label className="fw-semibold">Enter OTP</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter OTP"
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value)}
          />

          <Form.Text className="text-muted">
            OTP sent to{" "}
            <span className="fw-semibold">{newEmail}</span>
          </Form.Text>

          {/* TIMER */}
          {!canResendOtp ? (
            <Form.Text className="text-warning d-block mt-1">
              Resend OTP in {otpTimer}s
            </Form.Text>
          ) : (
            <Form.Text className="text-success d-block mt-1">
              OTP expired. You can resend now.
            </Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={4} className="d-grid">
        <Button
          variant="success"
          onClick={handleVerifyEmailOtp}
          disabled={!emailOtp}
        >
          Verify & Update
        </Button>
      </Col>
    </Row>

    <div className="d-flex justify-content-between mt-3">
      {/* RESEND OTP */}
      <Button
        variant="outline-primary"
        size="sm"
        disabled={!canResendOtp}
        onClick={handleSendEmailOtp}
      >
        Resend OTP
      </Button>

      {/* CANCEL */}
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => {
          setOtpSent(false);
          setNewEmail("");
          setEmailOtp("");
          setOtpTimer(60);
          setCanResendOtp(false);
        }}
      >
        Cancel
      </Button>
    </div>
  </>
)}

        </Card.Body>
      </Card>

      {/* CHANGE PASSWORD */}
      <Card className="shadow-sm border-0 rounded">
        <Card.Body>
          <Card.Title className="fw-semibold mb-4">CHANGE PASSWORD</Card.Title>

          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <InputGroup.Text
                role="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Button variant="info" onClick={handleChangePassword}>
            Change Password
          </Button>
        </Card.Body>
      </Card>
    </>
  );
};

export default AccountDetails;
