import { Card, Button } from "react-bootstrap";
import { useSelector } from "react-redux";

const AccountInfoCard = ({ setActiveTab }) => {
  const { user } = useSelector((state) => state.auth);

  const handleEditAccount = () => {
    if (typeof setActiveTab === "function") {
      setActiveTab("account");
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded"style={{ minHeight: "260px" }}>
      <Card.Body>
        <Card.Title className="fw-semibold mb-3">
          ACCOUNT INFO
        </Card.Title>

        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle border me-3 d-flex align-items-center justify-content-center"
            style={{ width: 70, height: 70, color: "#aaa" }}
          >
           {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="profile"
                className="w-100 h-100 rounded-circle "
                style={{ objectFit: "cover" }}
              />
            ) : (
              <i className="bi bi-person fs-2"></i>
            )}
          </div>

          <div>
            <div className="fw-medium" style={{ fontSize: 20 }}>{user?.username}</div>

            <div className="text-muted" style={{ fontSize: 15 }}>
              Email: {user?.email}
            </div>

            <div className="text-muted" style={{ fontSize: 14 }}>
              Phone: {user?.phone || "Not added"}
            </div>
          </div>
        </div>

        <Button
          variant="outline-info"
          size="sm"
          onClick={handleEditAccount}
        >
          Edit Account
        </Button>
      </Card.Body>
    </Card>
  );
};

export default AccountInfoCard;
