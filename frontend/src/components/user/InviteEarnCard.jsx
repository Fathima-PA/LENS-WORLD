import { Card } from "react-bootstrap";

const InviteEarnCard = () => {
  return (
    <Card className="shadow-sm border-0 rounded">
      <Card.Body>
        <Card.Title className="fw-semibold mb-3">
          INVITE AND EARN
        </Card.Title>

        <p style={{ fontSize: 14 }}>
          USE MY REFERRAL CODE WHEN YOU SIGN UP AND GET ₹50
          INSTANTLY. OFFER VALID FOR NEW USERS ONLY; THE
          REWARD IS CREDITED TO YOUR WALLET WITHIN 24 HOURS.
        </p>

        <div
          className="px-3 py-2 rounded"
          style={{
            background: "#e0e0e0",
            display: "inline-block",
            fontSize: 14,
          }}
        >
          432345@234
        </div>
      </Card.Body>
    </Card>
  );
};

export default InviteEarnCard;
