import { useEffect, useState } from "react";
import api from "../../api";
import { Container, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const Wallet = () => {

  const [wallet,setWallet] = useState(0);
  const [history,setHistory] = useState([]);
  const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");

const showMessage = (msg) => {
  setToastMsg(msg);
  setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
};
const navigate = useNavigate();

  const fetchWallet = async () => {
    try{

      const res = await api.get("/api/order/wallet");

      setWallet(res.data.wallet);
      setHistory(res.data.walletHistory);

    }catch(err){
     if (err.response?.status === 401) {
      showMessage("Please login again");
      navigate("/login");
      return;
    }
    showMessage(
      err.response?.data?.message || "Failed to fetch wallet",
      "danger"
    );
    }
  };

    useEffect(()=>{
    fetchWallet();
  },[]);

  return (
    <Container className="py-5">
      {showToast && (
  <div
    style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#333",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "5px",
      zIndex: 9999
    }}
  >
    {toastMsg}
  </div>
)}

      <h3 className="mb-4">My Wallet</h3>

      {/* Wallet Balance */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="text-center">

          <h6 className="text-muted">Wallet Balance</h6>

          <h2 style={{color:"#28a745"}}>₹{wallet}</h2>

        </Card.Body>
      </Card>

      {/* Wallet History */}

      <Card className="shadow-sm">
        <Card.Body>

          <h5 className="mb-3">Transaction History</h5>

          <Table bordered hover>

            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>

              {history.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">
                    No transactions
                  </td>
                </tr>
              )}

              {history.map((t,i)=>(
                <tr key={i}>

                  <td>
                    {new Date(t.date).toLocaleDateString()}
                  </td>

                  <td>{t.reason}</td>

                  <td
                    style={{
                      color: t.type === "CREDIT" ? "green" : "red",
                      fontWeight:"bold"
                    }}
                  >
                    {t.type === "CREDIT" ? "+" : "-"} ₹{t.amount}
                  </td>

                </tr>
              ))}

            </tbody>

          </Table>

        </Card.Body>
      </Card>

    </Container>
  );
};

export default Wallet;