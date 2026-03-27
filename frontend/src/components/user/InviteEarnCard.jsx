import { Card, Button,Toast, ToastContainer } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useState } from "react";

const InviteEarnCard = () => {

  const { user } = useSelector((state) => state.auth);

    const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

 const showMessage = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };
  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
     showMessage("Referral code copied! ✅");
    }
  };

  return (
    <>
 <Card className="shadow-sm border-0 rounded">
      <Card.Body>

        <Card.Title className="fw-semibold mb-3">
          INVITE AND EARN
        </Card.Title>

        <p style={{ fontSize: 14 }}>
          Use my referral code when you sign up and get ₹50 instantly.
          The reward will be credited to your wallet.
        </p>

        <div className="d-flex align-items-center gap-2">

          <div
            className="px-3 py-2 rounded fw-semibold"
            style={{
              background: "#e0e0e0",
              fontSize: 14
            }}
          >
            {user?.referralCode || "No Code"}
          </div>

          <Button
            size="sm"
            variant="outline-dark"
            onClick={copyCode}
          >
            Copy
          </Button>

        </div>

      </Card.Body>
    </Card>



    <ToastContainer position="top-center">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white text-center fw-semibold">
            {toastMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
   
  );
};

export default InviteEarnCard;