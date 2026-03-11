import { Card, Button } from "react-bootstrap";
import { useSelector } from "react-redux";

const InviteEarnCard = () => {

  const { user } = useSelector((state) => state.auth);

  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      alert("Referral code copied!");
    }
  };

  return (
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
  );
};

export default InviteEarnCard;